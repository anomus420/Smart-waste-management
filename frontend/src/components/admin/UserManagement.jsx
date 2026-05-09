import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import Loader from '../common/Loader'
import Alert from '../common/Alert'
import Modal from '../common/Modal'
import { formatDate } from '../../utils/formatters'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', role: '' })
  const [alert, setAlert] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetch = async (params) => {
    setLoading(true)
    try {
      const data = await adminService.getUsers(params)
      setUsers(data.users || [])
      setPagination(data.pagination || {})
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch(filters) }, [JSON.stringify(filters)])

  const handleBlock = async (id) => {
    setActionLoading(id)
    try {
      await adminService.blockUser(id)
      setAlert({ type: 'success', message: 'User block status updated' })
      fetch(filters)
    } catch { setAlert({ type: 'error', message: 'Action failed' }) }
    finally { setActionLoading(null) }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setActionLoading(deleteModal._id)
    try {
      await adminService.deleteUser(deleteModal._id)
      setAlert({ type: 'success', message: 'User deleted' })
      setDeleteModal(null)
      fetch(filters)
    } catch { setAlert({ type: 'error', message: 'Delete failed' }) }
    finally { setActionLoading(null) }
  }

  return (
    <div className="space-y-4">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex gap-3">
        <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
          placeholder="Search users..." className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-green-500" />
        <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}
          className="px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:border-green-500">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader /></div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button disabled={actionLoading === u._id} onClick={() => handleBlock(u._id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${u.isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        <button onClick={() => setDeleteModal(u)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Total: {pagination.total} users</p>
              <div className="flex items-center gap-2">
                <button disabled={!pagination.hasPrevPage} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <span className="text-xs text-gray-500">{pagination.page}/{pagination.totalPages}</span>
                <button disabled={!pagination.hasNextPage} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Confirm Delete">
        <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} disabled={!!actionLoading} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50">Delete</button>
        </div>
      </Modal>
    </div>
  )
}

export default UserManagement