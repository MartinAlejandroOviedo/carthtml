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
- En Linux Debian, herramientas de compilacion para dependencias nativas (`sharp`, `sqlite3`):
  - `python3`
  - `build-essential` (`make`, `g++`)
  - `sqlite3` (CLI opcional, util para backups)

### Requisitos Debian (referencia)

```bash
sudo apt update
sudo apt install -y curl ca-certificates python3 build-essential sqlite3
```

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm start
```

Servidor por defecto: `http://localhost:3000`

## Scripts

- `npm run dev`: compila Tailwind y levanta el server
- `npm start`: igual que `dev`
- `npm run tw:build`: genera `public/tailwind.css` minificado
- `npm run tw:watch`: recompila Tailwind en modo watch

## Variables de entorno

- `PORT` (default `3000`)
- `STORE_NAME` (default `SLStore`)
- `WHATSAPP_NUMBER` (default `5491112345678`)
- `NODE_ENV` (recomendado `production` en servidor)

Ejemplo:

```bash
PORT=3000 STORE_NAME=SLStore WHATSAPP_NUMBER=5491112345678 npm run dev
```

## Despliegue basico en Debian

1. Instalar Node.js 20+ y dependencias del sistema.
2. Clonar el repo e instalar paquetes con `npm install`.
3. Ejecutar `npm start` (compila Tailwind y levanta Express).
4. Publicar detras de Nginx o Apache como reverse proxy.
5. Ejecutar como servicio (`systemd` o PM2).
6. Configurar backups de `data/store.sqlite` y `public/uploads/`.

## Implementacion por fases (hardening)

- Fase 1: auth backend del panel con sesion en cookie `httpOnly` (`/api/panel/session`, `/api/panel/logout`).
- Fase 2: credenciales de usuarios con `bcrypt` (incluye migracion de contraseñas legacy en claro).
- Fase 3: hardening de uploads (bloqueo SVG + validacion por magic bytes) y PRAGMAs SQLite productivos.

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
- `/panel/index.html?view=template`: modulo de apariencia del template (branding y redes)
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
- El nombre de tienda (`storeName`) se hidrata de forma dinamica desde `/api/site-config` en elementos con `data-store-name`

## Carga y gestion de imagenes

### Endpoints

- `POST /api/panel/uploads/image` (campo `image`)
- `POST /api/panel/uploads/images` (campo `images[]`, hasta 20)
- `GET /api/panel/uploads/health`

Reglas de validacion:

- formatos permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/avif`
- SVG bloqueado
- validacion por magic bytes (no solo `mimetype`)

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
- `GET /api/site-config`

Panel CRUD:

- `POST /api/panel/login`
- `POST /api/panel/logout`
- `GET /api/panel/session`
- `GET/POST/PUT/DELETE /api/panel/users`
- `GET /api/panel/settings`
- `PUT /api/panel/settings/:id`
- `GET/POST/PUT/DELETE /api/panel/categories`
- `GET/POST/PUT/DELETE /api/panel/orders`
- `GET /api/panel/orders/:id`
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

Las rutas `/api/panel/*` (excepto login/logout/session) quedan protegidas por middleware backend de sesion. La sesion se maneja con cookie `httpOnly`.

Contraseñas:

- Usuarios guardados con hash `bcrypt`.
- Si existian usuarios legacy con contraseña en claro, se migran automaticamente al iniciar.

SQLite (produccion):

- `PRAGMA journal_mode=WAL`
- `PRAGMA synchronous=NORMAL`
- `PRAGMA busy_timeout=5000`
- `PRAGMA foreign_keys=ON`

Deploy operativo:

- Backup de DB y uploads: `deploy/backup.sh`
- Servicio systemd de ejemplo: `deploy/carthtml.service`
 
