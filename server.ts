import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { db, StoredOrder } from './src/server/db';
import { normalizeIranPhone, sanitizeInput, generateOtpCode, RateLimiter } from './src/server/security';
import { sendKavenegarOtp } from './src/server/kavenegar';
import { createAqayepardakhtPayment, verifyAqayepardakhtPayment } from './src/server/aqayepardakht';
import { Product } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers with size limit protection
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Anti-Attack Rate Limiters
const generalLimiter = new RateLimiter(150, 60 * 1000); // 150 req / min
const otpSendLimiter = new RateLimiter(4, 5 * 60 * 1000, 60 * 1000); // 4 sends / 5 min, 60s cooldown
const otpVerifyLimiter = new RateLimiter(6, 10 * 60 * 1000); // max 6 attempts / 10 min
const adminLoginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 failed logins / 15 min

// Global client IP helper
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

// In-Memory active OTP storage: key -> { code, expiresAt, attempts }
interface OtpSession {
  code: string;
  expiresAt: number;
  attempts: number;
}
const activeOtps = new Map<string, OtpSession>();

// Persistent Admin tokens
const DATA_DIR = path.resolve(__dirname, 'data');
const TOKENS_FILE = path.resolve(DATA_DIR, 'admin-tokens.json');

function getStoredAdminTokens(): Set<string> {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (err) {
    console.error('Error reading admin tokens:', err);
  }
  return new Set();
}

const activeAdminTokens = getStoredAdminTokens();

function recordAdminToken(token: string) {
  activeAdminTokens.add(token);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(Array.from(activeAdminTokens)), 'utf-8');
  } catch (err) {
    console.error('Error saving admin token:', err);
  }
}

function revokeAdminToken(token: string) {
  activeAdminTokens.delete(token);
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(Array.from(activeAdminTokens)), 'utf-8');
  } catch (err) {
    console.error('Error revoking admin token:', err);
  }
}

// Middleware: Rate limiting guard
app.use('/api/', (req: Request, res: Response, next: NextFunction) => {
  const ip = getClientIp(req);
  const check = generalLimiter.check(ip);
  if (!check.allowed) {
    res.status(429).json({ status: 'error', message: 'درخواست‌های بیش از حد مجاز. لطفاً کمی صبر کنید.' });
    return;
  }
  next();
});

// Middleware: Admin auth guard
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '').trim() || (req.query.token as string)?.trim();

  if (!token || !activeAdminTokens.has(token)) {
    res.status(401).json({ status: 'error', message: 'دسترسی غیرمجاز. لطفاً ابتدا وارد پنل مدیریت شوید.' });
    return;
  }
  next();
}

// ==========================================
// 1. PUBLIC API ROUTES
// ==========================================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'SAMSTYLE',
    gateway: 'Aqayepardakht',
    smsProvider: 'Kavenegar',
    timestamp: new Date().toISOString(),
  });
});

// Live Announcement Bar text and status
app.get('/api/announcement', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({
    status: 'success',
    announcement: settings.announcement,
  });
});

// Product Catalog
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    products: db.getProducts(),
  });
});

// ==========================================
// 2. KAVENEGAR OTP AUTH (Customer & Admin)
// ==========================================

// Send OTP
app.post('/api/auth/otp/send', async (req: Request, res: Response) => {
  const { mobile } = req.body;
  const ip = getClientIp(req);

  const phoneCheck = normalizeIranPhone(mobile);
  if (!phoneCheck.valid) {
    res.status(400).json({ status: 'error', message: phoneCheck.error });
    return;
  }
  const cleanPhone = phoneCheck.normalized;

  // Rate limit by IP and by Phone
  const ipCheck = otpSendLimiter.check(`ip:${ip}`);
  if (!ipCheck.allowed) {
    res.status(429).json({ status: 'error', message: ipCheck.reason });
    return;
  }

  const phoneLimitCheck = otpSendLimiter.check(`phone:${cleanPhone}`);
  if (!phoneLimitCheck.allowed) {
    res.status(429).json({ status: 'error', message: phoneLimitCheck.reason });
    return;
  }

  const code = generateOtpCode(5);
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes validity

  activeOtps.set(cleanPhone, {
    code,
    expiresAt,
    attempts: 0,
  });

  const settings = db.getSettings();
  const result = await sendKavenegarOtp({
    receptor: cleanPhone,
    code,
    apiKey: settings.kavenegar.apiKey,
    template: settings.kavenegar.template,
  });

  res.json({
    status: 'success',
    message: result.message,
    testCode: result.simulated ? result.code : undefined,
    expiresInSeconds: 180,
  });
});

// Verify OTP for Customer
app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
  const { mobile, code, fullName } = req.body;
  const phoneCheck = normalizeIranPhone(mobile);
  if (!phoneCheck.valid) {
    res.status(400).json({ status: 'error', message: phoneCheck.error });
    return;
  }
  const cleanPhone = phoneCheck.normalized;
  const cleanCode = String(code || '').trim();

  const session = activeOtps.get(cleanPhone);
  if (!session) {
    res.status(400).json({ status: 'error', message: 'کد تایید منقضی شده یا درخواستی ثبت نشده است. لطفاً مجدداً تلاش کنید.' });
    return;
  }

  if (Date.now() > session.expiresAt) {
    activeOtps.delete(cleanPhone);
    res.status(400).json({ status: 'error', message: 'کد تایید منقضی شده است. لطفاً مجدداً درخواست دهید.' });
    return;
  }

  session.attempts += 1;
  if (session.attempts > 5) {
    activeOtps.delete(cleanPhone);
    res.status(400).json({ status: 'error', message: 'تعداد دفعات اشتباه بیش از حد بود. لطفاً کد جدید دریافت کنید.' });
    return;
  }

  if (session.code !== cleanCode) {
    res.status(400).json({ status: 'error', message: 'کد تایید وارد شده صحیح نمی‌باشد.' });
    return;
  }

  // Success
  activeOtps.delete(cleanPhone);
  const user = db.saveUser(cleanPhone, fullName ? sanitizeInput(fullName) : undefined);
  const userToken = `USER-${crypto.randomBytes(16).toString('hex')}`;

  res.json({
    status: 'success',
    message: 'ورود موفقیت‌آمیز بود.',
    token: userToken,
    user,
  });
});

// ==========================================
// 3. ADMIN AUTHENTICATION (Dual Mode)
// ==========================================

// Admin Login via Username & Password
app.post('/api/auth/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ip = getClientIp(req);

  const limitCheck = adminLoginLimiter.check(`admin_login:${ip}`);
  if (!limitCheck.allowed) {
    res.status(429).json({ status: 'error', message: limitCheck.reason });
    return;
  }

  const settings = db.getSettings();
  const expectedUser = settings.admin.username;
  const expectedPass = settings.admin.password;

  if (username === expectedUser && password === expectedPass) {
    adminLoginLimiter.reset(`admin_login:${ip}`);
    const token = `ADM-${crypto.randomBytes(24).toString('hex')}`;
    recordAdminToken(token);

    res.json({
      status: 'success',
      token,
      message: 'ورود به پنل مدیریت با موفقیت انجام شد.',
    });
    return;
  }

  res.status(401).json({ status: 'error', message: 'نام کاربری یا رمز عبور اشتباه است.' });
});

// Admin OTP Send
app.post('/api/auth/admin/otp-send', async (req: Request, res: Response) => {
  const { mobile } = req.body;
  const phoneCheck = normalizeIranPhone(mobile);
  if (!phoneCheck.valid) {
    res.status(400).json({ status: 'error', message: phoneCheck.error });
    return;
  }
  const cleanPhone = phoneCheck.normalized;
  const settings = db.getSettings();

  // Validate that the phone matches admin phone
  const adminPhoneCheck = normalizeIranPhone(settings.admin.phone);
  if (!adminPhoneCheck.valid || adminPhoneCheck.normalized !== cleanPhone) {
    res.status(403).json({ status: 'error', message: 'این شماره موبایل به عنوان مدیر در سامانه ثبت نشده است.' });
    return;
  }

  const code = generateOtpCode(5);
  const expiresAt = Date.now() + 3 * 60 * 1000;
  activeOtps.set(`admin:${cleanPhone}`, { code, expiresAt, attempts: 0 });

  const result = await sendKavenegarOtp({
    receptor: cleanPhone,
    code,
    apiKey: settings.kavenegar.apiKey,
    template: settings.kavenegar.template,
  });

  res.json({
    status: 'success',
    message: result.message,
    testCode: result.simulated ? result.code : undefined,
    expiresInSeconds: 180,
  });
});

