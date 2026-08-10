/**
 * WHY THIS EXISTS AS A SHARED HELPER:
 * Pydantic serializes Decimal fields (base_price, discount_percentage) as
 * strings in JSON — this avoids floating-point rounding surprises on the
 * wire (0.1 + 0.2 problems), but means the frontend has to parse them
 * back into numbers before doing math. Every place that shows a price
 * (product card, PDP, cart, checkout in later phases) needs the same
 * "base price minus discount" calculation — centralizing it here means
 * that logic only has one place to be correct in.
 */
export function calculateDiscountedPrice(basePrice: string, discountPercentage: string): number {
  const base = parseFloat(basePrice);
  const discount = parseFloat(discountPercentage);
  return base - (base * discount) / 100;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
