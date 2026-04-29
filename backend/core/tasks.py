from celery import shared_task
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import random
import uuid as uuid_mod
from .models import PayoutRequest, LedgerEntry

@shared_task
def process_payout(payout_id):
    """
    Picks up a PENDING payout, moves it to PROCESSING,
    then simulates bank settlement:
      - 70% -> COMPLETED
      - 20% -> FAILED (refund held funds)
      - 10% -> stays PROCESSING (simulates a hang)
    """
    try:
        with transaction.atomic():
            payout = PayoutRequest.objects.select_for_update().get(id=payout_id)

            # State machine: only PENDING -> PROCESSING
            if payout.status != 'PENDING':
                return
            payout.status = 'PROCESSING'
            payout.save()
    except PayoutRequest.DoesNotExist:
        return

    # Simulate bank settlement delay
    rand = random.random()

    with transaction.atomic():
        payout = PayoutRequest.objects.select_for_update().get(id=payout_id)
        if payout.status != 'PROCESSING':
            return

        if rand < 0.7:
            # SUCCESS
            payout.status = 'COMPLETED'
            payout.save()
        elif rand < 0.9:
            # FAIL -> atomically refund held funds
            payout.status = 'FAILED'
            payout.save()
            LedgerEntry.objects.create(
                merchant=payout.merchant,
                amount_paise=payout.amount_paise,
                entry_type='CREDIT',
                payout=payout
            )
        else:
            # HANG -> leave in PROCESSING, will be caught by retry worker
            pass


@shared_task
def retry_stuck_payouts():
    """
    Periodic task: finds payouts stuck in PROCESSING for >30s.
    Retries with exponential backoff up to 3 attempts,
    then forces FAILED and refunds.
    """
    stuck_threshold = timezone.now() - timedelta(seconds=30)
    stuck_payouts = list(
        PayoutRequest.objects.filter(
            status='PROCESSING',
            updated_at__lt=stuck_threshold
        ).values_list('id', flat=True)
    )

    for payout_id in stuck_payouts:
        with transaction.atomic():
            p = PayoutRequest.objects.select_for_update().get(id=payout_id)
            if p.status != 'PROCESSING':
                continue

            p.attempts += 1
            if p.attempts >= 3:
                # Max retries exhausted -> force fail and refund atomically
                p.status = 'FAILED'
                p.save()
                LedgerEntry.objects.create(
                    merchant=p.merchant,
                    amount_paise=p.amount_paise,
                    entry_type='CREDIT',
                    payout=p
                )
            else:
                # Save updated attempt count, re-enqueue with exponential backoff
                p.save()
                _retry_single_payout.apply_async(
                    (str(p.id),),
                    countdown=2 ** p.attempts
                )


@shared_task
def _retry_single_payout(payout_id):
    """
    Retry task for a single payout that was stuck.
    Re-simulates bank settlement.
    """
    rand = random.random()

    with transaction.atomic():
        try:
            payout = PayoutRequest.objects.select_for_update().get(id=payout_id)
        except PayoutRequest.DoesNotExist:
            return

        if payout.status != 'PROCESSING':
            return

        if rand < 0.7:
            payout.status = 'COMPLETED'
            payout.save()
        elif rand < 0.9:
            payout.status = 'FAILED'
            payout.save()
            LedgerEntry.objects.create(
                merchant=payout.merchant,
                amount_paise=payout.amount_paise,
                entry_type='CREDIT',
                payout=payout
            )
        else:
            # Still hanging — will be caught again by retry_stuck_payouts
            pass
