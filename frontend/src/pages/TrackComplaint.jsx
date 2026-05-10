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
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateForm, setUpdateForm] = useState({ lat: '', lng: '' })
  const [updateFile, setUpdateFile] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' })
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
    setIsUpdating(false)
    setUpdateMsg({ type: '', text: '' })
  }

  const handleAutoFetch = () => {
    if (!navigator.geolocation) {
      setUpdateMsg({ type: 'error', text: 'Geolocation is not supported by your browser' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUpdateForm({
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        })
        setUpdateMsg({ type: '', text: '' })
      },
      () => {
        setUpdateMsg({ type: 'error', text: 'Unable to retrieve your location' })
      }
    )
  }

  const handleUpdateSubmit = async () => {
    if (!updateForm.lat && !updateForm.lng && !updateFile) {
      setUpdateMsg({ type: 'error', text: 'Please provide coordinates or an image to update.' })
      return
    }

    setUpdateLoading(true)
    setUpdateMsg({ type: '', text: '' })
    try {
      const fd = new FormData()
      if (updateForm.lat) fd.append('locationLat', updateForm.lat)
      if (updateForm.lng) fd.append('locationLng', updateForm.lng)
      if (updateFile) fd.append('image', updateFile)

      await complaintService.updateComplaint(detail._id, fd)
      setIsUpdating(false)
      setUpdateFile(null)
      fetchDetail() // refresh the data
    } catch (err) {
      setUpdateMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update complaint' })
    } finally {
      setUpdateLoading(false)
    }
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

                {detail.status === 'pending' && (
                  <div className="pt-2">
                    {!isUpdating ? (
                      <button 
                        onClick={() => setIsUpdating(true)}
                        className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-200 dark:border-green-800"
                      >
                        Update Additional Info
                      </button>
                    ) : (
                      <div className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Update Complaint Info</h3>
                          <button onClick={() => { setIsUpdating(false); setUpdateMsg({ type: '', text: '' }) }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Location Coordinates</label>
                              <button 
                                type="button" 
                                onClick={handleAutoFetch}
                                className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                              >
                                <span>📍</span> Auto-fetch
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="number" step="any" placeholder="Latitude" 
                                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                value={updateForm.lat} onChange={(e) => setUpdateForm({ ...updateForm, lat: e.target.value })}
                              />
                              <input 
                                type="number" step="any" placeholder="Longitude" 
                                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                value={updateForm.lng} onChange={(e) => setUpdateForm({ ...updateForm, lng: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Photograph</label>
                            <input 
                              type="file" accept="image/*"
                              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/30 dark:file:text-green-400"
                              onChange={(e) => setUpdateFile(e.target.files[0])}
                            />
                          </div>

                          {updateMsg.text && (
                            <div className={`p-2 text-xs rounded-lg ${updateMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {updateMsg.text}
                            </div>
                          )}

                          <button 
                            onClick={handleUpdateSubmit}
                            disabled={updateLoading}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {updateLoading ? 'Updating...' : 'Submit Update'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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