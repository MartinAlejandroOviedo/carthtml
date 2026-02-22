const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const {
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
} = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '5491112345678';
const uploadDir = path.join(__dirname, 'public', 'uploads');
const typedImagesDir = path.join(uploadDir, 'images');
const IMAGE_VARIANTS = {
  slider: { width: 1600, height: 900 },
  card: { width: 960, height: 720 }
};

fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
fs.mkdirSync(typedImagesDir, { recursive: true, mode: 0o755 });

function parseProductId(raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

function normalizeEntityType(raw) {
  const type = String(raw || '')
    .trim()
    .toLowerCase();
  if (!type) return null;
  if (!/^[a-z0-9][a-z0-9_-]{1,39}$/.test(type)) return null;
  return type;
}

function normalizeEntityId(raw) {
  const asNumber = parseProductId(raw);
  if (asNumber) return String(asNumber);

  const id = String(raw || '')
    .trim()
    .toLowerCase();
  if (!id) return null;
  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(id)) return null;
  return id;
}

function parseUploadContext(req) {
  const entityType = normalizeEntityType(req.body?.entityType || req.query?.entityType);
  const entityId = normalizeEntityId(req.body?.entityId || req.body?.entityKey || req.query?.entityId || req.query?.entityKey);
  if (entityType && entityId) {
    return { entityType, entityId };
  }

  const productId = parseProductId(req.body?.productId) || parseProductId(req.query?.productId);
  if (productId) {
    return { entityType: 'product', entityId: String(productId) };
  }

  return null;
}

function safeExtension(fileName) {
  const ext = path.extname(fileName || '').toLowerCase() || '.jpg';
  return ext.match(/^\.[a-z0-9]+$/) ? ext : '.jpg';
}

function safeBaseName(fileName) {
  const base = path.basename(fileName || '', path.extname(fileName || ''));
  const normalized = String(base || 'img').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
  return normalized || 'img';
}

