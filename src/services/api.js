import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: "https://mis-invoicing-backend.onrender.com/api",
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mis_token');
      localStorage.removeItem('mis_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       (data)  => api.post('/api/auth/register', data),
  login:          (data)  => api.post('/api/auth/login', data),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/api/auth/reset-password', data),
};

export const clientAPI = {
  getAll:  ()         => api.get('/api/clients'),
  getById: (id)       => api.get(`/api/clients/${id}`),
  create:  (data)     => api.post('/api/clients', data),
  update:  (id, data) => api.put(`/api/clients/${id}`, data),
  delete:  (id)       => api.delete(`/api/clients/${id}`),
};

export const groupAPI = {
  getAll:  ()         => api.get('/api/groups'),
  create:  (data)     => api.post('/api/groups', data),
  update:  (id, data) => api.put(`/api/groups/${id}`, data),
  delete:  (id)       => api.delete(`/api/groups/${id}`),
};

export const estimateAPI = {
  getAll:  ()         => api.get('/api/estimates'),
  getById: (id)       => api.get(`/api/estimates/${id}`),
  create:  (data)     => api.post('/api/estimates', data),
  update:  (id, data) => api.put(`/api/estimates/${id}`, data),
  delete:  (id)       => api.delete(`/api/estimates/${id}`),
  convert: (id)       => api.post(`/api/estimates/${id}/convert-to-invoice`),
};

export const invoiceAPI = {
  getAll:  ()         => api.get('/api/invoices'),
  getById: (id)       => api.get(`/api/invoices/${id}`),
  create:  (data)     => api.post('/api/invoices', data),
  update:  (id, data) => api.put(`/api/invoices/${id}`, data),
  delete:  (id)       => api.delete(`/api/invoices/${id}`),
  send:    (id)       => api.post(`/api/invoices/${id}/send`),
};

export const paymentAPI = {
  getAll:       ()    => api.get('/api/payments'),
  getByInvoice: (id)  => api.get(`/api/payments/invoice/${id}`),
  create:       (data)=> api.post('/api/payments', data),
  delete:       (id)  => api.delete(`/api/payments/${id}`),
};

export default api;
