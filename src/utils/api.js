const API_URL = import.meta.env.VITE_API_URL || 'https://dwarika-ecommerce.onrender.com/api';

// Simple in-memory cache for a few short-lived endpoints to avoid repeated fetches during rapid re-renders
const _cache = {
  banners: { ts: 0, data: null },
  shippingCharge: { ts: 0, data: null }
};

export const fetchProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/products?${queryString}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  return data.products || [];
};

export const fetchProduct = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return await response.json();
};

export const fetchBanners = async () => {
  // cache for 5 seconds
  const ttl = 5000;
  const now = Date.now();
  if (_cache.banners.data && (now - _cache.banners.ts) < ttl) return _cache.banners.data;
  const response = await fetch(`${API_URL}/banners?active=true`);
  if (!response.ok) throw new Error('Failed to fetch banners');
  const data = await response.json();
  _cache.banners = { ts: now, data };
  return data;
};

export const fetchShippingCharge = async () => {
  // cache for 3 seconds to avoid rapid repeated requests during UI updates
  const ttl = 3000;
  const now = Date.now();
  if (_cache.shippingCharge.data && (now - _cache.shippingCharge.ts) < ttl) return _cache.shippingCharge.data;
  const response = await fetch(`${API_URL}/settings/shipping-charge`);
  if (!response.ok) throw new Error('Failed to fetch shipping charge');
  const data = await response.json();
  _cache.shippingCharge = { ts: now, data };
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed');
  }
  return await response.json();
};

export const setPassword = async (token, password) => {
  const response = await fetch(`${API_URL}/auth/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to set password');
  }
  return await response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Login failed');
  }
  return await response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to request password reset');
  }
  return await response.json();
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) return null;
  return await response.json();
};

export const createOrder = async (orderData) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create order');
  }
  return await response.json();
};

export const fetchMyOrders = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}/orders/my`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch orders');
  }
  const data = await response.json();
  return data.orders || [];
};

export const fetchOrderDetail = async (orderId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}/orders/my/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch order');
  }
  return await response.json();
};

export const updateOrder = async (orderId, payload) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}/orders/my/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update order');
  }
  return await response.json();
};

export const deleteOrder = async (orderId) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}/orders/my/${orderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete order');
  }
  return await response.json();
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(profileData)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update profile');
  }
  return await response.json();
};

export const uploadAvatar = async (file) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const form = new FormData();
  form.append('image', file);

  const response = await fetch(`${API_URL}/upload/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to upload avatar');
  }

  return await response.json();
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/auth/verify?token=${encodeURIComponent(token)}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Email verification failed');
  }
  return await response.json();
};



