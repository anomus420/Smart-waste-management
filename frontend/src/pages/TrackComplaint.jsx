import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ComplaintList from '../components/complaint/ComplaintList'
import ComplaintTracker from '../components/complaint/ComplaintTracker'
import { complaintService } from '../services/complaintService'
import { formatDate, formatStatus, getStatusColor, getPriorityColor, getImageUrl } from '../utils/formatters'
import Loader from '../components/common/Loader'
import useAutoRefresh from '../hooks/useAutoRefresh'

const TrackComplaint = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const selectedId = searchParams.get('id')

  const fetchDetail = async () => {
    if (!selectedId) return
    try {
      setLoading(true)
      const data = await complaintService.getComplaint(selectedId)
      setDetail(data.complaint)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchDetail() }, [selectedId])
  useAutoRefresh(fetchDetail, 30000, !!selectedId)

  const handleSelect = (c) => {
    setSearchParams({ id: c._id })
    setSelected(c)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Track Complaints</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Monitor the status of your submitted complaints</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <ComplaintList onSelect={handleSelect} />
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex justify-center py-12"><Loader /></div>
            ) : detail ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5 sticky top-20 transition-colors duration-200">
                {getImageUrl(detail.image) && (
                  <img src={getImageUrl(detail.image)} alt={detail.title} className="w-full h-40 object-cover rounded-xl" />
                )}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">{detail.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${getStatusColor(detail.status)}`}>{formatStatus(detail.status)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{detail.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{formatStatus(detail.category)}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(detail.priority)}`}>{formatStatus(detail.priority)}</span>
                  <span>•</span>
                  <span>{formatDate(detail.createdAt)}</span>
                </div>
                {detail.location?.address && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    {detail.location.address}
                  </p>
                )}
                <hr className="border-gray-100 dark:border-gray-700" />
                <ComplaintTracker complaint={detail} />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center text-gray-400 dark:text-gray-500 sticky top-20 transition-colors duration-200">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40 dark:opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <p className="font-medium text-gray-900 dark:text-gray-300">Select a complaint</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click any complaint to view details and timeline</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackComplaint