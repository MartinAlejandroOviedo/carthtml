const STORAGE_KEY = 'sport-cart-items';

function normalizeText(value) {
  return String(value || '').trim();
}

function buildItemId(productId, color = '', size = '', detail = '') {
  return `${productId}::${color.toLowerCase()}::${size.toLowerCase()}::${detail.toLowerCase()}`;
}

export class CartStore {
  constructor() {
    this.items = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map((item) => {
          const productId = Number(item.productId);
          const quantity = Number(item.quantity);
          const color = normalizeText(item.color);
          const size = normalizeText(item.size);
          const detail = normalizeText(item.detail || item.detailText);

          if (!Number.isInteger(productId) || productId <= 0) return null;
          if (!Number.isInteger(quantity) || quantity <= 0) return null;

          return {
            id: buildItemId(productId, color, size, detail),
            productId,
            quantity,
            color,
            size,
            detail
          };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  add(productId) {
    this.addVariant({ productId, quantity: 1 });
  }

  addVariant({ productId, quantity = 1, color = '', size = '', detail = '' }) {
    const normalizedProductId = Number(productId);
    const normalizedQuantity = Number(quantity);
    const normalizedColor = normalizeText(color);
    const normalizedSize = normalizeText(size);
    const normalizedDetail = normalizeText(detail);

    if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) return;
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) return;

    const itemId = buildItemId(normalizedProductId, normalizedColor, normalizedSize, normalizedDetail);
    const existing = this.items.find((item) => item.id === itemId);

    if (existing) {
      existing.quantity += normalizedQuantity;
    } else {
      this.items.push({
        id: itemId,
        productId: normalizedProductId,
        quantity: normalizedQuantity,
        color: normalizedColor,
        size: normalizedSize,
        detail: normalizedDetail
      });
    }

    this.persist();
  }

  remove(itemId) {
    this.items = this.items.filter((item) => item.id !== itemId);
    this.persist();
  }

  updateQuantity(itemId, quantity) {
    const item = this.items.find((entry) => entry.id === itemId);
    if (!item) return;

    if (quantity <= 0) {
      this.remove(itemId);
      return;
    }

    item.quantity = quantity;
    this.persist();
  }

  clear() {
    this.items = [];
    this.persist();
  }

  getItems() {
    return this.items.map((item) => ({ ...item }));
  }
}
