import { formatDate, formatStatus, getStatusColor } from '../../utils/formatters'

const STATUS_ORDER = ['pending', 'in_progress', 'resolved']

const ComplaintTracker = ({ complaint }) => {
  const timeline = complaint?.timeline || []
  const currentStatus = complaint?.status

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">Status Timeline</h3>
      <div className="relative">
        {timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">No timeline events yet.</div>
        ) : (
          <div className="space-y-0">
            {timeline.map((event, idx) => {
              const isLast = idx === timeline.length - 1
              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isLast ? 'bg-green-600 border-green-600 text-white' : 'bg-white dark:bg-gray-800 border-green-300 dark:border-green-600 text-green-600 dark:text-green-500'}`}>
                      {isLast ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      )}
                    </div>
                    {!isLast && <div className="w-0.5 h-8 bg-green-200 dark:bg-green-800/50 my-1" />}
                  </div>
                  <div className={`pb-6 ${isLast ? '' : ''}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(event.status)}`}>{formatStatus(event.status)}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(event.createdAt)}</span>
                    </div>
                    {event.message && <p className="text-sm text-gray-600 dark:text-gray-300">{event.message}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplaintTracker