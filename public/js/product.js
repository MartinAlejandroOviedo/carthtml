import { fetchProductById } from './api.js';
import { CartStore } from './cart.js';
import { injectLayout } from './layout.js';
import { formatArs } from './products.js';

const stateEl = document.getElementById('product-state');
const cartStore = new CartStore();

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id'));
}

function renderError(message) {
  stateEl.innerHTML = `
    <div class="space-y-3">
      <p class="text-rose-300">${message}</p>
      <a href="/" class="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-100 hover:border-sky-300/40">
        Volver al inicio
      </a>
    </div>
  `;
}

function defaultColorsFor(product) {
  if (product.category === 'Calzado') return ['Negro', 'Blanco'];
  if (product.category === 'Textil') return ['Negro', 'Azul', 'Blanco'];
  return ['Unico'];
}

function defaultSizesFor(product) {
  if (product.category === 'Calzado') return ['39', '40', '41', '42', '43'];
  if (product.category === 'Textil') return ['S', 'M', 'L', 'XL'];
  return ['Unico'];
}

function buildShareData(product) {
  const shareUrl = window.location.href;
  const title = `${product.name} | SLStore`;
  const text = `Mira este producto en SLStore: ${product.name} (${formatArs(product.priceArs)})`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);

  return {
    title,
    text,
    shareUrl,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  };
}

