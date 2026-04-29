from rest_framework import serializers
from .models import Merchant, PayoutRequest, LedgerEntry

class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = ['id', 'amount_paise', 'entry_type', 'created_at']

class PayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = ['id', 'amount_paise', 'bank_account_id', 'status', 'created_at']

class MerchantDashboardSerializer(serializers.ModelSerializer):
    payouts = PayoutRequestSerializer(many=True, read_only=True)
    recent_ledger = serializers.SerializerMethodField()
    available_balance = serializers.SerializerMethodField()
    held_balance = serializers.SerializerMethodField()

    class Meta:
        model = Merchant
        fields = ['id', 'name', 'available_balance', 'held_balance', 'payouts', 'recent_ledger']

    def get_recent_ledger(self, obj):
        entries = obj.ledger_entries.all().order_by('-created_at')[:10]
        return LedgerEntrySerializer(entries, many=True).data

    def get_available_balance(self, obj):
        from django.db.models import Sum, Case, When, F
        res = obj.ledger_entries.aggregate(
            balance=Sum(Case(When(entry_type='CREDIT', then=F('amount_paise')), default=-F('amount_paise')))
        )
        return res['balance'] or 0

    def get_held_balance(self, obj):
        from django.db.models import Sum
        res = obj.payouts.filter(status__in=['PENDING', 'PROCESSING']).aggregate(
            held=Sum('amount_paise')
        )
        return res['held'] or 0
