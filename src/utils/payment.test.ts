import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toPersianDigits,
  formatToman,
  calculateOrderPricing,
  generateOrderId,
} from './payment';

test('toPersianDigits converts English numbers to Persian glyphs', () => {
  assert.equal(toPersianDigits('12345'), '۱۲۳۴۵');
  assert.equal(toPersianDigits('0912'), '۰۹۱۲');
  assert.equal(toPersianDigits('1,000'), '۱,۰۰۰');
});

test('formatToman formats numbers with Persian digits and Toman suffix', () => {
  assert.equal(formatToman(1450000), '۱,۴۵۰,۰۰۰ تومان');
  assert.equal(formatToman(0), '۰ تومان');
  assert.equal(formatToman(2980500), '۲,۹۸۰,۵۰۰ تومان');
});

test('calculateOrderPricing calculates subtotal and total cleanly', () => {
  const items = [
    { product: { priceToman: 650000 }, quantity: 2 },
    { product: { priceToman: 980000 }, quantity: 1 },
  ];

  const result = calculateOrderPricing(items);
  assert.equal(result.subtotal, 2280000);
  assert.equal(result.total, 2280000);
  assert.equal(result.itemCount, 3);
});

test('generateOrderId generates valid SAMSTYLE order codes', () => {
  const id = generateOrderId();
  assert.match(id, /^SAM-\d{5}$/);
});
