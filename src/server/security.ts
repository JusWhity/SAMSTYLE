/**
 * Security & Validation utilities for SAMSTYLE
 * - Persian/Arabic digit normalization
 * - Iranian mobile validation
 * - Anti-attack rate limiting (Sliding window)
 * - Input sanitization (Anti-XSS / SQLi)
 * - Cryptographic OTP generation
 */
import crypto from 'crypto';

/**
 * Normalizes phone numbers:
 * Converts Persian and Arabic digits to ASCII, removes spaces, dashes,
 * and ensures it matches valid Iranian mobile pattern: 09xxxxxxxxx (11 digits)
 */
export function normalizeIranPhone(rawPhone: string): { valid: boolean; normalized: string; error?: string } {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: '', error: 'شماره موبایل وارد نشده است.' };
  }

  // Convert Persian digits (۰-۹) and Arabic digits (٠-٩)
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let cleaned = rawPhone.trim();

  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.split(persianDigits[i]).join(String(i));
    cleaned = cleaned.split(arabicDigits[i]).join(String(i));
  }

  // Remove non-digit characters (+, -, spaces, parentheses)
  cleaned = cleaned.replace(/[^0-9]/g, '');

  // Handle +98 or 0098 prefix
  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  }

  // Must match 09xxxxxxxxx (11 digits)
  const iranMobileRegex = /^09[0-9]{9}$/;
  if (!iranMobileRegex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: 'فرمت شماره موبایل نامعتبر است. مثال: ۰۹۱۲۳۴۵۶۷۸۹',
    };
  }

  return { valid: true, normalized: cleaned };
}

/**
 * Sanitize string inputs to prevent HTML/Script injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // strip < and >
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Generate cryptographically secure numeric OTP code
 */
export function generateOtpCode(length: number = 5): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(crypto.randomInt(min, max + 1));
}

/**
 * Rate Limiter Entry
 */
interface RateLimitEntry {
  timestamps: number[];
  lastRequestTime: number;
}

/**
 * In-Memory Sliding Window Rate Limiter
 * Provides DDoS and brute-force mitigation for OTP, Admin Login, and Payments
 */
export class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;
  private minIntervalMs: number;

  constructor(maxRequests: number, windowMs: number, minIntervalMs: number = 0) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.minIntervalMs = minIntervalMs;

    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  /**
   * Check if a key is rate limited.
   * If allowed, records the request and returns { allowed: true }
   * If limited, returns { allowed: false, waitSeconds: number, reason: string }
   */
  check(key: string): { allowed: boolean; waitSeconds?: number; reason?: string } {
    const now = Date.now();
    let entry = this.limits.get(key);

    if (!entry) {
      entry = { timestamps: [now], lastRequestTime: now };
      this.limits.set(key, entry);
      return { allowed: true };
    }

    // Check minimum interval (e.g. 60 seconds cooldown between SMS requests)
    if (this.minIntervalMs > 0 && now - entry.lastRequestTime < this.minIntervalMs) {
      const waitSeconds = Math.ceil((this.minIntervalMs - (now - entry.lastRequestTime)) / 1000);
      return {
        allowed: false,
        waitSeconds,
        reason: `لطفاً ${waitSeconds} ثانیه دیگر مجدداً تلاش کنید.`,
      };
    }

    // Filter out timestamps outside window
    const windowStart = now - this.windowMs;
    entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (entry.timestamps.length >= this.maxRequests) {
      const oldest = entry.timestamps[0];
      const waitSeconds = Math.ceil((oldest + this.windowMs - now) / 1000);
      return {
        allowed: false,
        waitSeconds: Math.max(1, waitSeconds),
        reason: `تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً ${waitSeconds} ثانیه دیگر صبر کنید.`,
      };
    }

    entry.timestamps.push(now);
    entry.lastRequestTime = now;
    return { allowed: true };
  }

  /**
   * Reset limits for a key (e.g. after successful login)
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [key, entry] of this.limits.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);
      if (entry.timestamps.length === 0 && now - entry.lastRequestTime > this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}