// Admin OTP Verify
app.post('/api/auth/admin/otp-verify', (req: Request, res: Response) => {
  const { mobile, code } = req.body;
  const phoneCheck = normalizeIranPhone(mobile);
  if (!phoneCheck.valid) {
    res.status(400).json({ status: 'error', message: phoneCheck.error });
    return;
  }
  const cleanPhone = phoneCheck.normalized;
  const cleanCode = String(code || '').trim();

  const session = activeOtps.get(`admin:${cleanPhone}`);
  if (!session || Date.now() > session.expiresAt) {
    activeOtps.delete(`admin:${cleanPhone}`);
    res.status(400).json({ status: 'error', message: 'کد تایید منقضی شده یا نامعتبر است.' });
    return;
  }

  if (session.code !== cleanCode) {
    session.attempts += 1;
    if (session.attempts > 5) {
      activeOtps.delete(`admin:${cleanPhone}`);
    }
    res.status(400).json({ status: 'error', message: 'کد تایید وارد شده اشتباه است.' });
    return;
  }

  activeOtps.delete(`admin:${cleanPhone}`);
  const token = `ADM-${crypto.randomBytes(24).toString('hex')}`;
  recordAdminToken(token);

  res.json({
    status: 'success',
    token,
    message: 'ورود مدیر با کد تایید پیامکی موفقیت‌آمیز بود.',
  });
});

// Admin Logout
app.post('/api/auth/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '').trim() || (req.query.token as string)?.trim();
  if (token) revokeAdminToken(token);
  res.json({ status: 'success', message: 'از پنل مدیریت خارج شدید.' });
});

// ==========================================
// 4. ADMIN PANEL MANAGEMENT ENDPOINTS
// ==========================================

// Get Admin Settings
app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({
    status: 'success',
    settings: {
      announcement: settings.announcement,
      kavenegar: {
        apiKey: settings.kavenegar.apiKey,
        template: settings.kavenegar.template,
        hasKey: Boolean(settings.kavenegar.apiKey),
      },
      aqayepardakht: {
        pin: settings.aqayepardakht.pin,
        isSandbox: settings.aqayepardakht.isSandbox,
      },
      admin: {
        username: settings.admin.username,
        phone: settings.admin.phone,
      },
    },
  });
});

// Update Admin Settings (Announcement, Kavenegar, Aqayepardakht, Admin credentials)
app.post('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const { announcement, kavenegar, aqayepardakht, admin } = req.body;

  const updates: any = {};
  if (announcement) {
    updates.announcement = {
      enabled: Boolean(announcement.enabled),
      text: sanitizeInput(announcement.text || ''),
      link: sanitizeInput(announcement.link || '#shop'),
    };
  }

  if (kavenegar) {
    updates.kavenegar = {
      apiKey: sanitizeInput(kavenegar.apiKey || ''),
      template: sanitizeInput(kavenegar.template || 'verify'),
    };
  }

  if (aqayepardakht) {
    updates.aqayepardakht = {
      pin: sanitizeInput(aqayepardakht.pin || 'sandbox'),
      isSandbox: Boolean(aqayepardakht.isSandbox),
    };
  }

  if (admin) {
    const adminUpdates: any = {};
    if (admin.username) adminUpdates.username = sanitizeInput(admin.username);
    if (admin.password) adminUpdates.password = sanitizeInput(admin.password);
    if (admin.phone) {
      const pCheck = normalizeIranPhone(admin.phone);
      if (pCheck.valid) adminUpdates.phone = pCheck.normalized;
    }
    updates.admin = adminUpdates;
  }

  const newSettings = db.updateSettings(updates);
  res.json({
    status: 'success',
    message: 'تنظیمات با موفقیت ذخیره شد.',
    settings: newSettings,
  });
});

// Upload / Add New Product
app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  const { name, category, priceToman, description, colors, sizes } = req.body;

  if (!name || !priceToman) {
    res.status(400).json({ status: 'error', message: 'نام و قیمت کالا الزامی است.' });
    return;
  }

  const newProduct: Product = {
    id: `sam-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`,
    name: sanitizeInput(name),
    category: category || 'hoodies',
    priceToman: Number(priceToman),
    description: sanitizeInput(description || 'طراحی شیک و مینیمال از کالکشن سام‌استایل.'),
    sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['M', 'L', 'XL'],
    colors: Array.isArray(colors) && colors.length > 0
      ? colors.map((c: any) => ({
          name: sanitizeInput(c.name || 'مشکی'),
          hex: sanitizeInput(c.hex || '#151515'),
          image: sanitizeInput(c.image || 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?auto=format&fit=crop&w=1000&q=80'),
        }))
      : [
          {
            name: 'مشکی',
            hex: '#151515',
            image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
          },
        ],
  };

  db.addProduct(newProduct);
  res.json({
    status: 'success',
    message: 'کالای جدید با موفقیت اضافه شد.',
    product: newProduct,
  });
});

// Delete Product
app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteProduct(id);
  if (deleted) {
    res.json({ status: 'success', message: 'کالا با موفقیت حذف گردید.' });
  } else {
    res.status(404).json({ status: 'error', message: 'کالا یافت نشد.' });
  }
});

// View All Orders
app.get('/api/admin/orders', requireAdmin, (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    orders: db.getOrders(),
  });
});

// Send Test SMS via Kavenegar
app.post('/api/admin/test-sms', requireAdmin, async (req: Request, res: Response) => {
  const { mobile } = req.body;
  const pCheck = normalizeIranPhone(mobile);
  if (!pCheck.valid) {
    res.status(400).json({ status: 'error', message: pCheck.error });
    return;
  }

  const settings = db.getSettings();
  const testCode = generateOtpCode(5);
  const result = await sendKavenegarOtp({
    receptor: pCheck.normalized,
    code: testCode,
    apiKey: settings.kavenegar.apiKey,
    template: settings.kavenegar.template,
  });

  res.json({
    status: 'success',
    result,
  });
});

// ==========================================
// 5. AQAYEPARDAKHT PAYMENT GATEWAY
// ==========================================

// Create Payment & Checkout
app.post('/api/payment/create', async (req: Request, res: Response) => {
  const { fullName, mobile, city, address, amount, items } = req.body;

  const phoneCheck = normalizeIranPhone(mobile);
  if (!phoneCheck.valid) {
    res.status(400).json({ status: 'error', message: phoneCheck.error });
    return;
  }
  const cleanPhone = phoneCheck.normalized;

  const numAmount = Number(amount);
  if (!numAmount || numAmount < 1000) {
    res.status(400).json({ status: 'error', message: 'مبلغ پرداختی نامعتبر است.' });
    return;
  }

  const orderId = `SAM-${Math.floor(10000 + Math.random() * 90000)}`;
  const settings = db.getSettings();

  // Determine host for callback
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  const callbackUrl = `${protocol}://${host}/api/payment/aqayepardakht/callback`;

  // Create payment via Aqayepardakht API
  const paymentRes = await createAqayepardakhtPayment({
    pin: settings.aqayepardakht.pin,
    amount: numAmount,
    callback: callbackUrl,
    mobile: cleanPhone,
    description: `خرید از فروشگاه پوشاک سام‌استایل (سفارش ${orderId})`,
    invoice_id: orderId,
    isSandbox: settings.aqayepardakht.isSandbox,
  });

  if (!paymentRes.success || !paymentRes.paymentUrl) {
    res.status(500).json({
      status: 'error',
      message: paymentRes.error || 'خطا در ارتباط با درگاه آقای پرداخت.',
    });
    return;
  }

  // Record pending order in DB
  const storedOrder: StoredOrder = {
    orderId,
    transid: paymentRes.transid,
    paymentStatus: 'pending',
    fullName: sanitizeInput(fullName || 'مشتری سام‌استایل'),
    mobile: cleanPhone,
    city: sanitizeInput(city || 'تهران'),
    address: sanitizeInput(address || ''),
    amount: numAmount,
    itemCount: Array.isArray(items) ? items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0) : 1,
    items: Array.isArray(items) ? items : [],
    createdAt: new Date().toISOString(),
  };

  db.saveOrder(storedOrder);

  res.json({
    status: 'success',
    orderId,
    transid: paymentRes.transid,
    paymentUrl: paymentRes.paymentUrl,
    isSandbox: paymentRes.isSandbox,
  });
});

