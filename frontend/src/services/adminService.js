import api from './api'

export const adminService = {
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard')
    return data
  },

  getComplaints: async (params = {}) => {
    const { data } = await api.get('/admin/complaints', { params })
    return data
  },

  updateComplaint: async (id, payload) => {
    const { data } = await api.put(`/admin/complaints/${id}`, payload)
    return data
  },

  getUsers: async (params = {}) => {
    const { data } = await api.get('/admin/users', { params })
    return data
  },

  blockUser: async (id) => {
    const { data } = await api.put(`/admin/users/${id}/block`)
    return data
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/admin/users/${id}`)
    return data
  },

  getEwaste: async (params = {}) => {
    const { data } = await api.get('/admin/ewaste', { params })
    return data
  },

  updateEwaste: async (id, payload) => {
    const { data } = await api.put(`/admin/ewaste/${id}`, payload)
    return data
  },

  createCenter: async (payload) => {
    const { data } = await api.post('/admin/centers', payload)
    return data
  },

  deleteCenter: async (id) => {
    const { data } = await api.delete(`/admin/centers/${id}`)
    return data
  },

  getAwareness: async (params = {}) => {
    const { data } = await api.get('/awareness', { params })
    return data
  },

  createAwareness: async (formData) => {
    const { data } = await api.post('/awareness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  updateAwareness: async (id, payload) => {
    const { data } = await api.put(`/awareness/${id}`, payload)
    return data
  },

  deleteAwareness: async (id) => {
    const { data } = await api.delete(`/awareness/${id}`)
    return data
  },
}