import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  PackagePlus, 
  Truck, 
  Calendar, 
  User, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  X, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Purchases() {
  const { purchases, loadPurchases, products, loadProducts, settings, currentUser } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // New Purchase Form
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [notes, setNotes] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([
    { productId: products[0]?._id || '', qty: 10, costPrice: products[0]?.costPrice || 100 }
  ]);

  const handleAddItemRow = () => {
    setPurchaseItems([
      ...purchaseItems,
      { productId: products[0]?._id || '', qty: 10, costPrice: products[0]?.costPrice || 100 }
    ]);
  };

  const handleUpdateItemRow = (index, field, value) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;
    if (field === 'productId') {
      const prod = products.find(p => p._id === value);
      if (prod) {
        updated[index].costPrice = prod.costPrice || 0;
      }
    }
    setPurchaseItems(updated);
  };

  const handleRemoveItemRow = (index) => {
    if (purchaseItems.length === 1) return;
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.costPrice || 0)), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert("Supplier name is required");
      return;
    }

    const formattedItems = purchaseItems.map(item => {
      const prod = products.find(p => p._id === item.productId) || {};
      return {
        productId: item.productId,
        barcode: prod.barcode || 'N/A',
        name: prod.name || 'Custom Item',
        costPrice: Number(item.costPrice),
        qty: Number(item.qty),
        total: Number(item.qty) * Number(item.costPrice)
      };
    });

    const totalAmount = calculateTotal();

    setSubmitting(true);
    try {
      await api.createPurchase({
        supplierName: supplierName.trim(),
        supplierPhone: supplierPhone.trim(),
        items: formattedItems,
        totalAmount,
        paidAmount: totalAmount,
        paymentStatus,
        notes,
        createdBy: currentUser?.name || 'Admin'
      });

      setIsModalOpen(false);
      // Reset form
      setSupplierName('');
      setSupplierPhone('');
      setNotes('');
      setPurchaseItems([{ productId: products[0]?._id || '', qty: 10, costPrice: products[0]?.costPrice || 100 }]);
      
      // Refresh purchases and inventory stock!
      loadPurchases();
      loadProducts();
    } catch (err) {
      alert("Failed to record purchase: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const s = search.toLowerCase();
    return !search || 
      p.supplierName.toLowerCase().includes(s) || 
      p.purchaseNo.toLowerCase().includes(s);
  });

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Purchases & Inward Stock
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Receive inventory from suppliers and automatically update catalog stock counts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <PackagePlus size={16} />
          <span>New Stock Purchase</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Supplier or Purchase #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={() => loadPurchases()}
          title="Refresh"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Purchases Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">PURCHASE ORDER #</th>
                <th className="py-3.5 px-4">SUPPLIER / DISTRIBUTOR</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4">STOCK ITEMS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">TOTAL INWARD COST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    <Truck size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No stock purchases found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click 'New Stock Purchase' to record your first supplier shipment.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p._id || p.purchaseNo} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-violet-400">
                      {p.purchaseNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{p.supplierName}</div>
                      {p.supplierPhone && <div className="text-[10px] text-slate-500">{p.supplierPhone}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">
                        {p.items?.map(it => `${it.name} (+${it.qty})`).join(', ') || `${p.items?.length || 0} items`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.paymentStatus || 'PAID'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {settings.currency} {Number(p.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-violet-400" />
                <h3 className="font-display font-bold text-white text-base">Record Inward Stock Purchase</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              
              {/* Supplier Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Supplier / Distributor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Rehman FMCG Wholesalers"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Supplier Phone</label>
                  <input
                    type="text"
                    placeholder="0321-1234567"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Items to receive */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    Received Products & Stock Quantities
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Plus size={14} />
                    <span>Add Another Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItemRow(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          {products.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.name} (Current: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty to Add"
                            value={item.qty}
                            onChange={(e) => handleUpdateItemRow(idx, 'qty', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Cost Price"
                          value={item.costPrice}
                          onChange={(e) => handleUpdateItemRow(idx, 'costPrice', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Inward Purchase Cost:</span>
                <span className="font-mono text-xl font-bold text-emerald-400">
                  {settings.currency} {calculateTotal().toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg"
                >
                  {submitting ? 'Updating Inventory...' : 'Receive Stock & Increment Inventory'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
