import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate, formatRelativeTime, formatStatus, formatCategory, getImageUrl } from '../../utils/formatters'

const CATEGORY_ICONS = {
  garbage_overflow: '🗑️',
  illegal_dumping: '⚠️',
  littering: '🚯',
  hazardous_waste: '☣️',
  drainage_blockage: '💧',
  other: '📦',
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-400 text-amber-950 border-amber-300 font-bold shadow-sm',
    dot: 'bg-amber-900 animate-pulse',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-sky-500 text-white border-sky-400 font-semibold shadow-sm',
    dot: 'bg-white animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-sm',
    dot: 'bg-white',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-rose-600 text-white border-rose-500 font-semibold shadow-sm',
    dot: 'bg-white',
  },
}

const PRIORITY_CONFIG = {
  urgent: 'bg-rose-600 text-white font-bold',
  high: 'bg-orange-500 text-white font-semibold',
  medium: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
}

const ComplaintCard = ({ complaint, isSelected = false, onSelect }) => {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const imgUrl = getImageUrl(complaint?.image)
  const hasValidImage = Boolean(imgUrl && !imgError)

  const statusInfo = STATUS_CONFIG[complaint?.status] || STATUS_CONFIG.pending
  const priorityClass = PRIORITY_CONFIG[complaint?.priority] || PRIORITY_CONFIG.medium
  const categoryIcon = CATEGORY_ICONS[complaint?.category] || '📦'

  const refId = complaint?._id ? `#${complaint._id.slice(-5).toUpperCase()}` : '#CMP'
  const hasCoordinates = Boolean(complaint?.location?.coordinates?.lat && complaint?.location?.coordinates?.lng)

  const handleClick = (e) => {
    e.preventDefault()
    if (onSelect) {
      onSelect(complaint)
    } else {
      navigate(`/track-complaint?id=${complaint._id}`)
    }
  }

  return (
    <article
      onClick={handleClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e)
        }
      }}
      className={`group relative flex flex-col rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer bg-white dark:bg-slate-900 ${
        isSelected
          ? 'border border-emerald-600 dark:border-emerald-500 shadow-sm'
          : 'border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500'
      }`}
    >
      {/* ─── Card Header / Image Area (FIXED HEIGHT, NEVER COLLAPSES) ─── */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 select-none">
        {hasValidImage ? (
          <img
            src={imgUrl}
            alt={complaint.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Elegant placeholder when no photo uploaded */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No complaint image uploaded
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Verified by registered GPS location
            </span>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${statusInfo.badge}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            <span>{statusInfo.label}</span>
          </span>

          {/* Priority Badge */}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold shadow-sm ${priorityClass}`}>
            {formatStatus(complaint?.priority || 'medium')}
          </span>
        </div>

        {/* Bottom Floating Info Overlays */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none text-white text-[11px]">
          {/* ID Chip */}
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md font-mono font-medium tracking-wide border border-white/10">
            {refId}
          </span>

          {/* GPS tag if coordinates exist */}
          {hasCoordinates && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 backdrop-blur-md font-medium border border-emerald-500/40">
              <span>📍</span>
              <span>GPS Tagged</span>
            </span>
          )}
        </div>
      </div>

      {/* ─── Card Body ─── */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <span>{categoryIcon}</span>
              <span>{formatCategory(complaint?.category || 'other')}</span>
            </span>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              {formatRelativeTime(complaint?.createdAt) || formatDate(complaint?.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {complaint?.title || 'Untitled Complaint'}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
            {complaint?.description || 'No description provided.'}
          </p>
        </div>

        {/* ─── Footer Section ─── */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1 font-medium">
              {complaint?.location?.address || 'Address details provided'}
            </span>
          </div>

          {/* Bottom Bar: Timeline updates + Action prompt */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="inline-flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>
                {complaint?.timeline?.length
                  ? `${complaint.timeline.length} status update${complaint.timeline.length > 1 ? 's' : ''}`
                  : 'Submitted'}
              </span>
            </span>

            <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>View Details</span>
              <span>&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ComplaintCard