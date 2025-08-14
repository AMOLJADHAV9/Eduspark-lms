// API utility for handling all API calls
const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'http://localhost:5000'
  : 'https://lms-yoh3.onrender.com';

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('lms_token');
  
  const config = {
    headers: getAuthHeaders(token),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API methods
export const api = {
  // GET request
  get: (endpoint) => apiRequest(endpoint),
  
  // POST request
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // PUT request
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
  
  // PATCH request
  patch: (endpoint, data) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Auth API methods
export const authApi = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  adminLogin: (credentials) => api.post('/api/auth/admin/login', credentials),
};

// Course API methods
export const courseApi = {
  getAll: () => api.get('/api/courses'),
  getById: (id) => api.get(`/api/courses/${id}`),
  create: (courseData) => api.post('/api/courses', courseData),
  update: (id, courseData) => api.put(`/api/courses/${id}`, courseData),
  delete: (id) => api.delete(`/api/courses/${id}`),
};

// Live Class API methods
export const liveClassApi = {
  getAll: () => api.get('/api/live-classes'),
  getById: (id) => api.get(`/api/live-classes/${id}`),
  create: (liveClassData) => api.post('/api/live-classes', liveClassData),
  update: (id, liveClassData) => api.put(`/api/live-classes/${id}`),
  delete: (id) => api.delete(`/api/live-classes/${id}`),
  join: (id) => api.post(`/api/live-classes/${id}/join`),
  start: (id) => api.post(`/api/live-classes/${id}/start`),
  end: (id) => api.post(`/api/live-classes/${id}/end`),
};

// Quiz API methods
export const quizApi = {
  getAll: () => api.get('/api/quizzes'),
  getById: (id) => api.get(`/api/quizzes/${id}`),
  create: (quizData) => api.post('/api/quizzes', quizData),
  update: (id, quizData) => api.put(`/api/quizzes/${id}`, quizData),
  delete: (id) => api.delete(`/api/quizzes/${id}`),
};

// Assignment API methods
export const assignmentApi = {
  getAll: () => api.get('/api/assignments'),
  getById: (id) => api.get(`/api/assignments/${id}`),
  create: (assignmentData) => api.post('/api/assignments', assignmentData),
  update: (id, assignmentData) => api.put(`/api/assignments/${id}`),
  delete: (id) => api.delete(`/api/assignments/${id}`),
};

// Health check
export const healthCheck = () => api.get('/api/health');

export default api; 