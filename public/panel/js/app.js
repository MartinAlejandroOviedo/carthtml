const TOKEN_KEY = 'panel_token';
const API_BASE = '/api/panel';

const viewConfig = {
  products: {
    title: 'Productos',
    endpoint: 'products',
    idKey: 'id',
    columns: ['id', 'name', 'category', 'priceArs', 'description', 'imageUrl'],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'category', label: 'Categoria', type: 'select', required: true },
      { key: 'priceArs', label: 'Precio ARS', type: 'number', required: true },
      { key: 'imageUrl', label: 'URL Imagen', type: 'hidden', required: false },
      { key: 'description', label: 'Descripcion', type: 'textarea', required: true, colSpan: 2 }
    ]
  },
  categories: {
    title: 'Categorias',
    endpoint: 'categories',
    idKey: 'id',
    columns: ['id', 'name', 'slug'],
    fields: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: false }
    ]
  },
  'product-images': {
    title: 'Imagenes de producto',
    endpoint: 'product-images',
    idKey: 'id',
    columns: ['id', 'productId', 'url', 'altText', 'sortOrder'],
    fields: [
      { key: 'productId', label: 'ID Producto', type: 'number', required: true },
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'imageFile', label: 'Archivo imagen', type: 'file', required: false, colSpan: 2 },
      { key: 'imageFiles', label: 'Archivos (multiple)', type: 'file-multiple', required: false, colSpan: 2 },
      { key: 'altText', label: 'Texto ALT', type: 'text', required: false },
      { key: 'sortOrder', label: 'Orden', type: 'number', required: false }
    ]
  },
  pages: {
    title: 'Paginas',
    endpoint: 'pages',
    idKey: 'id',
    columns: ['id', 'slug', 'title', 'updatedAt'],
    fields: [
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'title', label: 'Titulo', type: 'text', required: true },
      { key: 'contentHtml', label: 'Contenido HTML', type: 'textarea', required: true, colSpan: 2 }
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

const topbarRoot = document.getElementById('panel-topbar');
const navRoot = document.getElementById('panel-nav');
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

function getFieldValue(field, input) {
  return input ? input.value : '';
}

function setFieldValue(field, input, value) {
  if (input) {
    input.value = value ?? '';
  }
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

function updateProductImagePreview(url) {
  const previewEl = document.getElementById('product-image-preview');
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
    root.innerHTML = '<p class="text-xs text-slate-400">Selecciona una o varias imágenes para ver preview.</p>';
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

async function uploadImageFile(file, productId = null) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return null;
  }

  const data = new FormData();
  if (productId) data.append('productId', String(productId));
  data.append('image', file);

  const response = await fetch('/api/panel/uploads/image', {
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

async function uploadImageFiles(files, productId = null) {
  const token = getAuthToken();
  if (!token) {
    window.location.replace('/panel/login.html');
    return [];
  }

  const data = new FormData();
  if (productId) data.append('productId', String(productId));
  files.forEach((file) => data.append('images', file));

  const response = await fetch('/api/panel/uploads/images', {
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
      const url = await uploadImageFile(file, productId);
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

    const options = categories
      .map((c) => `<option value="${c.name}">${c.name}</option>`)
      .join('');

    selectEl.innerHTML = options || '<option value="">Sin categorias</option>';
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
    }
  } catch (error) {
    showMessage(`No se pudieron cargar categorias: ${error.message}`, true);
  }
}

function setupProductImageUI() {
  const imageUrlInput = formEl.elements.namedItem('imageUrl');
  const imageFilesInput = document.getElementById('product-images-files');
  if (!imageUrlInput || !imageFilesInput) return;

  imageUrlInput.addEventListener('input', () => {
    updateProductImagePreview(imageUrlInput.value);
  });

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
    updateProductImagePreview(principalUrl);
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
          <button type="button" data-img-main="${img.id}" class="rounded border border-sky-300/40 px-2 py-1 text-[11px] text-sky-200">Principal</button>
          <button type="button" data-img-up="${img.id}" class="rounded border border-white/20 px-2 py-1 text-[11px]">↑</button>
          <button type="button" data-img-down="${img.id}" class="rounded border border-white/20 px-2 py-1 text-[11px]">↓</button>
          <button type="button" data-img-del="${img.id}" class="rounded border border-rose-400/40 px-2 py-1 text-[11px] text-rose-300">Borrar</button>
          <span class="ml-auto text-[11px] text-slate-500">#${index + 1}</span>
        </div>
      </article>
    `
      )
      .join('');

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
          updateProductImagePreview(selected.url);
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
        const uploadedUrl = await uploadImageFile(file);
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
  let html = cfg.fields
    .map((field) => {
      const colClass = field.colSpan === 2 ? 'sm:col-span-2' : '';
      if (field.type === 'textarea') {
        return `
          <label class="text-sm text-slate-200 ${colClass}">
            ${field.label}
            <textarea name="${field.key}" ${field.required ? 'required' : ''} rows="4" class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"></textarea>
          </label>
        `;
      }

      if (field.type === 'file' || field.type === 'file-multiple') {
        const isMultiple = field.type === 'file-multiple';
        return `
          <label class="text-sm text-slate-200 ${colClass}">
            ${field.label}
            <input name="${field.key}" type="file" accept="image/*" ${isMultiple ? 'multiple' : ''} ${field.required ? 'required' : ''} class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
          </label>
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
                  <input id="product-images-files" type="file" accept="image/*" multiple class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
                </label>
                <div class="text-xs text-slate-400 flex items-end pb-2">Elegi la principal en las previews antes de subir.</div>
              </div>
              <p class="text-xs text-slate-400">Las imagenes seleccionadas se suben al presionar Guardar.</p>
              <div class="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2">
                <span id="product-upload-spinner" class="hidden h-4 w-4 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300"></span>
                <span id="product-upload-status" class="text-xs text-slate-300">Sin tareas pendientes.</span>
              </div>
              <img id="product-image-preview" alt="Preview imagen principal" class="hidden h-44 w-full rounded-xl border border-white/10 object-cover" />
              <div id="product-upload-preview-list" class="grid gap-2 sm:grid-cols-2"></div>
              <div>
                <p class="mb-1 text-xs uppercase tracking-wide text-slate-400">Galeria asociada</p>
                <div id="product-images-manager" class="grid gap-2 sm:grid-cols-2"></div>
              </div>
            </div>
          `;
        }

        return hiddenHtml;
      }

      if (field.type === 'select') {
        return `
          <label class="text-sm text-slate-200 ${colClass}">
            ${field.label}
            <select name="${field.key}" ${field.required ? 'required' : ''} class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm">
              <option value="">Cargando...</option>
            </select>
          </label>
        `;
      }

      let inputHtml = `
        <label class="text-sm text-slate-200 ${colClass}">
          ${field.label}
          <input name="${field.key}" type="${field.type}" ${field.required ? 'required' : ''} class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm" />
        </label>
      `;

      return inputHtml;
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

  formEl.innerHTML = html;
  if (activeView === 'product-images') {
    setupImageUploadUI();
    populateProductSelector();
  }
  if (activeView === 'products') {
    setupProductImageUI();
    populateProductCategorySelect();
  }
}

function renderTableHead() {
  const cfg = getConfig();
  headEl.innerHTML = [...cfg.columns.map((col) => `<th class="px-3 py-2">${col}</th>`), '<th class="px-3 py-2">acciones</th>'].join('');
}

function fillForm(item) {
  const cfg = getConfig();
  cfg.fields.forEach((field) => {
    const input = formEl.elements.namedItem(field.key);
    if (field.type === 'file' || field.type === 'file-multiple') return;
    if (!input) return;
    setFieldValue(field, input, item[field.key] ?? '');
  });

  if (activeView === 'product-images') {
    updateImagePreview(item.url || '');
  }
  if (activeView === 'products') {
    updateProductImagePreview(item.imageUrl || '');
    populateProductCategorySelect(item.category || '');
    const productId = Number(item.id || editingId || 0);
    if (Number.isInteger(productId) && productId > 0) {
      renderProductImagesManager(productId);
    }
  }
}

function clearForm() {
  editingId = null;
  productUploadFiles = [];
  productPrimaryIndex = 0;
  formEl.reset();
  if (activeView === 'product-images') {
    updateImagePreview('');
    renderMultiPreview([]);
  }
  if (activeView === 'products') {
    updateProductImagePreview('');
    renderProductUploadPreview([]);
    setProductUploadProgress({ active: false, message: 'Sin tareas pendientes.' });
  }
  showMessage('Formulario limpio.');
  if (formTitle) formTitle.textContent = 'Nuevo registro';
}

function openForm() {
  formOffcanvas.classList.remove('translate-x-full');
  formBackdrop.classList.remove('hidden');
}

function closeForm() {
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
  const rows = await requestJson(`${API_BASE}/${cfg.endpoint}`);
  if (!rows) return;

  bodyEl.innerHTML = rows
    .map((row) => {
      const dataCols = cfg.columns.map((col) => `<td class="border-b border-white/10 px-3 py-2">${row[col] ?? ''}</td>`).join('');
      return `
        <tr class="text-slate-200">
          ${dataCols}
          <td class="border-b border-white/10 px-3 py-2">
            <div class="flex gap-2">
              <button data-edit="${row[cfg.idKey]}" class="rounded-lg border border-white/20 px-2 py-1 text-xs">Editar</button>
              <button data-delete="${row[cfg.idKey]}" class="rounded-lg border border-rose-400/40 px-2 py-1 text-xs text-rose-300">Borrar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  bodyEl.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.edit);
      const row = rows.find((r) => Number(r[cfg.idKey]) === id);
      if (!row) return;
      editingId = id;
      fillForm(row);
      if (formTitle) formTitle.textContent = `Editar ${cfg.title}`;
      openForm();
      showMessage(`Editando ID ${id}`);
    });
  });

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

async function saveItem() {
  const cfg = getConfig();
  const payload = {};

  cfg.fields.forEach((field) => {
    const input = formEl.elements.namedItem(field.key);
    if (field.type === 'file' || field.type === 'file-multiple') return;
    payload[field.key] = getFieldValue(field, input);
  });

  if (activeView === 'products' && !editingId && productUploadFiles.length && !String(payload.imageUrl || '').trim()) {
    payload.imageUrl = '/uploads/pending-product-image.jpg';
  }

  try {
    const saveBtnLabel = saveBtn ? saveBtn.textContent : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando...';
    }

    let saved = null;
    let targetId = editingId;

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
  activeView = nextView;
  editingId = null;

  const cfg = getConfig();
  viewTitle.textContent = cfg.title;
  renderForm();
  renderTableHead();
  activateNav();
  await renderRows();
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
  await switchView('products');

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
    await renderRows();
    showMessage('Datos recargados.');
  });
}

bootstrap().catch((error) => {
  showMessage(error.message, true);
});
