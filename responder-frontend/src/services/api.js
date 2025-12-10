import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const host = window.location.hostname;
  return `http://${host}:8000/api/v1`;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('responder_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const responderApi = {
  login: (formData) => api.post('/login/access-token', formData),
  getMe: () => api.get('/users/me'),
  getEvents: () => api.get('/responder/events'),
  acknowledgeEvent: (eventId) => api.post(`/responder/events/${eventId}/acknowledge`),
  resolveEvent: (eventId) => api.post(`/responder/events/${eventId}/resolve`),
  getLogs: () => api.get('/responder/logs'),
};

export default api;
