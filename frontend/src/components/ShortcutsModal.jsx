import React from 'react';
import { 
  Keyboard, 
  Sparkles, 
  X, 
  ShoppingCart, 
  Search, 
  CreditCard, 
  Maximize, 
  Zap, 
  Printer, 
  LayoutGrid, 
  ShieldCheck 
} from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "POS Checkout & Register",
      icon: ShoppingCart,
      color: "text-indigo-400",
      items: [
        { label: "Focus Barcode / Product Search", key: "F2" },
        { label: "Open Payment & Checkout Modal", key: "F4" },
        { label: "Quick Cash Sale (Instant Bill)", key: "F8" },
        { label: "Clear Cart / Close Modal / Clear Search", key: "Esc" },
        { label: "Reprint Last Receipt Slip", key: "Alt + P" }
      ]
    },
    {
      title: "Display & Terminal View",
      icon: Maximize,
      color: "text-amber-400",
      items: [
        { label: "Toggle Full Screen Kiosk Mode", key: "F9" },
        { label: "Open Keyboard Shortcuts Help", key: "F1" }
      ]
    },
    {
      title: "Instant Navigation (Alt + 1-8)",
      icon: LayoutGrid,
      color: "text-emerald-400",
      items: [
        { label: "POS Terminal Register", key: "Alt + 1" },
        { label: "Inventory Catalog", key: "Alt + 2" },
        { label: "Inward Stock Purchases", key: "Alt + 3" },
        { label: "Store Expenses Tracking", key: "Alt + 4" },
        { label: "Sales & Invoices History", key: "Alt + 5" },
        { label: "Financial Analytics", key: "Alt + 6" },
        { label: "Staff & User Roles", key: "Alt + 7" },
        { label: "Store Settings & Tax", key: "Alt + 8" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Keyboard size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">POS Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-400">High-speed cashier keys for hardware keyboards & barcode scanners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {shortcutGroups.map((group, gIdx) => {
            const Icon = group.icon;
            return (
              <div key={gIdx} className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Icon size={14} className={group.color} />
                  <span>{group.title}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60">
                  {group.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                      <span className="text-slate-300">{item.label}</span>
                      <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 font-mono font-bold text-[11px] shadow-sm">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0F172A]/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">F1</kbd> anytime to open this sheet.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
