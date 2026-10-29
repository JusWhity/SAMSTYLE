import React, { useState } from 'react';
import { Product, ProductColor } from '../types';
import { formatToman } from '../utils/payment';
import { Heart, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onQuickView,
}) => {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      setShowSizePicker(false);
    }, 1200);
  };

  return (
    <div
      onClick={() => onQuickView?.(product)}
      className="group flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/50 transition-all duration-300 relative rounded-xs overflow-hidden cursor-pointer"
    >
      {/* Product Image */}
      <div className="smooth-zoom-container relative w-full aspect-[4/5] bg-[#191919] overflow-hidden select-none">
        <img
          src={selectedColor.image}
          alt={`${product.name} - ${selectedColor.name}`}
          loading="lazy"
          className="smooth-zoom-img w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--bg-main)]/80 backdrop-blur-md border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-main)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200 z-20 cursor-pointer shadow-md pointer-events-auto"
          aria-label={isFavorite ? `حذف ${product.name} از علاقه‌مندی‌ها` : `افزودن ${product.name} به علاقه‌مندی‌ها`}
        >
          <Heart
            size={15}
            className={`transition-colors ${isFavorite ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}`}
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2 z-20 pointer-events-auto"
        >
          {showSizePicker ? (
            <div className="bg-[#1a1a1a] p-2.5 rounded-xs border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>انتخاب سایز:</span>
                <span className="text-[var(--accent)] font-bold">{selectedSize}</span>
              </div>
              <div className="flex gap-1.5 justify-center">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-7 h-7 text-xs font-mono font-bold rounded-xs transition-colors ${
                      selectedSize === sz
                        ? 'bg-[var(--accent)] text-[#111111]'
                        : 'bg-[#2a2a2a] text-[var(--text-main)] hover:bg-[#333333]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                className="w-full py-1.5 text-xs font-bold bg-[var(--accent)] text-[#111111] hover:brightness-110 transition-all rounded-xs flex items-center justify-center gap-1.5"
              >
                {addedAnimation ? (
                  <>
                    <Check size={14} /> اضافه شد
                  </>
                ) : (
                  <>
                    <Plus size={14} /> افزودن به سبد
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSizePicker(true)}
              className="w-full py-2 px-3 bg-[var(--bg-main)]/90 hover:bg-[var(--accent)] text-[var(--text-main)] hover:text-[#111111] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-bold transition-all duration-200 rounded-xs flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> انتخاب سایز و افزودن
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-[var(--bg-card)]">
        <div>
          {/* Product Name */}
          <h3 className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-2 text-sm font-bold text-[var(--accent)]">
            {formatToman(product.priceToman)}
          </div>
        </div>

        {/* Color Swatch Selector */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {product.colors.map((color) => {
              const isSelected = selectedColor.name === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-3.5 h-3.5 rounded-xs transition-all relative ${
                    isSelected ? 'ring-1.5 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg-main)] scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  aria-label={`انتخاب رنگ ${color.name}`}
                />
              );
            })}
          </div>

          <span className="text-[11px] text-[var(--text-muted)]">
            {selectedColor.name}
          </span>
        </div>
      </div>
    </div>
  );
};
