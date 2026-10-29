/**
 * Convert standard digits to Persian digits
 */
export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

/**
 * Format amount in Toman with Persian digits (e.g. ۱,۴۵۰,۰۰۰ تومان)
 */
export function formatToman(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '۰ تومان';
  }
  const formattedEn = Math.round(amount).toLocaleString('en-US');
  return `${toPersianDigits(formattedEn)} تومان`;
}

/**
 * Generate a unique order ID for SAMSTYLE (e.g. SAM-84920)
 */
export function generateOrderId(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `SAM-${randomSuffix}`;
}

/**
 * Calculate cart total cleanly without complex fees or policies
 */
export function calculateOrderPricing(
  items: { product: { priceToman: number }; quantity: number }[]
): {
  subtotal: number;
  total: number;
  itemCount: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.product.priceToman * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    total: subtotal,
    itemCount,
  };
}
