const API_BASE = '/api';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) throw new Error('No se pudieron obtener los productos.');
  return response.json();
}

export async function fetchProductById(productId) {
  const response = await fetch(`${API_BASE}/products/${productId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'No se pudo cargar el producto.');
  return data;
}

export async function submitOrder(payload) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo procesar el pedido.');
  }

  return data;
}

export async function fetchPageBySlug(slug) {
  const response = await fetch(`${API_BASE}/pages/${encodeURIComponent(slug)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'No se pudo cargar la pagina.');
  }
  return data;
}
