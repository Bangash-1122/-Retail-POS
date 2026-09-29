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
  ShoppingBag, 
  Edit3, 
  Eye, 
  AlertTriangle 
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Purchases() {
  const { purchases, loadPurchases, products, loadProducts, settings, currentUser } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  // Modals for View, Edit, Delete
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editForm, setEditForm] = useState({
    supplierName: '',
    supplierPhone: '',
    paymentStatus: 'paid',
    notes: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Rollback confirmation
  const [deletingPurchase, setDeletingPurchase] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        supplierName,
        supplierPhone,
        paymentStatus,
        notes,
        items: formattedItems,
        totalAmount
      });

      setIsModalOpen(false);
      setSupplierName('');
      setSupplierPhone('');
      setNotes('');
      setPurchaseItems([{ productId: products[0]?._id || '', qty: 10, costPrice: products[0]?.costPrice || 100 }]);
      
      loadPurchases();
      loadProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (p) => {
    setEditingPurchase(p);
    setEditForm({
      supplierName: p.supplierName || '',
      supplierPhone: p.supplierPhone || '',
      paymentStatus: p.paymentStatus || 'paid',
      notes: p.notes || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPurchase) return;
    setSavingEdit(true);
    try {
      await api.updatePurchase(editingPurchase._id, editForm);
      setEditingPurchase(null);
      loadPurchases();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPurchase) return;
    setIsDeleting(true);
    try {
      await api.deletePurchase(deletingPurchase._id);
      setDeletingPurchase(null);
      loadPurchases();
      loadProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const s = search.toLowerCase();
    return (
      p.supplierName?.toLowerCase().includes(s) ||
      p.purchaseNo?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto bg-[#0A1214] text-[#EDF1F2]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#EDF1F2] tracking-tight">
            Purchases & Inward Stock
          </h2>
          <p className="text-xs text-[#B2BEC2] mt-1">
            Receive inventory from suppliers, edit shipments, or delete with safe stock rollback.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs shadow-md transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <PackagePlus size={16} />
          <span>New Stock Purchase</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#32383B]/20 border border-[#32383B] flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-[#B2BEC2]" />
          <input
            type="text"
            placeholder="Search by Supplier or Purchase #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] placeholder-[#B2BEC2]/60 focus:outline-none focus:border-[#CBD3D6]"
          />
        </div>

        <button
          onClick={() => loadPurchases()}
          title="Refresh"
          className="p-2 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] transition-colors"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Purchases Table */}
      <div className="bg-[#32383B]/10 border border-[#32383B] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#32383B]/40 text-[#B2BEC2] font-semibold border-b border-[#32383B]">
              <tr>
                <th className="py-3.5 px-4">PURCHASE ORDER #</th>
                <th className="py-3.5 px-4">SUPPLIER / DISTRIBUTOR</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4">STOCK ITEMS</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">TOTAL INWARD COST</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#32383B]/60">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#B2BEC2]">
                    <Truck size={32} className="text-[#32383B] mx-auto mb-2" />
                    <p className="font-semibold text-[#EDF1F2]">No stock purchases found</p>
                    <p className="text-xs text-[#B2BEC2] mt-0.5">Click 'New Stock Purchase' to record your first supplier shipment.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p._id || p.purchaseNo} className="hover:bg-[#32383B]/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#CBD3D6]">
                      {p.purchaseNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#EDF1F2]">{p.supplierName}</div>
                      {p.supplierPhone && <div className="text-[10px] text-[#B2BEC2]">{p.supplierPhone}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#B2BEC2]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setViewingPurchase(p)}
                        className="px-2 py-0.5 rounded-md bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] font-mono text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        <span>{p.items?.length || 0} item(s)</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-[#32383B] text-[#CBD3D6] border border-[#32383B]">
                        {p.paymentStatus || 'PAID'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#EDF1F2] text-sm">
                      {settings.currency} {Number(p.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Supplier & Status"
                          className="p-1.5 rounded-lg bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] transition-colors"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingPurchase(p)}
                          title="Delete Purchase & Rollback Stock"
                          className="p-1.5 rounded-lg bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] border border-[#32383B] transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Purchase Items Breakdown Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#CBD3D6]" />
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">
                  Purchase Order: {viewingPurchase.purchaseNo}
                </h3>
              </div>
              <button onClick={() => setViewingPurchase(null)} className="text-[#B2BEC2] hover:text-[#EDF1F2]">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#32383B]/20 border border-[#32383B]">
                <div>
                  <span className="text-[#B2BEC2] text-[10px] uppercase font-bold">Supplier:</span>
                  <p className="font-semibold text-[#EDF1F2]">{viewingPurchase.supplierName}</p>
                </div>
                {viewingPurchase.supplierPhone && (
                  <div className="text-right">
                    <span className="text-[#B2BEC2] text-[10px] uppercase font-bold">Phone:</span>
                    <p className="font-mono text-[#EDF1F2]">{viewingPurchase.supplierPhone}</p>
                  </div>
                )}
              </div>

              <div className="divide-y divide-[#32383B]/60">
                {viewingPurchase.items?.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#EDF1F2]">{it.name}</p>
                      <p className="text-[11px] text-[#B2BEC2] font-mono">
                        +{it.qty} units received @ {settings.currency} {Number(it.costPrice).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right font-mono font-bold text-[#EDF1F2]">
                      {settings.currency} {Number(it.total || (it.qty * it.costPrice)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#32383B] flex justify-between items-center">
                <span className="text-xs text-[#B2BEC2] font-medium">Total Purchase Amount:</span>
                <span className="font-mono font-bold text-[#EDF1F2] text-base">
                  {settings.currency} {Number(viewingPurchase.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Purchase Modal */}
      {editingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-[#CBD3D6]" />
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">
                  Edit Purchase: {editingPurchase.purchaseNo}
                </h3>
              </div>
              <button onClick={() => setEditingPurchase(null)} className="text-[#B2BEC2] hover:text-[#EDF1F2]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#B2BEC2] font-medium mb-1">Supplier / Distributor Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.supplierName}
                  onChange={(e) => setEditForm({ ...editForm, supplierName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
              </div>

              <div>
                <label className="block text-[#B2BEC2] font-medium mb-1">Supplier Phone</label>
                <input
                  type="text"
                  value={editForm.supplierPhone}
                  onChange={(e) => setEditForm({ ...editForm, supplierPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
              </div>

              <div>
                <label className="block text-[#B2BEC2] font-medium mb-1">Payment Status</label>
                <select
                  value={editForm.paymentStatus}
                  onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                >
                  <option value="paid">Paid (Cleared)</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid (Credit)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#B2BEC2] font-medium mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
              </div>

              <div className="pt-3 border-t border-[#32383B] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPurchase(null)}
                  className="px-4 py-2 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold flex items-center gap-1.5 transition-colors"
                >
                  {savingEdit && <RefreshCw size={13} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Rollback Confirmation Modal */}
      {deletingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#CBD3D6]" />
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">
                  Delete Purchase & Rollback Stock?
                </h3>
              </div>
              <button onClick={() => setDeletingPurchase(null)} className="text-[#B2BEC2] hover:text-[#EDF1F2]">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#EDF1F2]">
                Are you sure you want to delete purchase <span className="font-mono font-bold text-[#CBD3D6]">{deletingPurchase.purchaseNo}</span> from <span className="font-semibold text-[#EDF1F2]">{deletingPurchase.supplierName}</span>?
              </p>

              <div className="p-3.5 rounded-xl bg-[#32383B]/40 border border-[#32383B] text-[#B2BEC2] space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#EDF1F2]">
                  <CheckCircle2 size={14} className="text-[#CBD3D6]" />
                  Automatic Stock Rollback Safeguard
                </p>
                <p className="text-[11px] text-[#B2BEC2]">
                  The {deletingPurchase.items?.length || 0} product item(s) received in this order will have their stock deducted back from current inventory to keep counts accurate.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPurchase(null)}
                  className="px-4 py-2 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] font-semibold transition-colors"
                >
                  Keep Purchase
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] border border-[#CBD3D6]/40 text-[#EDF1F2] font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isDeleting && <RefreshCw size={13} className="animate-spin" />}
                  <span>Confirm Delete & Rollback</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#CBD3D6]" />
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">Record Inward Stock Purchase</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#B2BEC2] hover:text-[#EDF1F2]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              
              {/* Supplier Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Supplier / Distributor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al-Rehman FMCG Wholesalers"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>
                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Supplier Phone</label>
                  <input
                    type="text"
                    placeholder="0321-1234567"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>
              </div>

              {/* Items to receive */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#B2BEC2] font-semibold uppercase tracking-wider text-[11px]">
                    Received Products & Stock Quantities
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-xs text-[#CBD3D6] hover:text-[#EDF1F2] font-medium"
                  >
                    <Plus size={14} />
                    <span>Add Another Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#32383B]/20 border border-[#32383B] grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItemRow(idx, 'productId', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6] text-xs"
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
                            className="w-full px-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] font-mono text-xs focus:outline-none focus:border-[#CBD3D6]"
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
                          className="w-full px-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] font-mono text-xs focus:outline-none focus:border-[#CBD3D6]"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1.5 text-[#B2BEC2] hover:text-[#CBD3D6]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-[#32383B]/20 border border-[#32383B] flex items-center justify-between">
                <span className="text-xs text-[#B2BEC2]">Total Inward Purchase Cost:</span>
                <span className="font-mono text-xl font-bold text-[#EDF1F2]">
                  {settings.currency} {calculateTotal().toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#B2BEC2] hover:text-[#EDF1F2] hover:bg-[#32383B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold shadow-md transition-all active:scale-[0.98]"
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
