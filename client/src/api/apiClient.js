const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('vanatrack_token');

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Convenience methods
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    apiClient(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  put: (endpoint, body, options) =>
    apiClient(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  patch: (endpoint, body, options) =>
    apiClient(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options) => apiClient(endpoint, { method: 'DELETE', ...options }),
};

