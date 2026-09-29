import React, { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  Trash2, 
  Edit2,
  Calendar, 
  Tag, 
  Banknote, 
  CreditCard, 
  Search, 
  RefreshCw, 
  X,
  FileText,
  Images,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Expenses() {
  const { 
    expenses, 
    loadExpenses, 
    settings, 
    currentUser, 
    loadSettings, 
    addCategory, 
    deleteCategory 
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Category Creation
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Multi-image receipt input state
  const [newReceiptUrl, setNewReceiptUrl] = useState('');

  // Lightbox / Image Viewer Modal
  const [activeViewerReceipts, setActiveViewerReceipts] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  const availableCategories = (settings?.expenseCategories && settings.expenseCategories.length > 0)
    ? settings.expenseCategories
    : ['Utilities', 'Rent', 'Salaries', 'Refreshment & Tea', 'Transportation', 'Maintenance', 'Packaging', 'Marketing', 'Other'];

  const availablePaymentMethods = (settings?.paymentMethods && settings.paymentMethods.length > 0)
    ? settings.paymentMethods
    : ['Cash', 'Card / POS', 'EasyPaisa', 'JazzCash', 'Raast / QR', 'Bank Transfer', 'Store Credit'];

  const [formData, setFormData] = useState({
    title: '',
    category: availableCategories[0] || 'Utilities',
    amount: '',
    paymentMethod: availablePaymentMethods[0] || 'Cash',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    receiptImage: '',
    receiptImages: []
  });

  const openAddModal = () => {
    setEditingExpense(null);
    setShowAddCategoryInput(false);
    setNewReceiptUrl('');
    setFormData({
      title: '',
      category: availableCategories[0] || 'Utilities',
      amount: '',
      paymentMethod: availablePaymentMethods[0] || 'Cash',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      receiptImage: '',
      receiptImages: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setShowAddCategoryInput(false);
    setNewReceiptUrl('');
    const imgs = Array.isArray(exp.receiptImages) && exp.receiptImages.length > 0
      ? exp.receiptImages
      : (exp.receiptImage ? [exp.receiptImage] : []);

    setFormData({
      title: exp.title,
      category: exp.category,
      amount: String(exp.amount),
      paymentMethod: exp.paymentMethod || 'Cash',
      date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: exp.notes || '',
      receiptImage: imgs[0] || '',
      receiptImages: imgs
    });
    setIsModalOpen(true);
  };

  const handleAddReceiptImage = () => {
    if (!newReceiptUrl.trim()) return;
    const url = newReceiptUrl.trim();
    if (!formData.receiptImages.includes(url)) {
      const updated = [...formData.receiptImages, url];
      setFormData({
        ...formData,
        receiptImages: updated,
        receiptImage: updated[0] || ''
      });
    }
    setNewReceiptUrl('');
  };

  const handleRemoveReceiptImage = (index) => {
    const updated = formData.receiptImages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      receiptImages: updated,
      receiptImage: updated[0] || ''
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await addCategory('expense', newCategoryName.trim());
      await loadSettings();
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowAddCategoryInput(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      await api.deleteExpense(id);
      loadExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      alert("Title and amount are required!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        receiptImage: formData.receiptImages[0] || formData.receiptImage || '',
        receiptImages: formData.receiptImages,
        recordedBy: currentUser?.name || 'Admin'
      };

      if (editingExpense) {
        await api.updateExpense(editingExpense._id, payload);
      } else {
        await api.createExpense(payload);
      }

      setIsModalOpen(false);
      loadExpenses();
      loadSettings();
    } catch (err) {
      alert("Failed to save expense: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openReceiptViewer = (receiptsList, initialIndex = 0) => {
    if (!receiptsList || receiptsList.length === 0) return;
    setActiveViewerReceipts(receiptsList);
    setViewerIndex(initialIndex);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesCat = selectedCategory === 'All' || e.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenseAmount = expenses
    .filter(e => new Date(e.date).toISOString().slice(0, 10) === todayStr)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto bg-[#0A1214] text-[#EDF1F2]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#EDF1F2] tracking-tight">
            Store Expenses & Petty Cash
          </h2>
          <p className="text-xs text-[#B2BEC2] mt-1">
            Track day-to-day operational costs, utilities, bills, and multi-receipt audit attachments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs shadow-md transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#32383B]/20 border border-[#32383B] shadow-xl">
          <span className="text-xs font-medium text-[#B2BEC2] uppercase tracking-wider block mb-1">
            Total Logged Expenses
          </span>
          <span className="font-mono text-2xl font-black text-[#EDF1F2]">
            {settings.currency} {totalExpenseAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#B2BEC2] block mt-1">
            Across {expenses.length} recorded items
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#32383B]/20 border border-[#32383B] shadow-xl">
          <span className="text-xs font-medium text-[#B2BEC2] uppercase tracking-wider block mb-1">
            Today's Outflow
          </span>
          <span className="font-mono text-2xl font-black text-[#CBD3D6]">
            {settings.currency} {todayExpenseAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#B2BEC2] block mt-1">
            Spent today on daily overheads
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#32383B]/20 border border-[#32383B] shadow-xl">
          <span className="text-xs font-medium text-[#B2BEC2] uppercase tracking-wider block mb-1">
            Expense Categories
          </span>
          <span className="font-display text-xl font-bold text-[#EDF1F2]">
            {availableCategories.length} Active Categories
          </span>
          <span className="text-[11px] text-[#B2BEC2] block mt-1">
            Fully customizable & dynamic
          </span>
        </div>
      </div>

      {/* Dynamic Category Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#32383B]/20 border border-[#32383B] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-2.5 text-[#B2BEC2]" />
          <input
            type="text"
            placeholder="Search expense description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] placeholder-[#B2BEC2]/60 focus:outline-none focus:border-[#CBD3D6]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-[#CBD3D6] text-[#0A1214] font-bold'
                : 'bg-[#32383B] text-[#B2BEC2] hover:bg-[#CBD3D6] hover:text-[#0A1214] border border-[#32383B]'
            }`}
          >
            All
          </button>
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#CBD3D6] text-[#0A1214] font-bold'
                  : 'bg-[#32383B] text-[#B2BEC2] hover:bg-[#CBD3D6] hover:text-[#0A1214] border border-[#32383B]'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={openAddModal}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#32383B] text-[#EDF1F2] hover:bg-[#CBD3D6] hover:text-[#0A1214] border border-[#32383B] flex items-center gap-1 whitespace-nowrap transition-colors"
          >
            <Plus size={13} />
            <span>Category</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#32383B]/10 border border-[#32383B] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#32383B]/40 text-[#B2BEC2] font-semibold border-b border-[#32383B]">
              <tr>
                <th className="py-3.5 px-4">EXPENSE & RECEIPTS</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4">PAID VIA</th>
                <th className="py-3.5 px-4">RECORDED BY</th>
                <th className="py-3.5 px-4 text-right">AMOUNT</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#32383B]/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#B2BEC2]">
                    <DollarSign size={32} className="text-[#32383B] mx-auto mb-2" />
                    <p className="font-semibold text-[#EDF1F2]">No expense records found</p>
                    <p className="text-xs text-[#B2BEC2] mt-0.5">Click 'Record New Expense' to log operational spending.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const receiptList = Array.isArray(exp.receiptImages) && exp.receiptImages.length > 0
                    ? exp.receiptImages
                    : (exp.receiptImage ? [exp.receiptImage] : []);

                  return (
                    <tr key={exp._id} className="hover:bg-[#32383B]/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#EDF1F2]">
                        <div className="flex items-center gap-3">
                          {receiptList.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => openReceiptViewer(receiptList, 0)}
                              className="relative w-10 h-10 rounded-xl bg-[#0A1214] overflow-hidden flex-shrink-0 border border-[#32383B] group/thumb hover:border-[#CBD3D6] transition-colors"
                              title="Click to view full receipts"
                            >
                              <img src={receiptList[0]} alt="Receipt" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                              {receiptList.length > 1 && (
                                <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-[#0A1214]/90 text-[8px] font-bold text-[#CBD3D6] rounded-tl-md">
                                  {receiptList.length}📷
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-[#EDF1F2] transition-opacity">
                                <Eye size={12} />
                              </div>
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#0A1214] border border-[#32383B] flex items-center justify-center text-[#B2BEC2] flex-shrink-0">
                              <FileText size={16} />
                            </div>
                          )}
                          <div>
                            <div className="text-[#EDF1F2] font-semibold">{exp.title}</div>
                            {exp.notes && <div className="text-[10px] text-[#B2BEC2] font-normal">{exp.notes}</div>}
                            {receiptList.length > 0 && (
                              <button
                                type="button"
                                onClick={() => openReceiptViewer(receiptList, 0)}
                                className="text-[10px] text-[#CBD3D6] hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Images size={10} />
                                <span>{receiptList.length} Receipt photo(s)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#32383B] text-[#EDF1F2] font-medium text-[11px] border border-[#32383B]">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[#B2BEC2]">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#32383B] text-[#EDF1F2] border border-[#32383B]">
                          {exp.paymentMethod || 'Cash'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#B2BEC2]">
                        {exp.recordedBy || 'Admin'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-[#EDF1F2] text-sm">
                        - {settings.currency} {Number(exp.amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 rounded-lg text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6] transition-colors"
                            title="Edit / Upgrade Expense"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="p-1.5 rounded-lg text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6] transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-[#CBD3D6]" />
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">
                  {editingExpense ? 'Upgrade / Edit Expense' : 'Record Store Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#B2BEC2] hover:text-[#EDF1F2]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-[#B2BEC2] font-medium mb-1">Expense Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LESCO Store Electricity Bill"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Dynamic Category Selector with Inline Creation */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#B2BEC2] font-medium">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                      className="text-[10px] text-[#CBD3D6] hover:text-[#EDF1F2] font-semibold flex items-center gap-0.5"
                    >
                      <Plus size={10} /> + New
                    </button>
                  </div>

                  {showAddCategoryInput ? (
                    <div className="flex items-center gap-1.5 mb-2">
                      <input
                        type="text"
                        placeholder="Category name..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#32383B]/40 border border-[#CBD3D6]/50 text-[#EDF1F2] text-xs focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-2.5 py-1.5 rounded-lg bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-semibold text-xs"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryInput(false)}
                        className="px-1.5 py-1 text-[#B2BEC2] hover:text-[#EDF1F2]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}

                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                  >
                    {availableCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Amount ({settings.currency}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] font-bold font-mono focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                  >
                    {availablePaymentMethods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Receipt Image Uploader */}
              <div className="p-3.5 rounded-2xl bg-[#32383B]/20 border border-[#32383B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#EDF1F2] font-medium">
                    <Images size={14} className="text-[#CBD3D6]" />
                    <span>Receipt & Invoice Photos ({formData.receiptImages.length})</span>
                  </div>
                  <span className="text-[10px] text-[#B2BEC2]">Multiple Photos Supported</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste receipt photo URL..."
                    value={newReceiptUrl}
                    onChange={(e) => setNewReceiptUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddReceiptImage();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-[#EDF1F2] placeholder-[#B2BEC2]/60 text-xs focus:outline-none focus:border-[#CBD3D6]"
                  />
                  <button
                    type="button"
                    onClick={handleAddReceiptImage}
                    className="px-3 py-2 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                {/* Receipt Thumbnails Grid */}
                {formData.receiptImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {formData.receiptImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group/thumb aspect-square rounded-xl overflow-hidden bg-[#0A1214] border border-[#32383B]">
                        <img src={imgUrl} alt={`Receipt ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveReceiptImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-[#0A1214] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] opacity-0 group/thumb:opacity-100 transition-opacity"
                          title="Remove receipt photo"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#B2BEC2] font-medium mb-1">Additional Notes</label>
                <textarea
                  rows="2"
                  placeholder="Invoice number, payment reference or details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#32383B]">
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
                  {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Full Receipt Viewer Modal */}
      {activeViewerReceipts && activeViewerReceipts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-[#EDF1F2] pb-3 px-2">
              <span className="text-xs font-semibold text-[#EDF1F2]">
                Receipt {viewerIndex + 1} of {activeViewerReceipts.length}
              </span>
              <button
                onClick={() => setActiveViewerReceipts(null)}
                className="p-1.5 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden bg-[#0A1214] border border-[#32383B]">
              <img
                src={activeViewerReceipts[viewerIndex]}
                alt="Receipt Full View"
                className="max-h-[75vh] max-w-full object-contain"
              />

              {activeViewerReceipts.length > 1 && (
                <>
                  <button
                    onClick={() => setViewerIndex((prev) => (prev - 1 + activeViewerReceipts.length) % activeViewerReceipts.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setViewerIndex((prev) => (prev + 1) % activeViewerReceipts.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails strip */}
            {activeViewerReceipts.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto p-1">
                {activeViewerReceipts.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setViewerIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      viewerIndex === idx ? 'border-[#CBD3D6] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
