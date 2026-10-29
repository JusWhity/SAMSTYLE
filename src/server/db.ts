import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../types';
import { PRODUCTS } from '../data/products';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

export interface AppSettings {
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  kavenegar: {
    apiKey: string;
    template: string;
  };
  aqayepardakht: {
    pin: string;
    isSandbox: boolean;
  };
  admin: {
    username: string;
    password: string; // secure password
    phone: string;    // phone number for admin OTP login
  };
}

export interface StoredOrder {
  orderId: string;
  transid?: string;
  trackingCode?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  fullName: string;
  mobile: string;
  city: string;
  address: string;
  amount: number;
  itemCount: number;
  items: Array<{
    title: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  paidAt?: string;
}

export interface StoredUser {
  phone: string;
  fullName?: string;
  createdAt: string;
}

export interface DBData {
  settings: AppSettings;
  products: Product[];
  orders: StoredOrder[];
  users: Record<string, StoredUser>;
}

const DEFAULT_SETTINGS: AppSettings = {
  announcement: {
    enabled: true,
    text: 'ارسال رایگان برای خریدهای بالای ۱،۵۰۰،۰۰۰ تومان | کالکشن جدید پاییزه سام‌استایل آماده تحویل است',
    link: '#shop',
  },
  kavenegar: {
    apiKey: '', // Empty initially, configured by Admin in Admin Panel
    template: 'verify',
  },
  aqayepardakht: {
    pin: 'sandbox', // Default to sandbox or merchant PIN
    isSandbox: true,
  },
  admin: {
    username: 'admin',
    password: 'samstyle1404',
    phone: '09121112233',
  },
};

class DBManager {
  private data: DBData;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DBData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          products: Array.isArray(parsed.products) ? parsed.products : [...PRODUCTS],
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          users: parsed.users || {},
        };
      }
    } catch (err) {
      console.error('Error loading DB file, fallback to defaults:', err);
    }

    const initialData: DBData = {
      settings: DEFAULT_SETTINGS,
      products: [...PRODUCTS],
      orders: [],
      users: {},
    };
    this.saveDirect(initialData);
    return initialData;
  }

  private saveDirect(data: DBData) {
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error writing DB file:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  // Getters & Setters
  public getSettings(): AppSettings {
    return this.data.settings;
  }

  public updateSettings(partial: Partial<AppSettings>) {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
      announcement: {
        ...this.data.settings.announcement,
        ...(partial.announcement || {}),
      },
      kavenegar: {
        ...this.data.settings.kavenegar,
        ...(partial.kavenegar || {}),
      },
      aqayepardakht: {
        ...this.data.settings.aqayepardakht,
        ...(partial.aqayepardakht || {}),
      },
      admin: {
        ...this.data.settings.admin,
        ...(partial.admin || {}),
      },
    };
    this.save();
    return this.data.settings;
  }

  public getProducts(): Product[] {
    return this.data.products;
  }

  public addProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  public deleteProduct(id: string): boolean {
    const cleanId = decodeURIComponent(String(id)).trim();
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(
      (p) => String(p.id).trim() !== cleanId && decodeURIComponent(String(p.id)).trim() !== cleanId
    );
    if (this.data.products.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getOrders(): StoredOrder[] {
    return this.data.orders;
  }

  public getOrder(orderId: string): StoredOrder | undefined {
    return this.data.orders.find((o) => o.orderId === orderId);
  }

  public getOrderByTransId(transid: string): StoredOrder | undefined {
    return this.data.orders.find((o) => o.transid === transid);
  }

  public saveOrder(order: StoredOrder) {
    const index = this.data.orders.findIndex((o) => o.orderId === order.orderId);
    if (index >= 0) {
      this.data.orders[index] = order;
    } else {
      this.data.orders.unshift(order);
    }
    this.save();
    return order;
  }

  public getUser(phone: string): StoredUser | undefined {
    return this.data.users[phone];
  }

  public saveUser(phone: string, fullName?: string): StoredUser {
    const user: StoredUser = {
      phone,
      fullName: fullName || this.data.users[phone]?.fullName || '',
      createdAt: this.data.users[phone]?.createdAt || new Date().toISOString(),
    };
    this.data.users[phone] = user;
    this.save();
    return user;
  }
}

export const db = new DBManager();
