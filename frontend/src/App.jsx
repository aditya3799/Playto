import { useState, useEffect, useCallback } from 'react';
import { fetchMerchants, fetchMerchantDashboard } from './api';
import BalanceCards, { LedgerTable, PayoutHistory, PayoutForm } from './components/Dashboard';

function App() {
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load merchants on mount
  useEffect(() => {
    fetchMerchants()
      .then((data) => {
        setMerchants(data);
        if (data.length > 0) setSelectedMerchant(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load dashboard when merchant changes or refresh is triggered
  const loadDashboard = useCallback(() => {
    if (!selectedMerchant) return;
    setLoading(true);
    fetchMerchantDashboard(selectedMerchant)
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMerchant]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshKey]);

  // Auto-refresh every 5 seconds for live status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-surface-950 to-surface-950 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-800/50 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Playto Pay</h1>
                <p className="text-xs text-slate-500">Payout Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Merchant Selector */}
              <select
                value={selectedMerchant || ''}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="bg-surface-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 appearance-none cursor-pointer"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-surface-900 border border-slate-700 text-slate-400 hover:text-white hover:border-primary-500/30 transition-all"
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading && !dashboard ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading dashboard...
              </div>
            </div>
          ) : dashboard ? (
            <>
              {/* Balance Cards */}
              <BalanceCards
                available={dashboard.available_balance}
                held={dashboard.held_balance}
              />

              {/* Two-column layout for form + history */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1">
                  <PayoutForm merchantId={selectedMerchant} onSuccess={handleRefresh} />
                </div>
                <div className="lg:col-span-2">
                  <PayoutHistory payouts={dashboard.payouts || []} />
                </div>
              </div>

              {/* Ledger Table */}
              <LedgerTable entries={dashboard.recent_ledger || []} />
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p>Select a merchant to view their dashboard</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
