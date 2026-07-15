// Server base URL resolution:
//  - Web app: same origin (Express serves the build) → ''
//  - Android APK: the user enters the server address on first launch; it is
//    stored in localStorage. VITE_API_URL can pre-bake a default at build time.
const SERVER_KEY = 'hw_server';
const TOKEN_KEY = 'hw_token';

export function getServer() {
  return localStorage.getItem(SERVER_KEY) || import.meta.env.VITE_API_URL || '';
}

export function setServer(url) {
  localStorage.setItem(SERVER_KEY, url.replace(/\/+$/, ''));
}

export function clearServer() {
  localStorage.removeItem(SERVER_KEY);
}

export function isNativeApp() {
  return window.location.protocol === 'capacitor:' || !!window.Capacitor?.isNativePlatform?.();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token, remember) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function assetUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${getServer()}${path}`;
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${getServer()}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    // Session expired mid-use: clear the stale token and return to the login
    // screen instead of letting saves fail silently in the background.
    if (res.status === 401 && !path.startsWith('/api/auth/')) {
      clearToken();
      window.location.reload();
    }
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me'),
  years: () => request('/api/cars/years'),
  cars: (year) => request(`/api/cars?year=${year}`),
  allCars: () => request('/api/cars'),
  collection: () => request('/api/collection'),
  setOwnership: (carId, payload) =>
    request(`/api/collection/${encodeURIComponent(carId)}`, { method: 'PUT', body: payload }),
  unOwn: (carId) =>
    request(`/api/collection/${encodeURIComponent(carId)}`, { method: 'DELETE' }),
  uploadPhoto: (carId, file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return request(`/api/collection/${encodeURIComponent(carId)}/photo`, {
      method: 'POST',
      formData: fd,
    });
  },
  deletePhoto: (carId, photoId) =>
    request(`/api/collection/${encodeURIComponent(carId)}/photo/${photoId}`, {
      method: 'DELETE',
    }),
};
