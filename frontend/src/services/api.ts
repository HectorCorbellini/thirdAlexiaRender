import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (data: { email: string; password: string; name: string; role?: string }) => 
    api.post('/auth/register', data),
  
  me: () => 
    api.get('/auth/me')
};

// Business API
export const businessAPI = {
  getAll: () => 
    api.get('/business'),
  
  getById: (id: string) => 
    api.get(`/business/${id}`),
  
  create: (data: any) => 
    api.post('/business', data),
  
  update: (id: string, data: any) => 
    api.put(`/business/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/business/${id}`)
};

// Campaign API
export const campaignAPI = {
  getAll: () => 
    api.get('/campaigns'),
  
  getById: (id: string) => 
    api.get(`/campaigns/${id}`),
  
  create: (data: any) => 
    api.post('/campaigns', data),
  
  update: (id: string, data: any) => 
    api.put(`/campaigns/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/campaigns/${id}`)
};

// Lead API
export const leadAPI = {
  getAll: () => 
    api.get('/leads'),
  
  getById: (id: string) => 
    api.get(`/leads/${id}`),
  
  create: (data: any) => 
    api.post('/leads', data),
  
  update: (id: string, data: any) => 
    api.put(`/leads/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/leads/${id}`)
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => 
    api.get('/analytics/overview'),
  
  getConversions: () => 
    api.get('/analytics/conversions'),

  getCategories: () =>
    api.get('/analytics/categories'),

  getCities: () =>
    api.get('/analytics/cities'),

  getWeeklyActivity: () =>
    api.get('/analytics/weekly-activity'),

  getActivityFeed: () =>
    api.get('/analytics/activity'),
  
  getCampaignMetrics: (id: string) => 
    api.get(`/analytics/campaigns/${id}`)
};

// Data ALEXIA API (Knowledge Base)
export const dataAlexiaAPI = {
  search: (query: string) => 
    api.get('/data-alexia', { params: { query } }),
  
  getAll: () => 
    api.get('/data-alexia'),
  
  getById: (id: string) => 
    api.get(`/data-alexia/${id}`),
  
  create: (data: any) => 
    api.post('/data-alexia', data),
  
  update: (id: string, data: any) => 
    api.put(`/data-alexia/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/data-alexia/${id}`)
};

// WhatsApp API
export const whatsappAPI = {
  getStatus: () => 
    api.get('/whatsapp/status'),
  
  sendMessage: (to: string, text: string) => 
    api.post('/whatsapp/send', { to, text })
};

export default api;
