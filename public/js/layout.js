const partsCache = new Map();
const CART_STORAGE_KEY = 'sport-cart-items';

async function loadPart(partName) {
  if (partsCache.has(partName)) {
    return partsCache.get(partName);
  }

  const response = await fetch(`/parts/${partName}.html`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar /parts/${partName}.html`);
  }

  const html = await response.text();
  partsCache.set(partName, html);
  return html;
}

export async function injectLayout() {
  const headerRoot = document.getElementById('site-header');
  const footerRoot = document.getElementById('site-footer');
  const filtersRoot = document.getElementById('filters-root');

  const tasks = [];

  if (headerRoot) {
    tasks.push(
      loadPart('header').then((html) => {
        headerRoot.innerHTML = html;
      })
    );
  }

  if (footerRoot) {
    tasks.push(
      loadPart('footer').then((html) => {
        footerRoot.innerHTML = html;
      })
    );
  }

  if (filtersRoot) {
    tasks.push(
      loadPart('filters-panel').then((html) => {
        filtersRoot.innerHTML = html;
      })
    );
  }

  await Promise.all(tasks);

  const cartToggle = document.getElementById('cart-toggle');
  const cartCount = document.getElementById('cart-count');
  const hasCartPanel = Boolean(document.getElementById('cart-panel'));

  if (cartCount) {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const qty = Array.isArray(items) ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0;
      cartCount.textContent = String(qty);
    } catch {
      cartCount.textContent = '0';
    }
  }

  if (cartToggle && !hasCartPanel) {
    cartToggle.addEventListener('click', () => {
      window.location.href = '/cart.html';
    });
  }

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}
