const API_BASE = '/api/v1';

export async function fetchMerchants() {
  const res = await fetch(`${API_BASE}/merchants`);
  if (!res.ok) throw new Error('Failed to fetch merchants');
  return res.json();
}

export async function fetchMerchantDashboard(merchantId) {
  const res = await fetch(`${API_BASE}/merchants/${merchantId}`);
  if (!res.ok) throw new Error('Failed to fetch merchant data');
  return res.json();
}

export async function createPayout({ merchantId, amountPaise, bankAccountId, idempotencyKey }) {
  const res = await fetch(`${API_BASE}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount_paise: amountPaise,
      bank_account_id: bankAccountId,
    }),
  });
  const data = await res.json();
  return { status: res.status, data };
}
