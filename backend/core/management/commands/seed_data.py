from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from core.models import Merchant, LedgerEntry


class Command(BaseCommand):
    help = 'Seed database with test merchants and credit history'

    def handle(self, *args, **options):
        merchants_data = [
            {'name': 'Acme Digital Solutions'},
            {'name': 'Zenith Creative Studio'},
            {'name': 'Pixel Perfect Agency'},
        ]

        for data in merchants_data:
            merchant, created = Merchant.objects.get_or_create(name=data['name'])
            if not created:
                self.stdout.write(f"  Merchant '{merchant.name}' already exists, skipping.")
                continue

            self.stdout.write(f"  Created merchant: {merchant.name} (ID: {merchant.id})")

            # Create 5-8 credit entries (simulated customer payments)
            num_credits = random.randint(5, 8)
            for i in range(num_credits):
                amount = random.choice([
                    500000,   # ₹5,000
                    1000000,  # ₹10,000
                    2500000,  # ₹25,000
                    5000000,  # ₹50,000
                    750000,   # ₹7,500
                    1500000,  # ₹15,000
                ])
                entry = LedgerEntry.objects.create(
                    merchant=merchant,
                    amount_paise=amount,
                    entry_type='CREDIT',
                )
                # Backdate credits so they look like history
                days_ago = random.randint(1, 30)
                entry.created_at = timezone.now() - timedelta(days=days_ago)
                entry.save(update_fields=['created_at'])
                self.stdout.write(
                    f"    + CREDIT INR {amount / 100:.2f} ({days_ago}d ago)"
                )

        self.stdout.write(self.style.SUCCESS('\nSeeding complete!'))

        # Print summary
        for m in Merchant.objects.all():
            from django.db.models import Sum, Case, When, F
            res = m.ledger_entries.aggregate(
                balance=Sum(Case(
                    When(entry_type='CREDIT', then=F('amount_paise')),
                    default=-F('amount_paise')
                ))
            )
            bal = res['balance'] or 0
            self.stdout.write(
                f"  {m.name}: Balance INR {bal / 100:.2f} (ID: {m.id})"
            )
