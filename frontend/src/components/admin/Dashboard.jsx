import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import Loader from '../common/Loader'
import { formatDate, formatStatus, getStatusColor, getPriorityColor } from '../../utils/formatters'

const StatCard = ({ label, value, icon, color = 'green' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
      <span className={`text-${color}-600 text-xl`}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
)

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboard().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader /></div>
  if (!data) return <p className="text-center text-gray-400 py-12">Failed to load dashboard data.</p>

  const { stats, recentComplaints = [], categoryStats = [], monthlyTrend = [] } = data
  const maxCategory = Math.max(...categoryStats.map(c => c.count || 0), 1)
  const maxMonthly = Math.max(...monthlyTrend.map(m => m.count || 0), 1)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats?.users?.total} icon="👥" color="blue" />
        <StatCard label="Total Complaints" value={stats?.complaints?.total} icon="📋" color="green" />
        <StatCard label="Pending" value={stats?.complaints?.pending} icon="⏳" color="yellow" />
        <StatCard label="Resolved" value={stats?.complaints?.resolved} icon="✅" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Complaints by Category</h3>
          <div className="space-y-3">
            {categoryStats.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{formatStatus(cat._id || cat.category)}</span>
                  <span className="text-xs font-medium text-gray-800">{cat.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${(cat.count / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Trend</h3>
          <div className="flex items-end gap-2 h-32">
            {monthlyTrend.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-green-500 rounded-t-sm transition-all duration-500"
                  style={{ height: `${(m.count / maxMonthly) * 100}%`, minHeight: '4px' }} />
                <span className="text-xs text-gray-400">{m.month || m._id?.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Complaints</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'User', 'Category', 'Status', 'Priority', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentComplaints.slice(0, 5).map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{c.title}</td>
                  <td className="px-4 py-3 text-gray-500">{c.userId?.name || 'Anonymous'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatStatus(c.category)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(c.status)}`}>{formatStatus(c.status)}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(c.priority)}`}>{formatStatus(c.priority)}</span></td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard