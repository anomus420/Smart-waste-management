import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// ─── Custom Uber / Rapido Style Map Pin ───────────────────────────────────────
const pinIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="position:relative;width:36px;height:48px;cursor:pointer;">
      <svg viewBox="0 0 24 32" width="36" height="48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <path d="M12 0C5.37258 0 0 5.37258 0 12C0 20.5 12 32 12 32C12 32 24 20.5 24 12C24 5.37258 18.6274 0 12 0Z" fill="#16a34a"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
        <circle cx="12" cy="12" r="2.5" fill="#15803d"/>
      </svg>
      <div style="position:absolute;bottom:0;left:14px;width:8px;height:4px;background:rgba(0,0,0,0.35);border-radius:50%;filter:blur(1px);"></div>
    </div>
  `,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -48],
})

// ─── Helper: Invalidate Size on Mount (Fixes blank tiles in modal) ────────────
const MapResizer = () => {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

// ─── Map Click & Drag Events ─────────────────────────────────────────────────
const MapEvents = ({ onLocationChange }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ─── Fly to target coords ───────────────────────────────────────────────────
const FlyToCoords = ({ coords }) => {
  const map = useMap()
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, 16, { animate: true, duration: 1.2 })
    }
  }, [coords, map])
  return null
}

// ─── Local Storage Key for Last Saved Location ──────────────────────────────
const STORAGE_KEY = 'smartwaste_last_location'

const getSavedLocation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed
    }
  } catch {
    return null
  }
  return null
}

const LocationPickerModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
  initialAddress,
}) => {
  // Determine initial coordinates: prop coords -> last saved location -> default (New Delhi fallback)
  const getInitialCoords = () => {
    if (initialLat && initialLng && !isNaN(parseFloat(initialLat)) && !isNaN(parseFloat(initialLng))) {
      return [parseFloat(initialLat), parseFloat(initialLng)]
    }
    const saved = getSavedLocation()
    if (saved) {
      return [saved.lat, saved.lng]
    }
    return [28.6139, 77.2090]
  }

  const [position, setPosition] = useState(getInitialCoords)
  const [flyCoords, setFlyCoords] = useState(null)
  const [address, setAddress] = useState(initialAddress || getSavedLocation()?.address || '')
  const [isResolving, setIsResolving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const searchTimeoutRef = useRef(null)
  const reverseTimeoutRef = useRef(null)

  // Reverse Geocoding with OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsResolving(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )
      const data = await res.json()
      if (data && data.display_name) {
        // Format clean address (prefer road + neighbourhood + city)
        const addr = data.address || {}
        const mainParts = [
          addr.road || addr.pedestrian || addr.suburb,
          addr.neighbourhood || addr.residential || addr.suburb,
          addr.city || addr.town || addr.village || addr.county,
          addr.state,
        ].filter(Boolean)

        const clean = mainParts.length > 0 ? mainParts.join(', ') : data.display_name
        setAddress(clean)
      } else {
        setAddress(`Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
      }
    } catch {
      setAddress(`Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`)
    } finally {
      setIsResolving(false)
    }
  }, [])

  // When marker moves
  const handleLocationChange = (lat, lng) => {
    setPosition([lat, lng])
    if (reverseTimeoutRef.current) clearTimeout(reverseTimeoutRef.current)
    reverseTimeoutRef.current = setTimeout(() => {
      reverseGeocode(lat, lng)
    }, 350)
  }

  // Marker drag end
  const handleMarkerDragEnd = (e) => {
    const marker = e.target
    if (marker) {
      const newPos = marker.getLatLng()
      handleLocationChange(newPos.lat, newPos.lng)
    }
  }

  // Initial geocode and live GPS acquisition on open
  useEffect(() => {
    if (!isOpen) return

    const hasInitialCoords =
      initialLat && initialLng &&
      !isNaN(parseFloat(initialLat)) &&
      !isNaN(parseFloat(initialLng))

    if (hasInitialCoords) {
      const lat = parseFloat(initialLat)
      const lng = parseFloat(initialLng)
      setPosition([lat, lng])
      setFlyCoords([lat, lng])
      if (initialAddress) {
        setAddress(initialAddress)
      } else {
        reverseGeocode(lat, lng)
      }
      return
    }

    // No explicit coordinates passed:
    // First, start immediately from last saved location if present
    const saved = getSavedLocation()
    if (saved) {
      setPosition([saved.lat, saved.lng])
      setFlyCoords([saved.lat, saved.lng])
      if (saved.address) {
        setAddress(saved.address)
      } else {
        reverseGeocode(saved.lat, saved.lng)
      }
    }

    // Simultaneously, request user's live GPS location to pinpoint immediately
    if (navigator.geolocation) {
      setLocatingUser(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const liveLat = pos.coords.latitude
          const liveLng = pos.coords.longitude
          setPosition([liveLat, liveLng])
          setFlyCoords([liveLat, liveLng])
          reverseGeocode(liveLat, liveLng)
          setLocatingUser(false)
        },
        (err) => {
          console.warn('Auto live location warning:', err)
          setLocatingUser(false)
          // If no saved location existed, fall back to default
          if (!saved) {
            setPosition([28.6139, 77.2090])
            reverseGeocode(28.6139, 77.2090)
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      )
    } else if (!saved) {
      setPosition([28.6139, 77.2090])
      reverseGeocode(28.6139, 77.2090)
    }
  }, [isOpen, initialLat, initialLng, initialAddress, reverseGeocode])

  // Current GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        setFlyCoords([lat, lng])
        handleLocationChange(lat, lng)
        setLocatingUser(false)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        alert('Could not determine your GPS location. Please drop the pin manually on the map.')
        setLocatingUser(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Search places via Nominatim
  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (!q.trim() || q.trim().length < 3) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
          {
            headers: { 'Accept-Language': 'en' },
          }
        )
        const data = await res.json()
        setSearchResults(data || [])
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setPosition([lat, lng])
    setFlyCoords([lat, lng])
    setAddress(result.display_name)
    setSearchResults([])
    setSearchQuery('')
  }

  // Confirm selection
  const handleConfirm = () => {
    const chosenAddress = address || `Location (${position[0].toFixed(5)}, ${position[1].toFixed(5)})`
    const chosenLat = position[0].toFixed(6)
    const chosenLng = position[1].toFixed(6)

    // Save to localStorage so future selections remember this location
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lat: parseFloat(chosenLat),
          lng: parseFloat(chosenLng),
          address: chosenAddress,
        })
      )
    } catch (e) {
      console.warn('Could not save location to localStorage:', e)
    }

    onConfirm({
      address: chosenAddress,
      lat: chosenLat,
      lng: chosenLng,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[85vh] max-h-[680px]">
        {/* ─── Modal Header ─── */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Select Waste Location
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Drag the pin or click anywhere on the map to pinpoint the exact location
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* ─── Map & Floating Search Bar Area ─── */}
        <div className="relative flex-1 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {/* Live locating banner */}
          {locatingUser && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Acquiring live location...</span>
            </div>
          )}

          {/* Floating Search Bar */}
          <div className="absolute top-3 left-3 right-14 sm:right-auto sm:w-80 z-[1000]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search area, landmark, or sector..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>

              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full p-2.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-2"
                  >
                    <span className="text-emerald-600 mt-0.5">📍</span>
                    <span className="line-clamp-2 text-slate-800 dark:text-slate-200 font-medium">
                      {item.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floating "Locate Me" Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            title="Use current GPS location"
            className="absolute top-3 right-3 z-[1000] w-9 h-9 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {locatingUser ? (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="7" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
              </svg>
            )}
          </button>

          {/* Leaflet Map */}
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapResizer />
            <FlyToCoords coords={flyCoords} />
            <MapEvents onLocationChange={handleLocationChange} />

            <Marker
              position={position}
              icon={pinIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            />
          </MapContainer>

          {/* Instruction Pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/80 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-md pointer-events-none shadow-md">
            Click map or drag the green pin to position
          </div>
        </div>

        {/* ─── Modal Footer & Address Preview ─── */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                Pin Location Address
              </span>
              <div className="flex items-center gap-2">
                {isResolving ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-0.5">
                    <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Resolving street address...</span>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                    {address || 'Location selected on map'}
                  </p>
                )}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>✓</span>
                <span>Confirm Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationPickerModal
