import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  Zap, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export default function Login({ onSuccess, onBackToLanding }) {
  const { login } = usePOS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
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
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err.message || "Failed to sign in with demo account");
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#0A1214] relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#32383B]/40 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Back Link */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6] px-3 py-1.5 rounded-xl mb-4 transition-all border border-transparent hover:border-[#CBD3D6] cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        )}

        <div className="p-8 rounded-3xl bg-[#32383B]/80 border border-[#32383B] shadow-2xl backdrop-blur-xl">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0A1214] border border-[#32383B] flex items-center justify-center shadow-glow text-[#EDF1F2] mx-auto mb-3">
              <Zap size={24} />
            </div>
            <h2 className="font-display font-black text-2xl text-[#EDF1F2] tracking-tight">
              RetailPOS Staff Portal
            </h2>
            <p className="text-xs text-[#B2BEC2] mt-1">
              Sign in to access POS Terminal, Inventory, Purchases & Finance
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-[#0A1214] border border-[#CBD3D6] text-[#EDF1F2] text-xs">
              <AlertCircle size={15} className="flex-shrink-0 text-[#CBD3D6]" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Login Preset Buttons */}
          <div className="mb-6 space-y-2">
            <p className="text-[11px] font-semibold text-[#B2BEC2] uppercase tracking-wider text-center">
              1-Click Demo Accounts (All 3 Roles)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('owner@retailpos.com', 'owner123')}
                className="p-2 rounded-xl bg-[#0A1214] hover:bg-[#CBD3D6] border border-[#32383B] hover:border-[#CBD3D6] text-[#EDF1F2] hover:text-[#0A1214] text-xs font-semibold flex flex-col items-center gap-0.5 transition-all text-center group/btn cursor-pointer"
              >
                <span className="text-sm">👑</span>
                <span>Owner</span>
                <span className="text-[9px] text-[#B2BEC2] group-hover/btn:text-[#0A1214] font-mono">owner123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@retailpos.com', 'manager123')}
                className="p-2 rounded-xl bg-[#0A1214] hover:bg-[#CBD3D6] border border-[#32383B] hover:border-[#CBD3D6] text-[#EDF1F2] hover:text-[#0A1214] text-xs font-semibold flex flex-col items-center gap-0.5 transition-all text-center group/btn cursor-pointer"
              >
                <span className="text-sm">💼</span>
                <span>Manager</span>
                <span className="text-[9px] text-[#B2BEC2] group-hover/btn:text-[#0A1214] font-mono">manager123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('salesman@retailpos.com', 'salesman123')}
                className="p-2 rounded-xl bg-[#0A1214] hover:bg-[#CBD3D6] border border-[#32383B] hover:border-[#CBD3D6] text-[#EDF1F2] hover:text-[#0A1214] text-xs font-semibold flex flex-col items-center gap-0.5 transition-all text-center group/btn cursor-pointer"
              >
                <span className="text-sm">⚡</span>
                <span>Salesman</span>
                <span className="text-[9px] text-[#B2BEC2] group-hover/btn:text-[#0A1214] font-mono">salesman123</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[#32383B] w-full"></div>
            <span className="bg-[#32383B] px-3 text-[10px] text-[#B2BEC2] uppercase tracking-widest absolute">
              or enter credentials
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#EDF1F2] font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-[#B2BEC2]" />
                <input
                  type="email"
                  required
                  placeholder="admin@retailpos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6] text-xs placeholder-[#B2BEC2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#EDF1F2] font-medium mb-1">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-[#B2BEC2]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6] text-xs font-mono placeholder-[#B2BEC2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] border border-[#EDF1F2] hover:border-[#CBD3D6] font-bold text-xs shadow-glow transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
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