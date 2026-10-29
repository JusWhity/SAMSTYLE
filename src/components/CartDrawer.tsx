import React from 'react';
import { CartItem } from '../types';
import { formatToman, calculateOrderPricing } from '../utils/payment';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, Check } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart?: () => void;
  promoCode: string;
  onApplyPromoCode: (code: string) => void;
  onProceedToCheckout: () => void;
  onExploreDrops: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onExploreDrops,
}) => {
  if (!isOpen) return null;

  const pricing = calculateOrderPricing(cart);

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-[var(--bg-main)] border-r border-[var(--border-subtle)] flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[var(--accent)]" />
            <h3 className="text-sm font-black tracking-wide uppercase text-[var(--text-main)]">
              سبد خرید سام‌استایل
            </h3>
            <span className="px-2 py-0.5 text-xs bg-[var(--accent)] text-[#111111] font-bold rounded-xs">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && onClearCart && (
              <button
                onClick={onClearCart}
                className="text-[11px] text-red-400 hover:text-red-300 hover:underline px-2 py-1 cursor-pointer font-bold"
                title="خالی کردن سبد خرید"
              >
                خالی کردن سبد
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              aria-label="بستن سبد خرید"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                <ShoppingBag size={28} />
              </div>
              <div className="text-base font-bold text-[var(--text-main)]">
                سبد خرید شما خالی است
              </div>
              <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                لباس‌های مورد نظرتان را از بخش فروشگاه انتخاب کنید.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreDrops();
                }}
                className="px-6 py-2.5 bg-[var(--accent)] text-[#111111] font-bold text-xs rounded-xs hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>مشاهده فروشگاه</span>
                <ArrowLeft size={14} />
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-xs flex gap-3 group"
              >
                {/* Thumb */}
                <div className="w-20 h-24 bg-[#1e1e1e] rounded-xs overflow-hidden shrink-0">
                  <img
                    src={item.selectedColor.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-[var(--text-main)] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                        className="text-[var(--text-muted)] hover:text-red-400 hover:bg-red-950/30 p-1 rounded transition-colors cursor-pointer shrink-0"
                        aria-label={`حذف ${item.product.name} از سبد خرید`}
                        title="حذف از سبد خرید"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-[var(--border-subtle)]"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        {item.selectedColor.name}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 bg-[var(--bg-subtle)] rounded-xs font-bold text-[var(--text-main)] text-[11px]">
                        سایز: {item.selectedSize}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[var(--text-main)] mt-1.5">
                      {formatToman(item.product.priceToman)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center border border-[var(--border-subtle)] rounded-xs overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 hover:bg-[var(--bg-subtle)] text-[var(--text-main)] cursor-pointer"
                        aria-label="کاهش تعداد"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-[var(--text-main)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 hover:bg-[var(--bg-subtle)] text-[var(--text-main)] cursor-pointer"
                        aria-label="افزایش تعداد"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-[var(--accent)]">
                      {formatToman(item.product.priceToman * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3">
            
            {/* Calculations breakdown */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>جمع اقلام:</span>
                <span>{formatToman(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>هزینه ارسال:</span>
                <span className="text-[var(--accent)] font-medium">رایگان</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-[var(--text-main)] pt-2 border-t border-[var(--border-subtle)]">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-[var(--accent)]">{formatToman(pricing.total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 bg-[var(--accent)] hover:brightness-110 text-[#111111] text-xs sm:text-sm font-bold tracking-wider rounded-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>تکمیل و ثبت سفارش</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
