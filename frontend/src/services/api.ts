const BASE_URL = import.meta.env.VITE_API_URL || 'https://erp-8qg4.onrender.com/api';

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const error: any = new Error(data.message || 'Request failed');
    error.response = { status: res.status, data };
    throw error;
  }
  return { data };
};

export const api = {
  get: async (url: string, config?: { params?: Record<string, any> }) => {
    let query = '';
    if (config?.params) {
      const filteredParams: Record<string, string> = {};
      Object.entries(config.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          filteredParams[k] = String(v);
        }
      });
      if (Object.keys(filteredParams).length > 0) {
        query = '?' + new URLSearchParams(filteredParams).toString();
      }
    }
    const res = await fetch(`${BASE_URL}${url}${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async (url: string, body?: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body || {}),
    });
    return handleResponse(res);
  },

  put: async (url: string, body?: any) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body || {}),
    });
    return handleResponse(res);
  },

  delete: async (url: string) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;
