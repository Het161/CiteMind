import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT from localStorage to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('citemind_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ---- auth ---- */
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

/* ---- sites ---- */
export const getSites = () => api.get('/sites');
export const createSite = (data) => api.post('/sites', data);
export const getSite = (id) => api.get(`/sites/${id}`);
export const addQueries = (id, queries) => api.post(`/sites/${id}/queries`, { queries });

/* ---- monitor ---- */
export const runMonitor = (siteId) => api.post(`/monitor/${siteId}/run`);

/* ---- agent ---- */
export const getObservations = (siteId) => api.get(`/agent/${siteId}/observations`);
export const askAgent = (siteId, question) => api.post(`/agent/${siteId}/ask`, { question });

/* ---- demo ---- */
export const seedDemo = (siteId) => api.post(`/demo/${siteId}/seed`);
export const resetDemo = (siteId) => api.post(`/demo/${siteId}/reset`);
export const askEmpty = (siteId, question) => api.post(`/demo/${siteId}/ask-empty`, { question });

/* ---- health ---- */
export const getHealth = () => api.get('/health');

export default api;
