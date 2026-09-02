/**
 * Shared "stock alert" thresholds and labels.
 *
 * Centralized here so a product card, the PDP, the wishlist, and the cart
 * all agree on what counts as "low stock" instead of each picking their
 * own number.
 */
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = "out" | "low" | "in";

export function getStockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

/**
 * A short label to show next to a price/button, or null when stock is
 * healthy enough that drawing attention to the number isn't useful.
 */
export function getStockLabel(quantity: number): string | null {
  const status = getStockStatus(quantity);
  if (status === "out") return "Out of stock";
  if (status === "low") return `Only ${quantity} left`;
  return null;
}
