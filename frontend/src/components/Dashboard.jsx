import { useState } from 'react';

const STATUS_COLORS = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PROCESSING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_DOT = {
  PENDING: 'bg-amber-400',
  PROCESSING: 'bg-blue-400',
  COMPLETED: 'bg-emerald-400',
  FAILED: 'bg-red-400',
};

export default function BalanceCards({ available, held }) {
  const fmtINR = (paise) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(rupees);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {/* Available Balance */}
      <div className="glass-card glow-border p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Available Balance</span>
        </div>
        <p className="text-3xl font-bold text-white font-mono tracking-tight">
          {fmtINR(available)}
        </p>
        <p className="text-xs text-slate-500 mt-2">Withdrawable funds</p>
      </div>

      {/* Held Balance */}
      <div className="glass-card glow-border p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Held Balance</span>
        </div>
        <p className="text-3xl font-bold text-white font-mono tracking-tight">
          {fmtINR(held)}
        </p>
        <p className="text-xs text-slate-500 mt-2">Pending/Processing payouts</p>
      </div>

      {/* Total Balance */}
      <div className="glass-card glow-border p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Balance</span>
        </div>
        <p className="text-3xl font-bold text-white font-mono tracking-tight">
          {fmtINR(available + held)}
        </p>
        <p className="text-xs text-slate-500 mt-2">Available + Held</p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[status] || 'bg-slate-500/20 text-slate-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status] || 'bg-slate-400'} ${status === 'PROCESSING' ? 'animate-pulse-dot' : ''}`} />
      {status}
    </span>
  );
}

export function LedgerTable({ entries }) {
  const fmtINR = (paise) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(rupees);
  };

  return (
    <div className="glass-card glow-border overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Recent Ledger Entries
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${entry.entry_type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.entry_type === 'CREDIT' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                    )}
                    {entry.entry_type}
                  </span>
                </td>
                <td className={`px-6 py-3 text-right font-mono text-sm ${entry.entry_type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {entry.entry_type === 'CREDIT' ? '+' : '-'}{fmtINR(entry.amount_paise)}
                </td>
                <td className="px-6 py-3 text-right text-sm text-slate-400">
                  {new Date(entry.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan="3" className="text-center py-8 text-slate-500">No ledger entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PayoutHistory({ payouts }) {
  const fmtINR = (paise) => {
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(rupees);
  };

  return (
    <div className="glass-card glow-border overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Payout History
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/30">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Bank Account</th>
              <th className="text-center px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3 text-sm text-slate-300 font-mono">{p.id.substring(0, 8)}...</td>
                <td className="px-6 py-3 text-right font-mono text-sm text-white">{fmtINR(p.amount_paise)}</td>
                <td className="px-6 py-3 text-sm text-slate-300">{p.bank_account_id}</td>
                <td className="px-6 py-3 text-center"><StatusBadge status={p.status} /></td>
                <td className="px-6 py-3 text-right text-sm text-slate-400">
                  {new Date(p.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr><td colSpan="5" className="text-center py-8 text-slate-500">No payouts yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PayoutForm({ merchantId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !bankAccount) return;

    setLoading(true);
    setMessage(null);

    const amountPaise = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountPaise) || amountPaise <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount in rupees' });
      setLoading(false);
      return;
    }

    const idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

    try {
      const { createPayout } = await import('../api');
      const { status, data } = await createPayout({
        merchantId,
        amountPaise,
        bankAccountId: bankAccount,
        idempotencyKey,
      });

      if (status === 201) {
        setMessage({ type: 'success', text: `Payout created! ID: ${data.id.substring(0, 8)}...` });
        setAmount('');
        setBankAccount('');
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Payout failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card glow-border p-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        Request Payout
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (INR)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">&#8377;</span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000.00"
              className="w-full pl-8 pr-4 py-2.5 bg-surface-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-mono"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Bank Account ID</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="HDFC-XXXX-1234"
            className="w-full px-4 py-2.5 bg-surface-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Processing...
            </span>
          ) : 'Submit Payout Request'}
        </button>
        {message && (
          <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
