import { useNavigate } from 'react-router-dom'
import { formatDate, formatStatus, formatCategory, getStatusColor, getPriorityColor, getImageUrl } from '../../utils/formatters'

const ComplaintCard = ({ complaint }) => {
  const navigate = useNavigate()
  const imgUrl = getImageUrl(complaint.image)

  return (
    <div onClick={() => navigate(`/track-complaint?id=${complaint._id}`)}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
      {imgUrl && (
        <div className="h-36 overflow-hidden">
          <img src={imgUrl} alt={complaint.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{complaint.title}</h3>
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${getStatusColor(complaint.status)}`}>
            {formatStatus(complaint.status)}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{complaint.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{formatCategory(complaint.category)}</span>
            {complaint.priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(complaint.priority)}`}>{formatStatus(complaint.priority)}</span>
            )}
          </div>
          <span className="text-xs text-gray-400">{formatDate(complaint.createdAt)}</span>
        </div>
        {complaint.location?.address && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="line-clamp-1">{complaint.location.address}</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default ComplaintCard