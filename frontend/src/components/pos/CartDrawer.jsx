import React from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Tag, 
  Receipt, 
  ArrowRight,
  Percent,
  Check,
  X
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export default function CartDrawer({ onClose }) {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    taxAmount, 
    netTotal, 
    discount, 
    setDiscount, 
    applyTax, 
    setApplyTax, 
    customer, 
    setCustomer, 
    settings,
    setIsPaymentModalOpen 
  } = usePOS();

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (onClose) onClose();
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] border-l border-slate-800 shadow-2xl">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-[#0F172A]/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">Current Cart</h3>
            <p className="text-xs text-slate-400">
              {cart.reduce((s, i) => s + i.qty, 0)} items in bill
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Clear Cart (Esc)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              title="Close Cart"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Customer Quick Info */}
      <div className="p-3 bg-slate-900/50 border-b border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
        <div className="relative">
          <User size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Phone (Optional)"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-600">
              <ShoppingCart size={28} />
            </div>
            <p className="font-semibold text-sm text-slate-300">Cart is Empty</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Scan barcode or click any product to add it to the bill.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="group p-2.5 rounded-xl bg-[#1A2338]/60 hover:bg-[#1E293B] border border-slate-800/80 transition-all flex items-center gap-3"
            >
              {/* Product Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
                    POS
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-xs text-slate-200 truncate">
                  {item.name}
                </h5>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                  <span>{settings.currency} {item.price}</span>
                  <span className="text-slate-600">×</span>
                  <span className="text-indigo-400 font-bold">{item.qty}</span>
                </div>
              </div>

              {/* Qty Controls */}
              <div className="flex items-center gap-1 bg-slate-800/90 rounded-lg p-0.5 border border-slate-700/80">
                <button
                  onClick={() => updateCartQty(item.productId, item.qty - 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-white font-mono">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateCartQty(item.productId, item.qty + 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Item Total & Trash */}
              <div className="text-right pl-1">
                <span className="block font-mono text-xs font-bold text-emerald-400">
                  {settings.currency} {item.total.toLocaleString()}
                </span>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity mt-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculation & Checkout Footer */}
      <div className="p-4 bg-[#0F172A] border-t border-slate-800 space-y-3">
        {/* Discount & Tax Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Discount Input */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Tag size={13} className="text-amber-400" />
            <input
              type="number"
              min="0"
              placeholder="Discount"
              value={discount || ''}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              className="w-full bg-transparent text-slate-200 placeholder-slate-500 text-xs focus:outline-none font-mono"
            />
          </div>

          {/* Tax Checkbox */}
          <button
            onClick={() => setApplyTax(!applyTax)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              applyTax
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <Percent size={12} /> Tax ({settings.taxRate}%)
            </span>
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
              applyTax ? 'bg-indigo-600 text-white' : 'border border-slate-600'
            }`}>
              {applyTax && <Check size={10} />}
            </span>
          </button>
        </div>

        {/* Calculation Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-200">{settings.currency} {subtotal.toLocaleString()}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Discount</span>
              <span>- {settings.currency} {discount.toLocaleString()}</span>
            </div>
          )}

          {applyTax && (
            <div className="flex justify-between text-indigo-300">
              <span>GST / Tax ({settings.taxRate}%)</span>
              <span>+ {settings.currency} {taxAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-slate-100">
            <span className="font-sans font-bold text-sm">TOTAL AMOUNT</span>
            <span className="font-mono text-xl font-extrabold text-emerald-400">
              {settings.currency} {netTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          disabled={cart.length === 0}
          onClick={handleCheckoutClick}
          className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            cart.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-glowEmerald active:scale-[0.99] cursor-pointer'
          }`}
        >
          <Receipt size={18} />
          <span>PAY & PRINT RECEIPT</span>
          <span className="ml-1 text-xs opacity-75 font-mono">[F4]</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}
