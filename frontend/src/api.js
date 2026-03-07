import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentApi = {
  // Get all students
  getAll: async () => {
    const response = await api.get('/students');
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
};

export default api;
