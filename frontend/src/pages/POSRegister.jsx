import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Barcode, 
  Sparkles, 
  SlidersHorizontal, 
  RefreshCw,
  ShoppingBag,
  Zap,
  FolderPlus,
  Plus
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import ProductCard from '../components/pos/ProductCard';
import CartDrawer from '../components/pos/CartDrawer';
import { api } from '../utils/api';

export default function POSRegister() {
  const { 
    products, 
    loadingProducts, 
    loadProducts, 
    addToCart, 
    settings, 
    loadSettings,
    setIsPaymentModalOpen,
    clearCart
  } = usePOS();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const searchInputRef = useRef(null);

  // Available categories from settings
  const dynamicCategories = ['All', ...(settings?.productCategories || [
    'Groceries', 'Beverages', 'Snacks', 'Dairy', 'Bakery', 'Personal Care', 'Household'
  ])];

  // Global Keyboard Shortcuts (F2 for search, F4 for payment, Esc to clear)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsPaymentModalOpen(true);
      } else if (e.key === 'Escape') {
        if (search) setSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [search, setIsPaymentModalOpen]);

  // Handle Barcode Scanner Input
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const term = barcodeInput.trim();
    const found = products.find(p => p.barcode === term || p.barcode.toLowerCase() === term.toLowerCase());
    
    if (found) {
      addToCart(found, 1);
      setBarcodeInput('');
    } else {
      alert(`No product found with barcode "${term}"`);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await api.addCategory('product', newCatName.trim());
      await loadSettings();
      setSelectedCategory(newCatName.trim());
      setNewCatName('');
      setShowAddCat(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.barcode.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* ── Left / Center Column: Product Catalog & Fast Search ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] overflow-hidden">
        
        {/* Search & Barcode Header Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#0F172A]/60 flex flex-wrap items-center gap-3">
          
          {/* Main Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search product name or barcode... [F2]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dedicated Barcode Scanner Input */}
          <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Barcode size={16} className="absolute left-3 top-3 text-indigo-400" />
              <input
                type="text"
                placeholder="Scan / Type Barcode + ↵"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-56 pl-9 pr-3 py-2.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs font-mono text-indigo-200 placeholder-indigo-400/50 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-2xl transition-colors shadow-sm"
            >
              Scan
            </button>
          </form>

          {/* Refresh Button */}
          <button
            onClick={() => loadProducts()}
            title="Refresh Products"
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={loadingProducts ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Dynamic Category Pills Navigation */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-[#0F172A]/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {dynamicCategories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {/* Inline Add Category Button */}
          {showAddCat ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCategory();
                  if (e.key === 'Escape') setShowAddCat(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-500 text-xs text-white focus:outline-none w-28"
              />
              <button
                onClick={handleCreateCategory}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
              >
                ✓
              </button>
              <button
                onClick={() => setShowAddCat(false)}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCat(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 whitespace-nowrap transition-colors"
            >
              <Plus size={13} />
              <span>Category</span>
            </button>
          )}
        </div>

        {/* Quick Demo Barcode Scanner Chips */}
        <div className="px-4 py-1.5 bg-indigo-950/20 border-b border-indigo-900/30 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400 no-scrollbar">
          <span className="font-semibold text-indigo-400 flex items-center gap-1 flex-shrink-0">
            <Zap size={12} /> Quick Scan:
          </span>
          {products.slice(0, 6).map(p => (
            <button
              key={p.barcode}
              onClick={() => addToCart(p, 1)}
              className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] whitespace-nowrap transition-colors"
            >
              + {p.name.split(' ')[0]} ({p.barcode})
            </button>
          ))}
        </div>

        {/* Products Grid with Multi-Image Card View */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loadingProducts ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw size={28} className="animate-spin text-indigo-500" />
              <p className="text-xs">Loading retail catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
              <ShoppingBag size={36} className="text-slate-600" />
              <p className="font-semibold text-sm text-slate-300">No products match your criteria</p>
              <p className="text-xs text-slate-500">Try searching for something else or reset filters.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                className="mt-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-indigo-300 hover:bg-slate-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.barcode} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Right Column: Interactive Cart Drawer ── */}
      <div className="w-80 sm:w-96 flex-shrink-0 h-full">
        <CartDrawer />
      </div>

    </div>
  );
}
