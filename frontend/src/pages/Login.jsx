import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  ArrowLeft, 
  Zap, 
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export default function Login({ onSuccess, onBackToLanding }) {
  const { login } = usePOS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to sign in. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setTimeout(async () => {
      setLoading(true);
      try {
        await login(demoEmail, demoPass);
        onSuccess?.();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#080C15] relative overflow-hidden">
      
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        
        {/* Back Link */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        )}

        <div className="p-8 rounded-3xl bg-[#111827]/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-glow text-white mx-auto mb-3">
              <Zap size={24} />
            </div>
            <h2 className="font-display font-black text-2xl text-white tracking-tight">
              RetailPOS Staff Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to access POS Terminal, Inventory, Purchases & Finance
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-6 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@retailpos.com', 'admin123')}
                className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all"
              >
                <ShieldCheck size={16} />
                <span>Admin Manager</span>
                <span className="text-[9px] text-indigo-400 font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cashier@retailpos.com', 'cashier123')}
                className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex flex-col items-center gap-0.5 transition-all"
              >
                <UserCheck size={16} />
                <span>Terminal Cashier</span>
                <span className="text-[9px] text-emerald-400 font-mono">cashier123</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-[#111827] px-3 text-[10px] text-slate-500 uppercase tracking-widest absolute">
              or enter credentials
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@retailpos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to POS</span>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
