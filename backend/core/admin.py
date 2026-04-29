from django.contrib import admin
from .models import Merchant, PayoutRequest, LedgerEntry, IdempotencyRecord

@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(PayoutRequest)
class PayoutRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'merchant', 'amount_paise', 'status', 'created_at')
    list_filter = ('status', 'merchant')
    search_fields = ('bank_account_id', 'id')

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'merchant', 'amount_paise', 'entry_type', 'created_at')
    list_filter = ('entry_type', 'merchant')

@admin.register(IdempotencyRecord)
class IdempotencyRecordAdmin(admin.ModelAdmin):
    list_display = ('idempotency_key', 'merchant', 'response_status', 'created_at')
    list_filter = ('merchant',)
