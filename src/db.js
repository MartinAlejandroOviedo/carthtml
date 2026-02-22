const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'data', 'store.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);
const UPLOADS_ROOT = path.join(__dirname, '..', 'public', 'uploads');

const DEFAULT_CATEGORIES = [
  'Fútbol',
  'Entrenamiento',
  'Running',
  'Indumentaria',
  'Calzado',
  'Accesorios',
  'Bolsos y mochilas'
];

const HELP_PAGE_TITLE = 'Como pedir de forma rapida';
const DEFAULT_ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  fullName: 'Administrador SLStore',
  role: 'admin'
};
const HELP_PAGE_CONTENT_HTML = `
<section class="mx-auto max-w-6xl px-4 pt-8">
  <div class="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-slate-950/60">
    <p class="font-display text-4xl uppercase leading-none text-white sm:text-5xl">${HELP_PAGE_TITLE}</p>
    <p class="mt-3 max-w-3xl text-sm text-slate-300">
      Esta pagina no procesa compras. Te ayuda a preparar un pedido claro para acelerar la atencion entre cliente y vendedor.
      La confirmacion final se realiza por WhatsApp con el vendedor.
    </p>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 py-6">
  <div class="grid gap-4 md:grid-cols-2">
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">1. Filtra y elige</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Usa filtros por categoria y orden por precio para encontrar rapido.</li>
        <li>Entra al detalle del producto para revisar variantes.</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">2. Completa variantes</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Define color, talle y cantidad antes de agregar al carrito.</li>
        <li>Agrega notas utiles (estampado, referencia, preferencia de entrega).</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">3. Revisa el carrito</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Verifica productos, subtotales y costo fijo de envio.</li>
        <li>Corrige cantidades antes de continuar.</li>
      </ul>
    </article>
    <article class="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <p class="font-display text-2xl uppercase text-white">4. Cierra por WhatsApp</p>
      <ul class="mt-3 space-y-2 text-sm text-slate-300">
        <li>Completa nombre, telefono y direccion para generar el pedido.</li>
        <li>El vendedor valida stock, tiempos y confirma la compra por WhatsApp.</li>
      </ul>
    </article>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 pb-10">
  <div class="rounded-2xl border border-sky-300/25 bg-sky-500/10 p-4 text-sm text-sky-100">
    <p class="font-semibold">Importante:</p>
    <p class="mt-1">
      El sitio funciona como asistente de armado de pedido. La operacion comercial se confirma unicamente por WhatsApp con el vendedor.
    </p>
  </div>
</section>
`;

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      return resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      return resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      return resolve(row);
    });
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(value);
}

function normalizeText(value, maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

function slugify(value) {
  return normalizeText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priceArs: row.priceArs,
    description: row.description,
    imageUrl: row.imageUrl,
    colors: parseCsv(row.colorsCsv),
    sizes: parseCsv(row.sizesCsv),
    stockQty: Number(row.stockQty || 0),
    detailText: row.detailText || ''
  };
}

function resolveUploadAbsolutePath(fileUrl) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;
  const relative = raw.replace(/^\/uploads\//, '');
  const safeRelative = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(UPLOADS_ROOT, safeRelative);
  const uploadsRootResolved = path.resolve(UPLOADS_ROOT) + path.sep;
  const resolved = path.resolve(full);
  if (!resolved.startsWith(uploadsRootResolved)) return null;
  return resolved;
}

function buildVariantUrl(fileUrl, variant) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;
  const parsed = path.posix.parse(raw);
  if (!parsed.name) return null;
  return `${parsed.dir}/${parsed.name}-${variant}.webp`;
}

function resolveImageWithVariants(imageRow, fallbackAlt = '') {
  const normalizedUrl = normalizeText(imageRow?.url, 1000);
  if (!normalizedUrl) return null;

  const sliderCandidate = buildVariantUrl(normalizedUrl, 'slider');
  const cardCandidate = buildVariantUrl(normalizedUrl, 'card');
  const sliderPath = sliderCandidate ? resolveUploadAbsolutePath(sliderCandidate) : null;
  const cardPath = cardCandidate ? resolveUploadAbsolutePath(cardCandidate) : null;
  const sliderExists = Boolean(sliderPath && fs.existsSync(sliderPath));
  const cardExists = Boolean(cardPath && fs.existsSync(cardPath));

  return {
    url: normalizedUrl,
    alt: normalizeText(imageRow?.alt ?? imageRow?.altText ?? fallbackAlt, 160),
    sliderUrl: sliderExists ? sliderCandidate : normalizedUrl,
    cardUrl: cardExists ? cardCandidate : normalizedUrl
  };
}

