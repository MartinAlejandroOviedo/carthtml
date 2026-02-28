export function renderProducts(products, onAddToCart) {
  const grid = document.getElementById('products-grid');

  if (!products.length) {
    grid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-center text-slate-300">
        No hay productos para ese filtro.
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map(
      (product, index) => {
        const firstImage = Array.isArray(product.images) && product.images[0] ? product.images[0] : null;
        const cardImage =
          product.imageCardUrl ||
          (firstImage && (firstImage.cardUrl || firstImage.url)) ||
          product.imageUrl;
        const cardImageAlt = (firstImage && firstImage.alt) || product.name;
        const focalX = Number.isFinite(Number(firstImage?.focalX)) ? Number(firstImage.focalX) : 50;
        const focalY = Number.isFinite(Number(firstImage?.focalY)) ? Number(firstImage.focalY) : 50;

        return `
      <article class="product-card overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 shadow-xl shadow-slate-950/40" style="animation-delay:${index * 40}ms">
        <a href="/product.html?id=${product.id}" class="relative block">
          ${product.onSale ? '<span class="absolute left-3 top-3 z-10 rounded-full border border-emerald-300/40 bg-emerald-500/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">Oferta</span>' : ''}
          <img src="${cardImage}" alt="${cardImageAlt}" class="h-48 w-full object-cover" style="object-position:${focalX}% ${focalY}%;" loading="lazy" />
        </a>
        <div class="space-y-2 p-4">
          <p class="text-xs uppercase tracking-wide text-sky-300/85">${product.category}</p>
          <a href="/product.html?id=${product.id}" class="block">
            <h3 class="font-display text-2xl uppercase leading-tight text-white">${product.name}</h3>
          </a>
          <p class="min-h-10 text-sm text-slate-300">${product.description}</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-2xl font-extrabold text-sky-300">${formatArs(product.priceArs)}</span>
            <div class="flex items-center gap-2">
              <a
                href="/product.html?id=${product.id}"
                class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-slate-100 transition hover:border-sky-300/40 hover:text-white has-tooltip"
                aria-label="Ver detalle"
                data-tooltip="Ver detalle"
              >
                <span class="lucide" data-lucide="eye"></span>
              </a>
              <button
                data-product-id="${product.id}"
                class="add-to-cart inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/30 bg-sky-500/25 text-sky-50 transition hover:bg-sky-500/35 has-tooltip"
                aria-label="Agregar al carrito"
                data-tooltip="Agregar al carrito"
              >
                <span class="lucide" data-lucide="shopping-cart"></span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
      }
    )
    .join('');

  grid.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.productId);
      onAddToCart(productId);
    });
  });

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

export function formatArs(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}
