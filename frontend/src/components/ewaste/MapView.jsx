import { useState, useEffect } from 'react'
import { ewasteService } from '../../services/ewasteService'
import CenterCard from './CenterCard'
import Loader from '../common/Loader'

const MapViewComponent = () => {
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    ewasteService.getCenters().then(d => { setCenters(d.centers || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = centers.filter(c =>
    !filter || c.address?.toLowerCase().includes(filter.toLowerCase()) || c.name?.toLowerCase().includes(filter.toLowerCase())
  )

  const mapCenter = selected
    ? `${selected.location?.coordinates?.lat || 20.5937},${selected.location?.coordinates?.lng || 78.9629}`
    : '20.5937,78.9629'
  const bbox = selected
    ? `${(selected.location?.coordinates?.lng || 78.9) - 0.05},${(selected.location?.coordinates?.lat || 20.5) - 0.05},${(selected.location?.coordinates?.lng || 78.9) + 0.05},${(selected.location?.coordinates?.lat || 20.5) + 0.05}`
    : '68.1,6.5,97.4,35.7'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '500px' }}>
          <iframe
            title="E-Waste Centers Map"
            width="100%"
            height="100%"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
            className="border-0"
          />
        </div>
        <a href={`https://www.openstreetmap.org/?mlat=${mapCenter.split(',')[0]}&mlon=${mapCenter.split(',')[1]}`}
          target="_blank" rel="noopener noreferrer"
          className="text-xs text-green-600 hover:underline mt-1 inline-block">
          View larger map →
        </a>
      </div>

      <div className="space-y-4">
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter by city or name..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '450px' }}>
          {loading ? <div className="flex justify-center py-8"><Loader /></div> :
            filtered.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">No centers found</p> :
            filtered.map((c, i) => (
              <div key={i} onClick={() => setSelected(c)} className={`cursor-pointer ${selected?._id === c._id ? 'ring-2 ring-green-500 rounded-xl' : ''}`}>
                <CenterCard center={c} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default MapViewComponent