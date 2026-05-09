const CenterCard = ({ center }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.address || center.name)}`

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{center.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{center.address}</p>
        </div>
        {center.rating && (
          <div className="flex items-center gap-1 text-yellow-500">
            {'★'.repeat(Math.round(center.rating))}{'☆'.repeat(5 - Math.round(center.rating))}
            <span className="text-xs text-gray-500 ml-1">{center.rating}</span>
          </div>
        )}
      </div>

      {center.operatingHours && (
        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {center.operatingHours}
        </p>
      )}

      {center.phone && (
        <p className="text-xs text-gray-600 mb-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          {center.phone}
        </p>
      )}

      {center.acceptedWasteTypes?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {center.acceptedWasteTypes.slice(0, 4).map((t, i) => (
            <span key={i} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{t.replace(/_/g, ' ')}</span>
          ))}
          {center.acceptedWasteTypes.length > 4 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{center.acceptedWasteTypes.length - 4} more</span>
          )}
        </div>
      )}

      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-green-600 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Get Directions
      </a>
    </div>
  )
}

export default CenterCard