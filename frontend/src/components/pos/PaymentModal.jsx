import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle2, 
  Printer, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { api } from '../../utils/api';
import { playSuccessSound } from '../../utils/sound';

export default function PaymentModal() {
  const { 
    isPaymentModalOpen, 
    setIsPaymentModalOpen, 
    cart, 
    subtotal, 
    taxAmount, 
    netTotal, 
    discount, 
    customer, 
    settings, 
    clearCart,
    triggerPrintReceipt,
    loadProducts
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default paid amount to netTotal
  useEffect(() => {
    if (isPaymentModalOpen) {
      setPaidAmount(String(netTotal));
      setError('');
    }
  }, [isPaymentModalOpen, netTotal]);

  if (!isPaymentModalOpen) return null;

  const numericPaid = Number(paidAmount) || 0;
  const changeDue = Math.max(0, numericPaid - netTotal);
  const isInsufficient = numericPaid < netTotal && paymentMethod === 'cash';

  // Quick Cash Preset chips
  const presets = [
    { label: 'Exact', value: netTotal },
    { label: '+100', value: netTotal + 100 },
    { label: '+500', value: Math.ceil(netTotal / 500) * 500 || 500 },
    { label: '+1,000', value: Math.ceil(netTotal / 1000) * 1000 || 1000 },
    { label: '+5,000', value: Math.ceil(netTotal / 5000) * 5000 || 5000 },
  ];

  const handleCompleteOrder = async () => {
    if (cart.length === 0) return;
    if (isInsufficient) {
      setError(`Amount received is less than total bill (${settings.currency} ${netTotal.toLocaleString()})`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          barcode: item.barcode,
          name: item.name,
          price: item.price,
          qty: item.qty,
          total: item.total
        })),
        subtotal,
        discount: Number(discount || 0),
        tax: Number(taxAmount || 0),
        total: netTotal,
        paidAmount: numericPaid,
        change: changeDue,
        paymentMethod,
        customerName: customer.name || 'Walk-in Customer',
        customerPhone: customer.phone || '',
        cashier: 'Admin'
      };

      const res = await api.createOrder(orderPayload);
      const createdOrder = res.data;

      playSuccessSound(settings.enableBeep);
      clearCart();
      setIsPaymentModalOpen(false);
      loadProducts(); // refresh stock counts

      // Automatically trigger receipt print modal!
      triggerPrintReceipt(createdOrder);
    } catch (err) {
      setError(err.message || "Failed to complete transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Banknote size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-lg">Checkout & Payment</h3>
              <p className="text-xs text-slate-400">Total payable: <strong className="text-emerald-400 font-mono">{settings.currency} {netTotal.toLocaleString()}</strong></p>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card / POS', icon: CreditCard },
                { id: 'mobile_wallet', label: 'Mobile Wallet', icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id !== 'cash') setPaidAmount(String(netTotal));
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Amount Tendered */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Cash Received ({settings.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-mono text-base">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    autoFocus
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xl font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPaidAmount(String(p.value))}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Change Calculation Box */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Change to return</span>
              <span className={`text-2xl font-mono font-black ${
                changeDue > 0 ? 'text-emerald-400' : 'text-slate-300'
              }`}>
                {settings.currency} {changeDue.toLocaleString()}
              </span>
            </div>
            {changeDue > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Return to Customer
              </span>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#0F172A] border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={submitting || isInsufficient}
            onClick={handleCompleteOrder}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all ${
              submitting || isInsufficient
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-glowEmerald'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Printer size={18} />
                <span>Complete Sale & Print Receipt</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
