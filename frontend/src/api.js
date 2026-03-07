import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentApi = {
  // Get all students (with optional search)
  getAll: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get student by ID
  getById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  // Create new student
  create: async (student) => {
    const response = await api.post('/students', student);
    return response.data;
  },

  // Update student
  update: async (studentId, student) => {
    const response = await api.put(`/students/${studentId}`, student);
    return response.data;
  },

  // Delete student
  delete: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await api.get('/students/stats/summary');
    return response.data;
  },

  // Export to CSV
  exportCsv: async () => {
    const response = await api.get('/students/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },
};

export const classApi = {
  // Get all classes
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  // Get class by ID
  getById: async (classId) => {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  // Create new class
  create: async (cls) => {
    const response = await api.post('/classes', cls);
    return response.data;
  },

  // Update class
  update: async (classId, cls) => {
    const response = await api.put(`/classes/${classId}`, cls);
    return response.data;
  },

  // Delete class
  delete: async (classId) => {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },
};

export default api;
