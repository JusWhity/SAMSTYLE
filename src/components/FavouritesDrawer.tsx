import React from 'react';
import { Product, ProductColor } from '../types';
import { PRODUCTS } from '../data/products';
import { formatToman } from '../utils/payment';
import { X, Heart, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

interface FavouritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteIds: string[];
  allProducts?: Product[];
  onRemoveFavorite: (productId: string) => void;
  onClearFavorites?: () => void;
  onAddToCart: (product: Product, color: ProductColor, size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => void;
  onExploreDrops: () => void;
}

export const FavouritesDrawer: React.FC<FavouritesDrawerProps> = ({
  isOpen,
  onClose,
  favoriteIds,
  allProducts,
  onRemoveFavorite,
  onClearFavorites,
  onAddToCart,
  onExploreDrops,
}) => {
  if (!isOpen) return null;

  const catalog = allProducts && allProducts.length > 0 ? allProducts : PRODUCTS;
  const favoriteProducts = catalog.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-[var(--bg-main)] border-r border-[var(--border-subtle)] flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={18} className="fill-[var(--accent)] text-[var(--accent)]" />
            <h3 className="text-sm font-black tracking-wide uppercase text-[var(--text-main)]">
              لباس‌های مورد علاقه
            </h3>
            <span className="px-2 py-0.5 text-xs bg-[var(--accent)] text-[#111111] font-bold rounded-xs">
              {favoriteProducts.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {favoriteProducts.length > 0 && onClearFavorites && (
              <button
                onClick={onClearFavorites}
                className="text-[11px] text-red-400 hover:text-red-300 hover:underline px-2 py-1 cursor-pointer font-bold"
                title="حذف همه علاقه‌مندی‌ها"
              >
                پاک کردن همه
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              aria-label="بستن علاقه‌مندی‌ها"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                <Heart size={28} />
              </div>
              <div className="text-base font-bold text-[var(--text-main)]">
                لیست علاقه‌مندی‌های شما خالی است
              </div>
              <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                با زدن آیکون قلب روی هر لباس، آن را ذخیره کنید تا به سادگی به آن دسترسی داشته باشید.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreDrops();
                }}
                className="px-6 py-2.5 bg-[var(--accent)] text-[#111111] font-bold text-xs rounded-xs hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>مشاهده لباس‌ها</span>
                <ArrowLeft size={14} />
              </button>
            </div>
          ) : (
            favoriteProducts.map((product) => {
              const defaultColor = product.colors[0];

              return (
                <div
                  key={product.id}
                  className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-xs flex gap-3 group hover:border-[var(--accent)]/50 transition-colors"
                >
                  <div className="w-20 h-24 bg-[#1b1b1b] rounded-xs overflow-hidden shrink-0">
                    <img
                      src={defaultColor.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-main)] line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="text-xs font-bold text-[var(--accent)] mt-1">
                        {formatToman(product.priceToman)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        onClick={() => onRemoveFavorite(product.id)}
                        className="text-xs text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                        aria-label={`حذف ${product.name} از علاقه‌مندی‌ها`}
                      >
                        <Trash2 size={13} />
                        <span>حذف</span>
                      </button>

                      <button
                        onClick={() => {
                          onAddToCart(product, defaultColor, 'L');
                          onClose();
                        }}
                        className="px-3 py-1 bg-[var(--accent)] text-[#111111] hover:brightness-110 text-xs font-bold rounded-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingBag size={13} />
                        <span>انتقال به سبد خرید</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        {favoriteProducts.length > 0 && (
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] text-xs text-[var(--text-muted)] flex items-center justify-between">
            <span>ذخیره شده در مرورگر شما</span>
            <button
              onClick={() => {
                onClose();
                onExploreDrops();
              }}
              className="text-[var(--accent)] hover:underline font-bold cursor-pointer"
            >
              ادامه انتخاب لباس
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
