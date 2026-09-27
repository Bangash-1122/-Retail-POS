import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  AlertTriangle, 
  Barcode, 
  CheckCircle2, 
  X,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Inventory() {
  const { products, loadProducts, loadingProducts, settings } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category: 'Groceries',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '5',
    image: '',
  });

  const categories = ['All', 'Groceries', 'Beverages', 'Snacks', 'Dairy', 'Bakery', 'Personal Care', 'Household'];

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      barcode: `8964${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      category: 'Groceries',
      price: '',
      costPrice: '',
      stock: '20',
      minStock: '5',
      image: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      price: String(p.price),
      costPrice: String(p.costPrice || 0),
      stock: String(p.stock),
      minStock: String(p.minStock || 5),
      image: p.image || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode || !formData.price) {
      alert("Barcode, name, and price are required!");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !filterLowStock || (p.stock <= p.minStock);
    return matchesCat && matchesSearch && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
            Inventory & Products
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your stock, retail barcodes, categories, and low-inventory alerts.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Low Stock Alert Banner (if any) */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
            <span>
              <strong>Low Stock Warning:</strong> You have <strong>{lowStockCount}</strong> products running below their minimum alert threshold!
            </span>
          </div>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
              filterLowStock
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
            }`}
          >
            {filterLowStock ? 'Show All Products' : 'View Low Stock Items'}
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by product name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => loadProducts()}
            title="Refresh"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw size={15} className={loadingProducts ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F172A] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">PRODUCT</th>
                <th className="py-3.5 px-4">BARCODE</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4 text-right">COST PRICE</th>
                <th className="py-3.5 px-4 text-right">SALE PRICE</th>
                <th className="py-3.5 px-4 text-center">STOCK LEVEL</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock <= 0;
                return (
                  <tr key={p._id || p.barcode} className="hover:bg-slate-800/30 transition-colors">
                    
                    {/* Name & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px]">
                              POS
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{p.name}</p>
                          <span className="text-[10px] text-slate-500">Min Alert: {p.minStock} units</span>
                        </div>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Barcode size={13} className="text-slate-500" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700/60">
                        {p.category}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {settings.currency} {Number(p.costPrice || 0).toLocaleString()}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {settings.currency} {Number(p.price).toLocaleString()}
                    </td>

                    {/* Stock status badge */}
                    <td className="py-3 px-4 text-center">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                          Low Stock: {p.stock}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.stock} units
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-base">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-medium mb-1">Barcode / SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-400 font-medium mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lipton Tea 400g"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cost Price ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Selling Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-bold font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Min Alert Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-glow"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
