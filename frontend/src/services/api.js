import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  refresh: (data) => api.post('/auth/refresh', data).then((r) => r.data),
  logout: (data) => api.post('/auth/logout', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  listUsers: (params) => api.get('/auth/users', { params }).then((r) => r.data),
  createUser: (data) => api.post('/auth/users', data).then((r) => r.data),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary').then((r) => r.data),
  syncStatus: () => api.get('/dashboard/sync-status').then((r) => r.data),
  chwActivity: (params) =>
    api.get('/dashboard/chw-activity', { params }).then((r) => r.data),
  health: () => api.get('/dashboard/health').then((r) => r.data),
  patientStats: () => api.get('/dashboard/patient-stats').then((r) => r.data),
};

export const patientsAPI = {
  list: (params) => api.get('/patients', { params }).then((r) => r.data),
  get: (id) => api.get(`/patients/${id}`).then((r) => r.data),
  create: (data) => api.post('/patients', data).then((r) => r.data),
  update: (id, data) => api.put(`/patients/${id}`, data).then((r) => r.data),
};

export const syncAPI = {
  trigger: () => api.post('/sync/trigger').then((r) => r.data),
  timeline: (params) => api.get('/sync/timeline', { params }).then((r) => r.data),
  retryFailed: () => api.get('/sync/retry-failed').then((r) => r.data),
  queue: (data) => api.post('/sync/queue', data).then((r) => r.data),
};

export default api;