function buildProductImages(mainUrl, imageRows, fallbackAlt) {
  const normalizedMain = normalizeText(mainUrl, 1000);
  const rows = Array.isArray(imageRows) ? [...imageRows] : [];

  if (!rows.length) {
    return normalizedMain ? [resolveImageWithVariants({ url: normalizedMain, alt: fallbackAlt || '' }, fallbackAlt)].filter(Boolean) : [];
  }

  const mainIndex = normalizedMain ? rows.findIndex((img) => img.url === normalizedMain) : -1;
  if (mainIndex > 0) {
    const [main] = rows.splice(mainIndex, 1);
    rows.unshift(main);
  } else if (mainIndex === -1 && normalizedMain) {
    rows.unshift({ url: normalizedMain, alt: fallbackAlt || '' });
  }

  return rows.map((img) => resolveImageWithVariants(img, fallbackAlt)).filter(Boolean);
}

function fallbackByCategory(category, description) {
  if (category === 'Calzado') {
    return {
      colors: 'Negro,Blanco,Rojo',
      sizes: '39,40,41,42,43,44',
      stockQty: 18,
      detailText: `Producto de calzado deportivo. ${description}`
    };
  }

  if (category === 'Textil') {
    return {
      colors: 'Negro,Blanco,Azul',
      sizes: 'S,M,L,XL',
      stockQty: 30,
      detailText: `Prenda deportiva con foco en comodidad y rendimiento. ${description}`
    };
  }

  return {
    colors: 'Negro,Blanco',
    sizes: 'Unico',
    stockQty: 20,
    detailText: `Accesorio deportivo para entrenamiento y partido. ${description}`
  };
}

