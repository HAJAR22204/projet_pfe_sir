import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const demandeService = {
  getAll: (params) => api.get('/demandes', { params }),
  getById: (id) => api.get(`/demandes/${id}`),
  valider: (id) => api.put(`/demandes/${id}/valider`),
  refuser: (id, motif) => api.put(`/demandes/${id}/refuser`, { motif_refus: motif }),
  mettreEnCours: (id) => api.put(`/demandes/${id}/mettre-en-cours`),
  statistiques: (periode) => api.get('/demandes/statistiques', { params: { periode } }),

  // ── Documents : apercu / edition / enregistrement ──
  documentHtml: (id) => api.get(`/demandes/${id}/document-html`),
  apercuDocument: (id) => api.get(`/demandes/${id}/document-apercu`, { responseType: 'blob' }),
  enregistrerDocumentPdf: (id, html, orientation = 'portrait') =>
    api.post(`/demandes/${id}/document-pdf`, { html, orientation }),
};

export const etudiantService = {
  historique: (cne) => api.get(`/etudiants/${cne}/historique`),
};

export const adminService = {
  dashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleActif: (id) => api.put(`/admin/users/${id}/toggle-actif`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;