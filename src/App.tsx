/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductColor, CartItem } from './types';
import { PRODUCTS } from './data/products';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CategoryShowcase } from './components/CategoryShowcase';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { FavouritesDrawer } from './components/FavouritesDrawer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickViewModal } from './components/QuickViewModal';
import { ContactModal, OrderSuccessModal } from './components/InfoModals';
import { UserAuthModal } from './components/UserAuthModal';
import { AdminPortal } from './components/AdminPortal';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  // Theme state: dark (#151515) by default, light mode togglable
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('samstyle_theme') === 'light';
  });

  // Navigation and active section
  const [activeNav, setActiveNav] = useState('home');
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Dynamic products list from backend, initialized with static list
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  // User state (phone OTP login)
  const [currentUser, setCurrentUser] = useState<{ phone: string; fullName?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('samstyle_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Favorites state (persisted in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('samstyle_favorites') || localStorage.getItem('akvrix_favorites');
      return saved ? JSON.parse(saved) : ['sam-01-hoodie-cream', 'sam-02-zip-hoodie'];
    } catch {
      return ['sam-01-hoodie-cream', 'sam-02-zip-hoodie'];
    }
  });

  // Cart state (persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('samstyle_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const initialProduct = PRODUCTS[0];
      return [
        {
          id: `${initialProduct.id}-${initialProduct.colors[0].name}-L`,
          productId: initialProduct.id,
          product: initialProduct,
          selectedColor: initialProduct.colors[0],
          selectedSize: 'L',
          quantity: 1,
        },
      ];
    } catch {
      return [];
    }
  });



  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Quick View product
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Completed order receipt
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const shopSectionRef = useRef<HTMLElement>(null);

  // Fetch dynamic products from backend
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data?.status === 'success' && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.log('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle Payment Return Callback from Aqayepardakht
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const orderId = urlParams.get('orderId');
    const tracking = urlParams.get('tracking');
    const amount = urlParams.get('amount');

    if (payment === 'success' && orderId) {
      setCart([]);
      localStorage.removeItem('samstyle_cart');
      setCompletedReceipt({
        orderId,
        trackingCode: tracking || `AP-${Date.now().toString().slice(-6)}`,
        amount: Number(amount) || 0,
        gateway: 'آقای پرداخت (Aqayepardakht)',
        date: new Date().toLocaleDateString('fa-IR'),
      });
      setIsReceiptModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'failed') {
      window.history.replaceState({}, document.title, window.location.pathname);
      alert('پرداخت در درگاه آقای پرداخت ناموفق بود یا توسط کاربر لغو گردید.');
    }
  }, []);

  // Sync theme to root class
  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.add('light');
      localStorage.setItem('samstyle_theme', 'light');
    } else {
      root.classList.remove('light');
      localStorage.setItem('samstyle_theme', 'dark');
    }
  }, [isLightMode]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('samstyle_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('samstyle_cart', JSON.stringify(cart));
  }, [cart]);

  const handleToggleFavorite = (product: Product) => {
    setFavorites((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const handleAddToCart = (
    product: Product,
    color: ProductColor,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    quantity: number = 1
  ) => {
    const itemKey = `${product.id}-${color.name}-${size}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.id === itemKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleScrollToShop = () => {
    setActiveNav('shop');
    shopSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigate = (sectionId: string) => {
    setActiveNav(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'shop') {
      handleScrollToShop();
    } else if (sectionId === 'contact') {
      setIsContactOpen(true);
    }
  };

  const handleSelectProductByName = (title: string) => {
    const match = products.find((p) => p.name.includes(title));
    if (match) {
      setQuickViewProduct(match);
    } else {
      handleScrollToShop();
    }
  };

  const handleLogoutUser = () => {
    localStorage.removeItem('samstyle_user');
    localStorage.removeItem('samstyle_token');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-[var(--accent)] selection:text-[#111111]">
      
      {/* 0. Dynamic Top Announcement Bar */}
      <AnnouncementBar />

      {/* 1. Small & Neat Header Navigation Bar */}
      <Header
        isLightMode={isLightMode}
        onToggleLightMode={() => setIsLightMode(!isLightMode)}
        favoritesCount={favorites.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenUserAuth={() => setIsUserAuthOpen(true)}
        onNavigate={handleNavigate}
        activeNav={activeNav}
        currentUser={currentUser}
        onLogoutUser={handleLogoutUser}
      />

      {/* 2. Landscape Photo Hero with SAMSTYLE */}
      <Hero onShopDrop={handleScrollToShop} />

      {/* 3. Main Catalog: Clean, sharp, strictly "محصولات" with one row and "See More" */}
      <main id="shop" ref={shopSectionRef} className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Simple Catalog Header: Just "محصولات" */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
            محصولات
          </h2>
          {showAllProducts && (
            <button
              onClick={() => setShowAllProducts(false)}
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              VIEW SINGLE ROW
            </button>
          )}
        </div>

        {/* Homescreen Products: One Row with "See More" Card Beside It */}
        {!showAllProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
            {products.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}

            {/* "See More" Card Beside the Items */}
            <div className="flex flex-col h-full min-h-[360px]">
              <button
                onClick={() => setShowAllProducts(true)}
                className="h-full w-full p-6 bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-xs flex flex-col items-center justify-center text-center group transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[var(--accent)]/5"
                title="مشاهده تمام آیتم‌ها"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-[#111111] transition-all">
                  <ArrowLeft size={22} />
                </div>
                <h3 className="text-base font-black text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                  مشاهده بیشتر
                </h3>
                <span className="text-xs font-mono text-[var(--accent)] mt-1 font-bold">
                  SEE MORE
                </span>
                <span className="mt-4 px-3 py-1 bg-[var(--bg-subtle)] text-[var(--text-main)] text-[11px] font-bold rounded-xs border border-[var(--border-subtle)] group-hover:border-[var(--accent)]">
                  +{products.length > 3 ? products.length - 3 : 0} کالای دیگر
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAllProducts(false)}
                className="px-6 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xs transition-colors cursor-pointer"
              >
                نمایش به صورت یک ردیف ←
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 4. Editorial Vertical Photo of Model Wearing a Hoodie with Quote */}
      <CategoryShowcase />

      {/* 5. Clean Minimal Footer with Admin Entry Link */}
      <Footer
        onSelectCategory={() => handleScrollToShop()}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Modals and Drawers */}

      {/* Real-time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
      />

      {/* Favourites Drawer */}
      <FavouritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteIds={favorites}
        allProducts={products}
        onRemoveFavorite={(id) => setFavorites((prev) => prev.filter((pId) => pId !== id))}
        onClearFavorites={() => setFavorites([])}
        onAddToCart={handleAddToCart}
        onExploreDrops={handleScrollToShop}
      />

      {/* Shopping Bag / Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        promoCode=""
        onApplyPromoCode={() => {}}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreDrops={handleScrollToShop}
      />

      {/* Persian Checkout Modal with Aqayepardakht Gateway */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
      />

      {/* Quick View Product Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isFavorite={quickViewProduct ? favorites.includes(quickViewProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        onDirectCheckout={(prod, color, size, qty) => {
          handleAddToCart(prod, color, size, qty);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Customer Mobile OTP Login Modal (Kavenegar) */}
      <UserAuthModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Admin Management Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onCatalogUpdated={fetchProducts}
      />

      {/* Support & Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Order Verified Receipt Modal (Aqayepardakht Return) */}
      <OrderSuccessModal
        receipt={completedReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

    </div>
  );
}
