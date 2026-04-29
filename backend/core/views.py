from rest_framework import status, views
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum, Case, When, F
from django.utils import timezone
from datetime import timedelta
import uuid

from .models import Merchant, PayoutRequest, LedgerEntry, IdempotencyRecord
from .serializers import MerchantDashboardSerializer, PayoutRequestSerializer
from .tasks import process_payout

class MerchantListView(views.APIView):
    def get(self, request):
        merchants = Merchant.objects.all()
        data = [{'id': str(m.id), 'name': m.name} for m in merchants]
        return Response(data)

class MerchantDashboardView(views.APIView):
    def get(self, request, merchant_id):
        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            return Response({'error': 'Merchant not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = MerchantDashboardSerializer(merchant)
        return Response(serializer.data)

class PayoutRequestView(views.APIView):
    def post(self, request):
        idempotency_key_str = request.headers.get('Idempotency-Key')
        if not idempotency_key_str:
            return Response({'error': 'Idempotency-Key header is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            idempotency_key = uuid.UUID(idempotency_key_str)
        except ValueError:
            return Response({'error': 'Invalid Idempotency-Key format'}, status=status.HTTP_400_BAD_REQUEST)

        amount_paise = request.data.get('amount_paise')
        bank_account_id = request.data.get('bank_account_id')
        merchant_id = request.data.get('merchant_id') # Usually this comes from auth token, but we'll accept it in body for simplicity

        if not all([amount_paise, bank_account_id, merchant_id]):
            return Response({'error': 'amount_paise, bank_account_id, merchant_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_paise = int(amount_paise)
            if amount_paise <= 0:
                raise ValueError
        except ValueError:
            return Response({'error': 'amount_paise must be a positive integer'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            merchant = Merchant.objects.get(id=merchant_id)
        except Merchant.DoesNotExist:
            return Response({'error': 'Merchant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Idempotency Check
        try:
            with transaction.atomic():
                idem_record, created = IdempotencyRecord.objects.get_or_create(
                    merchant=merchant,
                    idempotency_key=idempotency_key,
                    defaults={'response_status': None, 'response_body': None}
                )
        except Exception:
            # Handle potential race conditions with get_or_create
            return Response({'error': 'Concurrent request in progress'}, status=status.HTTP_409_CONFLICT)

        if not created:
            # Check if expired
            if idem_record.created_at < timezone.now() - timedelta(hours=24):
                # Expired, let's treat it as a new request? The spec says keys expire after 24h.
                # Actually, simpler to just say we delete or ignore. Let's delete and re-create.
                idem_record.delete()
                idem_record = IdempotencyRecord.objects.create(
                    merchant=merchant,
                    idempotency_key=idempotency_key
                )
            else:
                if idem_record.response_status is not None:
                    # Return exact same response
                    return Response(idem_record.response_body, status=idem_record.response_status)
                else:
                    return Response({'error': 'Concurrent request in progress'}, status=status.HTTP_409_CONFLICT)

        # Processing the payout
        try:
            with transaction.atomic():
                # Lock merchant row to prevent concurrent checks for the same merchant
                merchant_lock = Merchant.objects.select_for_update().get(id=merchant.id)

                # Calculate available balance using DB operations
                res = merchant_lock.ledger_entries.aggregate(
                    balance=Sum(Case(When(entry_type='CREDIT', then=F('amount_paise')), default=-F('amount_paise')))
                )
                available_balance = res['balance'] or 0

                if available_balance < amount_paise:
                    response_data = {'error': 'Insufficient funds'}
                    response_status = status.HTTP_400_BAD_REQUEST
                else:
                    # Create payout and debit ledger entry atomically
                    payout = PayoutRequest.objects.create(
                        merchant=merchant_lock,
                        amount_paise=amount_paise,
                        bank_account_id=bank_account_id,
                        status='PENDING'
                    )
                    LedgerEntry.objects.create(
                        merchant=merchant_lock,
                        amount_paise=amount_paise,
                        entry_type='DEBIT',
                        payout=payout
                    )
                    
                    response_data = PayoutRequestSerializer(payout).data
                    response_status = status.HTTP_201_CREATED
                    
                    # Enqueue Celery task. We should ideally trigger this via an on_commit hook
                    # to ensure it's only queued if transaction commits successfully.
                    transaction.on_commit(lambda: process_payout.delay(str(payout.id)))

            # Save response to idempotency record
            idem_record.response_status = response_status
            idem_record.response_body = response_data
            idem_record.save()

            return Response(response_data, status=response_status)

        except Exception as e:
            # If any failure happens, clean up idempotency record so they can try again
            idem_record.delete()
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
