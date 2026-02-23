import { fetchProducts, submitOrder } from './api.js';
import { CartStore } from './cart.js';
import { injectLayout } from './layout.js';
import { renderCart, showCheckoutMessage } from './ui.js';

const cartStore = new CartStore();
const productsById = new Map();
let checkoutForm;
let whatsappLink;

function openWhatsappCheckout(url) {
  if (!url) return;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    window.location.href = url;
  }
}

function setupDeliveryFields(form) {
  if (!form) return;
  const deliveryTypeInput = form.elements.namedItem('deliveryType');
  const addressInput = form.elements.namedItem('address');
  const branchInput = form.elements.namedItem('deliveryBranch');
  const addressWrap = document.getElementById('checkout-address-wrap');
  const branchWrap = document.getElementById('checkout-branch-wrap');
  if (!deliveryTypeInput || !addressInput || !branchInput) return;

  const refresh = () => {
    const type = String(deliveryTypeInput.value || 'home').toLowerCase();
    const isBranch = type === 'branch';
    if (addressWrap) addressWrap.classList.toggle('hidden', isBranch);
    if (branchWrap) branchWrap.classList.toggle('hidden', !isBranch);
    addressInput.required = !isBranch;
    branchInput.required = isBranch;
    if (isBranch) {
      addressInput.value = '';
    } else {
      branchInput.value = '';
    }
  };

  deliveryTypeInput.addEventListener('change', refresh);
  refresh();
}

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
      province: String(formData.get('province') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      deliveryType: String(formData.get('deliveryType') || 'home').trim(),
      deliveryBranch: String(formData.get('deliveryBranch') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      notes: String(formData.get('notes') || '').trim(),
      website: String(formData.get('website') || '').trim()
    },
    items: cartItems
  };

  if (!payload.customer.name || !payload.customer.phone || !payload.customer.province || !payload.customer.city) {
    showCheckoutMessage('Completá nombre, teléfono, provincia y ciudad para continuar.', true);
    return;
  }
  if (payload.customer.deliveryType === 'branch' && !payload.customer.deliveryBranch) {
    showCheckoutMessage('Indicá la sucursal de Correo Argentino para continuar.', true);
    return;
  }
  if (payload.customer.deliveryType !== 'branch' && !payload.customer.address) {
    showCheckoutMessage('Indicá la dirección para envío a domicilio.', true);
    return;
  }

  try {
    const result = await submitOrder(payload);
    const summary = [
      `Pedido #${result.orderId} creado.`,
      `Subtotal: ${result.itemsTotalFormatted || '-'}.`,
      `Envio: ${result.shippingFormatted || '-'}.`,
      `Total: ${result.totalFormatted}.`
    ].join(' ');
    showCheckoutMessage(summary);

    whatsappLink.href = result.whatsappUrl;
    whatsappLink.classList.remove('hidden');
    openWhatsappCheckout(result.whatsappUrl);

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
  setupDeliveryFields(checkoutForm);

  try {
    const products = await fetchProducts();
    products.forEach((product) => productsById.set(product.id, product));
    refreshCart();
  } catch (error) {
    showCheckoutMessage('No se pudieron cargar los productos.', true);
  }
}

bootstrap();
