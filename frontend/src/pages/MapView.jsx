import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../context/ToastContext';
import { getImageUrl, formatRelativeTime, formatCategory, getStatusColor } from '../utils/formatters';
import { ewasteService } from '../services/ewasteService';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';

// ── Custom marker icons ──────────────────────────────────────────────────────
const makeIcon = (color, pulse = false) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:28px;height:28px;cursor:pointer;">
        ${pulse ? `<div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.3;
          animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;
        "></div>` : ''}
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });

const CATEGORY_COLORS = {
  garbage_overflow: '#f97316',
  illegal_dumping:  '#ef4444',
  littering:        '#eab308',
  hazardous_waste:  '#dc2626',
  drainage_blockage:'#3b82f6',
  other:            '#6b7280',
};

const CATEGORY_ICONS = {
  garbage_overflow: '🗑️',
  illegal_dumping:  '⚠️',
  littering:        '🚯',
  hazardous_waste:  '☣️',
  drainage_blockage:'💧',
  other:            '📦',
};

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-400 text-amber-950 font-bold border-amber-300 shadow-sm',
    dot: 'bg-amber-900 animate-pulse',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-sky-500 text-white font-semibold border-sky-400 shadow-sm',
    dot: 'bg-white animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-emerald-600 text-white font-semibold border-emerald-500 shadow-sm',
    dot: 'bg-white',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-rose-600 text-white font-semibold border-rose-500 shadow-sm',
    dot: 'bg-white',
  },
};

const PRIORITY_CONFIG = {
  urgent: 'bg-rose-600 text-white font-bold',
  high: 'bg-orange-500 text-white font-semibold',
  medium: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
};

const getCategoryColor = (category) => CATEGORY_COLORS[category] || '#6b7280';

// Ping animation — inject once
if (!document.getElementById('leaflet-ping-style')) {
  const style = document.createElement('style');
  style.id = 'leaflet-ping-style';
  style.textContent = `@keyframes ping { 75%,100%{transform:scale(2);opacity:0} }`;
  document.head.appendChild(style);
}

// ── Sub-component: fly to location helper ───────────────────────────────────
const FlyToLocation = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { animate: true, duration: 1.2 });
  }, [coords, map]);
  return null;
};