// Gateway Simulator for Seamless Local / Test mode
app.get('/api/payment/gateway-simulator', (req: Request, res: Response) => {
  const transid = req.query.transid as string;
  const amount = req.query.amount as string;
  const invoice_id = req.query.invoice_id as string;

  res.send(`
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>شبیه‌ساز درگاه آقای پرداخت — SAMSTYLE</title>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;900&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Vazirmatn', sans-serif;
          background: #111111;
          color: #F2F0EB;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .card {
          background: #181818;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          max-width: 480px;
          width: 100%;
          padding: 28px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #2a2a2a;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .badge {
          background: #B8FF38;
          color: #111;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
          color: #bbb;
        }
        .row span:last-child {
          color: #fff;
          font-weight: 700;
        }
        .btn-pay {
          display: block;
          width: 100%;
          background: #B8FF38;
          color: #111;
          font-weight: 800;
          padding: 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 15px;
          margin-top: 24px;
          text-align: center;
          text-decoration: none;
          box-sizing: border-box;
        }
        .btn-pay:hover {
          background: #a5f022;
        }
        .btn-cancel {
          display: block;
          width: 100%;
          background: transparent;
          color: #888;
          font-weight: 600;
          padding: 10px;
          border: 1px solid #333;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          margin-top: 10px;
          text-align: center;
          text-decoration: none;
          box-sizing: border-box;
        }
        .btn-cancel:hover {
          color: #ff5555;
          border-color: #ff5555;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div style="font-size: 16px; font-weight: 800;">درگاه پرداخت اینترنتی آقای پرداخت</div>
          <div class="badge">SANDBOX TEST</div>
        </div>
        <div class="row">
          <span>فروشگاه:</span>
          <span>پوشاک سام‌استایل (SAMSTYLE)</span>
        </div>
        <div class="row">
          <span>شناسه فاکتور:</span>
          <span>${invoice_id || 'SAM-ORDER'}</span>
        </div>
        <div class="row">
          <span>کد تراکنش:</span>
          <span style="font-family: monospace;">${transid}</span>
        </div>
        <div class="row">
          <span>مبلغ قابل پرداخت:</span>
          <span style="color: #B8FF38; font-size: 16px;">${Number(amount || 0).toLocaleString('fa-IR')} تومان</span>
        </div>
        
        <a href="/api/payment/aqayepardakht/callback?transid=${transid}&status=success&invoice_id=${invoice_id}" class="btn-pay">
          پرداخت موفق و تایید خرید (آقای پرداخت)
        </a>
        <a href="/api/payment/aqayepardakht/callback?transid=${transid}&status=failed&invoice_id=${invoice_id}" class="btn-cancel">
          انصراف از پرداخت و بازگشت به سام‌استایل
        </a>
      </div>
    </body>
    </html>
  `);
});

// Aqayepardakht Callback Handler (Both GET and POST from gateway)
const handleAqayepardakhtCallback = async (req: Request, res: Response) => {
  const transid = (req.query.transid || req.body.transid) as string;
  const status = (req.query.status || req.body.status) as string;

  if (!transid) {
    res.redirect('/?payment=failed&reason=no_transid');
    return;
  }

  const order = db.getOrderByTransId(transid);
  const settings = db.getSettings();

  // If user cancelled or gateway sent failure
  if (status === 'failed' || status === '0') {
    if (order) {
      order.paymentStatus = 'failed';
      db.saveOrder(order);
    }
    res.redirect(`/?payment=failed&orderId=${order?.orderId || ''}`);
    return;
  }

  // Verify payment with Aqayepardakht
  const verifyRes = await verifyAqayepardakhtPayment({
    pin: settings.aqayepardakht.pin,
    amount: order ? order.amount : 0,
    transid,
  });

  if (verifyRes.success && order) {
    order.paymentStatus = 'paid';
    order.trackingCode = verifyRes.trackingNumber || `TRK-${Date.now().toString().slice(-6)}`;
    order.paidAt = new Date().toISOString();
    db.saveOrder(order);

    res.redirect(
      `/?payment=success&orderId=${order.orderId}&tracking=${encodeURIComponent(order.trackingCode)}&amount=${order.amount}`
    );
    return;
  }

  res.redirect(`/?payment=failed&orderId=${order?.orderId || ''}&reason=verify_failed`);
};

app.get('/api/payment/aqayepardakht/callback', handleAqayepardakhtCallback);
app.post('/api/payment/aqayepardakht/callback', handleAqayepardakhtCallback);

// Check order status
app.get('/api/payment/status/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = db.getOrder(orderId);
  if (!order) {
    res.status(404).json({ status: 'error', message: 'سفارش یافت نشد.' });
    return;
  }
  res.json({
    status: 'success',
    order,
  });
});

// ==========================================
// 6. VITE OR PRODUCTION STATIC SERVE
// ==========================================

async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAMSTYLE] Server active at http://localhost:${PORT}`);
  });
}

startServer();
