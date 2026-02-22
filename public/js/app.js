import { fetchProducts, submitOrder } from './api.js';
import { CartStore } from './cart.js';
import { injectLayout } from './layout.js';
import { renderProducts } from './products.js';
import { renderCart, setupCartPanel, showCheckoutMessage } from './ui.js';

const cartStore = new CartStore();
const productsById = new Map();
let allProducts = [];
let activeCategory = 'Todos';
let searchTerm = '';
let sortOrder = 'relevance';

let checkoutForm;
let whatsappLink;
let searchInput;
let categorySelect;
let filtersToggle;
let filtersPanel;
let filtersClose;
let filtersBackdrop;
let sortSelect;

function refreshCart() {
  renderCart({
    cartItems: cartStore.getItems(),
    productsById,
    onRemove: (itemId) => {
      cartStore.remove(itemId);
      refreshCart();
    },
    onQtyChange: (itemId, qty) => {
      cartStore.updateQuantity(itemId, qty);
      refreshCart();
    }
  });
}

function productCategories(product) {
  return product.categories && product.categories.length ? product.categories : [product.category];
}

function renderCategoryOptions(products) {
  const categories = ['Todos', ...new Set(products.flatMap((product) => productCategories(product)))];
  if (!categorySelect) return;
  categorySelect.innerHTML = categories.map((cat) => `<option value="${cat}">${cat}</option>`).join('');
  categorySelect.value = activeCategory;
}

function renderCurrentProducts() {
  const filtered = allProducts.filter((product) => {
    const byCategory =
      activeCategory === 'Todos' ||
      productCategories(product).includes(activeCategory) ||
      product.category === activeCategory;
    const bySearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    return byCategory && bySearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.priceArs - b.priceArs;
    if (sortOrder === 'price-desc') return b.priceArs - a.priceArs;
    if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOrder === 'relevance') return 0;
    return 0;
  });

  renderProducts(sorted, (productId) => {
    cartStore.add(productId);
    refreshCart();
  });
}

async function handleCheckout(event) {
  event.preventDefault();
  showCheckoutMessage('');
  whatsappLink.classList.add('hidden');

  const cartItems = cartStore.getItems();
  if (!cartItems.length) {
    showCheckoutMessage('Agregá al menos un producto al carrito.', true);
    return;
  }

  const formData = new FormData(checkoutForm);

  const payload = {
    customer: {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      notes: String(formData.get('notes') || '').trim()
    },
    items: cartItems
  };

  if (!payload.customer.name || !payload.customer.phone) {
    showCheckoutMessage('Completá nombre y teléfono para continuar.', true);
    return;
  }

  try {
    const result = await submitOrder(payload);
    showCheckoutMessage(`Pedido #${result.orderId} creado. Total: ${result.totalFormatted}.`);

    whatsappLink.href = result.whatsappUrl;
    whatsappLink.classList.remove('hidden');

    cartStore.clear();
    checkoutForm.reset();
    refreshCart();
  } catch (error) {
    showCheckoutMessage(error.message, true);
  }
}

async function bootstrap() {
  await injectLayout();

  checkoutForm = document.getElementById('checkout-form');
  whatsappLink = document.getElementById('whatsapp-link');
  searchInput = document.getElementById('search-products');
  categorySelect = document.getElementById('category-select');
  filtersToggle = document.getElementById('filters-toggle');
  filtersPanel = document.getElementById('filters-panel');
  filtersClose = document.getElementById('close-filters');
  filtersBackdrop = document.getElementById('filters-backdrop');
  sortSelect = document.getElementById('sort-products');

  setupCartPanel();
  if (filtersPanel && filtersToggle && filtersClose && filtersBackdrop) {
    const openFilters = () => {
      filtersPanel.classList.remove('-translate-x-full');
      filtersBackdrop.classList.remove('hidden');
    };
    const closeFilters = () => {
      filtersPanel.classList.add('-translate-x-full');
      filtersBackdrop.classList.add('hidden');
    };
    filtersToggle.addEventListener('click', openFilters);
    filtersClose.addEventListener('click', closeFilters);
    filtersBackdrop.addEventListener('click', closeFilters);
  }
  checkoutForm.addEventListener('submit', handleCheckout);
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      renderCurrentProducts();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortOrder = sortSelect.value;
      renderCurrentProducts();
    });
  }
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      activeCategory = categorySelect.value;
      renderCurrentProducts();
    });
  }

  try {
    const products = await fetchProducts();
    products.forEach((product) => productsById.set(product.id, product));

    allProducts = products;
    renderCategoryOptions(products);
    renderCurrentProducts();
    refreshCart();
  } catch (error) {
    showCheckoutMessage('No se pudieron cargar los productos.', true);
  }
}

bootstrap();