// ── Sub-component: ComplaintMarker with smooth hover & dismiss behavior ───────
const ComplaintMarker = ({ c, isLive, navigate }) => {
  const markerRef = useRef(null);
  const timerRef = useRef(null);
  const isPinnedRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const handleMouseOver = () => {
    clearTimer();
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  };

  const handleMouseOut = () => {
    if (isPinnedRef.current) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.closePopup();
      }
    }, 250);
  };

  const handleClick = () => {
    isPinnedRef.current = true;
    clearTimer();
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  };

  const color = getCategoryColor(c.category);
  const icon = makeIcon(color, !!isLive);
  const lat = c.location?.coordinates?.lat;
  const lng = c.location?.coordinates?.lng;
  if (!lat || !lng) return null;

  const imgUrl = getImageUrl(c.image);
  const statusInfo = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
  const priorityClass = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.medium;
  const categoryIcon = CATEGORY_ICONS[c.category] || '📦';
  const refId = c._id ? `#${c._id.slice(-5).toUpperCase()}` : '#CMP';

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
        click: handleClick,
      }}
    >
      <Popup
        className="custom-leaflet-popup"
        minWidth={290}
        maxWidth={290}
        eventHandlers={{
          remove: () => {
            isPinnedRef.current = false;
            clearTimer();
          },
        }}
      >
        <div
          className="w-[290px] overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl"
          onMouseEnter={clearTimer}
          onMouseLeave={handleMouseOut}
        >
          {/* Fixed-height Header Image or Placeholder Banner */}
          <div className="relative h-32 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden select-none">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={c.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Placeholder fallback when photo is absent or fails */}
            <div
              className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${
                imgUrl ? 'hidden' : 'flex'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                No photo attached
              </span>
            </div>

            {/* Top Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 pointer-events-none" />

            {/* Top Floating Badges */}
            <div className="absolute top-2.5 left-2.5 right-9 flex items-center justify-between gap-1 pointer-events-none">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border ${statusInfo.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                <span>{statusInfo.label}</span>
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold shadow-sm ${priorityClass}`}>
                {c.priority || 'medium'}
              </span>
            </div>

            {/* Bottom Overlay (ID) */}
            <div className="absolute bottom-2 left-2.5 pointer-events-none">
              <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                {refId}
              </span>
            </div>
          </div>

          {/* Card Content Area */}
          <div className="p-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span>{categoryIcon}</span>
                <span>{formatCategory(c.category)}</span>
              </span>

              <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                {formatRelativeTime(c.createdAt)}
              </span>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug line-clamp-1">
              {c.title}
            </h4>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
              {c.description || 'Civic waste complaint reported at this location.'}
            </p>

            {c.location?.address && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-start gap-1">
                <span className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">📍</span>
                <span className="line-clamp-1">{c.location.address}</span>
              </p>
            )}

            {/* Live update badge */}
            {isLive && (
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Live update just filed</span>
              </div>
            )}

            {/* Track button */}
            <button
              type="button"
              onClick={() => navigate(`/track-complaint?id=${c._id}`)}
              className="mt-2.5 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              <span>Track Complaint Details</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
export default function MapView() {
  const navigate = useNavigate();
  const socket = useSocket();
  const toast = useToast();

  const [centers, setCenters] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [liveComplaints, setLiveComplaints] = useState([]); // real-time additions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNearby, setShowNearby] = useState(false);
  const [radius, setRadius] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [liveCount, setLiveCount] = useState(0);

  const fetchGlobalComplaints = useCallback(async () => {
    try {
      const res = await api.get('/complaints/nearby?lat=20.5937&lng=78.9629&radius=10000000');
      setComplaints(res.data.complaints || []);
    } catch {
      console.error('Could not fetch global complaints.');
    }
  }, []);

  // Load waste centers on mount
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await ewasteService.getCenters();
        setCenters(res.centers || []);
      } catch {
        setError('Failed to load waste centers.');
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
    fetchGlobalComplaints();
  }, [fetchGlobalComplaints]);

  // Socket.io — listen for new complaints
  useEffect(() => {
    if (!socket) return;

    const handleNewComplaint = (complaint) => {
      setLiveComplaints((prev) => {
        // Avoid duplicates
        if (prev.find((c) => c._id === complaint._id)) return prev;
        return [complaint, ...prev];
      });
      setLiveCount((n) => n + 1);
      toast.info(`New complaint filed: ${complaint.title}`);

      // Auto-fly map to new pin
      if (complaint.location?.coordinates?.lat && complaint.location?.coordinates?.lng) {
        setFlyTarget([complaint.location.coordinates.lat, complaint.location.coordinates.lng]);
      }
    };

    socket.on('new_complaint', handleNewComplaint);
    return () => socket.off('new_complaint', handleNewComplaint);
  }, [socket, toast]);

  // Geolocation + nearby complaints
  const fetchNearby = useCallback(async (lat, lng) => {
    try {
      const res = await api.get(`/complaints/nearby?lat=${lat}&lng=${lng}&radius=${radius * 1000}`);
      setComplaints(res.data.complaints || []);
    } catch {
      toast.error('Could not fetch nearby complaints.');
    }
  }, [radius, toast]);

  const handleToggleNearby = () => {
    if (showNearby) {
      setShowNearby(false);
      fetchGlobalComplaints();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);
        setFlyTarget([loc.lat, loc.lng]);
        setShowNearby(true);
        fetchNearby(loc.lat, loc.lng);
      },
      () => toast.error('Location access denied.')
    );
  };

  // Merge static nearby + live complaints (deduplicated)
  const allComplaints = [
    ...complaints,
    ...liveComplaints.filter((lc) => !complaints.find((c) => c._id === lc._id)),
  ];

  const centerIcon  = makeIcon('#16a34a');
  const userIcon    = makeIcon('#3b82f6');

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-wrap gap-3 transition-colors duration-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live waste map</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Waste centers + real-time complaints</p>
        </div>
        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse inline-block" />
              {liveCount} live update{liveCount > 1 ? 's' : ''}
            </span>
          )}
          <select
            value={radius}
            onChange={(e) => {
              setRadius(Number(e.target.value));
              if (showNearby && userLocation) fetchNearby(userLocation.lat, userLocation.lng);
            }}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value={1}>1 km</option>
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
          </select>
          <button
            onClick={handleToggleNearby}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showNearby
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {showNearby ? 'Hide nearby' : 'Show nearby'}
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="flex h-[calc(100vh-120px)]">
        {/* Map */}
        <div className="flex-1">
          <MapContainer
            center={[20.5937, 78.9629]}  // center of India — change to any city
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {flyTarget && <FlyToLocation coords={flyTarget} />}

            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>Your location</Popup>
              </Marker>
            )}

            {/* Waste center markers */}
            {centers.map((center) => (
              <Marker
                key={center._id}
                position={[center.lat, center.lng]}
                icon={centerIcon}
              >
                <Popup className="dark:bg-gray-800 dark:text-gray-100 [&_.leaflet-popup-content-wrapper]:dark:bg-gray-800 [&_.leaflet-popup-content-wrapper]:dark:text-gray-100 [&_.leaflet-popup-tip]:dark:bg-gray-800">
                  <div className="min-w-[180px]">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{center.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{center.address}</p>
                    {center.phone && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{center.phone}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{center.operatingHours}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Complaint markers (nearby + live) */}
            {allComplaints.map((c) => {
              const isLive = liveComplaints.find((lc) => lc._id === c._id);
              return (
                <ComplaintMarker
                  key={c._id}
                  c={c}
                  isLive={!!isLive}
                  navigate={navigate}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* Side panel */}
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto hidden lg:block transition-colors duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Waste centres ({centers.length})</h2>
          </div>
          {centers.map((center) => (
            <div
              key={center._id}
              className="p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => setFlyTarget([center.lat, center.lng])}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{center.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{center.address}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{center.operatingHours}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {center.acceptedWasteTypes?.map((t) => (
                  <span key={t} className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {liveComplaints.length > 0 && (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 mt-2">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  Live complaints ({liveComplaints.length})
                </h2>
              </div>
              {liveComplaints.map((c) => (
                <div
                  key={c._id}
                  className="p-4 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() =>
                    c.location?.coordinates?.lat &&
                    setFlyTarget([c.location.coordinates.lat, c.location.coordinates.lng])
                  }
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 pr-2">{c.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatCategory(c.category)}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(c.createdAt)}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}