import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatToman, calculateOrderPricing } from '../utils/payment';
import { X, Lock, CheckCircle2, Loader2, ShoppingBag, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onPaymentSuccess?: (orderData: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
}) => {
  const [fullName, setFullName] = useState('سامان راد');
  const [mobile, setMobile] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('خیابان ولیعصر، بالاتر از پارک وی، پلاک ۱۲');
  const [postalCode, setPostalCode] = useState('۱۹۳۹۵۴۷۸');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const pricing = calculateOrderPricing(cart);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const itemsPayload = cart.map((item) => ({
        title: item.product.name,
        size: item.selectedSize,
        color: item.selectedColor.name,
        quantity: item.quantity,
        price: item.product.priceToman,
      }));

      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          mobile,
          city,
          address,
          amount: pricing.total,
          items: itemsPayload,
          note,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success' && data.paymentUrl) {
        // Redirect to Aqayepardakht gateway or sandbox simulator
        window.location.href = data.paymentUrl;
      } else {
        setErrorMessage(data.message || 'خطا در برقراری ارتباط با درگاه آقای پرداخت.');
        setIsSubmitting(false);
      }
    } catch {
      setErrorMessage('خطای شبکه در اتصال به درگاه پرداخت.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-[var(--accent)]" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
              ثبت سفارش و اتصال به درگاه آقای پرداخت
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            aria-label="بستن فرم سفارش"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="m-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xs flex items-center gap-2 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5">
          
          {/* Order Snapshot */}
          <div className="p-3.5 bg-[var(--bg-subtle)] rounded-xs border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag size={15} className="text-[var(--accent)]" />
              <span className="text-[var(--text-muted)]">تعداد اقلام:</span>
              <span className="font-bold text-[var(--text-main)]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} عدد
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">مبلغ پرداختی در آقای پرداخت:</span>
              <span className="font-bold text-[var(--accent)] mr-1.5 text-sm">
                {formatToman(pricing.total)}
              </span>
            </div>
          </div>

          {/* Customer Delivery Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  نام و نام خانوادگی *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  شماره موبایل *
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="۰۹۱۲xxxxxxx"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  شهر *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  کد پستی (اختیاری)
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  آدرس دقیق تحویل سفارش *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--text-muted)] mb-1">
                  توضیحات و یادداشت سفارش (اختیاری)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="نکات مربوط به زمان تحویل یا هماهنگی..."
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2 rounded-xs text-[var(--text-main)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[var(--accent)] hover:brightness-110 disabled:opacity-50 text-[#111111] text-sm font-bold tracking-wider rounded-xs transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>در حال انتقال به درگاه آقای پرداخت...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>انتقال به درگاه پرداخت ({formatToman(pricing.total)})</span>
                </>
              )}
            </button>
            <div className="mt-2 text-center text-xs text-[var(--text-muted)]">
              اتصال امن به درگاه پرداخت شاپرک از طریق آقای پرداخت
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
