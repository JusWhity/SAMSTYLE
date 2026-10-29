import React from 'react';
import { ArrowDown } from 'lucide-react';
import heroImage from '../assets/images/streetwear_graffiti_hero_1793242114413.jpg';

interface HeroProps {
  onShopDrop: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopDrop }) => {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg-main)] border-b border-[var(--border-subtle)] select-none">
      {/* High Quality Landscape Photo Hero */}
      <div className="relative w-full h-[480px] sm:h-[560px] md:h-[640px] lg:h-[720px] overflow-hidden">
        <img
          src={heroImage}
          alt="Streetwear model in black hoodie"
          loading="eager"
          className="w-full h-full object-cover object-[center_35%] brightness-[0.85] contrast-[1.05]"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-black/20 to-black/30 pointer-events-none" />

        {/* Minimal Centered / Bottom Content: Just SAMSTYLE and Clean Button */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 md:p-16 max-w-7xl mx-auto z-10">
          <div className="space-y-6">
            
            {/* Clean English Brand Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-[0.08em] uppercase leading-none drop-shadow-lg">
              SAMSTYLE
            </h1>

            {/* Clean Single Action Button */}
            <div>
              <button
                onClick={onShopDrop}
                className="px-8 py-3.5 bg-[var(--accent)] hover:brightness-110 text-[#111111] text-xs sm:text-sm font-black tracking-wider uppercase transition-all duration-200 rounded-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
                aria-label="مشاهده محصولات"
              >
                <span>مشاهده محصولات</span>
                <ArrowDown size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
