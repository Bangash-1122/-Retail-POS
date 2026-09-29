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
  FileText,
  Plus,
  Trash2,
  Tag,
  CreditCard
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Settings() {
  const { 
    settings, 
    setSettings, 
    loadSettings, 
    triggerPrintReceipt,
    addCategory,
    deleteCategory,
    addPaymentMethod,
    deletePaymentMethod
  } = usePOS();
  const [formData, setFormData] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Inline category and payment inputs
  const [newProdCat, setNewProdCat] = useState('');
  const [newExpCat, setNewExpCat] = useState('');
  const [newPayMethod, setNewPayMethod] = useState('');

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
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-5xl mx-auto bg-[#0A1214] text-[#EDF1F2]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#EDF1F2] tracking-tight">
            Store & Printer Settings
          </h2>
          <p className="text-xs text-[#B2BEC2] mt-1">
            Configure thermal receipt header, paper roll width, sound effects, and silent printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestPrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] border border-[#32383B] text-xs font-semibold transition-all shadow-sm"
          >
            <Printer size={15} />
            <span>Test Print Receipt</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-[#32383B] border border-[#CBD3D6]/40 text-[#EDF1F2] text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#CBD3D6]" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ── Section 1: Thermal Printer Preferences ── */}
        <div className="p-6 rounded-3xl bg-[#32383B]/20 border border-[#32383B] shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#32383B]">
            <div className="p-2 rounded-xl bg-[#32383B] text-[#CBD3D6] border border-[#32383B]">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#EDF1F2] text-base">Thermal Printer Configuration</h3>
              <p className="text-xs text-[#B2BEC2]">Works universally with USB, Wi-Fi, and Bluetooth POS printers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Paper Width Roll */}
            <div>
              <label className="block text-xs font-semibold text-[#B2BEC2] mb-1.5 uppercase tracking-wider">
                Printer Paper Roll Width
              </label>
              <select
                name="paperWidth"
                value={formData.paperWidth || '80mm'}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
              >
                <option value="80mm">80mm (Standard POS Roll - 3 inch)</option>
                <option value="58mm">58mm (Compact Mobile POS Roll - 2 inch)</option>
              </select>
              <p className="text-[11px] text-[#B2BEC2] mt-1">
                Choose the size that matches your thermal paper roll width.
              </p>
            </div>

            {/* Auto Print on Checkout */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0A1214] border border-[#32383B]">
              <div>
                <label className="text-xs font-semibold text-[#EDF1F2] block">
                  Auto-Print on Checkout
                </label>
                <span className="text-[11px] text-[#B2BEC2]">
                  Instantly open print dialog when sale completes
                </span>
              </div>
              <input
                type="checkbox"
                name="autoPrintReceipt"
                checked={formData.autoPrintReceipt}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#CBD3D6] focus:ring-[#CBD3D6] bg-[#32383B] border-[#32383B]"
              />
            </div>

            {/* Scanner Beep Sound */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0A1214] border border-[#32383B]">
              <div>
                <label className="text-xs font-semibold text-[#EDF1F2] block">
                  Barcode Scanner Beep Sound
                </label>
                <span className="text-[11px] text-[#B2BEC2]">
                  Audio chime feedback on scan & item additions
                </span>
              </div>
              <input
                type="checkbox"
                name="enableBeep"
                checked={formData.enableBeep}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#CBD3D6] focus:ring-[#CBD3D6] bg-[#32383B] border-[#32383B]"
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-xs font-semibold text-[#B2BEC2] mb-1.5 uppercase tracking-wider">
                Sales Tax (GST / VAT %)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Store Branding & Receipt Header ── */}
        <div className="p-6 rounded-3xl bg-[#32383B]/20 border border-[#32383B] shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#32383B]">
            <div className="p-2 rounded-xl bg-[#32383B] text-[#CBD3D6] border border-[#32383B]">
              <Store size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#EDF1F2] text-base">Store Branding & Receipt Header</h3>
              <p className="text-xs text-[#B2BEC2]">These details appear at the top and bottom of every printed receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#B2BEC2] font-medium mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>

            <div>
              <label className="block text-[#B2BEC2] font-medium mb-1">Store Tagline</label>
              <input
                type="text"
                name="storeTagline"
                value={formData.storeTagline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#B2BEC2] font-medium mb-1">Store Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>

            <div>
              <label className="block text-[#B2BEC2] font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>

            <div>
              <label className="block text-[#B2BEC2] font-medium mb-1">NTN / Tax Registration #</label>
              <input
                type="text"
                name="ntn"
                value={formData.ntn}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>

            <div>
              <label className="block text-[#B2BEC2] font-medium mb-1">Currency Symbol</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#B2BEC2] font-medium mb-1">Receipt Footer Note / Return Policy</label>
              <textarea
                rows="3"
                name="receiptFooter"
                value={formData.receiptFooter}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6] font-mono"
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: Dynamic Product Categories, Expense Categories & Payment Methods ── */}
        <div className="p-6 rounded-3xl bg-[#32383B]/20 border border-[#32383B] shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#32383B]">
            <div className="p-2 rounded-xl bg-[#32383B] text-[#CBD3D6] border border-[#32383B]">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-[#EDF1F2] text-base">Dynamic Categories & Payment Methods</h3>
              <p className="text-xs text-[#B2BEC2]">Add or remove custom product categories, expense classifications, and checkout payment methods</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Product Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#B2BEC2] uppercase tracking-wider">
                  Product Categories ({settings.productCategories?.length || 0})
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(settings.productCategories || []).map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs font-medium text-[#EDF1F2]">
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Remove category "${cat}"?`)) {
                          await deleteCategory('product', cat);
                          await loadSettings();
                        }
                      }}
                      className="text-[#B2BEC2] hover:text-[#EDF1F2] ml-0.5"
                      title="Remove category"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="New product category..."
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newProdCat.trim()) return;
                    await addCategory('product', newProdCat.trim());
                    await loadSettings();
                    setNewProdCat('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="pt-4 border-t border-[#32383B]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#B2BEC2] uppercase tracking-wider">
                  Expense Categories ({settings.expenseCategories?.length || 0})
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(settings.expenseCategories || []).map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs font-medium text-[#EDF1F2]">
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Remove expense category "${cat}"?`)) {
                          await deleteCategory('expense', cat);
                          await loadSettings();
                        }
                      }}
                      className="text-[#B2BEC2] hover:text-[#EDF1F2] ml-0.5"
                      title="Remove expense category"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="New expense category (e.g. Fuel, Tea)..."
                  value={newExpCat}
                  onChange={(e) => setNewExpCat(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newExpCat.trim()) return;
                    await addCategory('expense', newExpCat.trim());
                    await loadSettings();
                    setNewExpCat('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="pt-4 border-t border-[#32383B]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#B2BEC2] uppercase tracking-wider">
                  Payment Methods ({settings.paymentMethods?.length || 0})
                </label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(settings.paymentMethods || []).map((method) => (
                  <span key={method} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs font-medium text-[#CBD3D6]">
                    <span>{method}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Remove payment method "${method}"?`)) {
                          await deletePaymentMethod(method);
                          await loadSettings();
                        }
                      }}
                      className="text-[#B2BEC2] hover:text-[#EDF1F2] ml-0.5"
                      title="Remove payment method"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="New payment method (e.g. Nayapay, Voucher)..."
                  value={newPayMethod}
                  onChange={(e) => setNewPayMethod(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newPayMethod.trim()) return;
                    await addPaymentMethod(newPayMethod.trim());
                    await loadSettings();
                    setNewPayMethod('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── Section 4: Pro POS Tip: Kiosk Silent Printing Setup ── */}
        <div className="p-6 rounded-3xl bg-[#32383B]/10 border border-[#32383B] shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-[#CBD3D6]" />
            <h4 className="font-display font-bold text-[#EDF1F2] text-sm">
              Pro POS Tip: How to Enable 0-Click Silent Thermal Printing
            </h4>
          </div>
          <p className="text-xs text-[#B2BEC2] leading-relaxed">
            In busy retail counters, cashiers should not have to see the Windows print preview pop-up every single time.
            You can make Chrome or Edge print immediately to your thermal receipt printer:
          </p>
          <div className="p-3 rounded-2xl bg-[#0A1214] border border-[#32383B] font-mono text-xs text-[#CBD3D6] space-y-1">
            <p className="text-[#B2BEC2]">// Add this flag to your Google Chrome Desktop Shortcut Target:</p>
            <p className="text-[#EDF1F2] font-bold">
              "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing
            </p>
          </div>
          <p className="text-[11px] text-[#B2BEC2]">
            Set your thermal printer as your <strong>Default Windows Printer</strong>. Whenever you click <strong>Complete Sale</strong>, the printer will immediately output the paper slip without any dialogs!
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
