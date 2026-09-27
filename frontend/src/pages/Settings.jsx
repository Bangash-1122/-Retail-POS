import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Printer, 
  Store, 
  DollarSign, 
  Volume2, 
  CheckCircle2, 
  Info, 
  Terminal,
  HelpCircle,
  FileText
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Settings() {
  const { settings, setSettings, loadSettings, triggerPrintReceipt } = usePOS();
  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.updateSettings(formData);
      setSettings(res.data);
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Test Print sample receipt
  const handleTestPrint = () => {
    const sampleOrder = {
      orderNo: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      cashier: 'Admin',
      customerName: 'Test Customer',
      customerPhone: '0300-1234567',
      items: [
        { name: 'Lipton Yellow Label 400g', qty: 1, price: 680, total: 680 },
        { name: 'Olper Full Cream Milk 1L', qty: 2, price: 290, total: 580 },
        { name: 'Coca Cola Can 330ml', qty: 3, price: 110, total: 330 },
      ],
      subtotal: 1590,
      discount: 90,
      tax: 75,
      total: 1575,
      paidAmount: 2000,
      change: 425,
      paymentMethod: 'CASH',
    };
    triggerPrintReceipt(sampleOrder);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Store & Printer Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure thermal receipt header, paper roll width, sound effects, and silent printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestPrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all shadow-sm"
          >
            <Printer size={15} />
            <span>Test Print Receipt</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ── Section 1: Thermal Printer Preferences ── */}
        <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Thermal Printer Configuration</h3>
              <p className="text-xs text-slate-400">Works universally with USB, Wi-Fi, and Bluetooth POS printers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Paper Width Roll */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Printer Paper Roll Width
              </label>
              <select
                name="paperWidth"
                value={formData.paperWidth || '80mm'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="80mm">80mm (Standard POS Roll - 3 inch)</option>
                <option value="58mm">58mm (Compact Mobile POS Roll - 2 inch)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Choose the size that matches your thermal paper roll roll width.
              </p>
            </div>

            {/* Auto Print on Checkout */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-200 block">
                  Auto-Print on Checkout
                </label>
                <span className="text-[11px] text-slate-500">
                  Instantly open print dialog when sale completes
                </span>
              </div>
              <input
                type="checkbox"
                name="autoPrintReceipt"
                checked={formData.autoPrintReceipt}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
            </div>

            {/* Scanner Beep Sound */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-200 block">
                  Barcode Scanner Beep Sound
                </label>
                <span className="text-[11px] text-slate-500">
                  Audio chime feedback on scan & item additions
                </span>
              </div>
              <input
                type="checkbox"
                name="enableBeep"
                checked={formData.enableBeep}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Sales Tax (GST / VAT %)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Store Branding & Receipt Header ── */}
        <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Store size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Store Branding & Receipt Header</h3>
              <p className="text-xs text-slate-400">These details appear at the top and bottom of every printed receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Store Tagline</label>
              <input
                type="text"
                name="storeTagline"
                value={formData.storeTagline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Store Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">NTN / Tax Registration #</label>
              <input
                type="text"
                name="ntn"
                value={formData.ntn}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Currency Symbol</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Receipt Footer Note / Return Policy</label>
              <textarea
                rows="3"
                name="receiptFooter"
                value={formData.receiptFooter}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Pro POS Tip: Kiosk Silent Printing Setup ── */}
        <div className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-500/20 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-indigo-400" />
            <h4 className="font-display font-bold text-white text-sm">
              Pro POS Tip: How to Enable 0-Click Silent Thermal Printing
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In busy retail counters, cashiers should not have to see the Windows print preview pop-up every single time.
            You can make Chrome or Edge print immediately to your thermal receipt printer:
          </p>
          <div className="p-3 rounded-2xl bg-black/60 border border-white/5 font-mono text-xs text-indigo-300 space-y-1">
            <p className="text-slate-400">// Add this flag to your Google Chrome Desktop Shortcut Target:</p>
            <p className="text-amber-300 font-bold">
              "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            Set your thermal printer as your <strong>Default Windows Printer</strong>. Whenever you click <strong>Complete Sale</strong>, the printer will immediately output the paper slip without any dialogs!
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-glow transition-all active:scale-[0.98]"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
