import React from 'react';
import { 
  Zap, 
  ShoppingCart, 
  Printer, 
  Package, 
  BarChart3, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  Smartphone, 
  FileText,
  DollarSign,
  TrendingUp,
  Cpu,
  Sparkles
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export default function LandingPage({ onLaunchPOS, onOpenLogin }) {
  const { currentUser, settings } = usePOS();

  return (
    <div className="flex-1 overflow-y-auto bg-[#080C15] text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-teal-500/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 animate-fade-in shadow-glow">
            <Sparkles size={14} className="text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Hardware-Agnostic MERN Retail Engine • Version 2.0</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            The Modern Powerhouse for <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-teal-300 bg-clip-text text-transparent">Retail POS & Store Operations</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            High-speed checkout terminal, instant barcode scanning, universal <strong>80mm & 58mm thermal receipt printing</strong>, inward purchase orders, and automated expense tracking.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onLaunchPOS}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-glow transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShoppingCart size={18} />
              <span>Launch POS Terminal</span>
              <ArrowRight size={16} />
            </button>

            {!currentUser ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all shadow-sm"
              >
                <span>Staff & Admin Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.role})</span>
              </div>
            )}
          </div>

          {/* Feature Badges Grid */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Universal USB, Wi-Fi & Bluetooth Thermal Printers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>0-Click Silent Kiosk Printing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Hardware Barcode Scanner Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>100% Offline Capable</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── CORE CAPABILITIES SHOWCASE ── */}
      <section className="py-16 bg-[#0B101E] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl text-white tracking-tight">
              Engineered for Real-World Retail
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Everything your supermarket, retail boutique, or grocery store needs to operate without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: POS Billing */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 hover:border-indigo-500/40 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShoppingCart size={22} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">High-Speed Register</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan barcodes with audio feedback, add items with single clicks, calculate GST taxes, discounts, and tender change in split seconds.
              </p>
            </div>

            {/* Card 2: Universal Thermal Printing */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Printer size={22} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Thermal Receipt Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hardware agnostic support for any 80mm or 58mm printer. Built-in instant preview, auto-cut, and 0-click kiosk silent printing.
              </p>
            </div>

            {/* Card 3: Inward Purchases */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 hover:border-violet-500/40 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Package size={22} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Supplier Purchases (Stock In)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Record distributor bills and incoming inventory. Stock counts automatically increment in real-time across your product catalog.
              </p>
            </div>

            {/* Card 4: Store Expense Tracker */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 hover:border-amber-500/40 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <DollarSign size={22} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Petty Cash & Expenses</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log utility bills, staff salaries, refreshment costs, and packaging expenses with payment receipts and category filters.
              </p>
            </div>

            {/* Card 5: Inventory & Low Stock Alerts */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 hover:border-rose-500/40 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Real-Time Stock Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never run out of bestsellers. Automated threshold alerts notify you when stock runs low before you lose potential sales.
              </p>
            </div>

            {/* Card 6: Net Profit / Loss Analytics */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 hover:border-cyan-500/40 transition-all hover:shadow-xl group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp size={22} />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Profit & Loss Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculate real net profit: <strong>Revenue - Cost of Goods Sold - Store Expenses = True Bottom Line</strong>.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── THERMAL RECEIPT VISUAL PREVIEW BANNER ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-[#111827] via-[#161F33] to-[#0F172A] border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Universal Printer Compatibility
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              Connect Any Printer. USB, Wi-Fi, or Bluetooth.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No complicated COM ports or vendor driver locks. Whether you buy an Epson, Xprinter, Rongta, or any generic thermal receipt printer, RetailPOS Pro auto-formats the slip in 80mm or 58mm with zero margins!
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={onLaunchPOS}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition-all"
              >
                Try It in Terminal
              </button>
            </div>
          </div>

          {/* Micro Receipt Preview */}
          <div className="w-72 bg-white text-black p-4 rounded-xl shadow-2xl font-mono text-[10px] leading-tight select-none">
            <div className="text-center font-bold pb-1 uppercase border-b border-dashed border-black">
              <p className="text-xs font-black">{settings.storeName}</p>
              <p className="text-[9px] text-neutral-600 font-normal">{settings.storeTagline}</p>
              <p className="text-[8px] text-neutral-600 font-normal">Tel: {settings.phone}</p>
            </div>
            <div className="py-1 border-b border-dashed border-black flex justify-between text-[9px]">
              <span>INV: #INV-2609-8812</span>
              <span>PAID: CASH</span>
            </div>
            <div className="py-1 border-b border-dashed border-black space-y-1">
              <div className="flex justify-between">
                <span>Lipton Tea 400g x1</span>
                <span>Rs. 680</span>
              </div>
              <div className="flex justify-between">
                <span>Olpers Milk 1L x2</span>
                <span>Rs. 580</span>
              </div>
              <div className="flex justify-between">
                <span>Coca Cola Can x3</span>
                <span>Rs. 330</span>
              </div>
            </div>
            <div className="py-1 border-b border-dashed border-black text-right font-bold text-xs">
              <span>TOTAL: Rs. 1,590</span>
            </div>
            <div className="text-center pt-2 text-[8px] text-neutral-600">
              <p>*** THANK YOU FOR VISITING ***</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-800 bg-[#070A12] py-8 text-center text-xs text-slate-500">
        <p>RetailPOS Pro — Professional Point of Sale & Inventory Management System</p>
        <p className="mt-1">Powered by MERN Stack • Universal ESC/POS Thermal Printing Engine</p>
      </footer>

    </div>
  );
}
