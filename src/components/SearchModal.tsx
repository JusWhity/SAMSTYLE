import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, ProductColor } from '../types';
import { PRODUCTS } from '../data/products';
import { formatToman } from '../utils/payment';
import { Search, X, Heart, Plus, Sparkles } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onToggleFavorite,
  onAddToCart,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return PRODUCTS;
    const cleanQ = query.toLowerCase().trim();
    return PRODUCTS.filter((product) => {
      const matchName = product.name.toLowerCase().includes(cleanQ);
      const matchDesc = product.description.toLowerCase().includes(cleanQ);
      const matchColors = product.colors.some((c) => c.name.toLowerCase().includes(cleanQ));
      return matchName || matchDesc || matchColors;
    });
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <Search size={22} className="text-[var(--accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی هودی‌ها، رنگ‌ها..."
            className="flex-1 bg-transparent text-base sm:text-lg text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
            aria-label="جستجوی هودی‌ها"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              aria-label="پاک کردن متن جستجو"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xs transition-colors"
            aria-label="بستن جستجو"
          >
            بستن (ESC)
          </button>
        </div>

        {/* Results Counter */}
        <div className="px-4 sm:px-6 py-2.5 bg-[var(--bg-main)] text-xs text-[var(--text-muted)] flex items-center justify-between border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--accent)]" />
            <span>تعداد نتایج: {filteredProducts.length} مورد</span>
          </div>
          {query && <span className="text-[var(--accent)] font-medium">«{query}»</span>}
        </div>

        {/* Results Grid (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-xl text-[var(--text-muted)]">موردی یافت نشد</div>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                لباسی با مشخصات جستجوی شما پیدا نشد. عبارت دیگری را امتحان کنید یا فیلترها را ریست کنید.
              </p>
              <button
                onClick={() => setQuery('')}
                className="px-4 py-2 bg-[var(--accent)] text-[#111111] font-bold text-xs rounded-xs cursor-pointer"
              >
                نمایش همه محصولات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isFav = favorites.includes(product.id);
                const defaultColor = product.colors[0];

                return (
                  <div
                    key={product.id}
                    className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-xs flex gap-3 group hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="w-20 h-24 bg-[#1e1e1e] rounded-xs overflow-hidden shrink-0">
                      <img
                        src={defaultColor.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="text-xs font-bold text-[var(--accent)] mt-1">
                          {formatToman(product.priceToman)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                        <button
                          onClick={() => onToggleFavorite(product)}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer"
                          aria-label="افزودن به علاقه‌مندی"
                        >
                          <Heart
                            size={16}
                            className={isFav ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}
                          />
                        </button>
                        <button
                          onClick={() => onAddToCart(product, defaultColor, 'L')}
                          className="px-2.5 py-1 bg-[var(--accent)] text-[#111111] hover:brightness-110 text-xs font-bold rounded-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>خرید (L)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