async function addColumnIfMissing(tableName, columnName, definition) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function ensureSchemaMigrations() {
  await addColumnIfMissing('products', 'colors', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('products', 'sizes', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('products', 'stock_qty', 'INTEGER NOT NULL DEFAULT 0');
  await addColumnIfMissing('products', 'detail_text', "TEXT NOT NULL DEFAULT ''");

  await addColumnIfMissing('order_items', 'color', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('order_items', 'size', "TEXT NOT NULL DEFAULT ''");
  await addColumnIfMissing('order_items', 'detail_text', "TEXT NOT NULL DEFAULT ''");
}

async function seedProductsIfNeeded() {
  const row = await get('SELECT COUNT(*) as total FROM products');
  if (row.total > 0) return;

  const products = [
    [
      'Camiseta Titular Pro',
      'Textil',
      45999,
      'Remera técnica deportiva, respirable y liviana.',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'Negro,Blanco,Azul',
      'S,M,L,XL',
      42,
      'Camiseta oficial de entrenamiento con paneles de ventilación, costuras reforzadas y tejido de secado rápido para partidos intensos.'
    ],
    [
      'Botines Speed X',
      'Calzado',
      89999,
      'Botines con tapones firmes para cancha natural.',
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80',
      'Negro,Blanco,Rojo',
      '39,40,41,42,43,44',
      18,
      'Botines livianos con suela de tracción y estructura de estabilidad lateral. Ideal para cambios de ritmo y máxima aceleración.'
    ],
    [
      'Pelota Match Elite',
      'Accesorios',
      38999,
      'Pelota profesional con costura reforzada.',
      'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
      'Blanco,Blanco/Azul',
      'N5',
      35,
      'Pelota de competición con cámara de alta retención de aire y cubierta resistente para césped natural o sintético.'
    ],
    [
      'Short Training Dry',
      'Textil',
      29999,
      'Short flexible con secado rápido.',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'Negro,Gris,Azul Marino',
      'S,M,L,XL',
      27,
      'Short de entrenamiento con cintura elástica, tejido respirable y corte atlético para entrenar cómodo todos los días.'
    ],
    [
      'Guantes Goal Master',
      'Accesorios',
      51999,
      'Guantes de arquero con gran agarre.',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'Negro,Negro/Verde',
      '8,9,10,11',
      16,
      'Guantes con palma de látex de alto agarre, muñequera ajustable y refuerzo para amortiguar impactos en atajadas exigentes.'
    ],
    [
      'Mochila Team 30L',
      'Accesorios',
      34999,
      'Mochila deportiva con compartimentos y red lateral.',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      'Negro,Azul,Gris',
      '30L',
      22,
      'Mochila urbana/deportiva con bolsillo para botines, espacio para hidratación y correas acolchadas para uso diario.'
    ]
  ];

  for (const product of products) {
    await run(
      `INSERT INTO products (
        name, category, price_ars, description, image_url, colors, sizes, stock_qty, detail_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      product
    );
  }
}

async function backfillProductAttributesIfNeeded() {
  const rows = await all(
    `SELECT id, category, description, colors, sizes, stock_qty as stockQty, detail_text as detailText
     FROM products`
  );

  for (const row of rows) {
    const hasColors = Boolean(normalizeText(row.colors));
    const hasSizes = Boolean(normalizeText(row.sizes));
    const hasStock = Number(row.stockQty || 0) > 0;
    const hasDetail = Boolean(normalizeText(row.detailText, 500));

    if (hasColors && hasSizes && hasStock && hasDetail) continue;

    const fallback = fallbackByCategory(row.category, row.description);

    await run(
      `UPDATE products
       SET colors = ?, sizes = ?, stock_qty = ?, detail_text = ?
       WHERE id = ?`,
      [
        hasColors ? normalizeText(row.colors) : fallback.colors,
        hasSizes ? normalizeText(row.sizes) : fallback.sizes,
        hasStock ? Number(row.stockQty) : fallback.stockQty,
        hasDetail ? normalizeText(row.detailText, 500) : fallback.detailText,
        row.id
      ]
    );
  }
}

async function ensureCategoriesAndImagesFromProducts() {
  const products = await all('SELECT id, name, category, image_url FROM products');

  for (const product of products) {
    const categoryName = normalizeText(product.category, 80);
    const categorySlug = slugify(categoryName);

    const ensureCategory = async (name) => {
      const slug = slugify(name);
      const existing = await get('SELECT id FROM categories WHERE slug = ?', [slug]);
      if (existing) return existing.id;
      const inserted = await run('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
      return inserted.id;
    };

    const assignCategory = async (name) => {
      const catId = await ensureCategory(name);
      await run(
        `INSERT OR IGNORE INTO product_categories (product_id, category_id)
         VALUES (?, ?)`,
        [product.id, catId]
      );
    };

    const mappedCategories = [];
    if (product.category === 'Textil') mappedCategories.push('Indumentaria', 'Entrenamiento');
    if (product.category === 'Calzado') mappedCategories.push('Calzado', 'Fútbol');
    if (product.category === 'Accesorios') mappedCategories.push('Accesorios');

    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('pelota')) mappedCategories.push('Fútbol');
    if (nameLower.includes('botin') || nameLower.includes('botines')) mappedCategories.push('Fútbol');
    if (nameLower.includes('mochila')) mappedCategories.push('Bolsos y mochilas');
    if (nameLower.includes('training') || nameLower.includes('entrenamiento')) mappedCategories.push('Entrenamiento');
    if (nameLower.includes('running')) mappedCategories.push('Running');

    // always include original category as a fallback category
    mappedCategories.push(categoryName);

    for (const cat of new Set(mappedCategories)) {
      await assignCategory(cat);
    }

    const hasImage = await get('SELECT id FROM product_images WHERE product_id = ? LIMIT 1', [product.id]);
    if (!hasImage) {
      await run(
        `INSERT INTO product_images (product_id, url, alt_text, sort_order)
         VALUES (?, ?, ?, 0)`,
        [product.id, product.image_url, product.name]
      );
    }
  }
}

async function seedDefaultCategories() {
  for (const name of DEFAULT_CATEGORIES) {
    const slug = slugify(name);
    await run(
      `INSERT OR IGNORE INTO categories (name, slug)
       VALUES (?, ?)`,
      [name, slug]
    );
  }
}

async function seedPages() {
  await run(
    `INSERT INTO pages (slug, title, content_html)
     VALUES (?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       title = excluded.title,
       content_html = excluded.content_html,
       updated_at = datetime('now', 'localtime')`,
    ['help', HELP_PAGE_TITLE, HELP_PAGE_CONTENT_HTML]
  );
}

async function seedDefaultAdminUser() {
  await run(
    `INSERT OR IGNORE INTO users (username, password, full_name, role, is_active)
     VALUES (?, ?, ?, ?, 1)`,
    [DEFAULT_ADMIN_USER.username, DEFAULT_ADMIN_USER.password, DEFAULT_ADMIN_USER.fullName, DEFAULT_ADMIN_USER.role]
  );
}

function buildWhatsappMessage(order) {
  const lines = [
    '🛒 *Nuevo pedido*',
    `Pedido #${order.id}`,
    `Cliente: ${order.customer_name}`,
    `Teléfono: ${order.customer_phone}`,
    `Dirección: ${order.customer_address || 'Sin dirección'}`,
    '',
    '*Detalle:*'
  ];

  order.items.forEach((item) => {
    const attrs = [];
    if (item.color) attrs.push(`Color: ${item.color}`);
    if (item.size) attrs.push(`Talle: ${item.size}`);
    if (item.detail_text) attrs.push(`Detalle: ${item.detail_text}`);
    const attrsText = attrs.length ? ` (${attrs.join(', ')})` : '';

    lines.push(`- ${item.name}${attrsText} x${item.quantity} = ${formatCurrency(item.subtotal_ars)}`);
  });

  lines.push('');
  lines.push(`*Total: ${formatCurrency(order.total_ars)}*`);

  return lines.join('\n');
}

async function initDb() {
  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_ars INTEGER NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    colors TEXT NOT NULL DEFAULT '',
    sizes TEXT NOT NULL DEFAULT '',
    stock_qty INTEGER NOT NULL DEFAULT 0,
    detail_text TEXT NOT NULL DEFAULT ''
  )`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  )`);

  await run(`CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_html TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    notes TEXT,
    total_ars INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )`);

  await run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    unit_price_ars INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal_ars INTEGER NOT NULL,
    color TEXT NOT NULL DEFAULT '',
    size TEXT NOT NULL DEFAULT '',
    detail_text TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`);

  await ensureSchemaMigrations();
  await seedDefaultCategories();
  await seedPages();
  await seedDefaultAdminUser();
  await seedProductsIfNeeded();
  await backfillProductAttributesIfNeeded();
  await ensureCategoriesAndImagesFromProducts();
}

async function authenticateUser(username, password) {
  const normalizedUsername = normalizeText(username, 80).toLowerCase();
  const normalizedPassword = normalizeText(password, 120);
  if (!normalizedUsername || !normalizedPassword) return null;

  const user = await get(
    `SELECT id, username, full_name as fullName, role, is_active as isActive
     FROM users
     WHERE lower(username) = lower(?) AND password = ?`,
    [normalizedUsername, normalizedPassword]
  );

  if (!user || !Number(user.isActive)) return null;
  return user;
}

async function getPageBySlug(slug) {
  const normalizedSlug = normalizeText(slug, 80).toLowerCase();
  if (!normalizedSlug) return null;

  const row = await get(
    `SELECT slug, title, content_html as contentHtml, updated_at as updatedAt
     FROM pages
     WHERE slug = ?`,
    [normalizedSlug]
  );

  if (row) return row;

  // Fallback so `/api/pages/help` never fails even if seed wasn't run yet.
  if (normalizedSlug === 'help') {
    return {
      slug: 'help',
      title: HELP_PAGE_TITLE,
      contentHtml: HELP_PAGE_CONTENT_HTML,
      updatedAt: null
    };
  }

  return null;
}

async function getProducts() {
  const rows = await all(
    `SELECT
      id,
      name,
      category,
      price_ars as priceArs,
      description,
      image_url as imageUrl,
      colors as colorsCsv,
      sizes as sizesCsv,
      stock_qty as stockQty,
      detail_text as detailText
     FROM products
     ORDER BY id ASC`
  );

  const categoryRows = await all(
    `SELECT pc.product_id as productId, c.name
     FROM product_categories pc
     JOIN categories c ON c.id = pc.category_id`
  );
  const categoriesByProduct = new Map();
  categoryRows.forEach((row) => {
    const list = categoriesByProduct.get(row.productId) || [];
    list.push(row.name);
    categoriesByProduct.set(row.productId, list);
  });

  const imageRows = await all(
    `SELECT product_id as productId, url, alt_text as altText
     FROM product_images
     ORDER BY product_id, sort_order ASC, id ASC`
  );
  const imagesByProduct = new Map();
  imageRows.forEach((row) => {
    const list = imagesByProduct.get(row.productId) || [];
    list.push({ url: row.url, alt: row.altText });
    imagesByProduct.set(row.productId, list);
  });

  return rows.map((row) => {
    const base = formatProductRow(row);
    base.categories = categoriesByProduct.get(row.id) || [row.category];
    base.images = buildProductImages(row.imageUrl, imagesByProduct.get(row.id) || [], row.name);
    const main = base.images[0] || resolveImageWithVariants({ url: row.imageUrl, alt: row.name }, row.name);
    base.imageSliderUrl = main && main.sliderUrl ? main.sliderUrl : row.imageUrl;
    base.imageCardUrl = main && main.cardUrl ? main.cardUrl : row.imageUrl;
    return base;
  });
}

async function getProductById(productId) {
  const row = await get(
    `SELECT
      id,
      name,
      category,
      price_ars as priceArs,
      description,
      image_url as imageUrl,
      colors as colorsCsv,
      sizes as sizesCsv,
      stock_qty as stockQty,
      detail_text as detailText
     FROM products
     WHERE id = ?`,
    [productId]
  );

  if (!row) return null;

  const categories = await all(
    `SELECT c.name
     FROM product_categories pc
     JOIN categories c ON c.id = pc.category_id
     WHERE pc.product_id = ?`,
    [productId]
  );

  const images = await all(
    `SELECT url, alt_text as altText
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );

  const base = formatProductRow(row);
  base.categories = categories.length ? categories.map((c) => c.name) : [row.category];
  base.images = buildProductImages(row.imageUrl, images, row.name);
  const main = base.images[0] || resolveImageWithVariants({ url: row.imageUrl, alt: row.name }, row.name);
  base.imageSliderUrl = main && main.sliderUrl ? main.sliderUrl : row.imageUrl;
  base.imageCardUrl = main && main.cardUrl ? main.cardUrl : row.imageUrl;
  return base;
}

async function createOrder({ customer, items, whatsappNumber }) {
  const normalizedItems = items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
      color: normalizeText(item.color),
      size: normalizeText(item.size),
      detailText: normalizeText(item.detail || item.detailText, 300)
    }))
    .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);

  if (!normalizedItems.length) {
    throw new Error('No hay ítems válidos para procesar.');
  }

  const uniqueProductIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const placeholders = uniqueProductIds.map(() => '?').join(',');

  const productRows = await all(
    `SELECT id, name, price_ars FROM products WHERE id IN (${placeholders})`,
    uniqueProductIds
  );

  if (productRows.length !== uniqueProductIds.length) {
    throw new Error('Uno o más productos ya no están disponibles.');
  }

  const productMap = new Map(productRows.map((product) => [product.id, product]));

  const orderItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);
    const subtotal = product.price_ars * item.quantity;
    return {
      productId: product.id,
      name: product.name,
      unitPriceArs: product.price_ars,
      quantity: item.quantity,
      subtotalArs: subtotal,
      color: item.color,
      size: item.size,
      detailText: item.detailText
    };
  });

  const totalArs = orderItems.reduce((sum, item) => sum + item.subtotalArs, 0);

  await run('BEGIN TRANSACTION');
  try {
    const orderInsert = await run(
      `INSERT INTO orders (customer_name, customer_phone, customer_address, notes, total_ars)
       VALUES (?, ?, ?, ?, ?)`,
      [
        customer.name.trim(),
        customer.phone.trim(),
        customer.address ? customer.address.trim() : '',
        customer.notes ? customer.notes.trim() : '',
        totalArs
      ]
    );

    for (const item of orderItems) {
      await run(
        `INSERT INTO order_items (
          order_id, product_id, product_name, unit_price_ars, quantity, subtotal_ars, color, size, detail_text
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderInsert.id,
          item.productId,
          item.name,
          item.unitPriceArs,
          item.quantity,
          item.subtotalArs,
          item.color,
          item.size,
          item.detailText
        ]
      );
    }

    await run('COMMIT');

    const order = {
      id: orderInsert.id,
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      customer_address: customer.address ? customer.address.trim() : '',
      total_ars: totalArs,
      items: orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        subtotal_ars: item.subtotalArs,
        color: item.color,
        size: item.size,
        detail_text: item.detailText
      }))
    };

    const whatsappText = buildWhatsappMessage(order);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

    return {
      orderId: order.id,
      totalArs: totalArs,
      totalFormatted: formatCurrency(totalArs),
      whatsappUrl
    };
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }
}

async function listUsers() {
  return all(
    `SELECT
      id,
      username,
      full_name as fullName,
      role,
      is_active as isActive,
      created_at as createdAt
     FROM users
     ORDER BY id ASC`
  );
}

async function createUser({ username, password, fullName, role = 'admin', isActive = 1 }) {
  const normalizedUsername = normalizeText(username, 80).toLowerCase();
  const normalizedPassword = normalizeText(password, 120);
  const normalizedFullName = normalizeText(fullName, 120);
  const normalizedRole = normalizeText(role, 40) || 'admin';
  const normalizedIsActive = Number(isActive) ? 1 : 0;

  if (!normalizedUsername || !normalizedPassword || !normalizedFullName) {
    throw new Error('Datos de usuario incompletos.');
  }

  const result = await run(
    `INSERT INTO users (username, password, full_name, role, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [normalizedUsername, normalizedPassword, normalizedFullName, normalizedRole, normalizedIsActive]
  );

  return get(
    `SELECT id, username, full_name as fullName, role, is_active as isActive, created_at as createdAt
     FROM users WHERE id = ?`,
    [result.id]
  );
}

async function updateUser(userId, { username, password, fullName, role, isActive }) {
  const current = await get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!current) return null;

  const nextUsername = normalizeText(username ?? current.username, 80).toLowerCase();
  const nextPassword = normalizeText(password ?? current.password, 120);
  const nextFullName = normalizeText(fullName ?? current.full_name, 120);
  const nextRole = normalizeText(role ?? current.role, 40) || 'admin';
  const nextIsActive = isActive === undefined ? Number(current.is_active) : Number(isActive) ? 1 : 0;

  await run(
    `UPDATE users
     SET username = ?, password = ?, full_name = ?, role = ?, is_active = ?
     WHERE id = ?`,
    [nextUsername, nextPassword, nextFullName, nextRole, nextIsActive, userId]
  );

  return get(
    `SELECT id, username, full_name as fullName, role, is_active as isActive, created_at as createdAt
     FROM users WHERE id = ?`,
    [userId]
  );
}

async function deleteUser(userId) {
  const result = await run('DELETE FROM users WHERE id = ?', [userId]);
  return result.changes > 0;
}

async function listCategories() {
  return all(
    `SELECT id, name, slug
     FROM categories
     ORDER BY name ASC`
  );
}

async function createCategory({ name, slug }) {
  const normalizedName = normalizeText(name, 80);
  const normalizedSlug = normalizeText(slug, 80) || slugify(normalizedName);
  if (!normalizedName || !normalizedSlug) {
    throw new Error('Nombre de categoría inválido.');
  }

  const result = await run('INSERT INTO categories (name, slug) VALUES (?, ?)', [normalizedName, normalizedSlug]);
  return get('SELECT id, name, slug FROM categories WHERE id = ?', [result.id]);
}

async function updateCategory(categoryId, { name, slug }) {
  const current = await get('SELECT * FROM categories WHERE id = ?', [categoryId]);
  if (!current) return null;
  const nextName = normalizeText(name ?? current.name, 80);
  const nextSlug = normalizeText(slug ?? current.slug, 80) || slugify(nextName);
  await run('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [nextName, nextSlug, categoryId]);
  return get('SELECT id, name, slug FROM categories WHERE id = ?', [categoryId]);
}

async function deleteCategory(categoryId) {
  await run('DELETE FROM product_categories WHERE category_id = ?', [categoryId]);
  const result = await run('DELETE FROM categories WHERE id = ?', [categoryId]);
  return result.changes > 0;
}

async function listProductImages() {
  return all(
    `SELECT
      id,
      product_id as productId,
      url,
      alt_text as altText,
      sort_order as sortOrder
     FROM product_images
     ORDER BY product_id ASC, sort_order ASC, id ASC`
  );
}

async function getProductImageById(imageId) {
  return get(
    `SELECT
      id,
      product_id as productId,
      url,
      alt_text as altText,
      sort_order as sortOrder
     FROM product_images
     WHERE id = ?`,
    [imageId]
  );
}

async function listProductImagesByProductId(productId) {
  return all(
    `SELECT
      id,
      product_id as productId,
      url,
      alt_text as altText,
      sort_order as sortOrder
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );
}

async function syncProductMainImage(productId) {
  const normalizedProductId = Number(productId);
  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0) return;

  const firstImage = await get(
    `SELECT url
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC
     LIMIT 1`,
    [normalizedProductId]
  );

  if (firstImage && firstImage.url) {
    await run('UPDATE products SET image_url = ? WHERE id = ?', [firstImage.url, normalizedProductId]);
  }
}

async function setProductMainImage(productId, imageUrl) {
  const normalizedProductId = Number(productId);
  const normalizedImageUrl = normalizeText(imageUrl, 1000);

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0 || !normalizedImageUrl) {
    throw new Error('Imagen principal invalida.');
  }

  const current = await get('SELECT id FROM products WHERE id = ?', [normalizedProductId]);
  if (!current) return null;

  const images = await all(
    `SELECT id, url, sort_order as sortOrder
     FROM product_images
     WHERE product_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [normalizedProductId]
  );

  await run('BEGIN TRANSACTION');
  try {
    const selectedIndex = images.findIndex((img) => img.url === normalizedImageUrl);
    if (selectedIndex >= 0) {
      const ordered = [images[selectedIndex], ...images.filter((_img, index) => index !== selectedIndex)];
      for (let index = 0; index < ordered.length; index += 1) {
        const image = ordered[index];
        if (Number(image.sortOrder) !== index) {
          await run('UPDATE product_images SET sort_order = ? WHERE id = ?', [index, image.id]);
        }
      }
    }

    await run('UPDATE products SET image_url = ? WHERE id = ?', [normalizedImageUrl, normalizedProductId]);
    await run('COMMIT');
  } catch (error) {
    await run('ROLLBACK');
    throw error;
  }

  return get(
    `SELECT id, name, category, price_ars as priceArs, description, image_url as imageUrl
     FROM products WHERE id = ?`,
    [normalizedProductId]
  );
}

async function createProductImage({ productId, url, altText = '', sortOrder = 0 }) {
  const normalizedProductId = Number(productId);
  const normalizedUrl = normalizeText(url, 1000);
  const normalizedAltText = normalizeText(altText, 160);
  const normalizedSortOrder = Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0;

  if (!Number.isInteger(normalizedProductId) || normalizedProductId <= 0 || !normalizedUrl) {
    throw new Error('Imagen de producto inválida.');
  }

  const result = await run(
    `INSERT INTO product_images (product_id, url, alt_text, sort_order)
     VALUES (?, ?, ?, ?)`,
    [normalizedProductId, normalizedUrl, normalizedAltText, normalizedSortOrder]
  );

  await syncProductMainImage(normalizedProductId);

  return get(
    `SELECT id, product_id as productId, url, alt_text as altText, sort_order as sortOrder
     FROM product_images WHERE id = ?`,
    [result.id]
  );
}

async function updateProductImage(imageId, { productId, url, altText, sortOrder }) {
  const current = await get('SELECT * FROM product_images WHERE id = ?', [imageId]);
  if (!current) return null;

  const previousProductId = Number(current.product_id);
  const nextProductId = productId === undefined ? Number(current.product_id) : Number(productId);
  const nextUrl = normalizeText(url ?? current.url, 1000);
  const nextAltText = normalizeText(altText ?? current.alt_text, 160);
  const nextSortOrder = sortOrder === undefined ? Number(current.sort_order) : Number(sortOrder);

  await run(
    `UPDATE product_images
     SET product_id = ?, url = ?, alt_text = ?, sort_order = ?
     WHERE id = ?`,
    [nextProductId, nextUrl, nextAltText, nextSortOrder, imageId]
  );

  await syncProductMainImage(nextProductId);
  if (previousProductId !== nextProductId) {
    await syncProductMainImage(previousProductId);
  }

  return get(
    `SELECT id, product_id as productId, url, alt_text as altText, sort_order as sortOrder
     FROM product_images WHERE id = ?`,
    [imageId]
  );
}

async function deleteProductImage(imageId) {
  const current = await get('SELECT product_id as productId FROM product_images WHERE id = ?', [imageId]);
  const result = await run('DELETE FROM product_images WHERE id = ?', [imageId]);
  if (result.changes > 0 && current && current.productId) {
    await syncProductMainImage(current.productId);
  }
  return result.changes > 0;
}

async function listPages() {
  return all(
    `SELECT id, slug, title, content_html as contentHtml, updated_at as updatedAt
     FROM pages
     ORDER BY slug ASC`
  );
}

async function createPage({ slug, title, contentHtml }) {
  const normalizedSlug = normalizeText(slug, 80).toLowerCase();
  const normalizedTitle = normalizeText(title, 160);
  const normalizedContent = String(contentHtml || '').trim();
  if (!normalizedSlug || !normalizedTitle || !normalizedContent) {
    throw new Error('Datos de página inválidos.');
  }

  const result = await run(
    `INSERT INTO pages (slug, title, content_html)
     VALUES (?, ?, ?)`,
    [normalizedSlug, normalizedTitle, normalizedContent]
  );
  return get(
    `SELECT id, slug, title, content_html as contentHtml, updated_at as updatedAt
     FROM pages WHERE id = ?`,
    [result.id]
  );
}

async function updatePage(pageId, { slug, title, contentHtml }) {
  const current = await get('SELECT * FROM pages WHERE id = ?', [pageId]);
  if (!current) return null;

  const nextSlug = normalizeText(slug ?? current.slug, 80).toLowerCase();
  const nextTitle = normalizeText(title ?? current.title, 160);
  const nextContent = String(contentHtml ?? current.content_html).trim();

  await run(
    `UPDATE pages
     SET slug = ?, title = ?, content_html = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [nextSlug, nextTitle, nextContent, pageId]
  );

  return get(
    `SELECT id, slug, title, content_html as contentHtml, updated_at as updatedAt
     FROM pages WHERE id = ?`,
    [pageId]
  );
}

async function deletePage(pageId) {
  const result = await run('DELETE FROM pages WHERE id = ?', [pageId]);
  return result.changes > 0;
}

async function listProductsAdmin() {
  return all(
    `SELECT
      id,
      name,
      category,
      price_ars as priceArs,
      description,
      image_url as imageUrl
     FROM products
     ORDER BY id ASC`
  );
}

async function createProductAdmin({ name, category, priceArs, description, imageUrl }) {
  const normalizedName = normalizeText(name, 120);
  const normalizedCategory = normalizeText(category, 80);
  const normalizedPrice = Number(priceArs);
  const normalizedDescription = normalizeText(description, 500);
  const normalizedImageUrl = normalizeText(imageUrl, 1000);
  if (!normalizedName || !normalizedCategory || !Number.isFinite(normalizedPrice) || normalizedPrice <= 0 || !normalizedImageUrl) {
    throw new Error('Datos de producto inválidos.');
  }

  const fallback = fallbackByCategory(normalizedCategory, normalizedDescription);
  const result = await run(
    `INSERT INTO products (name, category, price_ars, description, image_url, colors, sizes, stock_qty, detail_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [normalizedName, normalizedCategory, Math.round(normalizedPrice), normalizedDescription, normalizedImageUrl, fallback.colors, fallback.sizes, fallback.stockQty, fallback.detailText]
  );

  await ensureCategoriesAndImagesFromProducts();
  return setProductMainImage(result.id, normalizedImageUrl);
}

async function updateProductAdmin(productId, { name, category, priceArs, description, imageUrl }) {
  const current = await get('SELECT * FROM products WHERE id = ?', [productId]);
  if (!current) return null;

  const nextName = normalizeText(name ?? current.name, 120);
  const nextCategory = normalizeText(category ?? current.category, 80);
  const nextPrice = priceArs === undefined ? Number(current.price_ars) : Number(priceArs);
  const nextDescription = normalizeText(description ?? current.description, 500);
  const nextImageUrl = normalizeText(imageUrl ?? current.image_url, 1000);

  if (!nextName || !nextCategory || !Number.isFinite(nextPrice) || nextPrice <= 0 || !nextImageUrl) {
    throw new Error('Datos de producto inválidos.');
  }

  await run(
    `UPDATE products
     SET name = ?, category = ?, price_ars = ?, description = ?, image_url = ?
     WHERE id = ?`,
    [nextName, nextCategory, Math.round(nextPrice), nextDescription, nextImageUrl, productId]
  );

  await ensureCategoriesAndImagesFromProducts();
  return setProductMainImage(productId, nextImageUrl);
}

async function deleteProductAdmin(productId) {
  await run('DELETE FROM product_images WHERE product_id = ?', [productId]);
  await run('DELETE FROM product_categories WHERE product_id = ?', [productId]);
  const result = await run('DELETE FROM products WHERE id = ?', [productId]);
  return result.changes > 0;
}

module.exports = {
  initDb,
  getProducts,
  getProductById,
  createOrder,
  getPageBySlug,
  authenticateUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProductImages,
  getProductImageById,
  listProductImagesByProductId,
  createProductImage,
  updateProductImage,
  deleteProductImage,
  setProductMainImage,
  listPages,
  createPage,
  updatePage,
  deletePage,
  listProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin
};
