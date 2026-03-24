import { fetchProducts, submitOrder } from './api.js';
import { CartStore } from './cart.js';
import { injectLayout } from './layout.js?v=20260320b';
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

function setupHomeHeroCarousel() {
  const carousel = document.getElementById('home-hero-carousel');
  if (!carousel) return;

  const slidesTrack = document.getElementById('home-hero-track');
  const dotsRoot = document.getElementById('home-hero-dots');
  if (!slidesTrack || !dotsRoot) return;

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  let slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  let dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  const prevBtn = document.getElementById('home-hero-prev');
  const nextBtn = document.getElementById('home-hero-next');
  if (!slides.length) return;

  let activeIndex = 0;
  let autoRotateId = null;
  let touchStartX = null;
  let touchStartY = null;
  let touchStartTime = 0;
  const canAutoRotate = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && slides.length > 1;

  const render = (index) => {
    if (!slides.length) return;
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('opacity-0', !isActive);
      slide.classList.toggle('pointer-events-none', !isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('bg-white', isActive);
      dot.classList.toggle('bg-white/45', !isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    const hasMany = slides.length > 1;
    dotsRoot.classList.toggle('hidden', !hasMany);
    prevBtn?.classList.toggle('hidden', !hasMany);
    nextBtn?.classList.toggle('hidden', !hasMany);
  };

  const stopAutoRotate = () => {
    if (autoRotateId) {
      window.clearInterval(autoRotateId);
      autoRotateId = null;
    }
  };

  const startAutoRotate = () => {
    if (!canAutoRotate()) return;
    stopAutoRotate();
    autoRotateId = window.setInterval(() => {
      render(activeIndex + 1);
    }, 5000);
  };

  const bindDots = () => {
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIndex = Number(dot.dataset.heroDot);
        if (!Number.isFinite(targetIndex)) return;
        render(targetIndex);
        startAutoRotate();
      });
    });
  };

  const fallbackCopy = [
    {
      title: 'Equipate para tu proximo partido',
      description: 'Elegi productos, armamos tu pedido y lo enviamos directo por WhatsApp con detalle completo.'
    },
    {
      title: 'Nuevos ingresos toda la semana',
      description: 'Remeras, shorts y accesorios listos para salir a la cancha.'
    },
    {
      title: 'Promos y envios a todo el pais',
      description: 'Compra rapido y recibi con Correo Argentino en tu ciudad.'
    }
  ];

  const applyRemoteSlides = (slideRows) => {
    if (!Array.isArray(slideRows) || !slideRows.length) return;
    const nextSlides = slideRows
      .filter((slide) => String(slide?.url || '').trim())
      .sort((a, b) => Number(a?.sortOrder || 0) - Number(b?.sortOrder || 0) || Number(a?.id || 0) - Number(b?.id || 0));
    if (!nextSlides.length) return;

    stopAutoRotate();
    activeIndex = 0;

    slidesTrack.innerHTML = nextSlides
      .map((slide, idx) => {
        const copy = fallbackCopy[idx % fallbackCopy.length] || fallbackCopy[0];
        const title = String(slide?.title || '').trim() || copy.title;
        const description = String(slide?.description || '').trim() || copy.description;
        const altText = String(slide?.altText || '').trim() || title;
        const focalX = Number.isFinite(Number(slide?.focalX)) ? Math.max(0, Math.min(100, Number(slide.focalX))) : 50;
        const focalY = Number.isFinite(Number(slide?.focalY)) ? Math.max(0, Math.min(100, Number(slide.focalY))) : 50;

        return `
          <article class="absolute inset-0 ${idx === 0 ? '' : 'opacity-0 pointer-events-none'} transition-opacity duration-500 ease-out" data-hero-slide aria-hidden="${idx === 0 ? 'false' : 'true'}">
            <img src="${escapeHtml(slide.url)}" alt="${escapeHtml(altText)}" class="h-full w-full object-cover" style="object-position:${focalX}% ${focalY}%;" />
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
              <p class="font-display text-3xl uppercase leading-none text-white sm:text-5xl">${escapeHtml(title)}</p>
              <p class="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">${escapeHtml(description)}</p>
            </div>
          </article>
        `;
      })
      .join('');

    dotsRoot.innerHTML = nextSlides
      .map(
        (_slide, idx) =>
          `<button type="button" class="h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/45'}" data-hero-dot="${idx}" aria-label="Ir al slide ${
            idx + 1
          }" ${idx === 0 ? 'aria-current="true"' : ''}></button>`
      )
      .join('');

    slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    bindDots();
    render(0);
    startAutoRotate();
  };

  prevBtn?.addEventListener('click', () => {
    render(activeIndex - 1);
    startAutoRotate();
  });

  nextBtn?.addEventListener('click', () => {
    render(activeIndex + 1);
    startAutoRotate();
  });

  bindDots();

  carousel.addEventListener('mouseenter', stopAutoRotate);
  carousel.addEventListener('mouseleave', startAutoRotate);
  carousel.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      stopAutoRotate();
    },
    { passive: true }
  );
  carousel.addEventListener(
    'touchend',
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch || touchStartX === null || touchStartY === null) {
        startAutoRotate();
        return;
      }

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const elapsedMs = Date.now() - touchStartTime;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const isHorizontalSwipe = slides.length > 1 && absX >= 40 && absX > absY;
      const isQuickEnough = elapsedMs <= 900;

      if (isHorizontalSwipe && isQuickEnough) {
        if (deltaX < 0) {
          render(activeIndex + 1);
        } else {
          render(activeIndex - 1);
        }
      }

      touchStartX = null;
      touchStartY = null;
      startAutoRotate();
    },
    { passive: true }
  );
  carousel.addEventListener('touchcancel', () => {
    touchStartX = null;
    touchStartY = null;
    startAutoRotate();
  });
  carousel.addEventListener('focusin', stopAutoRotate);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoRotate();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoRotate();
      return;
    }
    startAutoRotate();
  });

  render(0);
  startAutoRotate();

  fetch('/api/hero-slides')
    .then((response) => (response.ok ? response.json() : []))
    .then((rows) => {
      applyRemoteSlides(rows);
    })
    .catch(() => {
      // fallback: keep static slides if API fails
    });
}

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
      province: String(formData.get('province') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      postalCode: String(formData.get('postalCode') || '').trim(),
      deliveryType: String(formData.get('deliveryType') || 'home').trim(),
      deliveryBranch: String(formData.get('deliveryBranch') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      notes: String(formData.get('notes') || '').trim(),
      website: String(formData.get('website') || '').trim()
    },
    items: cartItems
  };

  if (!payload.customer.name || !payload.customer.phone || !payload.customer.province || !payload.customer.city || !payload.customer.postalCode) {
    showCheckoutMessage('Completá nombre, telefono, provincia, ciudad y codigo postal para continuar.', true);
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
  const productsPromise = fetchProducts();
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
  setupHomeHeroCarousel();
  setupDeliveryFields(checkoutForm);
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
    const products = await productsPromise;
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
