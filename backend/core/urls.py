from django.urls import path
from .views import MerchantDashboardView, MerchantListView, PayoutRequestView

urlpatterns = [
    path('merchants', MerchantListView.as_view(), name='merchant-list'),
    path('merchants/<uuid:merchant_id>', MerchantDashboardView.as_view(), name='merchant-dashboard'),
    path('payouts', PayoutRequestView.as_view(), name='payout-requests'),
]
