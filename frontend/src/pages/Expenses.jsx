import React, { useState } from 'react';
import { 
  Plus, 
  DollarSign, 
  Trash2, 
  Calendar, 
  Tag, 
  Banknote, 
  CreditCard, 
  Building, 
  Coffee, 
  Zap, 
  Search, 
  RefreshCw, 
  X,
  FileText
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

const EXPENSE_CATEGORIES = [
  'All',
  'Utilities',
  'Rent',
  'Salaries',
  'Refreshment & Tea',
  'Transportation',
  'Maintenance',
  'Packaging',
  'Marketing',
  'Other'
];

export default function Expenses() {
  const { expenses, loadExpenses, settings, currentUser } = usePOS();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    paymentMethod: 'cash',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
    receiptImage: ''
  });

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
      await api.createExpense({
        ...formData,
        amount: Number(formData.amount),
        recordedBy: currentUser?.name || 'Admin'
      });
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Utilities',
        amount: '',
        paymentMethod: 'cash',
        date: new Date().toISOString().slice(0, 10),
        notes: '',
        receiptImage: ''
      });
      loadExpenses();
    } catch (err) {
      alert("Failed to save expense: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenseAmount = expenses
    .filter(e => new Date(e.date).toISOString().slice(0, 10) === todayStr)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Store Expenses & Petty Cash
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track day-to-day operational costs, utilities, bills, and refreshment costs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Logged Expenses
          </span>
          <span className="font-mono text-2xl font-black text-amber-400">
            {settings.currency} {totalExpenseAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Across {expenses.length} recorded items
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Today's Outflow
          </span>
          <span className="font-mono text-2xl font-black text-rose-400">
            {settings.currency} {todayExpenseAmount.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Spent today on daily overheads
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-[#111827] border border-slate-800 shadow-xl">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Top Expense Category
          </span>
          <span className="font-display text-xl font-bold text-slate-200">
            Utilities & Energy
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Electricity & generator fuel
          </span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search expense description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {EXPENSE_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">EXPENSE TITLE</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4">PAID VIA</th>
                <th className="py-3.5 px-4">RECORDED BY</th>
                <th className="py-3.5 px-4 text-right">AMOUNT</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <DollarSign size={32} className="text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No expense records found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click 'Record New Expense' to log operational spending.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div>{exp.title}</div>
                      {exp.notes && <div className="text-[10px] text-slate-500 font-normal">{exp.notes}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 font-medium text-[11px] border border-slate-700/60">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {exp.recordedBy || 'Admin'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                      - {settings.currency} {Number(exp.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-amber-400" />
                <h3 className="font-display font-bold text-white text-base">Record Store Expense</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Expense Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LESCO Store Electricity Bill"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {EXPENSE_CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Amount ({settings.currency}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-rose-400 font-bold font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="cash">Cash (Petty Cash)</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Company Card</option>
                    <option value="mobile_wallet">Mobile Wallet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Additional Notes</label>
                <textarea
                  rows="2"
                  placeholder="Invoice number, payment reference or details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg"
                >
                  {submitting ? 'Saving...' : 'Save Expense Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
