const TOKEN_KEY = 'panel_token';
const API_BASE = '/api/panel';

const viewConfig = {
  dashboard: {
    title: 'Panel de control',
    endpoint: 'dashboard-summary',
    idKey: 'id',
    columns: [],
    fields: [],
    dashboard: true
  },
  products: {
    title: 'Productos',
    endpoint: 'products',
    idKey: 'id',
    columns: ['id', 'name', 'category', 'priceArs', 'description', 'imageUrl'],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true, colSpan: 2 },
      { key: 'category', label: 'Categoria', type: 'select', required: true },
      { key: 'priceArs', label: 'Precio ARS', type: 'number', required: true },
      { key: 'imageUrl', label: 'URL Imagen', type: 'hidden', required: false },
      { key: 'description', label: 'Descripcion', type: 'wysi-min', required: true, colSpan: 2 }
    ]
  },
  categories: {
    title: 'Categorias',
    endpoint: 'categories',
    idKey: 'id',
    columns: ['id', 'name', 'slug', 'icon'],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: false },
      {
        key: 'icon',
        label: 'Icono Lucide',
        type: 'text',
        required: false,
        placeholder: 'tag',
        helperText: 'Nombre de icono Lucide (ej: shirt, backpack, dumbbell).'
      }
    ]
  },
  orders: {
    title: 'Pedidos',
    endpoint: 'orders',
    idKey: 'id',
    columns: ['id', 'customerName', 'customerPhone', 'customerProvince', 'customerCity', 'deliveryType', 'totalArs', 'itemCount', 'createdAt'],
    fields: [
      { key: 'customerName', label: 'Nombre cliente', type: 'text', required: true, colSpan: 2 },
      { key: 'customerPhone', label: 'Telefono', type: 'text', required: true },
      { key: 'customerProvince', label: 'Provincia', type: 'text', required: true },
      { key: 'customerCity', label: 'Ciudad', type: 'text', required: true },
      {
        key: 'deliveryType',
        label: 'Tipo de entrega',
        type: 'select',
        required: true,
        options: [
          { value: 'home', label: 'Domicilio' },
          { value: 'branch', label: 'Sucursal Correo Argentino' }
        ]
      },
      { key: 'deliveryBranch', label: 'Sucursal correo', type: 'text', required: false },
      { key: 'customerAddress', label: 'Direccion', type: 'text', required: false },
      { key: 'notes', label: 'Notas', type: 'textarea', required: false, colSpan: 2 },
      { key: 'totalArs', label: 'Total ARS', type: 'number', required: false },
      {
        key: 'itemsJson',
        label: 'Items JSON',
        type: 'textarea',
        required: false,
        colSpan: 2,
        helperText:
          'Array JSON de items. Ejemplo: [{"productName":"Camiseta","quantity":2,"unitPriceArs":12000,"subtotalArs":24000}]'
      }
    ]
  },
  pages: {
    title: 'Paginas',
    endpoint: 'pages',
    idKey: 'id',
    columns: ['id', 'slug', 'title', 'imageUrl', 'updatedAt'],
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'title', label: 'Titulo', type: 'text', required: true },
      { key: 'imageUrl', label: 'URL Imagen', type: 'hidden', required: false },
      { key: 'contentHtml', label: 'Contenido HTML', type: 'wysi', required: true, colSpan: 2 }
    ]
  },
  settings: {
    title: 'Configuracion',
    endpoint: 'settings',
    idKey: 'id',
    singleton: true,
    tabs: [
      { id: 'general', label: 'General' },
      { id: 'html-meta', label: 'HTML Meta Tags' },
      { id: 'open-graph', label: 'Open Graph' },
      { id: 'twitter-cards', label: 'Twitter Cards' },
      { id: 'advanced-tags', label: 'Advanced Tags' },
      { id: 'schema-markup', label: 'Schema Markup' },
      { id: 'seo-images', label: 'SEO Imagenes' },
      { id: 'tech-files', label: 'Sitemap / Robots' }
    ],
    columns: ['id', 'storeName', 'whatsappNumber', 'updatedAt'],
    fields: [
      {
        key: 'seoGeneralIntro',
        label: 'Configuracion general del sitio',
        description: 'Estos ajustes SEO son globales y aplican a todas las publicaciones del sitio.',
        type: 'section',
        colSpan: 2,
        tab: 'general'
      },
      { key: 'storeName', label: 'Nombre de tienda', type: 'text', required: true, colSpan: 2, tab: 'general' },
      {
        key: 'whatsappNumber',
        label: 'Numero WhatsApp',
        type: 'text',
        required: true,
        colSpan: 2,
        tab: 'general',
        placeholder: '5491112345678'
      },
      {
        key: 'seoModules',
        label: 'Modulos SEO',
        description: 'Activa o desactiva modulos SEO globales. Esta configuracion aplica a todo el sitio.',
        type: 'section',
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoHtmlMetaEnabled',
        label: 'HTML Meta Tags',
        helper: 'Meta description, robots y datos base',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoOpenGraphEnabled',
        label: 'Open Graph',
        helper: 'Etiquetas para Facebook/LinkedIn',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoTwitterCardsEnabled',
        label: 'Twitter Cards',
        helper: 'Tarjetas para X/Twitter',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoAdvancedTagsEnabled',
        label: 'Advanced Tags',
        helper: 'robots, googlebot, author, theme-color',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoSchemaMarkupEnabled',
        label: 'Schema Markup',
        helper: 'JSON-LD estructurado',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoImagesModuleEnabled',
        label: 'SEO de Imagenes',
        helper: 'ALT automatico y herramientas de imagen',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoTechFilesEnabled',
        label: 'Sitemap, robots.txt y htaccess',
        helper: 'Modulo tecnico para archivos de rastreo e infraestructura',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'general'
      },
      {
        key: 'seoHtmlMetaIntro',
        label: 'AI Suggestions',
        description: 'Completa esta base global para HTML Meta Tags. Luego podemos agregar nuevas pestañas para Open Graph, Twitter, Schema y Advanced.',
        type: 'section',
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoHtmlDefaultTitle',
        label: 'Page Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'html-meta',
        placeholder: 'Enter your page title',
        recommendedMin: 50,
        recommendedMax: 60
      },
      {
        key: 'seoHtmlDefaultDescription',
        label: 'Meta Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'html-meta',
        placeholder: 'Enter a compelling description of your page',
        recommendedMin: 150,
        recommendedMax: 160
      },
      {
        key: 'seoHtmlAuthor',
        label: 'Author',
        type: 'text',
        required: false,
        tab: 'html-meta',
        placeholder: 'John Doe'
      },
      {
        key: 'seoHtmlContentLanguage',
        label: 'Content Language',
        type: 'text',
        required: false,
        tab: 'html-meta',
        placeholder: 'e.g., en, es, fr, de',
        helperText: "Use ISO 639-1 language codes (2-letter codes like 'en', 'es', 'fr')."
      },
      {
        key: 'seoHtmlRobotsIndexEnabled',
        label: 'Allow search engines to index this page',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoHtmlRobotsFollowEnabled',
        label: 'Allow search engines to follow links',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'html-meta'
      },
      {
        key: 'seoOpenGraphIntro',
        label: 'Open Graph',
        description:
          'Configuracion global de Open Graph para compartir en Facebook, LinkedIn, WhatsApp y Slack. Soporta placeholders: {{title}}, {{description}}, {{url}}, {{image}}, {{store}}.',
        type: 'section',
        colSpan: 2,
        tab: 'open-graph'
      },
      {
        key: 'seoOgDefaultTitle',
        label: 'OG Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'open-graph',
        placeholder: 'Enter title for social sharing',
        recommendedMin: 50,
        recommendedMax: 60
      },
      {
        key: 'seoOgDefaultDescription',
        label: 'OG Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'open-graph',
        placeholder: 'Enter description for social sharing',
        recommendedMin: 100,
        recommendedMax: 200
      },
      {
        key: 'seoOgImagesJson',
        label: 'OG Images *',
        type: 'og-images',
        required: false,
        colSpan: 2,
        tab: 'open-graph'
      },
      {
        key: 'seoOgUrl',
        label: 'OG URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'open-graph',
        placeholder: 'https://example.com/page'
      },
      {
        key: 'seoOgType',
        label: 'OG Type',
        type: 'select',
        required: false,
        tab: 'open-graph',
        options: [
          { value: 'website', label: 'Website' },
          { value: 'article', label: 'Article' },
          { value: 'product', label: 'Product' },
          { value: 'profile', label: 'Profile' }
        ]
      },
      {
        key: 'seoOgSiteName',
        label: 'Site Name',
        type: 'text',
        required: false,
        tab: 'open-graph',
        placeholder: 'Your Site Name'
      },
      {
        key: 'seoOgLocale',
        label: 'Locale',
        type: 'text',
        required: false,
        tab: 'open-graph',
        placeholder: 'e.g., en_US, es_ES',
        helperText: "Format: language_TERRITORY (e.g., en_US for English-United States)."
      },
      {
        key: 'seoTwitterIntro',
        label: 'Twitter Cards',
        description:
          'Configuracion global para tarjetas de X/Twitter con imagen y datos de cuenta. Soporta placeholders: {{title}}, {{description}}, {{url}}, {{image}}, {{store}}.',
        type: 'section',
        colSpan: 2,
        tab: 'twitter-cards'
      },
      {
        key: 'seoTwitterCardType',
        label: 'Card Type',
        type: 'select',
        required: false,
        tab: 'twitter-cards',
        options: [
          { value: 'summary_large_image', label: 'Summary Large Image (1200x628 hero)' },
          { value: 'summary', label: 'Summary' },
          { value: 'app', label: 'App' },
          { value: 'player', label: 'Player' }
        ]
      },
      {
        key: 'seoTwitterTitle',
        label: 'Twitter Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'twitter-cards',
        placeholder: 'Enter title for Twitter',
        recommendedMax: 70
      },
      {
        key: 'seoTwitterDescription',
        label: 'Twitter Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'twitter-cards',
        placeholder: 'Enter description for Twitter',
        recommendedMax: 200
      },
      {
        key: 'seoTwitterImageUrl',
        label: 'Twitter Image *',
        type: 'twitter-image',
        required: false,
        colSpan: 2,
        tab: 'twitter-cards'
      },
      {
        key: 'seoTwitterSiteHandle',
        label: 'Twitter Site Handle',
        type: 'text',
        required: false,
        tab: 'twitter-cards',
        placeholder: '@yourhandle'
      },
      {
        key: 'seoTwitterCreatorHandle',
        label: 'Twitter Creator Handle',
        type: 'text',
        required: false,
        tab: 'twitter-cards',
        placeholder: '@creator'
      },
      {
        key: 'seoAdvancedIntro',
        label: 'Advanced Tags',
        description: 'Directivas avanzadas para robots, googlebot y multi-idioma (hreflang).',
        type: 'section',
        colSpan: 2,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedCanonicalUrl',
        label: 'Canonical URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'https://example.com/canonical-page',
        helperText: 'Preferred URL to avoid duplicate content issues.'
      },
      {
        key: 'seoAdvancedNoArchiveEnabled',
        label: 'No Archive',
        helper: 'Prevent cached copies',
        type: 'switch',
        required: false,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedNoSnippetEnabled',
        label: 'No Snippet',
        helper: "Don't show text snippet",
        type: 'switch',
        required: false,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedNoImageIndexEnabled',
        label: 'No Image Index',
        helper: "Don't index images",
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags'
      },
      {
        key: 'seoAdvancedMaxSnippet',
        label: 'Max Snippet Length',
        type: 'number',
        required: false,
        tab: 'advanced-tags',
        placeholder: '160',
        helperText: '-1 no limit, 0 no snippet, or max characters.'
      },
      {
        key: 'seoAdvancedMaxImagePreview',
        label: 'Max Image Preview Size',
        type: 'select',
        required: false,
        tab: 'advanced-tags',
        options: [
          { value: 'large', label: 'Large' },
          { value: 'standard', label: 'Standard' },
          { value: 'none', label: 'None' }
        ]
      },
      {
        key: 'seoAdvancedMaxVideoPreview',
        label: 'Max Video Preview Duration',
        type: 'number',
        required: false,
        tab: 'advanced-tags',
        placeholder: '-1',
        helperText: '-1 no limit, 0 no preview, or max seconds.'
      },
      {
        key: 'seoAdvancedUnavailableAfter',
        label: 'Unavailable After Date',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'dd/mm/aaaa, --:--',
        helperText: "Search engines won't show this page after this date."
      },
      {
        key: 'seoAdvancedGooglebotRules',
        label: 'Googlebot Specific Rules',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'noindex, nofollow'
      },
      {
        key: 'seoAdvancedGooglebotNewsRules',
        label: 'Googlebot-News Rules',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags',
        placeholder: 'nosnippet'
      },
      {
        key: 'seoAdvancedHreflangJson',
        label: 'Hreflang Tags',
        type: 'hreflang-list',
        required: false,
        colSpan: 2,
        tab: 'advanced-tags'
      },
      {
        key: 'seoSchemaIntro',
        label: 'Schema Markup',
        description:
          'Schema ayuda a los buscadores a entender mejor el contenido y habilita rich snippets en resultados. Campos de texto soportan placeholders: {{title}}, {{description}}, {{url}}, {{image}}, {{store}}.',
        type: 'section',
        colSpan: 2,
        tab: 'schema-markup'
      },
      {
        key: 'seoSchemaType',
        label: 'Schema Type',
        type: 'select',
        required: false,
        tab: 'schema-markup',
        options: [
          { value: 'Article', label: 'Article' },
          { value: 'WebPage', label: 'WebPage' },
          { value: 'WebSite', label: 'WebSite' },
          { value: 'Product', label: 'Product' },
          { value: 'Organization', label: 'Organization' },
          { value: 'LocalBusiness', label: 'LocalBusiness' },
          { value: 'Event', label: 'Event' },
          { value: 'FAQPage', label: 'FAQPage' }
        ]
      },
      {
        key: 'seoSchemaName',
        label: 'Name / Title *',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'Enter name or title'
      },
      {
        key: 'seoSchemaDescription',
        label: 'Description *',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'Enter description'
      },
      {
        key: 'seoSchemaImageUrl',
        label: 'Image URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'https://example.com/image.jpg'
      },
      {
        key: 'seoSchemaUrl',
        label: 'URL',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'https://example.com/page'
      },
      {
        key: 'seoSchemaAuthor',
        label: 'Author',
        type: 'text',
        required: false,
        tab: 'schema-markup',
        placeholder: 'John Doe'
      },
      {
        key: 'seoSchemaDatePublished',
        label: 'Date Published',
        type: 'date',
        required: false,
        tab: 'schema-markup'
      },
      {
        key: 'seoSchemaHeadline',
        label: 'Headline',
        type: 'text',
        required: false,
        colSpan: 2,
        tab: 'schema-markup',
        placeholder: 'Article headline'
      },
      {
        key: 'seoImagesIntro',
        label: 'SEO de Imagenes',
        description:
          'Configuracion operativa para imagenes. El sistema ya genera variantes slider/card y permite regenerar ALT automaticamente.',
        type: 'section',
        colSpan: 2,
        tab: 'seo-images'
      },
      {
        key: 'seoTechFilesIntro',
        label: 'Sitemap Generator, robots.txt y htaccess',
        description:
          'Configura estos archivos tecnicos desde el panel. Sitemap y robots se publican automaticamente por ruta.',
        type: 'section',
        colSpan: 2,
        tab: 'tech-files'
      },
      {
        key: 'seoSitemapGeneratorEnabled',
        label: 'Activar sitemap generator',
        helper: 'Publica /sitemap.xml dinamico',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'tech-files'
      },
      {
        key: 'seoRobotsTxtContent',
        label: 'robots.txt',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'tech-files',
        placeholder: 'User-agent: *\\nAllow: /\\nSitemap: {{sitemapUrl}}'
      },
      {
        key: 'seoRobotsTxtEnabled',
        label: 'Activar robots.txt',
        helper: 'Publica /robots.txt',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'tech-files'
      },
      {
        key: 'seoHtaccessContent',
        label: 'htaccess',
        type: 'textarea',
        required: false,
        colSpan: 2,
        tab: 'tech-files',
        placeholder: 'Reglas Apache base para cache, compresion y rewrite.'
      },
      {
        key: 'seoHtaccessEnabled',
        label: 'Activar htaccess',
        helper: 'Publica /htaccess.txt para copia/descarga',
        type: 'switch',
        required: false,
        colSpan: 2,
        tab: 'tech-files'
      }
    ]
  },
  users: {
    title: 'Usuarios',
    endpoint: 'users',
    idKey: 'id',
    columns: ['id', 'username', 'fullName', 'role', 'isActive', 'createdAt'],
    fields: [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'password', label: 'Clave', type: 'password', required: true },
      { key: 'fullName', label: 'Nombre completo', type: 'text', required: true },
      { key: 'role', label: 'Rol', type: 'text', required: true },
      { key: 'isActive', label: 'Activo (1/0)', type: 'number', required: true }
    ]
  }
};

