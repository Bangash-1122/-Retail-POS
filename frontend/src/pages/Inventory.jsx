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
  Image as ImageIcon,
  Images,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { api } from '../utils/api';

export default function Inventory() {
  const { products, loadProducts, loadingProducts, settings, loadSettings } = usePOS();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox / Multiple Images Viewer Modal
  const [activeViewerProduct, setActiveViewerProduct] = useState(null);
  const [viewerImgIndex, setViewerImgIndex] = useState(0);

  // New category inline creation
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Multiple image input state
  const [newImageUrl, setNewImageUrl] = useState('');

  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category: 'Groceries',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '5',
    image: '',
    images: [],
    description: ''
  });

  const availableCategories = settings.productCategories || [
    'Groceries', 'Beverages', 'Snacks', 'Dairy', 'Bakery', 'Personal Care', 'Household'
  ];

  const openAddModal = () => {
    setEditingProduct(null);
    setShowAddCategoryInput(false);
    setNewImageUrl('');
    setFormData({
      barcode: `8964${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      category: availableCategories[0] || 'Groceries',
      price: '',
      costPrice: '',
      stock: '20',
      minStock: '5',
      image: '',
      images: [],
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setShowAddCategoryInput(false);
    setNewImageUrl('');
    const imgList = Array.isArray(p.images) && p.images.length > 0 
      ? p.images 
      : (p.image ? [p.image] : []);

    setFormData({
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      price: String(p.price),
      costPrice: String(p.costPrice || 0),
      stock: String(p.stock),
      minStock: String(p.minStock || 5),
      image: p.image || imgList[0] || '',
      images: imgList,
      description: p.description || ''
    });
    setIsModalOpen(true);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!formData.images.includes(url)) {
      const updated = [...formData.images, url];
      setFormData({
        ...formData,
        images: updated,
        image: formData.image || url
      });
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updated,
      image: updated[0] || ''
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await api.addCategory('product', newCategoryName.trim());
      await loadSettings();
      setFormData({ ...formData, category: newCategoryName.trim() });
      setNewCategoryName('');
      setShowAddCategoryInput(false);
    } catch (err) {
      alert(err.message);
    }
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
      const payload = {
        ...formData,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice || 0),
        stock: Number(formData.stock || 0),
        minStock: Number(formData.minStock || 5),
        image: formData.images[0] || formData.image || '',
        images: formData.images
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      loadProducts();
      loadSettings();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.barcode.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !filterLowStock || (p.stock <= p.minStock);
    return matchesCat && matchesSearch && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 max-w-7xl mx-auto bg-[#0A1214] text-[#EDF1F2]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[#EDF1F2] tracking-tight">
            Inventory & Catalog
          </h2>
          <p className="text-xs text-[#B2BEC2] mt-1">
            Manage your stock, multi-angle product photography, dynamic retail categories, and low-inventory alerts.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-xs shadow-md transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#32383B]/50 border border-[#CBD3D6]/30 flex items-center justify-between gap-3 text-xs text-[#EDF1F2]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-[#CBD3D6] flex-shrink-0" />
            <span>
              <strong className="text-[#EDF1F2]">Low Stock Warning:</strong> You have <strong>{lowStockCount}</strong> products running below their minimum alert threshold!
            </span>
          </div>
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
              filterLowStock
                ? 'bg-[#CBD3D6] text-[#0A1214] font-bold'
                : 'bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] border border-[#32383B]'
            }`}
          >
            {filterLowStock ? 'Show All Products' : 'View Low Stock Items'}
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#32383B]/20 border border-[#32383B] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-[#B2BEC2]" />
            <input
              type="text"
              placeholder="Search by product name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] placeholder-[#B2BEC2]/60 focus:outline-none focus:border-[#CBD3D6]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0A1214] border border-[#32383B] text-xs text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
          >
            <option value="All">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => loadProducts()}
            title="Refresh"
            className="p-2 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] transition-colors"
          >
            <RefreshCw size={15} className={loadingProducts ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#32383B]/10 border border-[#32383B] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#32383B]/40 text-[#B2BEC2] font-semibold border-b border-[#32383B]">
              <tr>
                <th className="py-3.5 px-4">PRODUCT & PHOTOS</th>
                <th className="py-3.5 px-4">BARCODE</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4 text-right">COST PRICE</th>
                <th className="py-3.5 px-4 text-right">SALE PRICE</th>
                <th className="py-3.5 px-4 text-center">STOCK LEVEL</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#32383B]/60">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const isOut = p.stock <= 0;
                const imgCount = (p.images && p.images.length > 0) ? p.images.length : (p.image ? 1 : 0);

                return (
                  <tr key={p._id || p.barcode} className="hover:bg-[#32383B]/30 transition-colors">
                    
                    {/* Name & Photo gallery preview */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
                            if (imgs.length > 0) {
                              setActiveViewerProduct(p);
                              setViewerImgIndex(0);
                            }
                          }}
                          className="relative w-11 h-11 rounded-xl bg-[#0A1214] overflow-hidden flex-shrink-0 border border-[#32383B] hover:border-[#CBD3D6] transition-colors group/photo text-left"
                          title="Click to inspect all product photos"
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#B2BEC2] font-mono text-[10px]">
                              POS
                            </div>
                          )}
                          {imgCount > 1 && (
                            <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-[#0A1214]/90 text-[8px] font-bold text-[#CBD3D6] rounded-tl-md">
                              {imgCount}📷
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center text-[#EDF1F2] transition-opacity">
                            <Eye size={12} />
                          </div>
                        </button>
                        <div>
                          <p className="font-semibold text-[#EDF1F2]">{p.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
                                if (imgs.length > 0) {
                                  setActiveViewerProduct(p);
                                  setViewerImgIndex(0);
                                }
                              }}
                              className="text-[10px] text-[#B2BEC2] hover:text-[#CBD3D6] font-medium hover:underline flex items-center gap-1"
                            >
                              <Images size={10} />
                              <span>{imgCount} photo(s)</span>
                            </button>
                            <span className="text-[10px] text-[#B2BEC2]/70">• Min Alert: {p.minStock}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-4 font-mono text-[#B2BEC2]">
                      <div className="flex items-center gap-1.5">
                        <Barcode size={13} className="text-[#B2BEC2]/60" />
                        <span>{p.barcode}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#32383B] text-[#EDF1F2] font-medium text-[11px] border border-[#32383B]">
                        {p.category}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-4 text-right font-mono text-[#B2BEC2]">
                      {settings.currency} {Number(p.costPrice || 0).toLocaleString()}
                    </td>

                    {/* Sale Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#EDF1F2]">
                      {settings.currency} {Number(p.price).toLocaleString()}
                    </td>

                    {/* Stock status badge */}
                    <td className="py-3 px-4 text-center">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#32383B] text-[#EDF1F2] border border-[#CBD3D6]/40">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#32383B] text-[#CBD3D6] border border-[#CBD3D6] animate-pulse">
                          Low Stock: {p.stock}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#32383B]/60 text-[#EDF1F2] border border-[#32383B]">
                          {p.stock} units
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6] transition-colors"
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

      {/* Add / Edit Product Modal with Multiple Images & Dynamic Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
            
            <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Images size={18} className="text-[#CBD3D6]" />
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product to Inventory'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#B2BEC2] hover:text-[#EDF1F2]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* Barcode */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[#B2BEC2] font-medium mb-1">Barcode / SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                {/* Dynamic Category Selector */}
                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#B2BEC2] font-medium">Category *</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                      className="text-[#CBD3D6] hover:text-[#EDF1F2] font-semibold text-[11px] flex items-center gap-1"
                    >
                      <FolderPlus size={12} />
                      <span>{showAddCategoryInput ? 'Cancel' : '+ New Category'}</span>
                    </button>
                  </div>

                  {showAddCategoryInput ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Type new category..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-3 py-2 bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] rounded-xl font-bold whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                    >
                      {availableCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Product Name */}
                <div className="col-span-2">
                  <label className="block text-[#B2BEC2] font-medium mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lipton Yellow Label Tea 400g"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                {/* Pricing & Stock */}
                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Cost Price ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Selling Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] font-bold font-mono focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                <div>
                  <label className="block text-[#B2BEC2] font-medium mb-1">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] font-mono focus:outline-none focus:border-[#CBD3D6]"
                  />
                </div>

                {/* Multiple Images Manager */}
                <div className="col-span-2 pt-2 border-t border-[#32383B]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#EDF1F2] font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Images size={14} className="text-[#CBD3D6]" />
                      <span>Multiple Product Photos ({formData.images.length})</span>
                    </label>
                    <span className="text-[10px] text-[#B2BEC2]">Add front, back, or label photos</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="url"
                      placeholder="Paste Image URL (https://images.unsplash.com/...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#32383B]/20 border border-[#32383B] text-[#EDF1F2] focus:outline-none focus:border-[#CBD3D6] text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-2 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] border border-[#32383B] text-[#EDF1F2] font-semibold whitespace-nowrap transition-colors"
                    >
                      + Add Photo
                    </button>
                  </div>

                  {/* Photo thumbnails grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2 rounded-2xl bg-[#32383B]/20 border border-[#32383B]">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-[#0A1214] border border-[#32383B]">
                          <img src={img} alt="Product view" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#0A1214] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-[#EDF1F2] text-[#0A1214] font-bold text-[8px]">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="pt-4 border-t border-[#32383B] flex justify-end gap-2">
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
                  className="px-6 py-2.5 rounded-xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold transition-all shadow-md active:scale-[0.98]"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Product Images Viewer Modal */}
      {activeViewerProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-[#EDF1F2] pb-3 px-2">
              <div>
                <h4 className="font-bold text-[#EDF1F2] text-sm">{activeViewerProduct.name}</h4>
                <span className="text-xs text-[#B2BEC2]">
                  Photo {viewerImgIndex + 1} of {(activeViewerProduct.images?.length || 1)}
                </span>
              </div>
              <button
                onClick={() => setActiveViewerProduct(null)}
                className="p-1.5 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#B2BEC2] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative w-full max-h-[70vh] flex items-center justify-center rounded-2xl overflow-hidden bg-[#0A1214] border border-[#32383B]">
              <img
                src={(activeViewerProduct.images && activeViewerProduct.images[viewerImgIndex]) || activeViewerProduct.image}
                alt="Product Full View"
                className="max-h-[70vh] max-w-full object-contain"
              />

              {activeViewerProduct.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setViewerImgIndex((prev) => (prev - 1 + activeViewerProduct.images.length) % activeViewerProduct.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setViewerImgIndex((prev) => (prev + 1) % activeViewerProduct.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#CBD3D6] hover:text-[#0A1214] text-[#EDF1F2] transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails strip */}
            {activeViewerProduct.images?.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto p-1">
                {activeViewerProduct.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setViewerImgIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      viewerImgIndex === idx ? 'border-[#CBD3D6] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
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
