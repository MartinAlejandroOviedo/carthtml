import { formatArs } from './products.js';

const SHIPPING_FLAT = 9500;

export function setupCartPanel() {
  const panel = document.getElementById('cart-panel');
  const backdrop = document.getElementById('backdrop');
  const openBtn = document.getElementById('cart-toggle');
  const closeBtn = document.getElementById('close-cart');

  const open = () => {
    panel.classList.remove('translate-x-full');
    backdrop.classList.remove('hidden');
  };

  const close = () => {
    panel.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  return { open, close };
}

function variantText(item) {
  const details = [];
  if (item.color) details.push(`Color: ${item.color}`);
  if (item.size) details.push(`Talle: ${item.size}`);
  if (item.detail) details.push(`Detalle: ${item.detail}`);
  return details.join(' • ');
}

export function renderCart({ cartItems, productsById, onRemove, onQtyChange }) {
  const container = document.getElementById('cart-items');
  const countEl = document.getElementById('cart-count');
  const totalEl = document.getElementById('cart-total');
  const shippingEl = document.getElementById('shipping-cost');
  const orderTotalEl = document.getElementById('order-total');

  if (!cartItems.length) {
    container.innerHTML = '<p class="text-sm text-slate-400">Tu carrito esta vacio.</p>';
    countEl.textContent = '0';
    totalEl.textContent = formatArs(0);
    if (shippingEl) shippingEl.textContent = formatArs(0);
    if (orderTotalEl) orderTotalEl.textContent = formatArs(0);
    return { total: 0 };
  }

  let total = 0;

  container.innerHTML = cartItems
    .map((item) => {
      const product = productsById.get(item.productId);
      if (!product) return '';
      const subtotal = product.priceArs * item.quantity;
      total += subtotal;
      const variant = variantText(item);

      return `
        <div class="rounded-xl border border-white/10 bg-slate-800/50 p-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-white">${product.name}</p>
              <p class="text-sm text-slate-400">${formatArs(product.priceArs)} c/u</p>
              ${variant ? `<p class="mt-1 text-xs text-slate-300">${variant}</p>` : ''}
            </div>
            <button data-remove-id="${item.id}" class="text-xs text-rose-300 hover:text-rose-200">Quitar</button>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button data-qty-step="-1" data-qty-id="${item.id}" class="h-8 w-8 rounded-lg border border-white/20 text-white">-</button>
              <span class="w-7 text-center text-sm font-semibold text-white">${item.quantity}</span>
              <button data-qty-step="1" data-qty-id="${item.id}" class="h-8 w-8 rounded-lg border border-white/20 text-white">+</button>
            </div>
            <p class="font-bold text-sky-300">${formatArs(subtotal)}</p>
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('[data-remove-id]').forEach((button) => {
    button.addEventListener('click', () => onRemove(button.dataset.removeId));
  });

  container.querySelectorAll('[data-qty-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.dataset.qtyId;
      const step = Number(button.dataset.qtyStep);
      const current = cartItems.find((entry) => entry.id === itemId);
      const currentQty = current ? current.quantity : 0;
      onQtyChange(itemId, currentQty + step);
    });
  });

  countEl.textContent = String(cartItems.reduce((sum, item) => sum + item.quantity, 0));
  totalEl.textContent = formatArs(total);
  if (shippingEl) shippingEl.textContent = formatArs(SHIPPING_FLAT);
  if (orderTotalEl) orderTotalEl.textContent = formatArs(total + SHIPPING_FLAT);

  return { total };
}

export function showCheckoutMessage(message, isError = false) {
  const messageEl = document.getElementById('checkout-message');
  messageEl.textContent = message;
  messageEl.className = `text-sm ${isError ? 'text-rose-300' : 'text-emerald-300'}`;
}