let activeView = 'products';
let editingId = null;
let productUploadFiles = [];
let productPrimaryIndex = 0;
let pageUploadFiles = [];
let pagePrimaryIndex = 0;
let activeFormTab = null;
let ogImagesState = [];
let twitterImageState = '';
let hreflangState = [];
let settingsInlineMode = false;
let dashboardAutoRefreshTimer = null;
let dashboardHistory = {
  cpu: [],
  memory: [],
  disk: []
};
let dashboardLastSummary = null;
let dashboardLottieScriptPromise = null;
let dashboardLottieInstance = null;
let dashboardChartsScriptPromise = null;
let dashboardCharts = {};
let dashboardRefreshPaused = false;
let dashboardRefreshCountdown = 30;
let wysiAssetsPromise = null;

const DASHBOARD_HISTORY_LIMIT = 20;
const DASHBOARD_REFRESH_STORAGE_KEY = 'panel_dashboard_refresh_seconds';
const DASHBOARD_REFRESH_PAUSED_STORAGE_KEY = 'panel_dashboard_refresh_paused';
const DEFAULT_DASHBOARD_REFRESH_SECONDS = 30;

const topbarRoot = document.getElementById('panel-topbar');
const navRoot = document.getElementById('panel-nav');
const panelMain = document.getElementById('panel-main');
const crudSection = document.getElementById('crud-section');
const viewTitle = document.getElementById('view-title');
const formEl = document.getElementById('crud-form');
const headEl = document.getElementById('crud-head');
const bodyEl = document.getElementById('crud-body');
const saveBtn = document.getElementById('save-item');
const clearBtn = document.getElementById('clear-form');
const refreshBtn = document.getElementById('refresh-view');
const newBtn = document.getElementById('new-item');
const messageEl = document.getElementById('panel-message');
const formOffcanvas = document.getElementById('form-offcanvas');
const formBackdrop = document.getElementById('form-backdrop');
const closeFormBtn = document.getElementById('close-form');
const formTitle = document.getElementById('form-title');
const defaultFormParent = formOffcanvas.parentElement;
let orderDetailModalEl = null;

function formatArs(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number.isFinite(amount) ? amount : 0);
}

function parseOrderItems(itemsJson) {
  if (!itemsJson) return [];
  if (Array.isArray(itemsJson)) return itemsJson;
  try {
    const parsed = JSON.parse(String(itemsJson));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function normalizeLucideIconName(iconName) {
  const raw = String(iconName || '').trim().toLowerCase();
  if (!raw) return 'circle';
  const normalized = raw === 'sneaker' ? 'footprints' : raw;
  const iconMap = window.lucide?.icons;
  const iconKey = normalized
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  if (iconMap && typeof iconMap === 'object' && !iconMap[iconKey]) {
    return 'tag';
  }
  return normalized;
}

function ensureOrderDetailModal() {
  if (orderDetailModalEl) return orderDetailModalEl;

  const wrapper = document.createElement('div');
  wrapper.id = 'order-detail-modal';
  wrapper.className = 'fixed inset-0 z-50 hidden';
  wrapper.innerHTML = `
    <div class="absolute inset-0 bg-slate-950/75" data-order-detail-close></div>
    <div class="relative mx-auto mt-8 w-[95%] max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl">
      <div class="mb-3 flex items-center justify-between">
        <p class="font-display text-2xl uppercase text-white">Detalle del pedido</p>
        <button type="button" class="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200" data-order-detail-close>Cerrar</button>
      </div>
      <div id="order-detail-content" class="space-y-3"></div>
    </div>
  `;
  document.body.appendChild(wrapper);

  wrapper.querySelectorAll('[data-order-detail-close]').forEach((el) => {
    el.addEventListener('click', () => {
      wrapper.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      wrapper.classList.add('hidden');
    }
  });

  orderDetailModalEl = wrapper;
  return wrapper;
}

function openOrderDetailModal(row) {
  const modal = ensureOrderDetailModal();
  const content = modal.querySelector('#order-detail-content');
  if (!content) return;

  const items = parseOrderItems(row.itemsJson);
  const customerName = row.customerName || '-';
  const customerPhone = row.customerPhone || '-';
  const customerProvince = row.customerProvince || '-';
  const customerCity = row.customerCity || '-';
  const deliveryType = String(row.deliveryType || 'home').toLowerCase() === 'branch' ? 'branch' : 'home';
  const deliveryBranch = row.deliveryBranch || '-';
  const customerAddress = row.customerAddress || '-';
  const notes = row.notes || '-';

  const itemsHtml = items.length
    ? items
        .map((item) => {
          const name = item.productName || item.name || '-';
          const qty = Number(item.quantity || 0);
          const unit = Number(item.unitPriceArs || item.unitPrice || 0);
          const subtotal = Number(item.subtotalArs || item.subtotal || 0);
          const attrs = [item.color ? `Color: ${item.color}` : '', item.size ? `Talle: ${item.size}` : '', item.detailText ? `Detalle: ${item.detailText}` : '']
            .filter(Boolean)
            .join(' · ');
          return `
            <article class="rounded-xl border border-white/10 bg-slate-950/50 p-3">
              <p class="font-semibold text-slate-100">${name}</p>
              <p class="mt-1 text-xs text-slate-400">Cantidad: ${qty} · Unitario: ${formatArs(unit)} · Subtotal: ${formatArs(subtotal)}</p>
              ${attrs ? `<p class="mt-1 text-xs text-slate-500">${attrs}</p>` : ''}
            </article>
          `;
        })
        .join('')
    : '<p class="text-sm text-slate-400">Sin items asociados.</p>';

  content.innerHTML = `
    <div class="grid gap-3 md:grid-cols-2">
      <div class="rounded-xl border border-white/10 bg-slate-950/50 p-3">
        <p class="text-xs uppercase tracking-wide text-slate-400">Cliente</p>
        <p class="mt-1 text-sm text-slate-100">${customerName}</p>
        <p class="text-sm text-slate-300">${customerPhone}</p>
        <p class="text-sm text-slate-400">${customerProvince} · ${customerCity}</p>
        <p class="mt-1 text-xs text-slate-400">
          ${deliveryType === 'branch' ? `Sucursal: ${deliveryBranch}` : `Domicilio: ${customerAddress}`}
        </p>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-950/50 p-3">
        <p class="text-xs uppercase tracking-wide text-slate-400">Pedido #${row.id}</p>
        <p class="mt-1 text-sm text-slate-300">Fecha: ${row.createdAt || '-'}</p>
        <p class="text-sm text-slate-300">Items: ${Number(row.itemCount || items.length || 0)}</p>
        <p class="mt-1 text-lg font-bold text-sky-300">${formatArs(row.totalArs || 0)}</p>
      </div>
    </div>
    <div class="rounded-xl border border-white/10 bg-slate-900/55 p-3">
      <p class="text-xs uppercase tracking-wide text-slate-400">Notas</p>
      <p class="mt-1 text-sm text-slate-300">${notes}</p>
    </div>
    <div class="space-y-2">
      <p class="text-xs uppercase tracking-wide text-slate-400">Items</p>
      ${itemsHtml}
    </div>
  `;

  modal.classList.remove('hidden');
}

function getInitialPanelView() {
  const view = new URLSearchParams(window.location.search).get('view');
  if (view && viewConfig[view]) return view;
  return 'dashboard';
}

async function loadPart(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.text();
}

function showMessage(message, isError = false) {
  messageEl.textContent = message;
  messageEl.className = `mt-3 text-sm ${isError ? 'text-rose-300' : 'text-emerald-300'}`;
}

function getConfig() {
  return viewConfig[activeView];
}

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getDashboardRefreshSeconds() {
  const saved = Number(localStorage.getItem(DASHBOARD_REFRESH_STORAGE_KEY));
  if (saved === 10 || saved === 30) return saved;
  return DEFAULT_DASHBOARD_REFRESH_SECONDS;
}

function setDashboardRefreshSeconds(seconds) {
  const next = Number(seconds);
  if (next === 10 || next === 30) {
    localStorage.setItem(DASHBOARD_REFRESH_STORAGE_KEY, String(next));
  }
}

function getDashboardRefreshPaused() {
  return localStorage.getItem(DASHBOARD_REFRESH_PAUSED_STORAGE_KEY) === '1';
}

function setDashboardRefreshPaused(value) {
  dashboardRefreshPaused = Boolean(value);
  localStorage.setItem(DASHBOARD_REFRESH_PAUSED_STORAGE_KEY, dashboardRefreshPaused ? '1' : '0');
}

function updateDashboardCountdownUI() {
  const countdownEl = document.getElementById('dashboard-refresh-countdown');
  if (!countdownEl) return;

  if (dashboardRefreshPaused) {
    countdownEl.textContent = 'Pausado';
    countdownEl.className = 'text-xs text-amber-200';
    return;
  }

  countdownEl.textContent = `Proxima actualizacion en ${Math.max(0, Math.ceil(dashboardRefreshCountdown))}s`;
  countdownEl.className = 'text-xs text-slate-300';
}

function formatBytes(bytes = 0) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const scaled = value / (1024 ** exponent);
  const digits = scaled >= 100 || exponent === 0 ? 0 : scaled >= 10 ? 1 : 2;
  return `${scaled.toFixed(digits)} ${units[exponent]}`;
}

function pushDashboardHistory(bucket, value) {
  if (!dashboardHistory[bucket]) return;
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) return;
  dashboardHistory[bucket].push(nextValue);
  if (dashboardHistory[bucket].length > DASHBOARD_HISTORY_LIMIT) {
    dashboardHistory[bucket] = dashboardHistory[bucket].slice(-DASHBOARD_HISTORY_LIMIT);
  }
}

function getAlertLevel(value, warningThreshold = 75, criticalThreshold = 90) {
  const numeric = Number(value || 0);
  if (numeric >= criticalThreshold) return 'critical';
  if (numeric >= warningThreshold) return 'warning';
  return 'ok';
}

function getAlertClasses(level) {
  if (level === 'critical') return 'border-rose-400/45 bg-rose-500/10';
  if (level === 'warning') return 'border-amber-300/45 bg-amber-500/10';
  return 'border-white/10 bg-slate-950/50';
}

function renderSparkBars(values = [], tone = 'sky') {
  if (!Array.isArray(values) || !values.length) {
    return '<div class="mt-2 text-[11px] text-slate-500">Sin datos historicos.</div>';
  }
  const palette = {
    sky: '#7dd3fc',
    emerald: '#6ee7b7',
    amber: '#fcd34d'
  };
  const color = palette[tone] || palette.sky;
  const bars = values
    .map((value) => {
      const clamped = Math.max(0, Math.min(100, Number(value || 0)));
      return `<span class="h-full w-1.5 rounded-sm" style="height:${Math.max(6, clamped)}%; background-color:${color};"></span>`;
    })
    .join('');
  return `<div class="mt-2 flex h-10 items-end gap-1">${bars}</div>`;
}

function destroyDashboardCharts() {
  Object.values(dashboardCharts).forEach((chart) => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  dashboardCharts = {};
}

async function ensureDashboardChartsScript() {
  if (window.Chart) return window.Chart;
  if (dashboardChartsScriptPromise) return dashboardChartsScriptPromise;

  dashboardChartsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    script.async = true;
    script.onload = () => resolve(window.Chart);
    script.onerror = () => reject(new Error('No se pudo cargar Chart.js.'));
    document.head.appendChild(script);
  });

  return dashboardChartsScriptPromise;
}

