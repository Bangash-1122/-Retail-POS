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
  ShoppingBag,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { api } from '../utils/api';
import { usePOS } from '../context/POSContext';

export default function SalesHistory() {
  const { settings, triggerPrintReceipt, loadProducts } = usePOS();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [viewingOrder, setViewingOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
    notes: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Void confirmation modal
  const [voidingOrder, setVoidingOrder] = useState(null);
  const [isVoiding, setIsVoiding] = useState(false);

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

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      paymentMethod: order.paymentMethod || 'cash',
      notes: order.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSavingEdit(true);
    try {
      await api.updateOrder(editingOrder._id, editForm);
      setEditingOrder(null);
      await fetchOrders();
    } catch (err) {
      alert("Failed to update invoice: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmVoid = async () => {
    if (!voidingOrder) return;

    setIsVoiding(true);
    try {
      await api.deleteOrder(voidingOrder._id);
      setVoidingOrder(null);
      await fetchOrders();
      await loadProducts(); // Refresh catalog stock immediately
    } catch (err) {
      alert("Failed to void order: " + err.message);
    } finally {
      setIsVoiding(false);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Sales & Orders History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction history with reprint, invoice editing, and safe voiding (with stock restoration).
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
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
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
                      <button
                        onClick={() => setViewingOrder(o)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        <span>{o.items?.length || 0} item(s)</span>
                      </button>
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

                    {/* Action Buttons: Print, Edit, Void */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Reprint Receipt */}
                        <button
                          onClick={() => triggerPrintReceipt(o)}
                          title="Print Thermal Receipt"
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all"
                        >
                          <Printer size={13} />
                        </button>

                        {/* Edit Invoice Details */}
                        <button
                          onClick={() => openEditModal(o)}
                          title="Edit Customer / Payment Method"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Void Order (Restores Stock) */}
                        <button
                          onClick={() => setVoidingOrder(o)}
                          title="Void / Cancel Invoice (Restores Stock)"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Items Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-indigo-400" />
                <h3 className="font-display font-bold text-white text-base">
                  Invoice Items: {viewingOrder.orderNo}
                </h3>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="divide-y divide-slate-800">
                {viewingOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-200">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.qty} × {settings.currency} {Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-200">
                      {settings.currency} {Number(item.total).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{settings.currency} {Number(viewingOrder.subtotal || viewingOrder.total).toLocaleString()}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount:</span>
                    <span>-{settings.currency} {Number(viewingOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                {viewingOrder.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Tax:</span>
                    <span>+{settings.currency} {Number(viewingOrder.taxAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>Net Total:</span>
                  <span>{settings.currency} {Number(viewingOrder.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => triggerPrintReceipt(viewingOrder)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-400" />
                <h3 className="font-display font-bold text-white text-base">
                  Edit Invoice: {editingOrder.orderNo}
                </h3>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card / POS Debit</option>
                  <option value="mobile_wallet">EasyPaisa / JazzCash / SadaPay</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notes / Remarks</label>
                <textarea
                  rows="2"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                >
                  {savingEdit && <RefreshCw size={13} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Invoice Confirmation Modal */}
      {voidingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-rose-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-rose-500/20 bg-rose-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" />
                <h3 className="font-display font-bold text-white text-base">
                  Void & Cancel Invoice?
                </h3>
              </div>
              <button onClick={() => setVoidingOrder(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                Are you sure you want to void invoice <span className="font-mono font-bold text-white">{voidingOrder.orderNo}</span>?
              </p>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-rose-400" />
                  Automatic Stock Restoration
                </p>
                <p className="text-[11px] text-slate-400">
                  All {voidingOrder.items?.length || 0} product item(s) from this invoice will be automatically restored back to catalog stock in inventory.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setVoidingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Keep Invoice
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVoid}
                  disabled={isVoiding}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
                >
                  {isVoiding && <RefreshCw size={13} className="animate-spin" />}
                  <span>Confirm Void</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
