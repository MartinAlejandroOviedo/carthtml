import { fetchProducts, submitOrder } from './api.js';
import { CartStore } from './cart.js';
import { injectLayout } from './layout.js';
import { renderCart, showCheckoutMessage } from './ui.js';

const cartStore = new CartStore();
const productsById = new Map();
let checkoutForm;
let whatsappLink;

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

  checkoutForm.addEventListener('submit', handleCheckout);

  try {
    const products = await fetchProducts();
    products.forEach((product) => productsById.set(product.id, product));
    refreshCart();
  } catch (error) {
    showCheckoutMessage('No se pudieron cargar los productos.', true);
  }
}

bootstrap();