function uniqueFileName(targetDir, originalName) {
  const ext = safeExtension(originalName);
  const base = safeBaseName(originalName);
  let candidate = `${base}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(targetDir, candidate))) {
    candidate = `${base}-${counter}${ext}`;
    counter += 1;
  }
  return candidate;
}

function publicUrlForUpload(uploadContext, fileName) {
  if (uploadContext && uploadContext.entityType && uploadContext.entityId) {
    return `/uploads/images/${uploadContext.entityType}/${uploadContext.entityId}/${fileName}`;
  }
  return `/uploads/${fileName}`;
}

function variantFileName(originalFileName, variant) {
  const base = path.basename(String(originalFileName || ''), path.extname(String(originalFileName || ''))) || 'img';
  return `${base}-${variant}.webp`;
}

async function generateImageVariants(file, uploadContext) {
  if (!file || !file.path || !file.filename) {
    throw new Error('Archivo inválido para generar variantes.');
  }

  const targetDir = path.dirname(file.path);
  const sliderName = variantFileName(file.filename, 'slider');
  const cardName = variantFileName(file.filename, 'card');
  const sliderPath = path.join(targetDir, sliderName);
  const cardPath = path.join(targetDir, cardName);

  await sharp(file.path)
    .rotate()
    .resize(IMAGE_VARIANTS.slider.width, IMAGE_VARIANTS.slider.height, { fit: 'cover', position: 'center' })
    .webp({ quality: 84 })
    .toFile(sliderPath);

  await sharp(file.path)
    .rotate()
    .resize(IMAGE_VARIANTS.card.width, IMAGE_VARIANTS.card.height, { fit: 'cover', position: 'center' })
    .webp({ quality: 84 })
    .toFile(cardPath);

  return {
    sliderUrl: publicUrlForUpload(uploadContext, sliderName),
    cardUrl: publicUrlForUpload(uploadContext, cardName)
  };
}

function resolveUploadFilePath(fileUrl) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;

  const relative = raw.replace(/^\/uploads\//, '');
  const safeRelative = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const full = path.join(uploadDir, safeRelative);
  const uploadRoot = path.resolve(uploadDir) + path.sep;
  const resolved = path.resolve(full);
  if (!resolved.startsWith(uploadRoot)) return null;
  return resolved;
}

function buildVariantUrlFromOriginal(fileUrl, variant) {
  const raw = String(fileUrl || '');
  if (!raw.startsWith('/uploads/')) return null;
  const parsed = path.posix.parse(raw);
  if (!parsed.name) return null;
  return `${parsed.dir}/${parsed.name}-${variant}.webp`;
}

async function deleteUploadedFileByUrl(fileUrl) {
  const target = resolveUploadFilePath(fileUrl);
  if (!target) return;
  try {
    await fs.promises.unlink(target);
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.warn('No se pudo borrar archivo:', target, error.message);
    }
  }
}

async function deleteUploadedVariantsByUrl(fileUrl) {
  const sliderUrl = buildVariantUrlFromOriginal(fileUrl, 'slider');
  const cardUrl = buildVariantUrlFromOriginal(fileUrl, 'card');
  if (sliderUrl) await deleteUploadedFileByUrl(sliderUrl);
  if (cardUrl) await deleteUploadedFileByUrl(cardUrl);
}

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const uploadContext = parseUploadContext(req);
      const targetDir = uploadContext
        ? path.join(typedImagesDir, uploadContext.entityType, uploadContext.entityId)
        : uploadDir;
      fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const uploadContext = parseUploadContext(req);
      const targetDir = uploadContext
        ? path.join(typedImagesDir, uploadContext.entityType, uploadContext.entityId)
        : uploadDir;
      cb(null, uniqueFileName(targetDir, file.originalname || 'img.jpg'));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Solo se permiten archivos de imagen.'));
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/panel', express.static(path.join(__dirname, 'public', 'panel')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'carthtml-api' });
});

app.get('/api/products', async (_req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar los productos.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: 'ID de producto inválido.' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo cargar el producto.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !customer.name || !customer.phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos de pedido inválidos.' });
    }

    const order = await createOrder({ customer, items, whatsappNumber: WHATSAPP_NUMBER });
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo crear el pedido.' });
  }
});

app.get('/api/pages/:slug', async (req, res) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Pagina no encontrada.' });
    }

    return res.json(page);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo cargar la pagina.' });
  }
});

app.post('/api/panel/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y clave son obligatorios.' });
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales invalidas.' });
    }

    return res.json({
      token: `panel-${user.id}-${Date.now()}`,
      user
    });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo iniciar sesion.' });
  }
});

app.get('/api/panel/uploads/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'panel-uploads',
    endpoint: '/api/panel/uploads/image',
    uploadDir: '/public/uploads',
    typedImagesDir: '/public/uploads/images/:entityType/:entityId',
    backwardCompat: 'Acepta productId y lo mapea a entityType=product',
    variants: IMAGE_VARIANTS
  });
});

app.post('/api/panel/uploads/image', (req, res) => {
  imageUpload.single('image')(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message || 'No se pudo subir la imagen.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió archivo.' });
    }

    const uploadContext = parseUploadContext(req);
    const url = publicUrlForUpload(uploadContext, req.file.filename);
    let variants = { sliderUrl: url, cardUrl: url };
    try {
      variants = await generateImageVariants(req.file, uploadContext);
    } catch (variantError) {
      await deleteUploadedFileByUrl(url);
      await deleteUploadedVariantsByUrl(url);
      return res.status(500).json({ error: 'No se pudieron generar variantes de imagen.' });
    }

    return res.status(201).json({
      ok: true,
      fileName: req.file.filename,
      entityType: uploadContext?.entityType || null,
      entityId: uploadContext?.entityId || null,
      url,
      originalUrl: url,
      sliderUrl: variants.sliderUrl,
      cardUrl: variants.cardUrl
    });
  });
});

app.post('/api/panel/uploads/images', (req, res) => {
  imageUpload.array('images', 20)(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: error.message || 'No se pudieron subir las imagenes.' });
    }

    if (!Array.isArray(req.files) || !req.files.length) {
      return res.status(400).json({ error: 'No se recibieron archivos.' });
    }

    const uploadContext = parseUploadContext(req);
    const files = [];
    for (const file of req.files) {
      const url = publicUrlForUpload(uploadContext, file.filename);
      try {
        const variants = await generateImageVariants(file, uploadContext);
        files.push({
          fileName: file.filename,
          entityType: uploadContext?.entityType || null,
          entityId: uploadContext?.entityId || null,
          url,
          originalUrl: url,
          sliderUrl: variants.sliderUrl,
          cardUrl: variants.cardUrl
        });
      } catch (_variantError) {
        await deleteUploadedFileByUrl(url);
        await deleteUploadedVariantsByUrl(url);
        return res.status(500).json({ error: 'No se pudieron generar variantes de imagen.' });
      }
    }

    return res.status(201).json({
      ok: true,
      files,
      urls: files.map((file) => file.url)
    });
  });
});

app.get('/api/panel/users', async (_req, res) => {
  try {
    res.json(await listUsers());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar usuarios.' });
  }
});

app.post('/api/panel/users', async (req, res) => {
  try {
    res.status(201).json(await createUser(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear usuario.' });
  }
});

app.put('/api/panel/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateUser(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar usuario.' });
  }
});

app.delete('/api/panel/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const ok = await deleteUser(id);
    if (!ok) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar usuario.' });
  }
});

app.get('/api/panel/categories', async (_req, res) => {
  try {
    res.json(await listCategories());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar categorías.' });
  }
});

app.post('/api/panel/categories', async (req, res) => {
  try {
    res.status(201).json(await createCategory(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear categoría.' });
  }
});

app.put('/api/panel/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateCategory(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar categoría.' });
  }
});

app.delete('/api/panel/categories/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const ok = await deleteCategory(id);
    if (!ok) return res.status(404).json({ error: 'Categoría no encontrada.' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar categoría.' });
  }
});

app.get('/api/panel/product-images', async (_req, res) => {
  try {
    res.json(await listProductImages());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar imágenes.' });
  }
});

app.post('/api/panel/product-images', async (req, res) => {
  try {
    res.status(201).json(await createProductImage(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear imagen.' });
  }
});

app.put('/api/panel/product-images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateProductImage(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Imagen no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar imagen.' });
  }
});

app.delete('/api/panel/product-images/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const current = await getProductImageById(id);
    const ok = await deleteProductImage(id);
    if (!ok) return res.status(404).json({ error: 'Imagen no encontrada.' });
    if (current && current.url) {
      await deleteUploadedFileByUrl(current.url);
      await deleteUploadedVariantsByUrl(current.url);
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar imagen.' });
  }
});

app.get('/api/panel/pages', async (_req, res) => {
  try {
    res.json(await listPages());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar páginas.' });
  }
});

app.post('/api/panel/pages', async (req, res) => {
  try {
    res.status(201).json(await createPage(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear página.' });
  }
});

app.put('/api/panel/pages/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updatePage(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Página no encontrada.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar página.' });
  }
});

app.delete('/api/panel/pages/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const ok = await deletePage(id);
    if (!ok) return res.status(404).json({ error: 'Página no encontrada.' });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar página.' });
  }
});

app.get('/api/panel/products', async (_req, res) => {
  try {
    res.json(await listProductsAdmin());
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron cargar productos.' });
  }
});

app.post('/api/panel/products', async (req, res) => {
  try {
    res.status(201).json(await createProductAdmin(req.body || {}));
  } catch (error) {
    res.status(400).json({ error: error.message || 'No se pudo crear producto.' });
  }
});

app.put('/api/panel/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const updated = await updateProductAdmin(id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar producto.' });
  }
});

app.patch('/api/panel/products/:id/image', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { imageUrl } = req.body || {};
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    if (!String(imageUrl || '').trim()) return res.status(400).json({ error: 'imageUrl es obligatorio.' });
    const updated = await setProductMainImage(id, imageUrl);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'No se pudo actualizar imagen principal.' });
  }
});

app.delete('/api/panel/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const images = await listProductImagesByProductId(id);
    const ok = await deleteProductAdmin(id);
    if (!ok) return res.status(404).json({ error: 'Producto no encontrado.' });
    if (Array.isArray(images)) {
      for (const image of images) {
        await deleteUploadedFileByUrl(image.url);
        await deleteUploadedVariantsByUrl(image.url);
      }
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo eliminar producto.' });
  }
});

app.get('/panel', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panel', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

initDb()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Servidor activo en http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya está en uso.`);
        console.error('Liberá el proceso que lo usa o iniciá con otro puerto: PORT=3001 npm start');
        process.exit(1);
      }

      console.error('Error levantando el servidor:', error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Error iniciando la base de datos:', error);
    process.exit(1);
  });
