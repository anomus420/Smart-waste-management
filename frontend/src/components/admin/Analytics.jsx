import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import Loader from '../common/Loader'
import { formatStatus } from '../../utils/formatters'

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getDashboard().then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader /></div>
  if (!data) return <p className="text-center text-gray-400 py-12">No data available.</p>

  const { categoryStats = [], monthlyTrend = [], stats } = data
  const maxCat = Math.max(...categoryStats.map(c => c.count || 0), 1)
  const maxMonth = Math.max(...monthlyTrend.map(m => m.count || 0), 1)
  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7']

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Complaints', value: stats?.complaints?.total, color: 'text-gray-900' },
          { label: 'Pending', value: stats?.complaints?.pending, color: 'text-yellow-600' },
          { label: 'In Progress', value: stats?.complaints?.in_progress, color: 'text-blue-600' },
          { label: 'Resolved', value: stats?.complaints?.resolved, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut-like category chart using SVG */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Category Distribution</h3>
          <div className="space-y-3">
            {categoryStats.map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 font-medium">{formatStatus(cat._id || cat.category)}</span>
                    <span className="text-xs text-gray-500">{cat.count} ({Math.round((cat.count / maxCat) * 100)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(cat.count / maxCat) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend SVG */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Monthly Trend</h3>
          <svg viewBox="0 0 300 120" className="w-full">
            {monthlyTrend.map((m, i) => {
              const barH = Math.max((m.count / maxMonth) * 90, 4)
              const x = 10 + i * (280 / Math.max(monthlyTrend.length, 1))
              const y = 110 - barH
              return (
                <g key={i}>
                  <rect x={x} y={y} width="18" height={barH} fill="#16a34a" rx="3" opacity="0.85" />
                  <text x={x + 9} y="118" textAnchor="middle" fontSize="7" fill="#9ca3af">
                    {String(m._id?.month || m.month || '').slice(0, 3)}
                  </text>
                  <text x={x + 9} y={y - 3} textAnchor="middle" fontSize="7" fill="#374151">{m.count}</text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Analytics