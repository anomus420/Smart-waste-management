import api from './api'

export const ewasteService = {
  getCenters: async () => {
    const { data } = await api.get('/ewaste/centers')
    return data
  },

  createPickup: async (payload) => {
    const { data } = await api.post('/ewaste', payload)
    return data
  },

  getPickups: async (params = {}) => {
    const { data } = await api.get('/ewaste', { params })
    return data
  },

  getPickup: async (id) => {
    const { data } = await api.get(`/ewaste/${id}`)
    return data
  },

  cancelPickup: async (id) => {
    const { data } = await api.put(`/ewaste/${id}`, { status: 'cancelled' })
    return data
  },
}