function buildDashboardLineChartConfig({ label, values, color }) {
  return {
    type: 'line',
    data: {
      labels: values.map((_v, index) => `${index + 1}`),
      datasets: [
        {
          label,
          data: values,
          borderColor: color,
          backgroundColor: `${color}33`,
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          display: false,
          grid: { display: false }
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: '#94a3b8',
            callback: (value) => `${value}%`
          },
          grid: { color: 'rgba(148, 163, 184, 0.14)' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y.toFixed(1)}%`
          }
        }
      }
    }
  };
}

async function initDashboardCharts() {
  const cpuCanvas = document.getElementById('dashboard-chart-cpu');
  const memoryCanvas = document.getElementById('dashboard-chart-memory');
  const diskCanvas = document.getElementById('dashboard-chart-disk');
  if (!cpuCanvas && !memoryCanvas && !diskCanvas) return;

  try {
    const ChartCtor = await ensureDashboardChartsScript();
    if (!ChartCtor) return;

    destroyDashboardCharts();

    if (cpuCanvas) {
      dashboardCharts.cpu = new ChartCtor(
        cpuCanvas,
        buildDashboardLineChartConfig({
          label: 'CPU',
          values: dashboardHistory.cpu,
          color: '#38bdf8'
        })
      );
    }

    if (memoryCanvas) {
      dashboardCharts.memory = new ChartCtor(
        memoryCanvas,
        buildDashboardLineChartConfig({
          label: 'Memoria',
          values: dashboardHistory.memory,
          color: '#34d399'
        })
      );
    }

    if (diskCanvas) {
      dashboardCharts.disk = new ChartCtor(
        diskCanvas,
        buildDashboardLineChartConfig({
          label: 'Disco',
          values: dashboardHistory.disk,
          color: '#f59e0b'
        })
      );
    }
  } catch (_error) {
    // fallback silencioso: si falla CDN, queda la tarjeta sin grafico
  }
}

function destroyDashboardLottie() {
  if (dashboardLottieInstance && typeof dashboardLottieInstance.destroy === 'function') {
    dashboardLottieInstance.destroy();
  }
  dashboardLottieInstance = null;
}

async function ensureDashboardLottieScript() {
  if (window.lottie) return window.lottie;
  if (dashboardLottieScriptPromise) return dashboardLottieScriptPromise;

  dashboardLottieScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js';
    script.async = true;
    script.onload = () => resolve(window.lottie);
    script.onerror = () => reject(new Error('No se pudo cargar Lottie.'));
    document.head.appendChild(script);
  });

  return dashboardLottieScriptPromise;
}

async function initDashboardLottie() {
  const container = document.getElementById('dashboard-lottie');
  if (!container) return;

  try {
    const lottieLib = await ensureDashboardLottieScript();
    if (!lottieLib || !container) return;
    destroyDashboardLottie();
    dashboardLottieInstance = lottieLib.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/panel/lottie/system-monitor.json'
    });
  } catch (_error) {
    container.innerHTML = '<p class="text-xs text-slate-500">Animacion no disponible.</p>';
  }
}

function stopDashboardAutoRefresh() {
  if (dashboardAutoRefreshTimer) {
    window.clearInterval(dashboardAutoRefreshTimer);
    dashboardAutoRefreshTimer = null;
  }
  dashboardRefreshCountdown = getDashboardRefreshSeconds();
  updateDashboardCountdownUI();
}

async function refreshDashboardNow(showToast = false) {
  try {
    const summary = await requestJson(`${API_BASE}/dashboard-summary`);
    if (!summary) return null;
    dashboardLastSummary = summary;
    renderDashboardSummary(summary);
    if (showToast) showMessage('Dashboard actualizado.');
    return summary;
  } catch (error) {
    showMessage(error.message, true);
    return null;
  }
}

function startDashboardAutoRefresh() {
  stopDashboardAutoRefresh();
  dashboardRefreshPaused = getDashboardRefreshPaused();
  const seconds = getDashboardRefreshSeconds();
  dashboardRefreshCountdown = seconds;
  updateDashboardCountdownUI();
  dashboardAutoRefreshTimer = window.setInterval(async () => {
    if (activeView !== 'dashboard') return;
    if (dashboardRefreshPaused) {
      updateDashboardCountdownUI();
      return;
    }
    dashboardRefreshCountdown -= 1;
    if (dashboardRefreshCountdown <= 0) {
      await refreshDashboardNow(false);
      dashboardRefreshCountdown = seconds;
    }
    updateDashboardCountdownUI();
  }, 1000);
}

function bindDashboardControls() {
  const refreshSelect = document.getElementById('dashboard-refresh-seconds');
  const refreshNowBtn = document.getElementById('dashboard-refresh-now');
  const resetHistoryBtn = document.getElementById('dashboard-reset-history');
  const pauseToggle = document.getElementById('dashboard-refresh-paused');

  if (refreshSelect) {
    refreshSelect.value = String(getDashboardRefreshSeconds());
    refreshSelect.addEventListener('change', () => {
      setDashboardRefreshSeconds(refreshSelect.value);
      dashboardRefreshCountdown = getDashboardRefreshSeconds();
      updateDashboardCountdownUI();
      if (activeView === 'dashboard') startDashboardAutoRefresh();
    });
  }

  if (pauseToggle) {
    pauseToggle.checked = getDashboardRefreshPaused();
    pauseToggle.addEventListener('change', () => {
      setDashboardRefreshPaused(pauseToggle.checked);
      updateDashboardCountdownUI();
    });
  }

  if (refreshNowBtn) {
    refreshNowBtn.addEventListener('click', async () => {
      await refreshDashboardNow(true);
      dashboardRefreshCountdown = getDashboardRefreshSeconds();
      updateDashboardCountdownUI();
    });
  }

  if (resetHistoryBtn) {
    resetHistoryBtn.addEventListener('click', () => {
      dashboardHistory = { cpu: [], memory: [], disk: [] };
      if (dashboardLastSummary) {
        renderDashboardSummary(dashboardLastSummary);
      }
      showMessage('Historico de metricas reiniciado.');
    });
  }
}

function renderDashboardSummary(summary) {
  const counts = summary?.counts || {};
  const storage = summary?.storage || {};
  const memory = summary?.memory || {};
  const cpu = summary?.cpu || {};
  const disk = storage?.disk || null;
  const timestamp = new Date().toLocaleTimeString('es-AR');

  const memoryPercent = Number(memory.usedPercent || 0);
  const cpuPercent = Number(cpu.loadPercent || 0);
  const diskPercent =
    disk && Number(disk.totalBytes || 0) > 0
      ? (Number(disk.usedBytes || 0) / Number(disk.totalBytes || 1)) * 100
      : null;

  pushDashboardHistory('cpu', cpuPercent);
  pushDashboardHistory('memory', memoryPercent);
  if (diskPercent !== null) pushDashboardHistory('disk', diskPercent);

  const memoryLevel = getAlertLevel(memoryPercent, 75, 85);
  const cpuLevel = getAlertLevel(cpuPercent, 70, 85);
  const diskLevel = diskPercent === null ? 'ok' : getAlertLevel(diskPercent, 80, 90);
  const hasAlerts = [memoryLevel, cpuLevel, diskLevel].some((level) => level !== 'ok');

  headEl.innerHTML = '';
  bodyEl.innerHTML = `
    <tr>
      <td class="px-0 py-0">
        <div class="space-y-3">
          <div class="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-display text-2xl uppercase text-white">Resumen operativo</p>
                <p class="text-xs text-slate-400">Actualizado: ${timestamp}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <label class="text-xs text-slate-300">
                  Auto-refresh
                  <select id="dashboard-refresh-seconds" class="ml-1 rounded-lg border border-white/15 bg-slate-900/70 px-2 py-1 text-xs text-slate-100">
                    <option value="10">10s</option>
                    <option value="30">30s</option>
                  </select>
                </label>
                <label class="inline-flex items-center gap-2 text-xs text-slate-300">
                  <input id="dashboard-refresh-paused" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-slate-900/70 text-sky-400" />
                  Pausar
                </label>
                <button id="dashboard-refresh-now" type="button" class="rounded-lg border border-sky-300/30 bg-sky-500/20 px-3 py-1.5 text-xs text-sky-100">Actualizar ahora</button>
                <button id="dashboard-reset-history" type="button" class="rounded-lg border border-white/20 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-100">Reiniciar grafico</button>
              </div>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <p id="dashboard-refresh-countdown" class="text-xs text-slate-300"></p>
            </div>
            ${
              hasAlerts
                ? `<div class="mt-3 rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Alertas activas:
              ${memoryLevel !== 'ok' ? ` RAM ${memoryPercent.toFixed(1)}%` : ''}
              ${cpuLevel !== 'ok' ? ` CPU ${cpuPercent.toFixed(1)}%` : ''}
              ${diskLevel !== 'ok' && diskPercent !== null ? ` Disco ${diskPercent.toFixed(1)}%` : ''}
            </div>`
                : ''
            }
          </div>
          <div class="grid gap-3 lg:grid-cols-[1.2fr_2fr]">
            <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-400">Estado del sistema</p>
              <div id="dashboard-lottie" class="mx-auto mt-2 h-40 w-full max-w-[260px]"></div>
              <p class="mt-2 text-center text-xs text-slate-400">Monitoreo en tiempo real</p>
            </article>
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">Productos</p>
            <p class="mt-1 text-3xl font-bold text-sky-300">${Number(counts.products || 0)}</p>
              </article>
              <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">Categorias</p>
            <p class="mt-1 text-3xl font-bold text-sky-300">${Number(counts.categories || 0)}</p>
              </article>
              <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">Pedidos</p>
            <p class="mt-1 text-3xl font-bold text-sky-300">${Number(counts.orders || 0)}</p>
              </article>
              <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">Imagenes</p>
            <p class="mt-1 text-3xl font-bold text-sky-300">${Number(counts.images || 0)}</p>
              </article>
              <article class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">Espacio app usado</p>
            <p class="mt-1 text-2xl font-bold text-sky-300">${formatBytes(storage.appUsedBytes || 0)}</p>
            <p class="mt-1 text-xs text-slate-400">Uploads: ${formatBytes(storage.uploadsBytes || 0)} · DB: ${formatBytes(
              storage.dbBytes || 0
            )}</p>
              </article>
            </div>
          </div>
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article class="rounded-2xl border ${getAlertClasses(memoryLevel)} p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">Memoria (RAM)</p>
            <p class="mt-1 text-2xl font-bold text-sky-300">${formatBytes(memory.usedBytes || 0)}</p>
            <p class="mt-1 text-xs text-slate-400">
              ${Number(memory.usedPercent || 0).toFixed(1)}% usado · Total: ${formatBytes(memory.totalBytes || 0)}
            </p>
            <div class="mt-2 h-24"><canvas id="dashboard-chart-memory"></canvas></div>
          </article>
          <article class="rounded-2xl border ${getAlertClasses(cpuLevel)} p-4">
            <p class="text-xs uppercase tracking-wide text-slate-400">CPU (carga)</p>
            <p class="mt-1 text-2xl font-bold text-sky-300">${Number(cpu.loadPercent || 0).toFixed(1)}%</p>
            <p class="mt-1 text-xs text-slate-400">
              Cores: ${Number(cpu.cores || 0)} · Load 1m: ${Number(cpu.load1m || 0).toFixed(2)}
            </p>
            <div class="mt-2 h-24"><canvas id="dashboard-chart-cpu"></canvas></div>
          </article>
          ${
            disk
              ? `<article class="rounded-2xl border ${getAlertClasses(diskLevel)} p-4 md:col-span-2 xl:col-span-1">
            <p class="text-xs uppercase tracking-wide text-slate-400">Disco del servidor</p>
            <p class="mt-1 text-lg font-semibold text-slate-100">
              Usado: ${formatBytes(disk.usedBytes || 0)} · Libre: ${formatBytes(disk.freeBytes || 0)} · Total: ${formatBytes(
                  disk.totalBytes || 0
                )}
            </p>
            <p class="mt-1 text-xs text-slate-400">${diskPercent !== null ? `${diskPercent.toFixed(1)}% usado` : 'Sin datos de porcentaje'}</p>
            <div class="mt-2 h-24"><canvas id="dashboard-chart-disk"></canvas></div>
          </article>`
              : ''
          }
          </div>
        </div>
      </td>
    </tr>
  `;
  bindDashboardControls();
  updateDashboardCountdownUI();
  void initDashboardLottie();
  void initDashboardCharts();
}

function getFieldValue(field, input) {
  if (!input) return '';
  if (field.type === 'switch') return input.checked ? 1 : 0;
  return input ? input.value : '';
}

function setFieldValue(field, input, value) {
  if (!input) return;
  if (field.type === 'switch') {
    input.checked = Number(value) === 1 || value === true || value === '1';
    return;
  }
  input.value = value ?? '';
}

function updateLengthHint(input) {
  if (!input) return;
  const targetId = input.dataset.lengthTarget;
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;

  const min = Number(input.dataset.lengthMin || 0);
  const max = Number(input.dataset.lengthMax || 0);
  const value = String(input.value || '');
  const length = value.length;

  let status = 'ok';
  let color = 'text-emerald-300';

  if (!length) {
    status = 'muy corto';
    color = 'text-rose-300';
  } else if (min && length < min) {
    status = 'corto';
    color = 'text-amber-300';
  } else if (max && length > max) {
    status = 'largo';
    color = 'text-amber-300';
  }

  const counter = max > 0 ? `${length}/${max}` : `${length}`;
  target.className = `mt-1 text-xs ${color}`;
  target.textContent = `${counter} caracteres (${status})`;
}

function syncWysiEditableFromTextarea(textarea) {
  if (!textarea) return;
  const scope = textarea.closest('label, div') || document;
  const editable = scope.querySelector('[contenteditable="true"]');
  if (!editable) return;
  editable.innerHTML = textarea.value || '';
}

function applyMinimalWysiToolbar(textarea) {
  if (!textarea) return;
  const scope = textarea.closest('[data-wysi-scope]') || textarea.closest('label') || document;
  const toolbar =
    scope.querySelector('.wysi-toolbar') ||
    scope.querySelector('[class*="toolbar"]') ||
    scope.querySelector('[role="toolbar"]');
  if (!toolbar) return;

  const controls = Array.from(toolbar.querySelectorAll('button, [role="button"], select'));
  controls.forEach((control, index) => {
    if (index > 4) {
      control.classList.add('hidden');
    }
  });
}

async function ensureWysiAssets() {
  if (window.Wysi) return window.Wysi;
  if (wysiAssetsPromise) return wysiAssetsPromise;

  wysiAssetsPromise = new Promise((resolve, reject) => {
    const cssId = 'wysi-css-cdn';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/gh/mdbassit/Wysi@latest/dist/wysi.min.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/mdbassit/Wysi@latest/dist/wysi.min.js';
    script.async = true;
    script.onload = () => resolve(window.Wysi);
    script.onerror = () => reject(new Error('No se pudo cargar Wysi.'));
    document.head.appendChild(script);
  });

  return wysiAssetsPromise;
}

async function setupPageWysiEditor() {
  if (activeView !== 'pages') return;
  const textarea = formEl.elements.namedItem('contentHtml');
  if (!textarea) return;

  if (!textarea.id) {
    textarea.id = 'page-content-wysi';
  }

  if (textarea.dataset.wysiReady === '1') {
    syncWysiEditableFromTextarea(textarea);
    return;
  }

  try {
    const WysiCtor = await ensureWysiAssets();
    if (!WysiCtor) return;
    WysiCtor({
      el: `#${textarea.id}`,
      darkMode: true,
      autoGrow: true,
      height: 320,
      onChange: (content) => {
        textarea.value = String(content || '');
      }
    });
    textarea.dataset.wysiReady = '1';
    syncWysiEditableFromTextarea(textarea);
  } catch (_error) {
    // fallback silencioso al textarea
  }
}

async function setupProductDescriptionWysiEditor() {
  if (activeView !== 'products') return;
  const textarea = formEl.elements.namedItem('description');
  if (!textarea) return;

  if (!textarea.id) {
    textarea.id = 'product-description-wysi';
  }

  if (textarea.dataset.wysiReady === '1') {
    syncWysiEditableFromTextarea(textarea);
    applyMinimalWysiToolbar(textarea);
    return;
  }

  try {
    const WysiCtor = await ensureWysiAssets();
    if (!WysiCtor) return;
    WysiCtor({
      el: `#${textarea.id}`,
      darkMode: true,
      autoGrow: true,
      height: 220,
      onChange: (content) => {
        textarea.value = String(content || '');
      }
    });
    textarea.dataset.wysiReady = '1';
    syncWysiEditableFromTextarea(textarea);
    applyMinimalWysiToolbar(textarea);
  } catch (_error) {
    // fallback silencioso al textarea
  }
}

