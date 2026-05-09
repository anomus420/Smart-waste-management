import { useContext } from 'react'
import { ComplaintContext } from '../context/ComplaintContext'

const useComplaints = () => {
  const context = useContext(ComplaintContext)
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider')
  }
  return context
}

export default useComplaints