import React from 'react';
import modelImage from '../assets/images/hoodie_model_editorial_1793244527814.jpg';

export const CategoryShowcase: React.FC = () => {
  return (
    <section className="w-full py-20 sm:py-28 border-b border-[var(--border-subtle)] bg-[var(--bg-main)] select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
          
          {/* 1 Vertical Photo of a Model Wearing a Hoodie */}
          <div className="md:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[3/4] bg-[#1a1a1a] rounded-xs overflow-hidden shadow-2xl border border-[var(--border-subtle)]">
              <img
                src={modelImage}
                alt="Editorial streetwear model wearing black hoodie"
                loading="lazy"
                className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* Editorial Quote (Clean, Sharp, Minimalist like akvrix) */}
          <div className="md:col-span-7 space-y-6 text-right" dir="rtl">
            <span className="inline-block text-xs font-mono tracking-[0.25em] text-[var(--accent)] uppercase">
              SAMSTYLE ARCHIVE
            </span>

            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-main)] leading-relaxed tracking-tight">
              «سادگی نهایت قدرت در استایل خیابانی است. کیفیت بافت، برش‌های رها و رهایی از جزئیات اضافه.»
            </blockquote>

            <p className="text-xs sm:text-sm font-mono text-[var(--text-muted)] tracking-wider">
              PURE SILHOUETTES • HEAVYWEIGHT FLEECE • NO COMPROMISE
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