function setupLengthHints() {
  formEl.querySelectorAll('[data-length-target]').forEach((input) => {
    const refresh = () => updateLengthHint(input);
    input.addEventListener('input', refresh);
    refresh();
  });
}

function setupFormTabs(cfg) {
  if (!cfg.tabs || !cfg.tabs.length) return;

  const tabsRoot = document.getElementById('form-tabs');
  if (!tabsRoot) return;

  const tabButtons = Array.from(tabsRoot.querySelectorAll('[data-form-tab]'));
  const tabPanels = Array.from(formEl.querySelectorAll('[data-field-tab]'));
  if (!tabButtons.length || !tabPanels.length) return;

  const validTabs = new Set(cfg.tabs.map((tab) => tab.id));
  const defaultTab = validTabs.has(activeFormTab) ? activeFormTab : cfg.tabs[0].id;

  const activateTab = (tabId) => {
    if (!validTabs.has(tabId)) return;
    activeFormTab = tabId;

    tabButtons.forEach((button) => {
      const isActive = button.dataset.formTab === tabId;
      button.classList.toggle('bg-sky-500/25', isActive);
      button.classList.toggle('border-sky-300/60', isActive);
      button.classList.toggle('text-white', isActive);
      button.classList.toggle('text-slate-300', !isActive);
    });

    tabPanels.forEach((panel) => {
      const isVisible = panel.dataset.fieldTab === tabId;
      panel.classList.toggle('hidden', !isVisible);
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => activateTab(button.dataset.formTab));
  });

  activateTab(defaultTab);
}

function normalizeOgImageEntry(item) {
  if (typeof item === 'string') {
    const url = item.trim();
    if (!url) return null;
    return { url, isPrimary: false };
  }

  if (!item || typeof item !== 'object') return null;
  const url = String(item.url || '').trim();
  if (!url) return null;
  return {
    url,
    isPrimary: Boolean(item.isPrimary)
  };
}

function parseOgImagesValue(value) {
  if (!value) return [];

  let parsed = [];
  if (Array.isArray(value)) {
    parsed = value;
  } else if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const maybe = JSON.parse(raw);
      parsed = Array.isArray(maybe) ? maybe : [];
    } catch (_error) {
      parsed = raw
        .split(/\r?\n|,/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }

  const normalized = [];
  const seen = new Set();
  parsed.forEach((item) => {
    const entry = normalizeOgImageEntry(item);
    if (!entry || seen.has(entry.url)) return;
    seen.add(entry.url);
    normalized.push(entry);
  });

  if (!normalized.length) return [];
  const primaryIndex = normalized.findIndex((entry) => entry.isPrimary);
  if (primaryIndex === -1) {
    normalized[0].isPrimary = true;
  } else {
    normalized.forEach((entry, index) => {
      entry.isPrimary = index === primaryIndex;
    });
  }

  return normalized;
}

function syncOgImagesInput() {
  const hiddenInput = formEl.elements.namedItem('seoOgImagesJson');
  if (!hiddenInput) return;
  hiddenInput.value = JSON.stringify(ogImagesState);
}

function renderOgImagesList() {
  const listEl = document.getElementById('og-images-list');
  if (!listEl) return;

  if (!ogImagesState.length) {
    listEl.innerHTML = '<p class="text-xs text-slate-400">Sin imagenes configuradas.</p>';
    syncOgImagesInput();
    return;
  }

  listEl.innerHTML = ogImagesState
    .map((item, index) => {
      const checked = item.isPrimary ? 'checked' : '';
      return `
        <div class="rounded-lg border border-white/10 bg-slate-900/50 p-2">
          <div class="flex items-center gap-2">
            <input type="radio" name="og-primary-image" value="${index}" ${checked} />
            <span class="text-xs text-slate-300">Primary Image</span>
            <button
              type="button"
              class="ml-auto rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-300"
              data-og-remove="${index}"
            >
              Borrar
            </button>
          </div>
          <p class="mt-1 truncate text-[11px] text-slate-400">${item.url}</p>
        </div>
      `;
    })
    .join('');

  listEl.querySelectorAll('input[name="og-primary-image"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const selectedIndex = Number(radio.value);
      if (!Number.isInteger(selectedIndex)) return;
      ogImagesState = ogImagesState.map((entry, index) => ({
        ...entry,
        isPrimary: index === selectedIndex
      }));
      renderOgImagesList();
    });
  });

  listEl.querySelectorAll('[data-og-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const removeIndex = Number(btn.dataset.ogRemove);
      if (!Number.isInteger(removeIndex)) return;
      ogImagesState = ogImagesState.filter((_entry, index) => index !== removeIndex);
      if (ogImagesState.length && !ogImagesState.some((entry) => entry.isPrimary)) {
        ogImagesState[0].isPrimary = true;
      }
      renderOgImagesList();
    });
  });

  syncOgImagesInput();
}

function addOgImageUrl(url, makePrimary = false) {
  const normalized = String(url || '').trim();
  if (!normalized) return false;
  const exists = ogImagesState.some((entry) => entry.url === normalized);
  if (exists) return false;

  const next = [...ogImagesState, { url: normalized, isPrimary: false }];
  if (makePrimary || !next.some((entry) => entry.isPrimary)) {
    next.forEach((entry, index) => {
      entry.isPrimary = index === next.length - 1;
    });
  }
  ogImagesState = next;
  renderOgImagesList();
  return true;
}

async function uploadSeoImage(file, entityId = 'open-graph') {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return '';
  }

  const safeEntityId = String(entityId || 'open-graph').trim() || 'open-graph';
  const data = new FormData();
  data.append('entityType', 'seo');
  data.append('entityId', safeEntityId);
  data.append('image', file);

  const query = new URLSearchParams({
    entityType: 'seo',
    entityId: safeEntityId
  }).toString();

  const response = await fetch(`/api/panel/uploads/image?${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'No se pudo subir la imagen SEO.');
  }

  return String(payload.url || '').trim();
}

async function uploadSeoOgImage(file) {
  return uploadSeoImage(file, 'open-graph');
}

async function uploadSeoTwitterImage(file) {
  return uploadSeoImage(file, 'twitter-cards');
}

function setupOgImagesUI() {
  const urlInput = document.getElementById('og-image-url-input');
  const addBtn = document.getElementById('og-image-add-btn');
  const uploadBtn = document.getElementById('og-image-upload-btn');
  const fileInput = document.getElementById('og-image-file-input');

  renderOgImagesList();

  if (addBtn && urlInput) {
    addBtn.addEventListener('click', () => {
      const added = addOgImageUrl(urlInput.value);
      if (!added) {
        showMessage('Ingresa una URL valida y no duplicada.', true);
        return;
      }
      urlInput.value = '';
      showMessage('Imagen Open Graph agregada.');
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage('Selecciona una imagen para subir.', true);
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';
      try {
        const uploadedUrl = await uploadSeoOgImage(file);
        if (!uploadedUrl) throw new Error('No se recibió URL de imagen.');
        addOgImageUrl(uploadedUrl, ogImagesState.length === 0);
        fileInput.value = '';
        showMessage('Imagen Open Graph subida correctamente.');
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Subir imagen';
      }
    });
  }
}

function syncTwitterImageInput() {
  const hiddenInput = formEl.elements.namedItem('seoTwitterImageUrl');
  if (!hiddenInput) return;
  hiddenInput.value = twitterImageState || '';
}

function renderTwitterImagePreview() {
  const previewImg = document.getElementById('twitter-image-preview');
  const emptyMessage = document.getElementById('twitter-image-empty');
  const currentUrl = document.getElementById('twitter-image-current-url');

  if (!previewImg || !emptyMessage || !currentUrl) {
    syncTwitterImageInput();
    return;
  }

  const url = String(twitterImageState || '').trim();
  if (url) {
    previewImg.src = url;
    previewImg.classList.remove('hidden');
    emptyMessage.classList.add('hidden');
    currentUrl.textContent = url;
  } else {
    previewImg.removeAttribute('src');
    previewImg.classList.add('hidden');
    emptyMessage.classList.remove('hidden');
    currentUrl.textContent = '';
  }

  syncTwitterImageInput();
}

function setTwitterImage(url) {
  twitterImageState = String(url || '').trim();
  renderTwitterImagePreview();
}

function setupTwitterImageUI() {
  const urlInput = document.getElementById('twitter-image-url-input');
  const setBtn = document.getElementById('twitter-image-set-btn');
  const uploadBtn = document.getElementById('twitter-image-upload-btn');
  const clearBtn = document.getElementById('twitter-image-clear-btn');
  const fileInput = document.getElementById('twitter-image-file-input');

  renderTwitterImagePreview();

  if (setBtn && urlInput) {
    setBtn.addEventListener('click', () => {
      const next = String(urlInput.value || '').trim();
      if (!next) {
        showMessage('Ingresa una URL de imagen para Twitter.', true);
        return;
      }
      setTwitterImage(next);
      showMessage('Imagen de Twitter actualizada.');
    });
  }

  if (clearBtn && urlInput) {
    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      setTwitterImage('');
      showMessage('Imagen de Twitter limpiada.');
    });
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage('Selecciona una imagen para subir.', true);
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';
      try {
        const uploadedUrl = await uploadSeoTwitterImage(file);
        if (!uploadedUrl) throw new Error('No se recibió URL de imagen.');
        setTwitterImage(uploadedUrl);
        if (urlInput) urlInput.value = uploadedUrl;
        fileInput.value = '';
        showMessage('Imagen Twitter subida correctamente.');
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Subir imagen';
      }
    });
  }
}

function normalizeHreflangEntry(item) {
  if (!item || typeof item !== 'object') return null;
  const lang = String(item.lang || '')
    .trim()
    .toLowerCase();
  const url = String(item.url || '').trim();
  if (!lang || !url) return null;
  if (!/^(x-default|[a-z]{2,3}(?:-[a-z0-9]{2,8})*)$/i.test(lang)) return null;
  return { lang, url };
}

function parseHreflangValue(value) {
  if (!value) return [];
  let parsed = [];
  if (Array.isArray(value)) {
    parsed = value;
  } else if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];
    try {
      const maybe = JSON.parse(raw);
      parsed = Array.isArray(maybe) ? maybe : [];
    } catch (_error) {
      parsed = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [lang, url] = line.split(/\s+/, 2);
          return { lang, url };
        });
    }
  }

  const normalized = [];
  const seen = new Set();
  parsed.forEach((item) => {
    const entry = normalizeHreflangEntry(item);
    if (!entry) return;
    const key = `${entry.lang}|${entry.url}`;
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(entry);
  });
  return normalized.slice(0, 20);
}

function syncHreflangInput() {
  const hiddenInput = formEl.elements.namedItem('seoAdvancedHreflangJson');
  if (!hiddenInput) return;
  hiddenInput.value = JSON.stringify(hreflangState);
}

function renderHreflangList() {
  const listEl = document.getElementById('hreflang-list');
  if (!listEl) {
    syncHreflangInput();
    return;
  }

  if (!hreflangState.length) {
    listEl.innerHTML = '<p class="text-xs text-slate-400">Sin idiomas cargados.</p>';
    syncHreflangInput();
    return;
  }

  listEl.innerHTML = hreflangState
    .map(
      (entry, index) => `
      <div class="rounded-lg border border-white/10 bg-slate-900/50 p-2">
        <div class="flex items-center gap-2">
          <span class="inline-flex rounded-md border border-sky-300/40 px-2 py-0.5 text-[11px] text-sky-200">${entry.lang}</span>
          <button
            type="button"
            data-hreflang-remove="${index}"
            class="ml-auto rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-300"
          >
            Borrar
          </button>
        </div>
        <p class="mt-1 truncate text-[11px] text-slate-400">${entry.url}</p>
      </div>
    `
    )
    .join('');

  listEl.querySelectorAll('[data-hreflang-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.hreflangRemove);
      if (!Number.isInteger(index)) return;
      hreflangState = hreflangState.filter((_item, i) => i !== index);
      renderHreflangList();
    });
  });

  syncHreflangInput();
}

function setupHreflangUI() {
  const langInput = document.getElementById('hreflang-lang-input');
  const urlInput = document.getElementById('hreflang-url-input');
  const addBtn = document.getElementById('hreflang-add-btn');

  renderHreflangList();

  if (addBtn && langInput && urlInput) {
    addBtn.addEventListener('click', () => {
      const nextEntry = normalizeHreflangEntry({ lang: langInput.value, url: urlInput.value });
      if (!nextEntry) {
        showMessage('Idioma/URL de hreflang invalido.', true);
        return;
      }
      const exists = hreflangState.some((entry) => entry.lang === nextEntry.lang && entry.url === nextEntry.url);
      if (exists) {
        showMessage('Ese hreflang ya existe.', true);
        return;
      }
      hreflangState = [...hreflangState, nextEntry].slice(0, 20);
      langInput.value = '';
      urlInput.value = '';
      renderHreflangList();
      showMessage('Hreflang agregado.');
    });
  }
}

const TECH_FILES_SWITCH_BINDINGS = [
  ['seoRobotsTxtEnabled', 'seoRobotsTxtContent'],
  ['seoHtaccessEnabled', 'seoHtaccessContent']
];

function applyTechFilesSwitchState() {
  const moduleInput = formEl.elements.namedItem('seoTechFilesEnabled');
  const moduleEnabled = moduleInput ? Boolean(moduleInput.checked) : true;
  const sitemapEnabledInput = formEl.elements.namedItem('seoSitemapGeneratorEnabled');
  if (sitemapEnabledInput) {
    sitemapEnabledInput.disabled = !moduleEnabled;
    sitemapEnabledInput.classList.toggle('opacity-50', !moduleEnabled);
  }

  TECH_FILES_SWITCH_BINDINGS.forEach(([enabledKey, contentKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    const contentInput = formEl.elements.namedItem(contentKey);
    if (!enabledInput || !contentInput) return;

    enabledInput.disabled = !moduleEnabled;
    enabledInput.classList.toggle('opacity-50', !moduleEnabled);

    const isEnabled = moduleEnabled && Boolean(enabledInput.checked);
    contentInput.disabled = !isEnabled;
    contentInput.classList.toggle('opacity-50', !isEnabled);
  });
}

function setupTechFilesSwitchesUI() {
  const moduleInput = formEl.elements.namedItem('seoTechFilesEnabled');
  if (moduleInput) {
    moduleInput.addEventListener('change', applyTechFilesSwitchState);
  }

  TECH_FILES_SWITCH_BINDINGS.forEach(([enabledKey]) => {
    const enabledInput = formEl.elements.namedItem(enabledKey);
    if (!enabledInput) return;
    enabledInput.addEventListener('change', applyTechFilesSwitchState);
  });

  applyTechFilesSwitchState();
}

function setupSeoAltRegeneratorUI() {
  const button = document.getElementById('seo-images-regenerate-alt-btn');
  const status = document.getElementById('seo-images-regenerate-alt-status');
  const moduleInput = formEl.elements.namedItem('seoImagesModuleEnabled');
  if (!button || !status) return;

  const syncModuleState = () => {
    const enabled = moduleInput ? Boolean(moduleInput.checked) : true;
    button.disabled = !enabled;
    if (!enabled) {
      status.textContent = 'Modulo SEO Imagenes desactivado.';
      status.className = 'text-xs text-amber-300';
    } else if (status.textContent === 'Modulo SEO Imagenes desactivado.') {
      status.textContent = 'Sin ejecutar.';
      status.className = 'text-xs text-slate-400';
    }
  };

  if (moduleInput) {
    moduleInput.addEventListener('change', syncModuleState);
  }
  syncModuleState();

  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Regenerando ALT de imagenes...';
    status.className = 'text-xs text-slate-300';
    try {
      const payload = await requestJson(`${API_BASE}/products/images/alt/regenerate`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      const updated = Number(payload?.updated || 0);
      const images = Number(payload?.images || 0);
      const products = Number(payload?.products || 0);
      status.textContent = `Listo. ${updated} ALT actualizados sobre ${images} imagen(es) en ${products} producto(s).`;
      status.className = 'text-xs text-emerald-300';
      showMessage('ALT de imagenes regenerados.');
    } catch (error) {
      status.textContent = error.message || 'No se pudo regenerar ALT.';
      status.className = 'text-xs text-rose-300';
      showMessage(error.message || 'No se pudo regenerar ALT.', true);
    } finally {
      button.disabled = false;
    }
  });
}

function updateImagePreview(url) {
  const previewEl = document.getElementById('image-preview');
  if (!previewEl) return;

  if (url) {
    previewEl.src = url;
    previewEl.classList.remove('hidden');
  } else {
    previewEl.removeAttribute('src');
    previewEl.classList.add('hidden');
  }
}

function renderMultiPreview(files) {
  const root = document.getElementById('images-preview-list');
  if (!root) return;
  if (!files || !files.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = files
    .filter((file) => file.type && file.type.startsWith('image/'))
    .slice(0, 12)
    .map((file) => {
      const objectUrl = URL.createObjectURL(file);
      return `<img src="${objectUrl}" alt="preview" class="h-20 w-20 rounded-lg border border-white/10 object-cover" />`;
    })
    .join('');
}

function renderProductUploadPreview(files) {
  const root = document.getElementById('product-upload-preview-list');
  if (!root) return;
  if (!files || !files.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = files
    .filter((file) => file.type && file.type.startsWith('image/'))
    .map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const checked = index === productPrimaryIndex ? 'checked' : '';
      return `
        <label class="rounded-xl border border-white/10 bg-slate-900/60 p-2">
          <img src="${objectUrl}" alt="preview-${index + 1}" class="h-24 w-full rounded-lg object-cover" />
          <span class="mt-2 flex items-center gap-2 text-xs text-slate-200">
            <input type="radio" name="product-primary-pick" value="${index}" ${checked} />
            Principal
          </span>
          <span class="mt-1 block truncate text-[11px] text-slate-400">${file.name}</span>
        </label>
      `;
    })
    .join('');

  root.querySelectorAll('input[name="product-primary-pick"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const next = Number(radio.value);
      if (!Number.isInteger(next) || next < 0) return;
      productPrimaryIndex = next;
    });
  });
}

function renderPageUploadPreview(files) {
  const root = document.getElementById('page-upload-preview-list');
  if (!root) return;
  if (!files || !files.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = files
    .filter((file) => file.type && file.type.startsWith('image/'))
    .map((file, index) => {
      const objectUrl = URL.createObjectURL(file);
      const checked = index === pagePrimaryIndex ? 'checked' : '';
      return `
        <label class="rounded-xl border border-white/10 bg-slate-900/60 p-2">
          <img src="${objectUrl}" alt="preview-page-${index + 1}" class="h-24 w-full rounded-lg object-cover" />
          <span class="mt-2 flex items-center gap-2 text-xs text-slate-200">
            <input type="radio" name="page-primary-pick" value="${index}" ${checked} />
            Principal
          </span>
          <span class="mt-1 block truncate text-[11px] text-slate-400">${file.name}</span>
        </label>
      `;
    })
    .join('');

  root.querySelectorAll('input[name="page-primary-pick"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const next = Number(radio.value);
      if (!Number.isInteger(next) || next < 0) return;
      pagePrimaryIndex = next;
    });
  });
}

function setProductUploadProgress({ active = false, current = 0, total = 0, message = '' } = {}) {
  const statusEl = document.getElementById('product-upload-status');
  const spinnerEl = document.getElementById('product-upload-spinner');
  if (!statusEl || !spinnerEl) return;

  if (active) {
    spinnerEl.classList.remove('hidden');
    if (message) {
      statusEl.textContent = message;
    } else {
      statusEl.textContent = total > 0 ? `Subiendo ${current}/${total}...` : 'Procesando imágenes...';
    }
  } else {
    spinnerEl.classList.add('hidden');
    statusEl.textContent = message || 'Sin tareas pendientes.';
  }
}

async function uploadImageFile(file, entityOrProductId = null, maybeEntityId = null) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return null;
  }

  let entityType = null;
  let entityId = null;
  if (typeof entityOrProductId === 'string') {
    entityType = entityOrProductId;
    entityId = maybeEntityId;
  } else {
    entityType = 'product';
    entityId = entityOrProductId;
  }

  const data = new FormData();
  const params = new URLSearchParams();
  if (entityId) {
    data.append('entityType', String(entityType || 'product'));
    data.append('entityId', String(entityId));
    params.set('entityType', String(entityType || 'product'));
    params.set('entityId', String(entityId));
    if (entityType === 'product') {
      data.append('productId', String(entityId));
      params.set('productId', String(entityId));
    }
  }
  data.append('image', file);
  const query = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`/api/panel/uploads/image${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'No se pudo subir la imagen.');
  return payload.url;
}

