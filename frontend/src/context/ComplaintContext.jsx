import { createContext, useState, useCallback } from 'react'
import { complaintService } from '../services/complaintService'

export const ComplaintContext = createContext(null)

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({})

  const fetchComplaints = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setFilters(params)
      const data = await complaintService.getComplaints(params)
      setComplaints(data.complaints || [])
      setPagination(data.pagination || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createComplaint = useCallback(async (formData) => {
    const data = await complaintService.createComplaint(formData)
    await fetchComplaints(filters)
    return data
  }, [fetchComplaints, filters])

  const updateComplaint = useCallback(async (id, payload) => {
    const data = await complaintService.updateComplaint(id, payload)
    await fetchComplaints(filters)
    return data
  }, [fetchComplaints, filters])

  const deleteComplaint = useCallback(async (id) => {
    await complaintService.deleteComplaint(id)
    await fetchComplaints(filters)
  }, [fetchComplaints, filters])

  return (
    <ComplaintContext.Provider value={{ complaints, pagination, loading, filters, fetchComplaints, createComplaint, updateComplaint, deleteComplaint }}>
      {children}
    </ComplaintContext.Provider>
  )
}