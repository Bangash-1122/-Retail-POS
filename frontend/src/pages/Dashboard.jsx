import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  CreditCard, 
  Banknote, 
  Smartphone,
  RefreshCw,
  Award,
  DollarSign,
  ArrowUpRight,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { api } from '../utils/api';
import { usePOS } from '../context/POSContext';

export default function Dashboard() {
  const { settings } = usePOS();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setStats(res.data);
    } catch (err) {
      console.error("Could not fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 gap-3">
        <RefreshCw size={24} className="animate-spin text-indigo-500" />
        <span className="text-xs">Loading financial reports...</span>
      </div>
    );
  }

  const netProfit = (stats?.netProfit !== undefined) 
    ? stats.netProfit 
    : (stats?.totalSales || 0) - (stats?.cogs || 0) - (stats?.totalExpenses || 0);

  const kpis = [
    {
      title: "Total Gross Revenue",
      value: `${settings.currency} ${(stats?.totalSales || 0).toLocaleString()}`,
      sub: `Today: ${settings.currency} ${(stats?.todaySales || 0).toLocaleString()} (${stats?.todayOrdersCount || 0} orders)`,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400"
    },
    {
      title: "Cost of Goods Sold (COGS)",
      value: `${settings.currency} ${(stats?.cogs || 0).toLocaleString()}`,
      sub: `Direct wholesale purchase cost of sold units`,
      icon: Package,
      color: "from-indigo-500 to-violet-500",
      textColor: "text-indigo-400"
    },
    {
      title: "Operating Expenses",
      value: `${settings.currency} ${(stats?.totalExpenses || 0).toLocaleString()}`,
      sub: `Store bills, salaries, tea & overheads`,
      icon: DollarSign,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400"
    },
    {
      title: "True Net Profit (Bottom Line)",
      value: `${settings.currency} ${netProfit.toLocaleString()}`,
      sub: `Revenue - COGS - Store Expenses`,
      icon: netProfit >= 0 ? TrendingUp : TrendingDown,
      color: netProfit >= 0 ? "from-emerald-500 to-cyan-500" : "from-rose-500 to-red-600",
      textColor: netProfit >= 0 ? "text-emerald-400 font-black" : "text-rose-400 font-black"
    },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Store Performance & Financials
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time profit & loss, COGS margins, expense distribution, and sales analytics.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary KPI Row: Revenue, COGS, Expenses, Net Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-3xl bg-[#111827] border border-slate-800/90 shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {k.title}
                </span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${k.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className={`font-mono text-2xl font-black ${k.textColor}`}>
                  {k.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {k.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Top Sellers, Expenses by Category, Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 5 Selling Products */}
        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <h3 className="font-display font-bold text-white text-sm">Top Selling Products</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">By volume</span>
          </div>

          {!stats?.topProducts || stats.topProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No product sales data recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((p, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-mono font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-200 text-xs">{p.name}</p>
                      <span className="text-[10px] text-slate-500">{p.qty} units sold</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {settings.currency} {p.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-rose-400" />
              <h3 className="font-display font-bold text-white text-sm">Expense Outflow</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">By Category</span>
          </div>

          {!stats?.expenseByCategory || Object.keys(stats.expenseByCategory).length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No store expenses recorded.
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(stats.expenseByCategory).map(([cat, amt]) => (
                <div key={cat} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">{cat}</span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    - {settings.currency} {amt.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-sm mb-4 pb-3 border-b border-slate-800">
              Payment Channels
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Banknote size={18} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">Cash Register</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {stats?.paymentBreakdown?.cash || 0} orders
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard size={18} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Card / POS</span>
                </div>
                <span className="font-mono font-bold text-indigo-400 text-sm">
                  {stats?.paymentBreakdown?.card || 0} orders
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={18} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-200">Mobile Wallet</span>
                </div>
                <span className="font-mono font-bold text-cyan-400 text-sm">
                  {stats?.paymentBreakdown?.mobile_wallet || 0} orders
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Customer Invoices:</span>
            <span className="font-mono font-bold text-white text-base">
              {stats?.totalOrders || 0}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