async function uploadImageFiles(files, entityOrProductId = null, maybeEntityId = null) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return [];
  }

  let entityType = null;
  let entityId = null;
  if (typeof entityOrProductId === 'string') {
    entityType = entityOrProductId;
    entityId = maybeEntityId;
  } else {
    entityType = 'product';
    entityId = entityOrProductId;
  }

  const data = new FormData();
  const params = new URLSearchParams();
  if (entityId) {
    data.append('entityType', String(entityType || 'product'));
    data.append('entityId', String(entityId));
    params.set('entityType', String(entityType || 'product'));
    params.set('entityId', String(entityId));
    if (entityType === 'product') {
      data.append('productId', String(entityId));
      params.set('productId', String(entityId));
    }
  }
  files.forEach((file) => data.append('images', file));
  const query = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`/api/panel/uploads/images${query}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  });

  const payload = await response.json().catch(() => ({}));
  if (response.ok) {
    return Array.isArray(payload.urls) ? payload.urls : [];
  }

  if (response.status === 404 || response.status === 405) {
    const urls = [];
    for (const file of files) {
      const url = await uploadImageFile(file, entityType, entityId);
      if (url) urls.push(url);
    }
    return urls;
  }

  throw new Error(payload.error || 'No se pudieron subir las imagenes.');
}

async function uploadMultipleProductImages(files) {
  const productIdInput = formEl.elements.namedItem('productId');
  const productIdSelect = document.getElementById('product-id-select');
  const altTextInput = formEl.elements.namedItem('altText');
  const sortOrderInput = formEl.elements.namedItem('sortOrder');

  const productIdFromInput = Number(productIdInput ? productIdInput.value : 0);
  const productIdFromSelect = Number(productIdSelect ? productIdSelect.value : 0);
  const productId = Number.isInteger(productIdFromInput) && productIdFromInput > 0 ? productIdFromInput : productIdFromSelect;
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error('Ingresa un ID de producto valido para carga multiple.');
  }

  const baseSort = Number(sortOrderInput ? sortOrderInput.value : 0);
  const startSort = Number.isFinite(baseSort) ? baseSort : 0;
  const altBase = String(altTextInput ? altTextInput.value : '').trim();

  let created = 0;
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file.type || !file.type.startsWith('image/')) continue;

    const url = await uploadImageFile(file, productId);
    await requestJson(`${API_BASE}/product-images`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        url,
        altText: altBase || file.name,
        sortOrder: startSort + i
      })
    });
    created += 1;
  }

  if (!created) {
    throw new Error('No se subieron imagenes validas.');
  }

  return created;
}

async function populateProductSelector() {
  const selectEl = document.getElementById('product-id-select');
  const productIdInput = formEl.elements.namedItem('productId');
  if (!selectEl || !productIdInput) return;

  try {
    const products = await requestJson(`${API_BASE}/products`);
    if (!Array.isArray(products)) return;

    selectEl.innerHTML = `
      <option value="">Seleccionar producto...</option>
      ${products.map((p) => `<option value="${p.id}">#${p.id} - ${p.name}</option>`).join('')}
    `;

    const current = Number(productIdInput.value || 0);
    if (Number.isInteger(current) && current > 0) {
      selectEl.value = String(current);
    }

    selectEl.addEventListener('change', () => {
      if (!selectEl.value) return;
      productIdInput.value = selectEl.value;
    });

    productIdInput.addEventListener('input', () => {
      const value = String(productIdInput.value || '');
      if (!value) {
        selectEl.value = '';
        return;
      }
      const option = selectEl.querySelector(`option[value="${value}"]`);
      if (option) {
        selectEl.value = value;
      }
    });
  } catch (error) {
    showMessage(`No se pudo cargar selector de productos: ${error.message}`, true);
  }
}

async function populateProductCategorySelect(selectedValue = '') {
  const selectEl = formEl.elements.namedItem('category');
  if (!selectEl || activeView !== 'products') return;

  try {
    const categories = await requestJson(`${API_BASE}/categories`);
    if (!Array.isArray(categories)) return;

    const options = categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
    selectEl.innerHTML = `<option value="">Seleccionar categoria...</option>${options}`;
    if (selectedValue) {
      const exists = categories.some((c) => c.name === selectedValue);
      if (exists) {
        selectEl.value = selectedValue;
      } else {
        const extra = document.createElement('option');
        extra.value = selectedValue;
        extra.textContent = `${selectedValue} (actual)`;
        selectEl.appendChild(extra);
        selectEl.value = selectedValue;
      }
    } else {
      selectEl.value = '';
    }
  } catch (error) {
    showMessage(`No se pudieron cargar categorias: ${error.message}`, true);
  }
}

function setupProductImageUI() {
  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  const imageFilesInput = document.getElementById('product-images-files');
  if (!imageUrlInput || !imageFilesInput) return;

  imageFilesInput.addEventListener('change', () => {
    const files = Array.from(imageFilesInput.files || []);
    const valid = files.filter((file) => file.type && file.type.startsWith('image/'));
    productUploadFiles = valid;
    productPrimaryIndex = 0;
    renderProductUploadPreview(valid);
  });

  renderProductUploadPreview([]);
  setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });

  if (editingId) {
    renderProductImagesManager(editingId);
  }
}

async function processPendingProductImages(productId) {
  const files = productUploadFiles;
  if (!Array.isArray(files) || !files.length) return { created: 0, principalUrl: null };

  const rows = await requestJson(`${API_BASE}/product-images`);
  const currentImages = Array.isArray(rows) ? rows.filter((img) => Number(img.productId) === Number(productId)) : [];
  const maxSort = currentImages.reduce((max, img) => Math.max(max, Number(img.sortOrder || 0)), -1);
  const startSort = maxSort + 1;

  const uploadedUrls = [];
  let created = 0;
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file || !file.type || !file.type.startsWith('image/')) continue;

    setProductUploadProgress({
      active: true,
      current: i + 1,
      total: files.length,
      message: `Subiendo ${i + 1}/${files.length}: ${file.name}`
    });

    const url = await uploadImageFile(file, productId);
    if (!url) continue;
    uploadedUrls.push(url);

    await requestJson(`${API_BASE}/product-images`, {
      method: 'POST',
      body: JSON.stringify({
        productId,
        url,
        altText: file?.name || 'imagen',
        sortOrder: startSort + i
      })
    });
    created += 1;
  }

  if (!created || !uploadedUrls.length) {
    throw new Error('No se subieron imagenes validas.');
  }

  const principalUrl = uploadedUrls[productPrimaryIndex] || uploadedUrls[0];
  if (principalUrl) {
    await requestJson(`${API_BASE}/products/${productId}/image`, {
      method: 'PATCH',
      body: JSON.stringify({ imageUrl: principalUrl })
    });
  }

  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  if (imageUrlInput && principalUrl) {
    imageUrlInput.value = principalUrl;
  }

  const imageFilesInput = document.getElementById('product-images-files');
  if (imageFilesInput) imageFilesInput.value = '';
  productUploadFiles = [];
  productPrimaryIndex = 0;
  renderProductUploadPreview([]);
  setProductUploadProgress({ active: false, message: `Subida completa: ${created} imagen(es).` });

  return { created, principalUrl };
}

async function renderProductImagesManager(productId) {
  const container = document.getElementById('product-images-manager');
  if (!container || !productId) return;

  try {
    const rows = await requestJson(`${API_BASE}/product-images`);
    const images = Array.isArray(rows)
      ? rows
          .filter((img) => Number(img.productId) === Number(productId))
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(a.id) - Number(b.id))
      : [];

    if (!images.length) {
      container.innerHTML = '<p class="text-xs text-slate-400">Este producto aun no tiene galeria.</p>';
      return;
    }

    container.innerHTML = images
      .map(
        (img, index) => `
      <article class="product-image-item rounded-xl border border-white/10 bg-slate-900/60 p-2" draggable="true" data-img-id="${img.id}" data-img-index="${index}">
        <img src="${img.url}" alt="${img.altText || 'img'}" class="h-24 w-full rounded-lg object-cover" />
        <p class="mt-1 truncate text-[11px] text-slate-400">${img.url}</p>
        <div class="mt-2 flex gap-1">
          <button
            type="button"
            data-img-main="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-sky-300/40 text-sky-200"
            aria-label="Marcar principal"
            data-tooltip="Principal"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="star"></span>
          </button>
          <button
            type="button"
            data-img-up="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 text-slate-100"
            aria-label="Mover arriba"
            data-tooltip="Subir"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="arrow-up"></span>
          </button>
          <button
            type="button"
            data-img-down="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 text-slate-100"
            aria-label="Mover abajo"
            data-tooltip="Bajar"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="arrow-down"></span>
          </button>
          <button
            type="button"
            data-img-del="${img.id}"
            class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-rose-400/40 text-rose-300"
            aria-label="Borrar imagen"
            data-tooltip="Borrar"
          >
            <span class="lucide h-3.5 w-3.5" data-lucide="trash-2"></span>
          </button>
          <span class="ml-auto text-[11px] text-slate-500">#${index + 1}</span>
        </div>
      </article>
    `
      )
      .join('');

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }

    container.querySelectorAll('[data-img-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const imageId = Number(btn.dataset.imgDel);
        if (!confirm(`Eliminar imagen ${imageId}?`)) return;
        try {
          await requestJson(`${API_BASE}/product-images/${imageId}`, { method: 'DELETE' });
          await renderProductImagesManager(productId);
          showMessage(`Imagen ${imageId} eliminada.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });

    container.querySelectorAll('[data-img-main]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const imageId = Number(btn.dataset.imgMain);
        const selected = images.find((img) => Number(img.id) === imageId);
        if (!selected) return;
        try {
          await requestJson(`${API_BASE}/products/${productId}/image`, {
            method: 'PATCH',
            body: JSON.stringify({
              imageUrl: selected.url
            })
          });
          const imageUrlInput = formEl.elements.namedItem('imageUrl');
          if (imageUrlInput) imageUrlInput.value = selected.url;
          showMessage(`Imagen ${imageId} marcada como principal.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });

    const move = async (imageId, direction) => {
      const current = images.find((img) => Number(img.id) === Number(imageId));
      if (!current) return;
      const idx = images.findIndex((img) => Number(img.id) === Number(imageId));
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= images.length) return;
      const target = images[swapIdx];
      try {
        await requestJson(`${API_BASE}/product-images/${current.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            productId: current.productId,
            url: current.url,
            altText: current.altText || '',
            sortOrder: target.sortOrder
          })
        });
        await requestJson(`${API_BASE}/product-images/${target.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            productId: target.productId,
            url: target.url,
            altText: target.altText || '',
            sortOrder: current.sortOrder
          })
        });
        await renderProductImagesManager(productId);
        showMessage('Orden de imagenes actualizado.');
      } catch (error) {
        showMessage(error.message, true);
      }
    };

    container.querySelectorAll('[data-img-up]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await move(Number(btn.dataset.imgUp), 'up');
      });
    });

    container.querySelectorAll('[data-img-down]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await move(Number(btn.dataset.imgDown), 'down');
      });
    });

    const items = Array.from(container.querySelectorAll('.product-image-item'));
    let draggedIndex = null;
    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        draggedIndex = Number(item.dataset.imgIndex);
      });
      item.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      item.addEventListener('drop', async (event) => {
        event.preventDefault();
        const targetIndex = Number(item.dataset.imgIndex);
        if (!Number.isInteger(draggedIndex) || !Number.isInteger(targetIndex) || draggedIndex === targetIndex) return;

        const reordered = [...images];
        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        try {
          for (let i = 0; i < reordered.length; i += 1) {
            const img = reordered[i];
            await requestJson(`${API_BASE}/product-images/${img.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                productId: img.productId,
                url: img.url,
                altText: img.altText || '',
                sortOrder: i
              })
            });
          }
          await renderProductImagesManager(productId);
          showMessage('Orden actualizado por drag and drop.');
        } catch (error) {
          showMessage(error.message, true);
        } finally {
          draggedIndex = null;
        }
      });
    });
  } catch (error) {
    container.innerHTML = `<p class="text-xs text-rose-300">${error.message}</p>`;
  }
}

