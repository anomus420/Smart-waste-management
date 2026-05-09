import { useState, useEffect } from 'react'
import ComplaintCard from './ComplaintCard'
import Loader from '../common/Loader'
import { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES } from '../../utils/constants'
import { complaintService } from '../../services/complaintService'

const ComplaintList = ({ onSelect }) => {
  const [complaints, setComplaints] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 9 })
  const [search, setSearch] = useState('')

  const fetchData = async (params) => {
    try {
      setLoading(true)
      const data = await complaintService.getComplaints(params)
      setComplaints(data.complaints || [])
      setPagination(data.pagination || {})
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(filters)
  }, [filters])

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setFilters(f => ({ ...f, search, page: 1 }))}
          placeholder="Search complaints..." className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30" />
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30">
          <option value="">All Statuses</option>
          {COMPLAINT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => setFilters(f => ({ ...f, search, page: 1 }))}
          className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader /></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40 dark:opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <p className="font-medium text-gray-900 dark:text-gray-300">No complaints found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map(c => (
            <div key={c._id} onClick={() => onSelect?.(c)}>
              <ComplaintCard complaint={c} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button disabled={!pagination.hasPrevPage}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button disabled={!pagination.hasNextPage}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ComplaintList