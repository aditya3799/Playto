# Playto Payout Engine - Technical Explainer

This document outlines the architectural decisions and safety mechanisms implemented in the Playto Payout Engine to ensure financial integrity, concurrency safety, and idempotency.

---

## 1. The Ledger & Balance Calculation

### The Query
```python
res = merchant_lock.ledger_entries.aggregate(
    balance=Sum(
        Case(
            When(entry_type='CREDIT', then=F('amount_paise')), 
            default=-F('amount_paise')
        )
    )
)
available_balance = res['balance'] or 0
```

### Modeling Rationale
Credits and debits are modeled as **immutable ledger entries** instead of a single `balance` column. This ensures maximum data integrity. By re-deriving the balance from the historical transaction log, we eliminate the "lost update" bug common in high-concurrency environments. Every single paise is traceable back to a specific event (Credit or Payout).

---

## 2. Concurrency & Locking

### The Implementation
```python
merchant_lock = Merchant.objects.select_for_update().get(id=merchant.id)
```

### Mechanism
This implementation relies on the **`SELECT FOR UPDATE`** row-level locking primitive in PostgreSQL. When a payout request is initiated, the database locks the specific merchant record. Any concurrent process attempting to access or modify the same merchant is blocked until the first transaction commits. This prevents race conditions where multiple requests might "see" the same balance before it has been deducted.

---

## 3. Idempotency Handling

Our system uses an `IdempotencyRecord` model to store the result of every payout request, indexed by a unique key provided by the client. 

### In-Flight Protection
If a second request arrives while the first is still being processed (i.e., the background task is running but hasn't updated the record with a response), the system finds the existing record with a `null` response and returns a **`409 Conflict`**. This prevents the accidental start of duplicate background tasks for the same financial intent.

---

## 4. The State Machine

The transition from `FAILED` to `COMPLETED` (or any other illegal state jump) is blocked by explicit status checks before any settlement logic occurs in the background worker:

```python
# From core/tasks.py
payout = PayoutRequest.objects.select_for_update().get(id=payout_id)

# Guard clause: only allow transitions from PENDING -> PROCESSING
if payout.status != 'PENDING':
    return
```

Once a payout is marked as `FAILED` or `COMPLETED`, it no longer meets the `PENDING` requirement. The task exits safely without performing any further money-moving logic.

---

## 5. The AI Audit

### Case Study: The "Ghost" Request Issue
During the deployment phase on an AWS EC2 instance, I encountered a critical failure: clicking the "Submit Payout" button caused a "Processing" state to hang indefinitely in the UI, but no logs appeared in the backend or Redis.

**The AI's Mistake:** The AI repeatedly suggested debugging the server-side infrastructure (checking Docker logs, verifying Redis connectivity, and increasing Gunicorn timeouts). 

**The Manual Catch:** Upon inspecting the application in the browser's Network tab, I found that the API request was **not even being sent**. 

**The Root Cause:** The code was using `crypto.randomUUID()`, which is a "Powerful Feature" blocked by modern browsers in non-secure (HTTP) contexts. Since the EC2 deployment was running over HTTP, the frontend was crashing silently before the fetch call. I replaced the restricted API with a robust fallback UUID generator, which instantly resolved the deployment-level failure.