function setupPageImageUI() {
  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  const imageFilesInput = document.getElementById('page-images-files');
  if (!imageUrlInput || !imageFilesInput) return;

  imageFilesInput.addEventListener('change', () => {
    const files = Array.from(imageFilesInput.files || []);
    const valid = files.filter((file) => file.type && file.type.startsWith('image/'));
    pageUploadFiles = valid;
    pagePrimaryIndex = 0;
    renderPageUploadPreview(valid);
  });

  renderPageUploadPreview([]);
  setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });

  if (editingId) {
    renderPageImagesManager(editingId);
  }
}

async function processPendingPageImages(pageId) {
  const files = pageUploadFiles;
  if (!Array.isArray(files) || !files.length) return { created: 0, principalUrl: null };

  const rows = await requestJson(`${API_BASE}/page-images`);
  const currentImages = Array.isArray(rows) ? rows.filter((img) => Number(img.pageId) === Number(pageId)) : [];
  const maxSort = currentImages.reduce((max, img) => Math.max(max, Number(img.sortOrder || 0)), -1);
  const startSort = maxSort + 1;

  const uploadedUrls = [];
  let created = 0;
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file || !file.type || !file.type.startsWith('image/')) continue;

    setProductUploadProgress({
      active: true,
      current: i + 1,
      total: files.length,
      message: `Subiendo ${i + 1}/${files.length}: ${file.name}`
    });

    const url = await uploadImageFile(file, 'page', pageId);
    if (!url) continue;
    uploadedUrls.push(url);

    await requestJson(`${API_BASE}/page-images`, {
      method: 'POST',
      body: JSON.stringify({
        pageId,
        url,
        altText: file?.name || 'imagen',
        sortOrder: startSort + i
      })
    });
    created += 1;
  }

  if (!created || !uploadedUrls.length) {
    throw new Error('No se subieron imagenes validas.');
  }

  const principalUrl = uploadedUrls[pagePrimaryIndex] || uploadedUrls[0];
  if (principalUrl) {
    await requestJson(`${API_BASE}/pages/${pageId}/image`, {
      method: 'PATCH',
      body: JSON.stringify({ imageUrl: principalUrl })
    });
  }

  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  if (imageUrlInput && principalUrl) {
    imageUrlInput.value = principalUrl;
  }

  const imageFilesInput = document.getElementById('page-images-files');
  if (imageFilesInput) imageFilesInput.value = '';
  pageUploadFiles = [];
  pagePrimaryIndex = 0;
  renderPageUploadPreview([]);
  setProductUploadProgress({ active: false, message: `Subida completa: ${created} imagen(es).` });

  return { created, principalUrl };
}

async function renderPageImagesManager(pageId) {
  const container = document.getElementById('page-images-manager');
  if (!container || !pageId) return;

  try {
    const rows = await requestJson(`${API_BASE}/page-images`);
    const images = Array.isArray(rows)
      ? rows
          .filter((img) => Number(img.pageId) === Number(pageId))
          .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(a.id) - Number(b.id))
      : [];

    if (!images.length) {
      container.innerHTML = '<p class="text-xs text-slate-400">Esta pagina aun no tiene galeria.</p>';
      return;
    }

    container.innerHTML = images
      .map(
        (img, index) => `
      <article class="page-image-item rounded-xl border border-white/10 bg-slate-900/60 p-2" draggable="true" data-img-id="${img.id}" data-img-index="${index}">
        <img src="${img.url}" alt="${img.altText || 'img'}" class="h-24 w-full rounded-lg object-cover" />
        <p class="mt-1 truncate text-[11px] text-slate-400">${img.url}</p>
        <div class="mt-2 flex gap-1">
          <button type="button" data-img-main="${img.id}" class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-sky-300/40 text-sky-200" aria-label="Marcar principal" data-tooltip="Principal">
            <span class="lucide h-3.5 w-3.5" data-lucide="star"></span>
          </button>
          <button type="button" data-img-up="${img.id}" class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 text-slate-100" aria-label="Mover arriba" data-tooltip="Subir">
            <span class="lucide h-3.5 w-3.5" data-lucide="arrow-up"></span>
          </button>
          <button type="button" data-img-down="${img.id}" class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 text-slate-100" aria-label="Mover abajo" data-tooltip="Bajar">
            <span class="lucide h-3.5 w-3.5" data-lucide="arrow-down"></span>
          </button>
          <button type="button" data-img-del="${img.id}" class="has-tooltip inline-flex h-7 w-7 items-center justify-center rounded border border-rose-400/40 text-rose-300" aria-label="Borrar imagen" data-tooltip="Borrar">
            <span class="lucide h-3.5 w-3.5" data-lucide="trash-2"></span>
          </button>
          <span class="ml-auto text-[11px] text-slate-500">#${index + 1}</span>
        </div>
      </article>
    `
      )
      .join('');

    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }

    container.querySelectorAll('[data-img-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const imageId = Number(btn.dataset.imgDel);
        if (!confirm(`Eliminar imagen ${imageId}?`)) return;
        try {
          await requestJson(`${API_BASE}/page-images/${imageId}`, { method: 'DELETE' });
          await renderPageImagesManager(pageId);
          showMessage(`Imagen ${imageId} eliminada.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });

    container.querySelectorAll('[data-img-main]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const imageId = Number(btn.dataset.imgMain);
        const selected = images.find((img) => Number(img.id) === imageId);
        if (!selected) return;
        try {
          await requestJson(`${API_BASE}/pages/${pageId}/image`, {
            method: 'PATCH',
            body: JSON.stringify({
              imageUrl: selected.url
            })
          });
          const imageUrlInput = formEl.elements.namedItem('imageUrl');
          if (imageUrlInput) imageUrlInput.value = selected.url;
          showMessage(`Imagen ${imageId} marcada como principal.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });

    const move = async (imageId, direction) => {
      const current = images.find((img) => Number(img.id) === Number(imageId));
      if (!current) return;
      const idx = images.findIndex((img) => Number(img.id) === Number(imageId));
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= images.length) return;
      const target = images[swapIdx];
      try {
        await requestJson(`${API_BASE}/page-images/${current.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            pageId: current.pageId,
            url: current.url,
            altText: current.altText || '',
            sortOrder: target.sortOrder
          })
        });
        await requestJson(`${API_BASE}/page-images/${target.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            pageId: target.pageId,
            url: target.url,
            altText: target.altText || '',
            sortOrder: current.sortOrder
          })
        });
        await renderPageImagesManager(pageId);
        showMessage('Orden de imagenes actualizado.');
      } catch (error) {
        showMessage(error.message, true);
      }
    };

    container.querySelectorAll('[data-img-up]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await move(Number(btn.dataset.imgUp), 'up');
      });
    });

    container.querySelectorAll('[data-img-down]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await move(Number(btn.dataset.imgDown), 'down');
      });
    });

    const items = Array.from(container.querySelectorAll('.page-image-item'));
    let draggedIndex = null;
    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        draggedIndex = Number(item.dataset.imgIndex);
      });
      item.addEventListener('dragover', (event) => {
        event.preventDefault();
      });
      item.addEventListener('drop', async (event) => {
        event.preventDefault();
        const targetIndex = Number(item.dataset.imgIndex);
        if (!Number.isInteger(draggedIndex) || !Number.isInteger(targetIndex) || draggedIndex === targetIndex) return;

        const reordered = [...images];
        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        try {
          for (let i = 0; i < reordered.length; i += 1) {
            const img = reordered[i];
            await requestJson(`${API_BASE}/page-images/${img.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                pageId: img.pageId,
                url: img.url,
                altText: img.altText || '',
                sortOrder: i
              })
            });
          }
          await renderPageImagesManager(pageId);
          showMessage('Orden actualizado por drag and drop.');
        } catch (error) {
          showMessage(error.message, true);
        } finally {
          draggedIndex = null;
        }
      });
    });
  } catch (error) {
    container.innerHTML = `<p class="text-xs text-rose-300">${error.message}</p>`;
  }
}

function setupImageUploadUI() {
  const fileInput = formEl.elements.namedItem('imageFile');
  const filesInput = formEl.elements.namedItem('imageFiles');
  const urlInput = formEl.elements.namedItem('url');
  const uploadBtn = document.getElementById('upload-image-btn');
  const uploadManyBtn = document.getElementById('upload-images-btn');
  const productIdInput = formEl.elements.namedItem('productId');

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        updateImagePreview(urlInput.value);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        updateImagePreview(urlInput.value || '');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showMessage('El archivo debe ser de tipo imagen.', true);
        fileInput.value = '';
        updateImagePreview(urlInput.value || '');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      updateImagePreview(objectUrl);
    });
  }

  if (filesInput) {
    filesInput.addEventListener('change', () => {
      const files = Array.from(filesInput.files || []);
      renderMultiPreview(files);
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput && fileInput.files && fileInput.files[0];
      if (!file) {
        showMessage('Selecciona una imagen antes de subir.', true);
        return;
      }

      if (!urlInput) {
        showMessage('No se encontro el campo URL para asignar la imagen.', true);
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Subiendo...';

      try {
        const currentProductId = Number(productIdInput ? productIdInput.value : 0);
        const targetProductId =
          Number.isInteger(currentProductId) && currentProductId > 0 ? currentProductId : null;
        const uploadedUrl = await uploadImageFile(file, targetProductId);
        if (!uploadedUrl) return;

        urlInput.value = uploadedUrl;
        updateImagePreview(urlInput.value);

        if (activeView === 'product-images' && editingId) {
          const altTextInput = formEl.elements.namedItem('altText');
          const sortOrderInput = formEl.elements.namedItem('sortOrder');

          await requestJson(`${API_BASE}/product-images/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify({
              productId: productIdInput ? productIdInput.value : '',
              url: urlInput.value,
              altText: altTextInput ? altTextInput.value : '',
              sortOrder: sortOrderInput ? sortOrderInput.value : 0
            })
          });

          await renderRows();
          showMessage(`Imagen subida y URL actualizada en DB para ID ${editingId}.`);
        } else {
          showMessage('Imagen subida correctamente.');
        }
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Subir imagen';
      }
    });
  }

  if (uploadManyBtn) {
    uploadManyBtn.addEventListener('click', async () => {
      const files = Array.from((filesInput && filesInput.files) || []);
      if (!files.length) {
        showMessage('Selecciona varias imagenes para subir.', true);
        return;
      }

      uploadManyBtn.disabled = true;
      uploadManyBtn.textContent = 'Subiendo...';

      try {
        const created = await uploadMultipleProductImages(files);
        if (filesInput) filesInput.value = '';
        renderMultiPreview([]);
        await renderRows();
        showMessage(`Se subieron y guardaron ${created} imagen(es) en la base de datos.`);
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        uploadManyBtn.disabled = false;
        uploadManyBtn.textContent = 'Subir varias y crear registros';
      }
    });
  }
}

