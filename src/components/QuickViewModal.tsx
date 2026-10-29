import React, { useState, useEffect } from 'react';
import { Product, ProductColor } from '../types';
import { formatToman } from '../utils/payment';
import { X, Heart, Plus, Minus, ShoppingBag, Check } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', quantity: number) => void;
  onDirectCheckout: (product: Product, color: ProductColor, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', quantity: number) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onDirectCheckout,
}) => {
  if (!isOpen || !product) return null;

  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('L');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize('L');
      setQuantity(1);
      setJustAdded(false);
    }
  }, [product]);

  const handleAdd = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    onDirectCheckout(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl overflow-hidden my-6">
        
        {/* Modal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image Stage */}
          <div className="relative aspect-[4/5] bg-[#1a1a1a] overflow-hidden">
            <img
              src={selectedColor.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-bold">
                  سام‌استایل // SAMSTYLE
                </span>
                <button
                  onClick={onClose}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  aria-label="بستن پنجره"
                >
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mt-2">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-xl font-bold text-[var(--accent)]">
                  {formatToman(product.priceToman)}
                </span>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {product.description}
              </p>

              {/* Color Swatches */}
              <div className="mt-5 space-y-2">
                <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
                  <span>انتخاب رنگ:</span>
                  <span className="text-[var(--text-main)] font-bold">{selectedColor.name}</span>
                </div>
                <div className="flex gap-2.5">
                  {product.colors.map((color) => {
                    const isSel = selectedColor.name === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-xs transition-all relative border border-[var(--border-subtle)] cursor-pointer ${
                          isSel ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-main)] scale-105' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-5 space-y-2">
                <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
                  <span>انتخاب سایز:</span>
                  <span className="text-[var(--accent)] font-bold">{selectedSize}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 text-xs font-bold rounded-xs transition-colors cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[var(--accent)] text-[#111111]'
                          : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions bottom */}
            <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex gap-2.5">
                {/* Quantity */}
                <div className="flex items-center border border-[var(--border-subtle)] rounded-xs overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[var(--bg-subtle)] text-[var(--text-main)] cursor-pointer"
                    aria-label="کاهش تعداد"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-xs font-bold text-[var(--text-main)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-[var(--bg-subtle)] text-[var(--text-main)] cursor-pointer"
                    aria-label="افزایش تعداد"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-bold rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {justAdded ? (
                    <>
                      <Check size={16} className="text-[var(--accent)]" />
                      <span>به سبد اضافه شد</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>افزودن به سبد</span>
                    </>
                  )}
                </button>

                {/* Favourites toggle */}
                <button
                  onClick={() => onToggleFavorite(product)}
                  className="p-3 border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-xs text-[var(--text-main)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  aria-label="علاقه‌مندی"
                >
                  <Heart
                    size={18}
                    className={isFavorite ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}
                  />
                </button>
              </div>

              {/* Buy Now Direct Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-[var(--accent)] hover:brightness-110 text-[#111111] text-xs sm:text-sm font-bold rounded-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>خرید و ثبت سفارش</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
