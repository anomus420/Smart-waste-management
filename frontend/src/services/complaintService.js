import api from './api'

export const complaintService = {
  getComplaints: async (params = {}) => {
    const { data } = await api.get('/complaints', { params })
    return data
  },

  getComplaint: async (id) => {
    const { data } = await api.get(`/complaints/${id}`)
    return data
  },

  createComplaint: async (formData) => {
    const { data } = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  updateComplaint: async (id, payload) => {
    const { data } = await api.put(`/complaints/${id}`, payload)
    return data
  },

  deleteComplaint: async (id) => {
    const { data } = await api.delete(`/complaints/${id}`)
    return data
  },

  getNearby: async (lat, lng, radius = 5) => {
    const { data } = await api.get('/complaints/nearby', { params: { lat, lng, radius } })
    return data
  },
}