function renderForm() {
  const cfg = getConfig();
  const fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  const tabsHtml = Array.isArray(cfg.tabs) && cfg.tabs.length
    ? `
      <div id="form-tabs" class="sm:col-span-2 mb-2 flex flex-wrap gap-2">
        ${cfg.tabs
          .map(
            (tab) => `
          <button
            type="button"
            data-form-tab="${tab.id}"
            class="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-300 transition hover:border-sky-300/40 hover:text-white"
          >
            ${tab.label}
          </button>
        `
          )
          .join('')}
      </div>
    `
    : '';

  let html = fields
    .map((field) => {
      const colClass = field.colSpan === 2 ? 'sm:col-span-2' : '';
      const tabClass = field.tab ? 'form-tab-item' : '';
      const tabAttr = field.tab ? `data-field-tab="${field.tab}"` : '';
      const placeholderAttr = field.placeholder ? `placeholder="${field.placeholder}"` : '';
      const hasLengthHint = Number.isInteger(field.recommendedMin) || Number.isInteger(field.recommendedMax);
      const lengthHintId = hasLengthHint ? `length-hint-${field.key}` : '';
      const hintMin = Number(field.recommendedMin || 0);
      const hintMax = Number(field.recommendedMax || 0);
      const lengthAttrs = hasLengthHint
        ? `data-length-target="${lengthHintId}" data-length-min="${hintMin}" data-length-max="${hintMax}"`
        : '';
      let optimalHint = '';
      if (hasLengthHint) {
        if (hintMin > 0 && hintMax > 0) {
          optimalHint = `<p class="mt-1 text-[11px] text-slate-500">Optimo: ${hintMin}-${hintMax} caracteres</p>`;
        } else if (hintMax > 0) {
          optimalHint = `<p class="mt-1 text-[11px] text-slate-500">Maximo recomendado: ${hintMax} caracteres</p>`;
        } else if (hintMin > 0) {
          optimalHint = `<p class="mt-1 text-[11px] text-slate-500">Minimo recomendado: ${hintMin} caracteres</p>`;
        }
      }
      const helperText = field.helperText ? `<p class="mt-1 text-[11px] text-slate-400">${field.helperText}</p>` : '';
      const lengthHint = hasLengthHint ? `<p id="${lengthHintId}" class="mt-1 text-xs text-slate-400"></p>${optimalHint}` : '';

      if (field.type === 'textarea') {
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <textarea
              name="${field.key}"
              ${field.required ? 'required' : ''}
              ${placeholderAttr}
              ${lengthAttrs}
              rows="4"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
            ></textarea>
            ${lengthHint}
            ${helperText}
          </label>
        `;
      }

      if (field.type === 'wysi') {
        const inputId = `wysi-${field.key}`;
        return `
          <label ${tabAttr} data-wysi-scope="full" class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <textarea
              id="${inputId}"
              name="${field.key}"
              ${field.required ? 'required' : ''}
              ${placeholderAttr}
              rows="8"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
            ></textarea>
            ${helperText}
          </label>
        `;
      }

      if (field.type === 'wysi-min') {
        const inputId = `wysi-min-${field.key}`;
        return `
          <label ${tabAttr} data-wysi-scope="minimal" class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <textarea
              id="${inputId}"
              name="${field.key}"
              ${field.required ? 'required' : ''}
              ${placeholderAttr}
              rows="5"
              class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
            ></textarea>
            ${helperText}
          </label>
        `;
      }

      if (field.type === 'file' || field.type === 'file-multiple') {
        const isMultiple = field.type === 'file-multiple';
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <input name="${field.key}" type="file" accept="image/*" ${isMultiple ? 'multiple' : ''} ${field.required ? 'required' : ''} class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
          </label>
        `;
      }

      if (field.type === 'section') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2">
            <p class="text-xs uppercase tracking-wide text-slate-400">${field.label}</p>
            ${field.description ? `<p class="mt-1 text-xs text-slate-300">${field.description}</p>` : ''}
          </div>
        `;
      }

      if (field.type === 'og-images') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
            <input name="${field.key}" type="hidden" />
            <div>
              <p class="text-sm text-slate-200">${field.label}</p>
              <p class="mt-1 text-xs text-slate-400">
                Recommended: 1200x630 pixels for optimal display on Facebook and LinkedIn.
              </p>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              <label class="text-sm text-slate-200">
                URL Imagen
                <input
                  id="og-image-url-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <label class="text-sm text-slate-200">
                Upload Image
                <input id="og-image-file-input" type="file" accept="image/*" class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
              </label>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="og-image-upload-btn"
                class="rounded-xl border border-sky-300/30 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35"
              >
                Subir imagen
              </button>
              <button
                type="button"
                id="og-image-add-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                + Add Another Image
              </button>
            </div>
            <div id="og-images-list" class="grid gap-2 sm:grid-cols-2"></div>
          </div>
        `;
      }

      if (field.type === 'twitter-image') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
            <input name="${field.key}" type="hidden" />
            <div>
              <p class="text-sm text-slate-200">${field.label}</p>
              <p class="mt-1 text-xs text-slate-400">Recommended: 1200x628 pixels (1.91:1 ratio).</p>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              <label class="text-sm text-slate-200">
                Image URL
                <input
                  id="twitter-image-url-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <label class="text-sm text-slate-200">
                Upload Image
                <input id="twitter-image-file-input" type="file" accept="image/*" class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
              </label>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="twitter-image-upload-btn"
                class="rounded-xl border border-sky-300/30 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35"
              >
                Subir imagen
              </button>
              <button
                type="button"
                id="twitter-image-set-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                Usar URL
              </button>
              <button
                type="button"
                id="twitter-image-clear-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                Limpiar
              </button>
            </div>
            <div class="rounded-xl border border-white/10 bg-slate-900/50 p-2">
              <img id="twitter-image-preview" alt="Preview Twitter image" class="hidden h-36 w-full rounded-lg object-cover" />
              <p id="twitter-image-empty" class="text-xs text-slate-400">Sin imagen configurada.</p>
              <p id="twitter-image-current-url" class="mt-1 truncate text-[11px] text-slate-500"></p>
            </div>
          </div>
        `;
      }

      if (field.type === 'hreflang-list') {
        return `
          <div ${tabAttr} class="${colClass} ${tabClass} rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
            <input name="${field.key}" type="hidden" />
            <div>
              <p class="text-sm text-slate-200">${field.label}</p>
              <p class="mt-1 text-xs text-slate-400">Multi-language alternate URLs (ej: en, es-AR, x-default).</p>
            </div>
            <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_2fr_auto] sm:items-end">
              <label class="text-sm text-slate-200">
                Language
                <input
                  id="hreflang-lang-input"
                  type="text"
                  placeholder="en"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <label class="text-sm text-slate-200">
                URL
                <input
                  id="hreflang-url-input"
                  type="url"
                  placeholder="https://example.com/en/"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                id="hreflang-add-btn"
                class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70"
              >
                + Add
              </button>
            </div>
            <div id="hreflang-list" class="grid gap-2 sm:grid-cols-2"></div>
          </div>
        `;
      }

      if (field.type === 'hidden') {
        let hiddenHtml = `<input name="${field.key}" type="hidden" />`;

        if (activeView === 'products' && field.key === 'imageUrl') {
          hiddenHtml += `
            <div class="sm:col-span-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
              <div class="grid gap-2 sm:grid-cols-2">
                <label class="text-sm text-slate-200">
                  Cargar imagenes
                  <input id="product-images-files" type="file" accept="image/*" multiple class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
                </label>
                <div class="text-xs text-slate-400 flex items-end pb-2">Elegi la principal en las previews antes de subir.</div>
              </div>
              <p class="text-xs text-slate-400">Las imagenes seleccionadas se suben al presionar Guardar.</p>
              <div class="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2">
                <span id="product-upload-spinner" class="hidden h-4 w-4 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300"></span>
                <span id="product-upload-status" class="text-xs text-slate-300">Sin tareas pendientes.</span>
              </div>
              <div id="product-upload-preview-list" class="grid gap-2 sm:grid-cols-2"></div>
              <div>
                <p class="mb-1 text-xs uppercase tracking-wide text-slate-400">Galeria asociada</p>
                <div id="product-images-manager" class="grid gap-2 sm:grid-cols-2"></div>
              </div>
            </div>
          `;
        }

        if (activeView === 'pages' && field.key === 'imageUrl') {
          hiddenHtml += `
            <div class="sm:col-span-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
              <div class="grid gap-2 sm:grid-cols-2">
                <label class="text-sm text-slate-200">
                  Cargar imagenes
                  <input id="page-images-files" type="file" accept="image/*" multiple class="file-picker mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
                </label>
                <div class="text-xs text-slate-400 flex items-end pb-2">Elegi la principal en las previews antes de subir.</div>
              </div>
              <p class="text-xs text-slate-400">Las imagenes seleccionadas se suben al presionar Guardar.</p>
              <div class="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2">
                <span id="product-upload-spinner" class="hidden h-4 w-4 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300"></span>
                <span id="product-upload-status" class="text-xs text-slate-300">Sin tareas pendientes.</span>
              </div>
              <div id="page-upload-preview-list" class="grid gap-2 sm:grid-cols-2"></div>
              <div>
                <p class="mb-1 text-xs uppercase tracking-wide text-slate-400">Galeria asociada</p>
                <div id="page-images-manager" class="grid gap-2 sm:grid-cols-2"></div>
              </div>
            </div>
          `;
        }

        return hiddenHtml;
      }

      if (field.type === 'select') {
        const optionsHtml = Array.isArray(field.options) && field.options.length
          ? field.options
              .map((option) => {
                if (typeof option === 'string') {
                  return `<option value="${option}">${option}</option>`;
                }
                return `<option value="${option.value}">${option.label}</option>`;
              })
              .join('')
          : '<option value="">Cargando...</option>';
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <select name="${field.key}" ${field.required ? 'required' : ''} class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
              ${optionsHtml}
            </select>
            ${helperText}
          </label>
        `;
      }

      if (field.type === 'switch') {
        const switchId = `switch-${field.key}`;
        return `
          <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
            ${field.label}
            <div class="mt-2 flex items-center gap-3">
              <label for="${switchId}" class="inline-flex cursor-pointer items-center">
                <input id="${switchId}" name="${field.key}" type="checkbox" class="peer sr-only" />
                <span class="relative h-6 w-11 rounded-full bg-slate-700/80 transition peer-checked:bg-sky-500/70 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400/60 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5"></span>
              </label>
              <span class="text-xs text-slate-400">${field.helper || ''}</span>
            </div>
          </label>
        `;
      }

      return `
        <label ${tabAttr} class="text-sm text-slate-200 ${colClass} ${tabClass}">
          ${field.label}
          <input
            name="${field.key}"
            type="${field.type}"
            ${field.required ? 'required' : ''}
            ${placeholderAttr}
            ${lengthAttrs}
            class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
          />
          ${lengthHint}
          ${helperText}
        </label>
      `;
    })
    .join('');

  if (activeView === 'product-images') {
    html += `
      <div class="sm:col-span-2 rounded-xl border border-white/10 bg-slate-950/40 p-3 space-y-3">
        <label class="block text-sm text-slate-200">
          Seleccionar producto
          <select id="product-id-select" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
            <option value="">Cargando productos...</option>
          </select>
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" id="upload-image-btn" class="rounded-xl border border-sky-300/30 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35">
            Subir imagen
          </button>
          <button type="button" id="upload-images-btn" class="rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/70">
            Subir varias y crear registros
          </button>
          <span class="text-xs text-slate-400">Solo image/* hasta 5MB por archivo</span>
        </div>
        <img id="image-preview" alt="Vista previa" class="hidden h-40 w-full rounded-xl border border-white/10 object-cover" />
        <div id="images-preview-list" class="grid grid-cols-4 gap-2"></div>
      </div>
    `;
  }

  if (activeView === 'settings') {
    html += `
      <div data-field-tab="seo-images" class="form-tab-item sm:col-span-2 rounded-xl border border-sky-300/20 bg-sky-500/10 p-3">
        <p class="text-xs uppercase tracking-wide text-sky-200">Alt de imagenes</p>
        <p class="mt-1 text-xs text-slate-300">
          Regenera descripciones ALT en todas las imagenes de productos a partir de nombre, categoria y descripcion.
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <button
            id="seo-images-regenerate-alt-btn"
            type="button"
            class="rounded-xl border border-sky-300/35 bg-sky-500/20 px-3 py-2 text-sm text-sky-100 transition hover:bg-sky-500/35"
          >
            Regenerar ALT global
          </button>
          <span id="seo-images-regenerate-alt-status" class="text-xs text-slate-400">Sin ejecutar.</span>
        </div>
      </div>
    `;
  }

  formEl.innerHTML = `${tabsHtml}${html}`;

  if (Array.isArray(cfg.tabs) && cfg.tabs.length) {
    setupFormTabs(cfg);
  }

  setupLengthHints();

  if (activeView === 'settings') {
    setupOgImagesUI();
    setupTwitterImageUI();
    setupHreflangUI();
    setupTechFilesSwitchesUI();
    setupSeoAltRegeneratorUI();
  }

  if (activeView === 'product-images') {
    setupImageUploadUI();
    populateProductSelector();
  }
  if (activeView === 'products') {
    setupProductImageUI();
    populateProductCategorySelect();
    void setupProductDescriptionWysiEditor();
  }
  if (activeView === 'pages') {
    setupPageImageUI();
    void setupPageWysiEditor();
  }
}

function renderTableHead() {
  const cfg = getConfig();
  if (cfg.dashboard) {
    headEl.innerHTML = '';
    return;
  }

  const iconByColumn = {
    id: 'hash',
    name: 'type',
    slug: 'tag',
    icon: 'sparkles',
    category: 'shapes',
    priceArs: 'badge-dollar-sign',
    description: 'align-left',
    imageUrl: 'image',
    username: 'at-sign',
    fullName: 'user-round',
    role: 'shield-check',
    isActive: 'toggle-right',
    createdAt: 'calendar-clock',
    updatedAt: 'history',
    title: 'heading',
    contentHtml: 'file-text',
    customerName: 'user-round',
    customerPhone: 'phone',
    customerProvince: 'map-pinned',
    customerCity: 'building-2',
    deliveryType: 'truck',
    totalArs: 'wallet',
    itemCount: 'package'
  };

  headEl.innerHTML = [
    ...cfg.columns.map((col) => {
      const icon = iconByColumn[col] || 'circle';
      return `
        <th class="px-3 py-2 text-center">
          <span class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-900/60 text-slate-200" data-tooltip="${col}">
            <span class="lucide h-4 w-4" data-lucide="${icon}" aria-hidden="true"></span>
          </span>
        </th>
      `;
    }),
    `
      <th class="px-3 py-2 text-center">
        <span class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-900/60 text-slate-200" data-tooltip="acciones">
          <span class="lucide h-4 w-4" data-lucide="settings-2" aria-hidden="true"></span>
        </span>
      </th>
    `
  ].join('');

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

function fillForm(item) {
  const cfg = getConfig();
  const fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  fields.forEach((field) => {
    const input = formEl.elements.namedItem(field.key);
    if (field.type === 'file' || field.type === 'file-multiple' || field.type === 'section') return;
    if (field.type === 'og-images') {
      ogImagesState = parseOgImagesValue(item[field.key]);
      renderOgImagesList();
      return;
    }
    if (field.type === 'twitter-image') {
      setTwitterImage(item[field.key] || '');
      const urlInput = document.getElementById('twitter-image-url-input');
      if (urlInput) urlInput.value = twitterImageState;
      return;
    }
    if (field.type === 'hreflang-list') {
      hreflangState = parseHreflangValue(item[field.key]);
      renderHreflangList();
      return;
    }
    if (!input) return;
    setFieldValue(field, input, item[field.key] ?? '');
  });

  if (activeView === 'product-images') {
    updateImagePreview(item.url || '');
  }
  if (activeView === 'products') {
    populateProductCategorySelect(item.category || '');
    const descriptionInput = formEl.elements.namedItem('description');
    if (descriptionInput) {
      syncWysiEditableFromTextarea(descriptionInput);
      if (descriptionInput.dataset.wysiReady !== '1') {
        void setupProductDescriptionWysiEditor();
      } else {
        applyMinimalWysiToolbar(descriptionInput);
      }
    }
    const productId = Number(item.id || editingId || 0);
    if (Number.isInteger(productId) && productId > 0) {
      renderProductImagesManager(productId);
    }
  }
  if (activeView === 'pages') {
    const pageId = Number(item.id || editingId || 0);
    const contentInput = formEl.elements.namedItem('contentHtml');
    if (contentInput) {
      syncWysiEditableFromTextarea(contentInput);
      if (contentInput.dataset.wysiReady !== '1') {
        void setupPageWysiEditor();
      }
    }
    if (Number.isInteger(pageId) && pageId > 0) {
      renderPageImagesManager(pageId);
    }
  }
  if (activeView === 'settings') {
    applyTechFilesSwitchState();
  }

  formEl.querySelectorAll('[data-length-target]').forEach((input) => {
    updateLengthHint(input);
  });
}

function clearForm() {
  const cfg = getConfig();
  editingId = null;
  productUploadFiles = [];
  productPrimaryIndex = 0;
  pageUploadFiles = [];
  pagePrimaryIndex = 0;
  ogImagesState = [];
  twitterImageState = '';
  hreflangState = [];
  if (formEl) formEl.reset();
  if (activeView === 'product-images') {
    updateImagePreview('');
    renderMultiPreview([]);
  }
  if (activeView === 'products') {
    const imageUrlInput = formEl.elements.namedItem('imageUrl');
    if (imageUrlInput) imageUrlInput.value = '';
    const descriptionInput = formEl.elements.namedItem('description');
    if (descriptionInput) {
      descriptionInput.value = '';
      syncWysiEditableFromTextarea(descriptionInput);
      applyMinimalWysiToolbar(descriptionInput);
    }
    const imageFilesInput = document.getElementById('product-images-files');
    if (imageFilesInput) imageFilesInput.value = '';
    const imageManager = document.getElementById('product-images-manager');
    if (imageManager) imageManager.innerHTML = '<p class="text-xs text-slate-400">Guarda el producto para gestionar la galeria.</p>';
    renderProductUploadPreview([]);
    setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });
    void populateProductCategorySelect('');
  }
  if (activeView === 'pages') {
    const imageUrlInput = formEl.elements.namedItem('imageUrl');
    if (imageUrlInput) imageUrlInput.value = '';
    const contentInput = formEl.elements.namedItem('contentHtml');
    if (contentInput) {
      contentInput.value = '';
      syncWysiEditableFromTextarea(contentInput);
    }
    const imageFilesInput = document.getElementById('page-images-files');
    if (imageFilesInput) imageFilesInput.value = '';
    const imageManager = document.getElementById('page-images-manager');
    if (imageManager) imageManager.innerHTML = '<p class="text-xs text-slate-400">Guarda la pagina para gestionar la galeria.</p>';
    renderPageUploadPreview([]);
    setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });
  }
  if (activeView === 'settings') {
    renderOgImagesList();
    renderTwitterImagePreview();
    renderHreflangList();
    applyTechFilesSwitchState();
  }
  formEl.querySelectorAll('[data-length-target]').forEach((input) => {
    updateLengthHint(input);
  });
  showMessage('Formulario limpio.');
  if (formTitle) {
    formTitle.textContent = cfg.singleton ? 'Configuracion global' : `Nuevo ${cfg.title}`;
  }
}

