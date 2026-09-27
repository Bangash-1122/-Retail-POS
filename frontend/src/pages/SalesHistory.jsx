import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  Eye, 
  Calendar, 
  User, 
  CreditCard, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { api } from '../utils/api';
import { usePOS } from '../context/POSContext';

export default function SalesHistory() {
  const { settings, triggerPrintReceipt } = usePOS();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getOrders({ search, limit: 50 });
      setOrders(res.data || []);
    } catch (err) {
      console.error("Could not fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Sales & Orders History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            View completed transactions and reprint customer thermal receipts anytime.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Invoice # (e.g. INV-...) or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">INVOICE #</th>
                <th className="py-3.5 px-4">DATE & TIME</th>
                <th className="py-3.5 px-4">CUSTOMER</th>
                <th className="py-3.5 px-4">ITEMS</th>
                <th className="py-3.5 px-4">METHOD</th>
                <th className="py-3.5 px-4 text-right">TOTAL AMOUNT</th>
                <th className="py-3.5 px-4 text-right">REPRINT RECEIPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <RefreshCw size={24} className="animate-spin text-indigo-500 mx-auto mb-2" />
                    <span>Loading transactions...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <Receipt size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No transactions recorded yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">Complete a sale in POS Terminal to see invoices here.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id || o.orderNo} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Order No */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {o.orderNo}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-medium">{o.customerName || 'Walk-in Customer'}</div>
                      {o.customerPhone && <div className="text-[10px] text-slate-500 font-mono">{o.customerPhone}</div>}
                    </td>

                    {/* Items count & summary */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {o.items?.length || 0} item(s)
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {o.paymentMethod || 'CASH'}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {settings.currency} {Number(o.total || 0).toLocaleString()}
                    </td>

                    {/* Reprint Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => triggerPrintReceipt(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-transparent font-semibold transition-all shadow-sm"
                      >
                        <Printer size={13} />
                        <span>Print Slip</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
