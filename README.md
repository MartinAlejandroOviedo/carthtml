# SLStore (carthtml)

Tienda deportiva mobile-first con carrito, checkout por WhatsApp, panel administrativo y SEO configurable.

## Stack

- Node.js + Express
- SQLite (`data/store.sqlite`)
- Tailwind CSS (build local via CLI)
- Frontend vanilla JS
- Carga de imagenes con `multer` + `sharp`

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm

## Instalacion

```bash
npm install
```

## Scripts

- `npm run dev`: compila Tailwind y levanta el server
- `npm start`: igual que `dev`
- `npm run tw:build`: genera `public/tailwind.css` minificado
- `npm run tw:watch`: recompila Tailwind en modo watch

## Variables de entorno

- `PORT` (default `3000`)
- `STORE_NAME` (default `SLStore`)
- `WHATSAPP_NUMBER` (default `5491112345678`)

Ejemplo:

```bash
PORT=3000 STORE_NAME=SLStore WHATSAPP_NUMBER=5491112345678 npm run dev
```

## URLs principales

### Sitio publico

- `/` o `/index.html`: catalogo
- `/product.html?id=:id`: detalle de producto
- `/cart.html`: vista carrito
- `/help.html`: ayuda para armar pedido

### Seguridad (contenido)

- `/security.html` y `/seguridad.html`: render SEO de la pagina "security"
- `/api/pages/security`: contenido base para tabs de seguridad

### Panel

- `/panel`: dashboard CRUD
- `/panel/index.html?view=products`: dashboard con vista inicial controlada por query
- `/panel/security.html`: pagina de seguridad dentro del backend
- `/panel/security` y `/panel/seguridad`: alias a `panel/security.html`
- `/panel/login.html`: login

## Credenciales iniciales (seed)

- Usuario: `admin`
- Clave: `admin123`

Se crean automaticamente en `initDb()` si no existen.

## Flujo general

1. El cliente agrega productos al carrito.
2. El total incluye envio fijo en frontend (`$9500`).
3. Se envia pedido a `POST /api/orders`.
4. El cierre comercial final se hace por WhatsApp.

## Layout reutilizable

- Header y footer del sitio: `public/parts/header.html` y `public/parts/footer.html`
- Inyeccion dinamica desde `public/js/layout.js`

## Carga y gestion de imagenes

### Endpoints

- `POST /api/panel/uploads/image` (campo `image`)
- `POST /api/panel/uploads/images` (campo `images[]`, hasta 20)
- `GET /api/panel/uploads/health`

### Ubicacion de archivos

Las imagenes pueden guardarse en:

- Legacy: `public/uploads/`
- Tipadas: `public/uploads/images/:entityType/:entityId/`

Para productos, normalmente se usa:

- `public/uploads/images/product/:productId/`

### Variantes automaticas

Al subir una imagen se generan:

- Original: archivo subido
- Slider: `500x300` (`-slider.webp`)
- Card: `360x190` (`-card.webp`)

### Borrado de variantes

Cuando se elimina una imagen asociada, el server elimina la familia completa (original + variantes) basada en el nombre base.

## SEO configurable

La configuracion global esta en `settings` y se administra desde el panel.

Modulos principales:

- HTML Meta Tags
- Open Graph
- Twitter Cards
- Advanced Tags
- Schema Markup
- Google 2026
- SEO Imagenes
- Sitemap / robots.txt / htaccess

Archivos y rutas tecnicas:

- `/sitemap.xml` (dinamico, configurable)
- `/robots.txt` (configurable con placeholders)
- `/htaccess.txt` (export de reglas para Apache)

Placeholders comunes:

- `{{baseUrl}}`
- `{{siteUrl}}`
- `{{sitemapUrl}}`

## Seguridad (backend)

La pagina del panel `/panel/security.html` muestra contenido tabulado de seguridad cargado desde la tabla `pages` (slug `security`).

Tabs actuales:

- Anti Scrape
- Hardening
- Deteccion
- Legal

## API (resumen)

Publica:

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/orders`
- `GET /api/pages/:slug`

Panel CRUD:

- `POST /api/panel/login`
- `GET/POST/PUT/DELETE /api/panel/users`
- `GET /api/panel/settings`
- `PUT /api/panel/settings/:id`
- `GET/POST/PUT/DELETE /api/panel/categories`
- `GET/POST/PUT/DELETE /api/panel/product-images`
- `GET/POST/PUT/DELETE /api/panel/pages`
- `GET/POST/PUT/DELETE /api/panel/products`
- `PATCH /api/panel/products/:id/image`

## Estructura relevante

- `server.js`: rutas HTTP y upload pipeline
- `src/db.js`: schema SQLite, seeds, queries y migraciones
- `mod/social-meta.js`: generacion de meta tags SEO/OG/Twitter/Schema
- `mod/google-2026.js`: defaults del modulo Google 2026
- `mod/seo-images.js`: defaults del modulo SEO imagenes
- `mod/seo-tech-files.js`: defaults sitemap/robots/htaccess
- `public/`: frontend publico
- `public/panel/`: frontend del panel

## Nota de seguridad tecnica

Actualmente el token del panel se valida del lado cliente (localStorage/redirecciones). Si vas a produccion, se recomienda agregar middleware de autenticacion real en todas las rutas `/api/panel/*`.
 
