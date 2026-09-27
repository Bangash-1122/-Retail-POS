const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProductByBarcode: (barcode) => request(`/products/barcode/${encodeURIComponent(barcode)}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders / Sales
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  getOrderById: (id) => request(`/orders/${id}`),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
