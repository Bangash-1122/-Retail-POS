import React, { useState } from 'react';
import { Plus, Barcode, AlertTriangle, Images, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export default function ProductCard({ product }) {
  const { addToCart, settings } = usePOS();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const isOutOfStock = product.stock <= 0;

  // Prepare images list (supports multiple images or single fallback image)
  const imageList = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);

  const currentDisplayImage = imageList[currentImgIndex] || product.image;

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % imageList.length);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <div
      onClick={() => !isOutOfStock && addToCart(product, 1)}
      className={`group relative rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none border ${
        isOutOfStock
          ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
          : 'bg-[#131B2E]/90 hover:bg-[#1A253F] border-slate-800/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:scale-[0.98]'
      }`}
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-800 mb-2.5 group/img">
          {currentDisplayImage ? (
            <img
              src={currentDisplayImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              No Image
            </div>
          )}

          {/* Multiple Images Navigation Controls */}
          {imageList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                title="Previous Photo"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                title="Next Photo"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10"
              >
                <ChevronRight size={14} />
              </button>

              {/* Photos Counter Badge */}
              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-slate-200 border border-white/10 flex items-center gap-1 backdrop-blur-md">
                <Images size={10} />
                <span>{currentImgIndex + 1}/{imageList.length}</span>
              </span>
            </>
          )}

          {/* Category Tag */}
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-200 border border-white/10">
            {product.category}
          </span>

          {/* Stock Tag */}
          <div className="absolute bottom-2 right-2">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/90 text-white backdrop-blur-md">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-slate-950 backdrop-blur-md animate-pulse">
                <AlertTriangle size={10} /> {product.stock} Left
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                {product.stock} in stock
              </span>
            )}
          </div>
        </div>

        {/* Product Name */}
        <h4 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h4>

        {/* Barcode */}
        <div className="flex items-center gap-1 mt-1 text-[11px] font-mono text-slate-400">
          <Barcode size={13} className="text-slate-500" />
          <span>{product.barcode}</span>
        </div>
      </div>

      {/* Price & Quick Add Button */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Price</span>
          <span className="text-base font-bold text-emerald-400 font-mono">
            {settings.currency} {Number(product.price).toLocaleString()}
          </span>
        </div>

        <button
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product, 1);
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            isOutOfStock
              ? 'bg-slate-800 text-slate-600'
              : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white group-hover:bg-indigo-600 group-hover:text-white shadow-sm'
          }`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
