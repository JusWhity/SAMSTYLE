import React from 'react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenContact,
  onOpenAdmin,
}) => {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[#111111] text-[#999999] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[var(--accent)] rounded-xs" />
              <span className="text-2xl font-black tracking-[0.2em] text-[#F2F0EB] uppercase">
                SAMSTYLE
              </span>
            </div>
            <p className="text-[#a09e98] leading-relaxed max-w-md text-xs sm:text-sm">
              سام‌استایل؛ فروشگاه پوشاک و استایل روزمره. طراحی ساده، تن‌خور راحت و انتخابی شیک برای استایل مدرن شما.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-[#F2F0EB] uppercase">
              لینک‌های سریع
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  محصولات
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  ارتباط با ما
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-[#F2F0EB] uppercase">
              ارتباط با ما
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  پشتیبانی و تماس
                </button>
              </li>
              <li className="text-[#888888]">
                ساعات پاسخگویی: ۱۰ الی ۲۱
              </li>
              <li className="text-[#888888]">
                تهران، خیابان ولیعصر
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <div>
            © ۱۴۰۴ تمام حقوق برای فروشگاه پوشاک سام‌استایل (SAMSTYLE) محفوظ است.
          </div>
          
          {/* Subtle discreet text for admin panel */}
          <div className="flex items-center gap-4">
            <span className="text-[var(--accent)]">
              طراحی ساده و مینیمال
            </span>
            <span className="text-[#333333]">|</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#555555] hover:text-[var(--accent)] transition-colors underline cursor-pointer text-[11px]"
              aria-label="ورود به پنل مدیریت"
            >
              ورود به پنل مدیریت
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