function setSettingsInlineMode(enabled) {
  const next = Boolean(enabled);
  if (next === settingsInlineMode) return;
  settingsInlineMode = next;

  if (settingsInlineMode) {
    formBackdrop.classList.add('hidden');
    if (panelMain && formOffcanvas.parentElement !== panelMain) {
      panelMain.appendChild(formOffcanvas);
    }
    if (crudSection) {
      crudSection.classList.add('hidden');
    }
    if (closeFormBtn) {
      closeFormBtn.classList.add('hidden');
    }

    formOffcanvas.classList.remove('fixed', 'inset-y-0', 'right-0', 'z-40', 'max-w-xl', 'translate-x-full', 'border-l', 'shadow-2xl');
    formOffcanvas.classList.add('relative', 'w-full', 'max-w-none', 'rounded-2xl', 'border', 'border-white/10', 'bg-slate-900/75');
    formOffcanvas.style.transform = 'none';
    formOffcanvas.style.maxHeight = 'none';
    formOffcanvas.style.height = 'auto';
    return;
  }

  if (defaultFormParent && formOffcanvas.parentElement !== defaultFormParent) {
    defaultFormParent.appendChild(formOffcanvas);
  }
  if (crudSection) {
    crudSection.classList.remove('hidden');
  }
  if (closeFormBtn) {
    closeFormBtn.classList.remove('hidden');
  }

  formOffcanvas.classList.remove('relative', 'max-w-none', 'rounded-2xl', 'border');
  formOffcanvas.classList.add('fixed', 'inset-y-0', 'right-0', 'z-40', 'max-w-xl', 'translate-x-full', 'border-l', 'shadow-2xl');
  formOffcanvas.style.transform = '';
  formOffcanvas.style.maxHeight = '';
  formOffcanvas.style.height = '';
}

function openForm() {
  if (settingsInlineMode) return;
  formOffcanvas.classList.remove('translate-x-full');
  formBackdrop.classList.remove('hidden');
  if (activeView === 'products') {
    void setupProductDescriptionWysiEditor();
  }
  if (activeView === 'pages') {
    void setupPageWysiEditor();
  }
}

function closeForm() {
  if (settingsInlineMode) {
    formBackdrop.classList.add('hidden');
    return;
  }
  formOffcanvas.classList.add('translate-x-full');
  formBackdrop.classList.add('hidden');
}

async function requestJson(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return null;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Error de API.');
  return data;
}

async function renderRows() {
  const cfg = getConfig();
  if (cfg.dashboard) {
    const summary = await requestJson(`${API_BASE}/${cfg.endpoint}`);
    if (!summary) return [];
    renderDashboardSummary(summary);
    return [summary];
  }

  const rows = await requestJson(`${API_BASE}/${cfg.endpoint}`);
  if (!rows) return [];

  bodyEl.innerHTML = rows
    .map((row) => {
      const dataCols = cfg.columns
        .map((col) => {
          if (activeView === 'categories' && col === 'icon') {
            const iconName = normalizeLucideIconName(row[col] || 'tag');
            return `
              <td class="border-b border-white/10 px-3 py-2">
                <span class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-slate-900/60 text-slate-200" data-tooltip="${iconName}">
                  <span class="lucide h-4 w-4" data-lucide="${iconName}" aria-hidden="true"></span>
                </span>
              </td>
            `;
          }
          return `<td class="border-b border-white/10 px-3 py-2">${row[col] ?? ''}</td>`;
        })
        .join('');
      const actionButtons = cfg.singleton
        ? `
          <button
            data-edit="${row[cfg.idKey]}"
            class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-slate-100"
            aria-label="Editar"
            data-tooltip="Editar"
          >
            <span class="lucide h-4 w-4" data-lucide="pencil" aria-hidden="true"></span>
          </button>
        `
        : `
              ${
                activeView === 'orders'
                  ? `
                    <button
                      data-order-detail="${row[cfg.idKey]}"
                      class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-300/30 bg-sky-500/20 text-sky-100"
                      aria-label="Ver detalle"
                      data-tooltip="Ver detalle"
                    >
                      <span class="lucide h-4 w-4" data-lucide="file-search" aria-hidden="true"></span>
                    </button>
                  `
                  : ''
              }
              <button
                data-edit="${row[cfg.idKey]}"
                class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-slate-100"
                aria-label="Editar"
                data-tooltip="Editar"
              >
                <span class="lucide h-4 w-4" data-lucide="pencil" aria-hidden="true"></span>
              </button>
              <button
                data-delete="${row[cfg.idKey]}"
                class="has-tooltip inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/40 text-rose-300"
                aria-label="Borrar"
                data-tooltip="Borrar"
              >
                <span class="lucide h-4 w-4" data-lucide="trash-2" aria-hidden="true"></span>
              </button>
            `;
      return `
        <tr class="text-slate-200">
          ${dataCols}
          <td class="border-b border-white/10 px-3 py-2">
            <div class="flex gap-2">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }

  bodyEl.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.edit);
      const row = rows.find((r) => Number(r[cfg.idKey]) === id);
      if (!row) return;
      editingId = id;
      fillForm(row);
      if (formTitle) formTitle.textContent = cfg.singleton ? 'Configuracion global' : `Editar ${cfg.title}`;
      if (!settingsInlineMode) {
        openForm();
      }
      showMessage(`Editando ID ${id}`);
    });
  });

  if (!cfg.singleton) {
    if (activeView === 'orders') {
      bodyEl.querySelectorAll('[data-order-detail]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.orderDetail);
          const row = rows.find((r) => Number(r[cfg.idKey]) === id);
          if (!row) return;
          openOrderDetailModal(row);
        });
      });
    }

    bodyEl.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.delete);
        if (!confirm(`Eliminar registro ${id}?`)) return;
        try {
          await requestJson(`${API_BASE}/${cfg.endpoint}/${id}`, { method: 'DELETE' });
          await renderRows();
          showMessage(`Registro ${id} eliminado.`);
        } catch (error) {
          showMessage(error.message, true);
        }
      });
    });
  }

  return rows;
}

async function saveItem() {
  const cfg = getConfig();
  if (cfg.dashboard) {
    showMessage('Dashboard en modo solo lectura.');
    return;
  }
  const payload = {};
  const fields = Array.isArray(cfg.fields) ? cfg.fields : [];
  fields.forEach((field) => {
    const input = formEl.elements.namedItem(field.key);
    if (field.type === 'file' || field.type === 'file-multiple' || field.type === 'section') return;
    payload[field.key] = getFieldValue(field, input);
  });

  if (activeView === 'products' && !editingId && productUploadFiles.length && !String(payload.imageUrl || '').trim()) {
    payload.imageUrl = '/uploads/pending-product-image.jpg';
  }
  if (activeView === 'pages' && !editingId && pageUploadFiles.length && !String(payload.imageUrl || '').trim()) {
    payload.imageUrl = '/uploads/pending-page-image.jpg';
  }

  try {
    const saveBtnLabel = saveBtn ? saveBtn.textContent : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando...';
    }

    let saved = null;
    let targetId = editingId;

    if (cfg.singleton) {
      const singletonId = Number.isInteger(Number(editingId)) && Number(editingId) > 0 ? Number(editingId) : 1;
      saved = await requestJson(`${API_BASE}/${cfg.endpoint}/${singletonId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      editingId = singletonId;
      if (saved) fillForm(saved);
      showMessage('Configuracion actualizada.');
      await renderRows();
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = saveBtnLabel || 'Guardar';
      }
      return;
    }

    if (editingId) {
      saved = await requestJson(`${API_BASE}/${cfg.endpoint}/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showMessage(`Registro ${editingId} actualizado.`);
    } else {
      saved = await requestJson(`${API_BASE}/${cfg.endpoint}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showMessage('Registro creado.');
      if (saved && Number.isInteger(Number(saved.id))) {
        targetId = Number(saved.id);
      }
    }

    if (activeView === 'products' && Number.isInteger(Number(targetId)) && Number(targetId) > 0 && productUploadFiles.length) {
      const uploadResult = await processPendingProductImages(Number(targetId));
      if (uploadResult.created > 0) {
        showMessage(`Producto guardado. Se subieron ${uploadResult.created} imagen(es).`);
      }
    }
    if (activeView === 'pages' && Number.isInteger(Number(targetId)) && Number(targetId) > 0 && pageUploadFiles.length) {
      const uploadResult = await processPendingPageImages(Number(targetId));
      if (uploadResult.created > 0) {
        showMessage(`Pagina guardada. Se subieron ${uploadResult.created} imagen(es).`);
      }
    }

    clearForm();
    await renderRows();
    closeForm();
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = saveBtnLabel || 'Guardar';
    }
  } catch (error) {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Guardar';
    }
    setProductUploadProgress({ active: false, message: 'Error durante la subida.' });
    showMessage(error.message, true);
  }
}

function activateNav() {
  navRoot.querySelectorAll('[data-view]').forEach((btn) => {
    const active = btn.dataset.view === activeView;
    btn.classList.toggle('bg-sky-500/25', active);
    btn.classList.toggle('border-sky-300/60', active);
  });
}

async function switchView(nextView) {
  if (!viewConfig[nextView]) return;
  stopDashboardAutoRefresh();
  destroyDashboardLottie();
  destroyDashboardCharts();

  activeView = nextView;
  editingId = null;
  activeFormTab = null;

  const url = new URL(window.location.href);
  url.searchParams.set('view', activeView);
  window.history.replaceState({}, '', `${url.pathname}?${url.searchParams.toString()}`);

  const cfg = getConfig();
  const isDashboard = Boolean(cfg.dashboard);
  setSettingsInlineMode(Boolean(cfg.singleton));
  viewTitle.textContent = cfg.title;
  newBtn.classList.toggle('hidden', Boolean(cfg.singleton) || isDashboard);
  saveBtn.classList.toggle('hidden', isDashboard);
  clearBtn.classList.toggle('hidden', isDashboard);
  refreshBtn.classList.remove('hidden');
  if (formTitle) {
    formTitle.textContent = cfg.singleton ? 'Configuracion global' : `Nuevo ${cfg.title}`;
  }
  renderForm();
  renderTableHead();
  activateNav();
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
  const rows = await renderRows();

  if (isDashboard) {
    startDashboardAutoRefresh();
    showMessage('Dashboard cargado.');
    return;
  }

  if (cfg.singleton && Array.isArray(rows) && rows.length) {
    const first = rows[0];
    const singletonId = Number(first[cfg.idKey]);
    if (Number.isInteger(singletonId) && singletonId > 0) {
      editingId = singletonId;
    }
    fillForm(first);
    if (formTitle) formTitle.textContent = 'Configuracion global';
    if (!settingsInlineMode) {
      openForm();
    }
    showMessage('Configuracion cargada.');
  }
}

async function setupLayoutParts() {
  topbarRoot.innerHTML = await loadPart('/panel/parts/topbar.html');
  navRoot.innerHTML = await loadPart('/panel/parts/nav.html');

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('panel_user');
      window.location.replace('/panel/login.html');
    });
  }

  navRoot.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await switchView(btn.dataset.view);
    });
  });
}

async function bootstrap() {
  await setupLayoutParts();
  await switchView(getInitialPanelView());

  saveBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    await saveItem();
  });

  clearBtn.addEventListener('click', () => clearForm());
  newBtn.addEventListener('click', () => {
    clearForm();
    openForm();
  });
  closeFormBtn.addEventListener('click', () => closeForm());
  formBackdrop.addEventListener('click', () => closeForm());
  refreshBtn.addEventListener('click', async () => {
    if (activeView === 'dashboard') {
      await refreshDashboardNow(true);
      return;
    }
    const rows = await renderRows();
    const cfg = getConfig();
    if (cfg.singleton && Array.isArray(rows) && rows.length) {
      const first = rows[0];
      const singletonId = Number(first[cfg.idKey]);
      if (Number.isInteger(singletonId) && singletonId > 0) {
        editingId = singletonId;
      }
      fillForm(first);
    }
    showMessage('Datos recargados.');
  });
}

window.addEventListener('beforeunload', () => {
  stopDashboardAutoRefresh();
  destroyDashboardLottie();
  destroyDashboardCharts();
});

bootstrap().catch((error) => {
  showMessage(error.message, true);
});
