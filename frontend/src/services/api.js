import axios from 'axios';
import toast from 'react-hot-toast';
import { offlineDB } from './db';

let offlineQueue = null;
let isToastShowing = false;

export function setOfflineQueue(queueFn) {
  offlineQueue = queueFn;
}

const API_BASE = import.meta.env.VITE_API_URL
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  async (response) => {
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = `get:${response.config.url}`;
      try {
        await offlineDB.set(cacheKey, response.data);
      } catch {}
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
      if (originalRequest.method === 'get' && !originalRequest._fromOffline) {
        const cacheKey = `get:${originalRequest.url}`;
        try {
          const cached = await offlineDB.get(cacheKey);
          if (cached !== null) {
            if (!isToastShowing) {
              isToastShowing = true;
              toast('Showing cached data (offline)', { icon: '📡', duration: 3000 });
              setTimeout(() => { isToastShowing = false; }, 3000);
            }
            return Promise.resolve({ data: cached, fromCache: true });
          }
        } catch {}
      }

      if (originalRequest.method !== 'get' && offlineQueue) {
        try {
          await offlineQueue(originalRequest.method, originalRequest.url, originalRequest.data);
          toast.success('Saved offline. Will sync when connected.');
          return Promise.resolve({ data: { queued: true }, offline: true });
        } catch {}
      }

      if (!isToastShowing) {
        isToastShowing = true;
        toast.error('No network connection');
        setTimeout(() => { isToastShowing = false; }, 3000);
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
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

    const message = error.response?.data?.message || error.message || 'An error occurred';
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
  recentReferrals: (params) =>
    api.get('/dashboard/recent-referrals', { params }).then((r) => r.data),
};

export const patientsAPI = {
  list: (params) => api.get('/patients', { params }).then((r) => r.data),
  get: (id) => api.get(`/patients/${id}`).then((r) => r.data),
  create: (data) => api.post('/patients', data).then((r) => r.data),
  update: (id, data) => api.put(`/patients/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/patients/${id}`).then((r) => r.data),
};

export const householdsAPI = {
  list: (params) => api.get('/households', { params }).then((r) => r.data),
  get: (id) => api.get(`/households/${id}`).then((r) => r.data),
  create: (data) => api.post('/households', data).then((r) => r.data),
  update: (id, data) => api.put(`/households/${id}`, data).then((r) => r.data),
};

export const referralsAPI = {
  list: (params) => api.get('/referrals', { params }).then((r) => r.data),
  create: (data) => api.post('/referrals', data).then((r) => r.data),
  facilities: (params) => api.get('/referrals/facilities', { params }).then((r) => r.data),
};

export const syncAPI = {
  trigger: () => api.post('/sync/trigger').then((r) => r.data),
  timeline: (params) => api.get('/sync/timeline', { params }).then((r) => r.data),
  retryFailed: () => api.get('/sync/retry-failed').then((r) => r.data),
  queue: (data) => api.post('/sync/queue', data).then((r) => r.data),
};

export const paymentsAPI = {
  summary: () => api.get('/payments/summary').then((r) => r.data),
  list: (params) => api.get('/payments', { params }).then((r) => r.data),
  create: (data) => api.post('/payments', data).then((r) => r.data),
};

export const appointmentsAPI = {
  list: (params) => api.get('/appointments', { params }).then((r) => r.data),
  get: (id) => api.get(`/appointments/${id}`).then((r) => r.data),
  create: (data) => api.post('/appointments', data).then((r) => r.data),
  update: (id, data) => api.put(`/appointments/${id}`, data).then((r) => r.data),
  availableSlots: (params) =>
    api.get('/appointments/available-slots', { params }).then((r) => r.data),
};

export const medicalRecordsAPI = {
  list: (params) => api.get('/medical-records', { params }).then((r) => r.data),
  get: (id) => api.get(`/medical-records/${id}`).then((r) => r.data),
  create: (data) => api.post('/medical-records', data).then((r) => r.data),
  update: (id, data) => api.put(`/medical-records/${id}`, data).then((r) => r.data),
};

export const departmentsAPI = {
  list: (params) => api.get('/departments', { params }).then((r) => r.data),
  get: (id) => api.get(`/departments/${id}`).then((r) => r.data),
  create: (data) => api.post('/departments', data).then((r) => r.data),
  update: (id, data) => api.put(`/departments/${id}`, data).then((r) => r.data),
};

export const queueAPI = {
  list: (params) => api.get('/queue', { params }).then((r) => r.data),
  get: (id) => api.get(`/queue/${id}`).then((r) => r.data),
  summary: (params) => api.get('/queue/summary', { params }).then((r) => r.data),
  enqueue: (data) => api.post('/queue', data).then((r) => r.data),
  callNext: (data) => api.post('/queue/call-next', data).then((r) => r.data),
  update: (id, data) => api.put(`/queue/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/queue/${id}`).then((r) => r.data),
};

export default api;
