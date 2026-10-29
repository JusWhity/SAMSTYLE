import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Smartphone,
  KeyRound,
  Megaphone,
  PlusCircle,
  Settings,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Send,
  Eye,
} from 'lucide-react';
import { Product } from '../types';
import { formatToman, toPersianDigits } from '../utils/payment';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogUpdated: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  onCatalogUpdated,
}) => {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('samstyle_admin_token');
  });

  // Auth form states
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('samstyle1404');
  const [otpPhone, setOtpPhone] = useState('09121112233');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'announcement' | 'products' | 'settings' | 'orders'>('announcement');

  // Shared status & loaders
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Tab 1: Announcement state
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    'ارسال رایگان به سراسر کشور برای خریدهای بالای ۱،۵۰۰،۰۰۰ تومان | کالکشن جدید پاییزه سام‌استایل آماده تحویل است'
  );
  const [announcementLink, setAnnouncementLink] = useState('#shop');

  // Tab 2: Products state
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<'hoodies' | 't-shirts' | 'shirts' | 'pants' | 'jackets'>('hoodies');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'
  );
  const [newProdColorName, setNewProdColorName] = useState('مشکی مات');
  const [newProdColorHex, setNewProdColorHex] = useState('#151515');
  const [selectedSizes, setSelectedSizes] = useState<('S' | 'M' | 'L' | 'XL' | 'XXL')[]>(['M', 'L', 'XL']);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab 3: API Settings state
  const [kavenegarApiKey, setKavenegarApiKey] = useState('');
  const [kavenegarTemplate, setKavenegarTemplate] = useState('verify');
  const [aqayepardakhtPin, setAqayepardakhtPin] = useState('sandbox');
  const [isAqayepardakhtSandbox, setIsAqayepardakhtSandbox] = useState(true);
  const [adminPhone, setAdminPhone] = useState('09121112233');
  const [testSmsTarget, setTestSmsTarget] = useState('09121112233');

  // Tab 4: Orders state
  const [ordersList, setOrdersList] = useState<any[]>([]);

  // Load Admin Data when authenticated
  useEffect(() => {
    if (adminToken && isOpen) {
      loadSettings();
      loadProducts();
      loadOrders();
    }
  }, [adminToken, isOpen]);

  if (!isOpen) return null;

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success' && data.settings) {
        const s = data.settings;
        setAnnouncementEnabled(s.announcement?.enabled ?? true);
        setAnnouncementText(s.announcement?.text ?? '');
        setAnnouncementLink(s.announcement?.link ?? '#shop');
        setKavenegarApiKey(s.kavenegar?.apiKey ?? '');
        setKavenegarTemplate(s.kavenegar?.template ?? 'verify');
        setAqayepardakhtPin(s.aqayepardakht?.pin ?? 'sandbox');
        setIsAqayepardakhtSandbox(s.aqayepardakht?.isSandbox ?? true);
        setAdminPhone(s.admin?.phone ?? '09121112233');
        setTestSmsTarget(s.admin?.phone ?? '09121112233');
      }
    } catch (e) {
      console.log('Error loading settings', e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data?.status === 'success' && Array.isArray(data.products)) {
        setProductsList(data.products);
      }
    } catch (e) {
      console.log('Error loading products', e);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data?.status === 'success' && Array.isArray(data.orders)) {
        setOrdersList(data.orders);
      }
    } catch (e) {
      console.log('Error loading orders', e);
    }
  };

  // Login handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        localStorage.setItem('samstyle_admin_token', data.token);
        setAdminToken(data.token);
        setSuccessMessage('خوش آمدید! ورود موفق به پنل مدیریت.');
      } else {
        setErrorMessage(data.message || 'نام کاربری یا رمز عبور اشتباه است.');
      }
    } catch {
      setErrorMessage('خطا در اتصال به سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin OTP Request
  const handleAdminOtpSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setTestOtpNotice(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: otpPhone }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setOtpStep('verify');
        if (data.testCode) {
          setTestOtpNotice(data.testCode);
          setOtpCode(data.testCode);
        }
      } else {
        setErrorMessage(data.message || 'خطا در ارسال پیامک مدیر.');
      }
    } catch {
      setErrorMessage('خطای سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin OTP Verify
  const handleAdminOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: otpPhone, code: otpCode }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        localStorage.setItem('samstyle_admin_token', data.token);
        setAdminToken(data.token);
      } else {
        setErrorMessage(data.message || 'کد تایید اشتباه است.');
      }
    } catch {
      setErrorMessage('خطای سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('samstyle_admin_token');
    setAdminToken(null);
    setOtpStep('request');
    setOtpCode('');
  };

  // Save Announcement
  const handleSaveAnnouncement = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          announcement: {
            enabled: announcementEnabled,
            text: announcementText,
            link: announcementLink,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMessage('اعلان بالای سایت با موفقیت به‌روزرسانی شد.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'خطا در ذخیره اعلان.');
      }
    } catch {
      setErrorMessage('خطای شبکه.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Gateway & SMS Settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          kavenegar: {
            apiKey: kavenegarApiKey,
            template: kavenegarTemplate,
          },
          aqayepardakht: {
            pin: aqayepardakhtPin,
            isSandbox: isAqayepardakhtSandbox,
          },
          admin: {
            phone: adminPhone,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMessage('تنظیمات کاوه نگار و درگاه آقای پرداخت ذخیره شد.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.message || 'خطا در ثبت تنظیمات.');
      }
    } catch {
      setErrorMessage('خطای ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  // Test SMS via Kavenegar
  const handleSendTestSms = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/admin/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ mobile: testSmsTarget }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMessage(data.result?.message || 'پیامک تستی با موفقیت ارسال گردید.');
      } else {
        setErrorMessage(data.message || 'خطا در ارسال پیامک آزمایشی.');
      }
    } catch {
      setErrorMessage('خطا در ارسال پیامک.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      setErrorMessage('نام و قیمت کالا الزامی است.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          priceToman: Number(newProdPrice),
          description: newProdDesc,
          sizes: selectedSizes,
          colors: [
            {
              name: newProdColorName,
              hex: newProdColorHex,
              image: newProdImage,
            },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMessage('کالای جدید با موفقیت اضافه شد و در فروشگاه منتشر گردید.');
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDesc('');
        loadProducts();
        onCatalogUpdated();
      } else {
        setErrorMessage(data.message || 'خطا در افزودن کالا.');
      }
    } catch {
      setErrorMessage('خطا در ارسال اطلاعات کالا.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Product
  const executeDeleteProduct = async (id: string) => {
    setIsDeleting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        setSuccessMessage(data.message || 'کالا با موفقیت از فروشگاه حذف شد.');
        setDeletingProductId(null);
        await loadProducts();
        onCatalogUpdated();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else if (res.status === 401) {
        setErrorMessage('نشست مدیریت منقضی شده است. لطفاً مجدداً وارد شوید.');
        setAdminToken(null);
        localStorage.removeItem('samstyle_admin_token');
      } else {
        setErrorMessage(data.message || 'خطا در حذف کالا از فروشگاه.');
      }
    } catch {
      setErrorMessage('خطای ارتباط با سرور.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSize = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-xs" />
            <h2 className="text-sm sm:text-base font-black tracking-wider text-[var(--text-main)] uppercase">
              پنل مدیریت سام‌استایل (SAMSTYLE ADMIN)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {adminToken && (
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-bold"
                title="خروج از حساب مدیریت"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">خروج</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
              aria-label="بستن پنل"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notice Bars */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-red-950/40 border border-red-800/60 rounded-xs flex items-center gap-2 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-4 mt-3 p-3 bg-[var(--accent)]/15 border border-[var(--accent)]/40 rounded-xs flex items-center gap-2 text-xs text-[var(--text-main)] font-semibold">
            <CheckCircle2 size={15} className="shrink-0 text-[var(--accent)]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body: Login OR Admin Tabs */}
        {!adminToken ? (
          /* ================= LOGIN VIEW ================= */
          <div className="p-5 sm:p-8 max-w-md mx-auto w-full space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mb-2">
                <Lock size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--text-main)]">ورود مدیر فروشگاه</h3>
              <p className="text-xs text-[var(--text-muted)]">
                جهت دسترسی به تنظیمات درگاه آقای پرداخت، کاوه نگار و مدیریت کالاها وارد شوید.
              </p>
            </div>

            {/* Toggle Dual Login Mode */}
            <div className="grid grid-cols-2 p-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs text-xs font-bold">
              <button
                onClick={() => setLoginMethod('password')}
                className={`py-2 text-center rounded-xs transition-colors cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-[var(--accent)] text-[#111111]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                نام کاربری و رمز
              </button>
              <button
                onClick={() => setLoginMethod('otp')}
                className={`py-2 text-center rounded-xs transition-colors cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-[var(--accent)] text-[#111111]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                کد پیامکی (OTP)
              </button>
            </div>

            {/* Mode A: Password Login */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">نام کاربری</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">رمز عبور</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[var(--accent)] text-[#111111] hover:brightness-110 font-bold text-xs rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>ورود به پنل مدیریت</span>}
                </button>
              </form>
            )}

            {/* Mode B: OTP SMS Login */}
            {loginMethod === 'otp' && (
              <div className="space-y-4">
                {testOtpNotice && (
                  <div className="p-2.5 bg-yellow-950/40 border border-yellow-700/50 rounded-xs text-xs text-yellow-200 flex items-center justify-between">
                    <span>کد تستی مدیر (کاوه نگار):</span>
                    <span className="font-mono font-bold text-sm bg-yellow-500/20 px-2 py-0.5 rounded">
                      {testOtpNotice}
                    </span>
                  </div>
                )}

                {otpStep === 'request' ? (
                  <form onSubmit={handleAdminOtpSend} className="space-y-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">شماره همراه مدیر</label>
                      <input
                        type="tel"
                        required
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[var(--accent)] text-[#111111] hover:brightness-110 font-bold text-xs rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>ارسال کد تایید پیامکی</span>}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminOtpVerify} className="space-y-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">کد ۵ رقمی ارسال شده</label>
                      <input
                        type="text"
                        maxLength={5}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-center font-mono tracking-widest text-base outline-none"
                        dir="ltr"
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[var(--accent)] text-[#111111] hover:brightness-110 font-bold text-xs rounded-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>تایید و ورود مدیر</span>}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ================= AUTHENTICATED ADMIN PANEL ================= */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-x-auto text-xs font-bold scrollbar-none">
              <button
                onClick={() => setActiveTab('announcement')}
                className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'announcement'
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Megaphone size={15} />
                <span>اعلان بالای سایت</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'products'
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <PlusCircle size={15} />
                <span>افزودن و مدیریت کالاها ({productsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Settings size={15} />
                <span>تنظیمات درگاه و کاوه نگار</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-3 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === 'orders'
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ShoppingBag size={15} />
                <span>سفارشات و تراکنش‌ها ({ordersList.length})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: ANNOUNCEMENT BAR */}
              {activeTab === 'announcement' && (
                <div className="space-y-5 max-w-2xl">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[var(--text-main)]">تنظیم نوار اعلان بالای سایت</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      این پیام به صورت سراسری در بالاترین بخش وب‌سایت برای تمام مشتریان نمایش داده می‌شود.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs">
                    <input
                      type="checkbox"
                      id="announcementToggle"
                      checked={announcementEnabled}
                      onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                    />
                    <label htmlFor="announcementToggle" className="text-xs font-bold text-[var(--text-main)] cursor-pointer">
                      نمایش نوار اعلان در سایت فعال باشد
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                      متن پیام اعلان
                    </label>
                    <textarea
                      rows={3}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="متن پیام جدید برای نمایش در بالای سایت..."
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-3 rounded-xs text-[var(--text-main)] text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                      لینک دکمه اعلان (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      placeholder="#shop یا لینک دلخواه"
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none"
                      dir="ltr"
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-bold">
                      <Eye size={13} />
                      <span>پیش‌نمایش زنده نوار اعلان:</span>
                    </div>
                    {announcementEnabled ? (
                      <div className="bg-[#181818] border border-[var(--border-subtle)] text-[#F2F0EB] py-2 px-3 rounded-xs text-xs flex items-center justify-between">
                        <span className="truncate">{announcementText}</span>
                        <span className="text-[var(--accent)] font-bold shrink-0 mr-2 text-[11px]">مشاهده ←</span>
                      </div>
                    ) : (
                      <div className="text-xs text-[var(--text-muted)] italic">
                        (نوار اعلان در حال حاضر خاموش است)
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSaveAnnouncement}
                    disabled={isLoading}
                    className="py-3 px-6 bg-[var(--accent)] text-[#111111] hover:brightness-110 font-bold text-xs rounded-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>ذخیره و انتشار اعلان</span>}
                  </button>
                </div>
              )}

              {/* TAB 2: PRODUCTS CATALOG & UPLOAD */}
              {activeTab === 'products' && (
                <div className="space-y-8">
                  {/* Add New Product Form */}
                  <form onSubmit={handleAddProduct} className="p-4 sm:p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                      <PlusCircle size={17} className="text-[var(--accent)]" />
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                        افزودن لباس جدید به فروشگاه سام‌استایل
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">نام و عنوان لباس *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: هودی بگ کلاه‌دار زغالی"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">دسته‌بندی *</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value as any)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                        >
                          <option value="hoodies">هودی و دورس</option>
                          <option value="t-shirts">تیشرت</option>
                          <option value="shirts">پیراهن</option>
                          <option value="pants">شلوار</option>
                          <option value="jackets">کاپشن و ژاکت</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">قیمت به تومان *</label>
                        <input
                          type="number"
                          required
                          placeholder="مثال: 1950000"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">آدرس عکس کالا (URL)</label>
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          value={newProdImage}
                          onChange={(e) => setNewProdImage(e.target.value)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">نام رنگ پیش‌فرض</label>
                        <input
                          type="text"
                          value={newProdColorName}
                          onChange={(e) => setNewProdColorName(e.target.value)}
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">انتخاب رنگ (کد هگز)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newProdColorHex}
                            onChange={(e) => setNewProdColorHex(e.target.value)}
                            className="w-10 h-9 p-0 bg-transparent border-0 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={newProdColorHex}
                            onChange={(e) => setNewProdColorHex(e.target.value)}
                            className="flex-1 bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2 rounded-xs text-[var(--text-main)] outline-none font-mono"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-[var(--text-muted)] mb-1.5">سایزهای موجود:</label>
                        <div className="flex items-center gap-2">
                          {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSize(s)}
                              className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition-colors cursor-pointer ${
                                selectedSizes.includes(s)
                                  ? 'bg-[var(--accent)] border-[var(--accent)] text-[#111111]'
                                  : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-[var(--text-muted)] mb-1">توضیحات لباس</label>
                        <textarea
                          rows={2}
                          value={newProdDesc}
                          onChange={(e) => setNewProdDesc(e.target.value)}
                          placeholder="توضیح کوتاه درباره جنس پارچه، برش و استایل..."
                          className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="py-3 px-6 bg-[var(--accent)] text-[#111111] hover:brightness-110 font-bold text-xs rounded-xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>ثبت و انتشار کالا در فروشگاه</span>}
                    </button>
                  </form>

                  {/* Existing Products List */}
                  <div className="space-y-3">
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                      کالاهای فعال در سایت ({productsList.length} کالا)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {productsList.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs flex items-center justify-between gap-3 text-xs"
                        >
                          <img
                            src={p.colors[0]?.image || ''}
                            alt={p.name}
                            className="w-14 h-14 object-cover rounded-xs border border-[var(--border-subtle)]"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-[var(--text-main)] truncate">{p.name}</h5>
                            <div className="text-[var(--accent)] font-semibold mt-0.5">
                              {formatToman(p.priceToman)}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                              دسته‌بندی: {p.category}
                            </div>
                          </div>
                          {deletingProductId === p.id ? (
                            <div className="flex items-center gap-1 shrink-0 bg-red-950/70 p-1 rounded-xs border border-red-700/80">
                              <span className="text-[10px] text-red-200 font-bold whitespace-nowrap">حذف؟</span>
                              <button
                                onClick={() => executeDeleteProduct(p.id)}
                                disabled={isDeleting}
                                className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-xs text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                {isDeleting ? '...' : 'بله'}
                              </button>
                              <button
                                onClick={() => setDeletingProductId(null)}
                                disabled={isDeleting}
                                className="px-1.5 py-0.5 bg-[#2c2c2c] hover:bg-[#3d3d3d] text-[var(--text-main)] rounded-xs text-[10px] transition-colors cursor-pointer"
                              >
                                لغو
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingProductId(p.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xs transition-colors cursor-pointer shrink-0"
                              title="حذف کالا"
                              aria-label={`حذف ${p.name}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: API SETTINGS (KAVENEGAR & AQAYEPARDAKHT) */}
              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-2xl">
                  
                  {/* Kavenegar OTP SMS Section */}
                  <div className="space-y-4 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs">
                    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                      <Smartphone size={17} className="text-[var(--accent)]" />
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                        تنظیمات پیامک OTP کاوه نگار (Kavenegar)
                      </h4>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      سام‌استایل از وب‌سرویس اعتبارسنجی کاوه نگار جهت ارسال سریع و بی‌وقفه کدهای OTP به خریداران و مدیر استفاده می‌کند. در صورت عدم تنظیم کلید، سیستم در حالت آزمایشی (سیمولیشن) فعال است.
                    </p>

                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">
                        کلید دسترسی وب‌سرویس کاوه نگار (API Key)
                      </label>
                      <input
                        type="text"
                        value={kavenegarApiKey}
                        onChange={(e) => setKavenegarApiKey(e.target.value)}
                        placeholder="مثال: 4A75456A4F..."
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">
                        نام الگوی پیامک خدماتی (Lookup Template)
                      </label>
                      <input
                        type="text"
                        value={kavenegarTemplate}
                        onChange={(e) => setKavenegarTemplate(e.target.value)}
                        placeholder="مثال: verify یا samstyle"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none font-mono"
                        dir="ltr"
                      />
                    </div>

                    {/* Test SMS Action */}
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
                      <input
                        type="tel"
                        value={testSmsTarget}
                        onChange={(e) => setTestSmsTarget(e.target.value)}
                        placeholder="شماره موبایل جهت تست..."
                        className="bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2 rounded-xs text-[var(--text-main)] text-xs outline-none"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestSms}
                        disabled={isLoading}
                        className="py-2 px-3 bg-[var(--bg-subtle)] hover:bg-[var(--accent)] hover:text-[#111] border border-[var(--border-subtle)] text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>ارسال پیامک آزمایشی</span>
                      </button>
                    </div>
                  </div>

                  {/* Aqayepardakht Gateway Section */}
                  <div className="space-y-4 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs">
                    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                      <KeyRound size={17} className="text-[var(--accent)]" />
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                        تنظیمات درگاه پرداخت اینترنتی آقای پرداخت (Aqayepardakht)
                      </h4>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      کد پین اختصاصی (PIN) دریافتی از پنل آقای پرداخت خود را در فیلد زیر قرار دهید. در صورت فعال بودن حالت آزمایشی، پرداخت‌ها بدون کسر وجه واقعی در محیط سندباکس پردازش می‌شوند.
                    </p>

                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1">
                        کد پین درگاه آقای پرداخت (PIN)
                      </label>
                      <input
                        type="text"
                        value={aqayepardakhtPin}
                        onChange={(e) => setAqayepardakhtPin(e.target.value)}
                        placeholder="کد پین درگاه یا sandbox"
                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="sandboxToggle"
                        checked={isAqayepardakhtSandbox}
                        onChange={(e) => setIsAqayepardakhtSandbox(e.target.checked)}
                        className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                      />
                      <label htmlFor="sandboxToggle" className="text-xs font-bold text-[var(--text-main)] cursor-pointer">
                        فعال‌سازی حالت آزمایشی (سندباکس آقای پرداخت)
                      </label>
                    </div>
                  </div>

                  {/* Admin Phone for OTP */}
                  <div className="space-y-3 p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs">
                    <label className="block text-xs font-bold text-[var(--text-main)]">
                      شماره موبایل مدیر جهت دریافت پیامک OTP ورود به پنل
                    </label>
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none"
                      dir="ltr"
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="py-3 px-6 bg-[var(--accent)] text-[#111111] hover:brightness-110 font-bold text-xs rounded-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>ذخیره تمام تنظیمات</span>}
                  </button>

                </div>
              )}

              {/* TAB 4: ORDERS & TRANSACTIONS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)]">
                      گزارش سفارشات و تراکنش‌های درگاه ({ordersList.length} مورد)
                    </h4>
                    <button
                      onClick={loadOrders}
                      className="text-xs text-[var(--accent)] hover:underline font-bold cursor-pointer"
                    >
                      به‌روزرسانی لیست
                    </button>
                  </div>

                  {ordersList.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs">
                      هنوز سفارشی در سیستم ثبت نشده است.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ordersList.map((ord: any) => (
                        <div
                          key={ord.orderId}
                          className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xs space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[var(--accent)] text-sm">{ord.orderId}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.paymentStatus === 'paid'
                                    ? 'bg-green-950/60 text-green-300 border border-green-700/50'
                                    : 'bg-yellow-950/60 text-yellow-300 border border-yellow-700/50'
                                }`}
                              >
                                {ord.paymentStatus === 'paid' ? 'پرداخت موفق' : 'در انتظار پرداخت'}
                              </span>
                            </div>
                            <div className="text-[var(--text-muted)]">
                              {new Date(ord.createdAt).toLocaleDateString('fa-IR')}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[var(--text-muted)]">
                            <div>خریدار: <span className="text-[var(--text-main)] font-semibold">{ord.fullName}</span></div>
                            <div>تلفن: <span className="text-[var(--text-main)] font-mono" dir="ltr">{toPersianDigits(ord.mobile)}</span></div>
                            <div>مبلغ: <span className="text-[var(--accent)] font-bold">{formatToman(ord.amount)}</span></div>
                            <div className="sm:col-span-3">آدرس: <span className="text-[var(--text-main)]">{ord.city}، {ord.address}</span></div>
                            {ord.trackingCode && (
                              <div className="sm:col-span-3 text-[var(--accent)] font-mono">
                                کد پیگیری تراکنش آقای پرداخت: {ord.trackingCode}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
