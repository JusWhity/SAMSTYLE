import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIranPhone, sanitizeInput, generateOtpCode, RateLimiter } from './security';

test('normalizeIranPhone converts Persian digits and standardizes 09 prefix', () => {
  const p1 = normalizeIranPhone('۰۹۱۲۳۴۵۶۷۸۹');
  assert.equal(p1.valid, true);
  assert.equal(p1.normalized, '09123456789');

  const p2 = normalizeIranPhone('+989123456789');
  assert.equal(p2.valid, true);
  assert.equal(p2.normalized, '09123456789');

  const p3 = normalizeIranPhone('00989351234567');
  assert.equal(p3.valid, true);
  assert.equal(p3.normalized, '09351234567');

  const p4 = normalizeIranPhone('0912-345-6789');
  assert.equal(p4.valid, true);
  assert.equal(p4.normalized, '09123456789');
});

test('normalizeIranPhone rejects invalid phones', () => {
  const p1 = normalizeIranPhone('123456');
  assert.equal(p1.valid, false);

  const p2 = normalizeIranPhone('08123456789');
  assert.equal(p2.valid, false);

  const p3 = normalizeIranPhone('');
  assert.equal(p3.valid, false);
});

test('sanitizeInput removes script tags and event handlers', () => {
  const input = '<script>alert("xss")</script>هودی مشکی <img src=x onerror=alert(1)>';
  const clean = sanitizeInput(input);
  assert.ok(!clean.includes('<'));
  assert.ok(!clean.includes('>'));
  assert.ok(!clean.includes('onerror'));
  assert.ok(clean.includes('هودی مشکی'));
});

test('generateOtpCode generates 5-digit numeric strings', () => {
  for (let i = 0; i < 10; i++) {
    const code = generateOtpCode(5);
    assert.equal(code.length, 5);
    assert.match(code, /^[0-9]{5}$/);
  }
});

test('RateLimiter enforces max requests and cooldowns', () => {
  // 3 requests allowed in 1000ms window, 50ms min interval
  const limiter = new RateLimiter(3, 1000, 50);

  const r1 = limiter.check('test-ip');
  assert.equal(r1.allowed, true);

  // Immediate 2nd request fails due to minInterval (50ms cooldown)
  const r2 = limiter.check('test-ip');
  assert.equal(r2.allowed, false);
  assert.ok(r2.reason?.includes('ثانیه'));
});
