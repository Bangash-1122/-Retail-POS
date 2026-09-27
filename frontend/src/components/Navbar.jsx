import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  BarChart3, 
  Settings as SettingsIcon, 
  Receipt, 
  Zap, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { cart, netTotal, settings, setSettings } = usePOS();
  const [time, setTime] = useState(new Date());
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, enableBeep: !prev.enableBeep }));
  };

  const navItems = [
    { id: 'register', label: 'POS Terminal', icon: ShoppingCart, badge: totalItemsCount > 0 ? totalItemsCount : null },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales History', icon: Receipt },
    { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-glow text-white font-bold text-lg">
              <Zap size={22} className="animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg text-white tracking-tight">
                  Retail<span className="text-indigo-400">POS</span> Pro
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Online • 5001
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {settings.storeName}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1E293B]/70 p-1.5 rounded-2xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-indigo-700 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Widgets (Sound, Time, Shortcuts, Quick Cart Total) */}
          <div className="flex items-center gap-3">
            
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={settings.enableBeep ? "Sound Beep: ON" : "Sound Beep: OFF"}
              className={`p-2 rounded-xl border transition-colors ${
                settings.enableBeep
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {settings.enableBeep ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Shortcuts Help */}
            <button
              onClick={() => setShowShortcuts(true)}
              title="Keyboard Shortcuts"
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <HelpCircle size={16} />
            </button>

            {/* Real-time Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1E293B]/60 border border-slate-800 text-slate-300 text-xs font-mono">
              <Clock size={13} className="text-indigo-400" />
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>

            {/* Top Quick Register Total Pill */}
            {activeTab !== 'register' && (
              <button
                onClick={() => setActiveTab('register')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-all"
              >
                <ShoppingCart size={14} />
                <span>{settings.currency} {netTotal.toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="md:hidden flex overflow-x-auto border-t border-slate-800/80 px-2 py-1 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span className="px-1 rounded-full text-[9px] bg-white text-indigo-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="font-display font-bold text-white text-base">POS Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Focus Barcode / Product Search</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">F2</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Open Checkout / Payment Dialog</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">F4</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Clear Current Cart</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">Esc</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span>Simulate / Scan Barcode</span>
                <span className="text-slate-400">Scanner hardware sends 'Enter' automatically</span>
              </div>
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