function renderProduct(product) {
  const colors = product.colors?.length ? product.colors : defaultColorsFor(product);
  const sizes = product.sizes?.length ? product.sizes : defaultSizesFor(product);
  const detailText = product.detailText || product.description;
  const share = buildShareData(product);
  const images = product.images?.length ? product.images : [{ url: product.imageUrl, alt: product.name }];
  const hasSlider = images.length > 1;

  stateEl.innerHTML = `
    <article class="grid gap-4 md:grid-cols-2">
      <div class="space-y-3">
        <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50">
          <img id="product-main-image" src="${images[0].url}" alt="${images[0].alt || product.name}" class="h-full max-h-[420px] w-full object-cover" />
          ${
            hasSlider
              ? `
            <button
              id="slider-prev"
              type="button"
              class="slider-nav slider-prev inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-slate-900/75 text-white transition hover:bg-slate-800/80 has-tooltip"
              aria-label="Imagen anterior"
              data-tooltip="Anterior"
            >
              <span class="lucide h-4 w-4" data-lucide="chevron-left"></span>
            </button>
            <button
              id="slider-next"
              type="button"
              class="slider-nav slider-next inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-slate-900/75 text-white transition hover:bg-slate-800/80 has-tooltip"
              aria-label="Siguiente imagen"
              data-tooltip="Siguiente"
            >
              <span class="lucide h-4 w-4" data-lucide="chevron-right"></span>
            </button>
            <span id="slider-counter" class="absolute bottom-3 right-3 rounded-full border border-white/20 bg-slate-900/75 px-2 py-1 text-xs text-slate-100">
              1 / ${images.length}
            </span>
          `
              : ''
          }
        </div>
        ${
          hasSlider
            ? `
          <div id="product-thumbs" class="grid grid-cols-5 gap-2 sm:grid-cols-6">
            ${images
              .map(
                (img, index) => `
              <button
                type="button"
                data-thumb-index="${index}"
                class="product-thumb overflow-hidden rounded-lg border border-white/15 bg-slate-900/50 ${index === 0 ? 'ring-2 ring-sky-400' : ''}"
                aria-label="Ver imagen ${index + 1}"
              >
                <img src="${img.url}" alt="${img.alt || product.name}" class="h-16 w-full object-cover" />
              </button>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
      <div class="space-y-4">
        <p class="text-xs uppercase tracking-widest text-sky-300">${product.category}</p>
        <h1 class="font-display text-4xl uppercase leading-none text-white">${product.name}</h1>

        <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4 space-y-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-400">Precio</p>
            <p id="unit-price" class="text-3xl font-bold text-sky-300">${formatArs(product.priceArs)}</p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="text-sm text-slate-200">
              Color
              <select id="product-color" class="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm">
                ${colors.map((color) => `<option value="${color}">${color}</option>`).join('')}
              </select>
            </label>
            <label class="text-sm text-slate-200">
              Talle
              <select id="product-size" class="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm">
                ${sizes.map((size) => `<option value="${size}">${size}</option>`).join('')}
              </select>
            </label>
          </div>

          <label class="text-sm text-slate-200 block">
            Cantidad de productos
            <div class="mt-1 flex items-center gap-2">
              <button id="qty-minus" type="button" class="h-9 w-9 rounded-lg border border-white/20">-</button>
              <input id="product-qty" type="number" min="1" step="1" value="1" class="h-9 w-20 rounded-lg border border-white/15 bg-slate-900 px-2 text-center" />
              <button id="qty-plus" type="button" class="h-9 w-9 rounded-lg border border-white/20">+</button>
            </div>
          </label>

          <label class="text-sm text-slate-200 block">
            Texto de detalle
            <textarea id="product-detail" rows="3" placeholder="Ej: nombre para estampar, preferencia de envio, etc." class="mt-1 w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm">${detailText}</textarea>
          </label>

          <p id="line-total" class="text-sm text-slate-300">Subtotal: ${formatArs(product.priceArs)}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            id="add-to-cart"
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-500 has-tooltip"
            aria-label="Agregar al carrito"
            data-tooltip="Agregar al carrito"
          >
            <span class="lucide" data-lucide="shopping-cart"></span>
          </button>
          <a
            href="/"
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-sm text-slate-100 hover:border-sky-300/40 has-tooltip"
            aria-label="Seguir comprando"
            data-tooltip="Seguir comprando"
          >
            <span class="lucide" data-lucide="arrow-left-circle"></span>
          </a>
        </div>

        <div class="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
          <p class="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Compartir</p>
          <div class="flex flex-wrap gap-2">
            <a href="${share.whatsapp}" target="_blank" rel="noopener noreferrer" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500/15 text-emerald-200 transition hover:bg-emerald-500/30 has-tooltip" aria-label="Compartir por WhatsApp" data-tooltip="WhatsApp">
              <span class="lucide h-4 w-4" data-lucide="message-circle"></span>
            </a>
            <a href="${share.facebook}" target="_blank" rel="noopener noreferrer" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/30 bg-blue-500/15 text-blue-200 transition hover:bg-blue-500/30 has-tooltip" aria-label="Compartir en Facebook" data-tooltip="Facebook">
              <span class="lucide h-4 w-4" data-lucide="facebook"></span>
            </a>
            <a href="${share.x}" target="_blank" rel="noopener noreferrer" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/30 bg-slate-500/15 text-slate-100 transition hover:bg-slate-500/30 has-tooltip" aria-label="Compartir en X" data-tooltip="X">
              <span class="lucide h-4 w-4" data-lucide="twitter"></span>
            </a>
            <a href="${share.telegram}" target="_blank" rel="noopener noreferrer" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/15 text-cyan-200 transition hover:bg-cyan-500/30 has-tooltip" aria-label="Compartir en Telegram" data-tooltip="Telegram">
              <span class="lucide h-4 w-4" data-lucide="send"></span>
            </a>
            <button id="copy-share-link" type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-800/70 text-slate-200 transition hover:bg-slate-700/70 has-tooltip" aria-label="Copiar link" data-tooltip="Copiar link">
              <span class="lucide h-4 w-4" data-lucide="link-2"></span>
            </button>
            <button id="native-share" type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sky-300/30 bg-sky-500/20 text-sky-100 transition hover:bg-sky-500/35 has-tooltip" aria-label="Compartir" data-tooltip="Compartir">
              <span class="lucide h-4 w-4" data-lucide="share-2"></span>
            </button>
          </div>
        </div>

        <p id="add-message" class="text-sm text-emerald-300"></p>
      </div>
    </article>
  `;

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }

  const qtyInput = document.getElementById('product-qty');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const lineTotalEl = document.getElementById('line-total');
  const addBtn = document.getElementById('add-to-cart');
  const colorEl = document.getElementById('product-color');
  const sizeEl = document.getElementById('product-size');
  const detailEl = document.getElementById('product-detail');
  const msgEl = document.getElementById('add-message');
  const copyShareBtn = document.getElementById('copy-share-link');
  const nativeShareBtn = document.getElementById('native-share');
  const mainImageEl = document.getElementById('product-main-image');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const counterEl = document.getElementById('slider-counter');
  const thumbButtons = Array.from(document.querySelectorAll('[data-thumb-index]'));
  let imageIndex = 0;

  const setActiveImage = (nextIndex) => {
    if (!mainImageEl || !images.length) return;
    imageIndex = (nextIndex + images.length) % images.length;
    const image = images[imageIndex];
    mainImageEl.src = image.url;
    mainImageEl.alt = image.alt || product.name;
    if (counterEl) {
      counterEl.textContent = `${imageIndex + 1} / ${images.length}`;
    }

    thumbButtons.forEach((btn, idx) => {
      const active = idx === imageIndex;
      btn.classList.toggle('ring-2', active);
      btn.classList.toggle('ring-sky-400', active);
    });
  };

  const getQty = () => {
    const value = Number(qtyInput.value);
    return Number.isInteger(value) && value > 0 ? value : 1;
  };

  const syncSubtotal = () => {
    const subtotal = product.priceArs * getQty();
    lineTotalEl.textContent = `Subtotal: ${formatArs(subtotal)}`;
  };

  minusBtn.addEventListener('click', () => {
    const next = Math.max(1, getQty() - 1);
    qtyInput.value = String(next);
    syncSubtotal();
  });

  plusBtn.addEventListener('click', () => {
    const next = getQty() + 1;
    qtyInput.value = String(next);
    syncSubtotal();
  });

  qtyInput.addEventListener('input', syncSubtotal);
  if (prevBtn) prevBtn.addEventListener('click', () => setActiveImage(imageIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setActiveImage(imageIndex + 1));
  thumbButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.thumbIndex);
      if (!Number.isInteger(idx)) return;
      setActiveImage(idx);
    });
  });

  addBtn.addEventListener('click', () => {
    cartStore.addVariant({
      productId: product.id,
      quantity: getQty(),
      color: colorEl.value,
      size: sizeEl.value,
      detail: detailEl.value
    });

    msgEl.textContent = 'Producto agregado al carrito con sus variantes. Volve al catalogo para finalizar el pedido.';
  });

  if (copyShareBtn) {
    copyShareBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(share.shareUrl);
        msgEl.textContent = 'Link del producto copiado.';
      } catch {
        msgEl.textContent = 'No se pudo copiar el link.';
      }
    });
  }

  if (nativeShareBtn) {
    if (navigator.share) {
      nativeShareBtn.addEventListener('click', async () => {
        try {
          await navigator.share({ title: share.title, text: share.text, url: share.shareUrl });
        } catch {
          // Usuario canceló o fallo de share API.
        }
      });
    } else {
      nativeShareBtn.classList.add('hidden');
    }
  }
}

async function bootstrap() {
  await injectLayout();

  const productId = getProductIdFromUrl();
  if (!Number.isInteger(productId) || productId <= 0) {
    renderError('El link del producto no es valido.');
    return;
  }

  try {
    const product = await fetchProductById(productId);
    renderProduct(product);
  } catch (error) {
    renderError(error.message || 'No se pudo cargar el producto.');
  }
}

bootstrap();
