import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Sun, Moon, Menu, X, User } from 'lucide-react';
import { toPersianDigits } from '../utils/payment';

interface HeaderProps {
  isLightMode: boolean;
  onToggleLightMode: () => void;
  favoritesCount: number;
  cartCount: number;
  onOpenSearch: () => void;
  onOpenFavorites: () => void;
  onOpenCart: () => void;
  onOpenUserAuth: () => void;
  onNavigate: (sectionId: string) => void;
  activeNav: string;
  currentUser?: { phone: string; fullName?: string } | null;
  onLogoutUser?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLightMode,
  onToggleLightMode,
  favoritesCount,
  cartCount,
  onOpenSearch,
  onOpenFavorites,
  onOpenCart,
  onOpenUserAuth,
  onNavigate,
  activeNav,
  currentUser,
  onLogoutUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'خانه' },
    { id: 'shop', label: 'فروشگاه' },
    { id: 'contact', label: 'تماس با ما' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300 backdrop-blur-md bg-[var(--bg-main)]/90 border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 sm:h-11 flex items-center justify-between">
        
        {/* Right Navigation in RTL (Desktop) - Increased gap between links for clear separation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-semibold tracking-wide" aria-label="منوی اصلی">
          {navLinks.map((link) => {
            const isActive = activeNav === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`transition-colors duration-200 cursor-pointer py-1 px-1 relative ${
                  isActive
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-main)] hover:text-[var(--accent)]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-[var(--text-main)] hover:text-[var(--accent)] focus:outline-none transition-colors"
            aria-label="باز کردن منو"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* Centered Logo: SAMSTYLE (English) */}
        <div className="flex-1 md:flex-initial text-center md:absolute md:left-1/2 md:-translate-x-1/2">
          <button
            onClick={() => handleLinkClick('home')}
            className="inline-block text-sm sm:text-base font-black tracking-[0.2em] uppercase text-[var(--text-main)] hover:text-[var(--accent)] transition-colors leading-none cursor-pointer"
            aria-label="SAMSTYLE Home"
          >
            SAMSTYLE
          </button>
        </div>

        {/* Left Tools in RTL (Search, Favourites, Cart, User Auth, Theme) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 text-[var(--text-main)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer rounded-xs"
            aria-label="جستجوی لباس"
            title="جستجو"
          >
            <Search size={15} strokeWidth={2.2} />
          </button>

          {/* Favourites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-1.5 text-[var(--text-main)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer rounded-xs"
            aria-label={`علاقه‌مندی‌ها (${favoritesCount} مورد)`}
            title="علاقه‌مندی‌ها"
          >
            <Heart size={15} strokeWidth={2.2} className={favoritesCount > 0 ? 'fill-[var(--accent)] text-[var(--accent)]' : ''} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[9px] font-black flex items-center justify-center leading-none">
                {toPersianDigits(favoritesCount)}
              </span>
            )}
          </button>

          {/* Cart / Bag Button */}
          <button
            onClick={onOpenCart}
            className="relative p-1.5 text-[var(--text-main)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer rounded-xs"
            aria-label={`سبد خرید (${cartCount} مورد)`}
            title="سبد خرید"
          >
            <ShoppingBag size={15} strokeWidth={2.2} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[9px] font-black flex items-center justify-center leading-none">
                {toPersianDigits(cartCount)}
              </span>
            )}
          </button>

          {/* User Account / OTP Login Button */}
          {currentUser ? (
            <div className="relative group">
              <button
                onClick={onLogoutUser}
                className="flex items-center gap-1 py-0.5 px-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[11px] text-[var(--text-main)] transition-colors cursor-pointer"
                title="کلیک برای خروج از حساب"
              >
                <User size={12} className="text-[var(--accent)]" />
                <span className="font-mono text-[10px]" dir="ltr">
                  {currentUser.phone.slice(-4)}...
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenUserAuth}
              className="p-1.5 text-[var(--text-main)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer rounded-xs"
              aria-label="ورود با پیامک کد تایید"
              title="ورود با شماره موبایل"
            >
              <User size={15} strokeWidth={2.2} />
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleLightMode}
            className="p-1.5 text-[var(--text-main)] hover:text-[var(--accent)] transition-colors duration-200 cursor-pointer rounded-full"
            aria-label={isLightMode ? 'حالت تیره' : 'حالت روشن'}
            title={isLightMode ? 'حالت تیره' : 'حالت روشن'}
          >
            {isLightMode ? <Moon size={15} strokeWidth={2.2} /> : <Sun size={15} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-main)] px-4 py-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col space-y-3 text-sm font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-right py-2 transition-colors ${
                  activeNav === link.id
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-main)] hover:text-[var(--accent)]'
                }`}
              >
                {link.label}
              </button>
            ))}
            {!currentUser && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserAuth();
                }}
                className="text-right py-2 text-[var(--accent)] font-bold flex items-center gap-2"
              >
                <User size={16} />
                <span>ورود با شماره موبایل (کاوه نگار)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
