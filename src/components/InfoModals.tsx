import React, { useState } from 'react';
import { X, CheckCircle2, Send, Mail, Phone } from 'lucide-react';
import { formatToman } from '../utils/payment';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl p-6 sm:p-8 relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
          aria-label="بستن"
        >
          <X size={20} />
        </button>

        <div className="text-xs font-mono text-[var(--accent)] uppercase font-bold">
          // سام‌استایل SAMSTYLE
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
          تماس با پشتیبانی
        </h2>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={36} className="text-[var(--accent)] mx-auto" />
            <div className="text-sm font-bold text-[var(--text-main)]">پیام شما با موفقیت دریافت شد</div>
            <p className="text-xs text-[var(--text-muted)]">
              همکاران ما در سام‌استایل به زودی با شما تماس خواهند گرفت.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">نام یا شماره تماس:</label>
              <input
                type="text"
                required
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">موضوع پیام:</label>
              <input
                type="text"
                required
                placeholder="پیگیری سفارش، راهنمای سایز یا پیشنهاد..."
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">متن پیام:</label>
              <textarea
                rows={3}
                required
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[var(--accent)] hover:brightness-110 text-[#111111] font-bold rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={14} />
              <span>ارسال پیام به سام‌استایل</span>
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Mail size={13} className="text-[var(--accent)]" />
            <span>info@samstyle.ir</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={13} className="text-[var(--accent)]" />
            <span>۰۲۱-۸۸۹۹۰۰۱۱</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OrderSuccessModalProps {
  receipt: any;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ receipt, isOpen, onClose }) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl p-6 sm:p-8 relative space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>

        <div>
          <div className="text-xs font-mono text-[var(--accent)] font-bold">
            سام‌استایل // SAMSTYLE ORDER
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mt-1">
            سفارش شما با موفقیت ثبت شد
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            اطلاعات سفارش برای شما ثبت شده و فرآیند آماده‌سازی آغاز گردید.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-xs text-xs space-y-2.5 text-right">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">شماره سفارش:</span>
            <span className="font-bold text-[var(--accent)]">{receipt.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">تحویل گیرنده:</span>
            <span className="font-bold text-[var(--text-main)]">{receipt.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">شماره تماس:</span>
            <span className="text-[var(--text-main)]">{receipt.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">آدرس مقصد:</span>
            <span className="text-[var(--text-main)] text-[11px] truncate max-w-[200px]">{receipt.address}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[var(--border-subtle)] font-bold text-sm">
            <span className="text-[var(--text-main)]">مبلغ پرداختی:</span>
            <span className="text-[var(--accent)]">{formatToman(receipt.amount)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[var(--accent)] hover:brightness-110 text-[#111111] text-xs font-bold uppercase rounded-xs transition-all cursor-pointer"
        >
          بازگشت به فروشگاه
        </button>

      </div>
    </div>
  );
};
