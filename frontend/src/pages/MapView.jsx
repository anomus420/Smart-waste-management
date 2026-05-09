import { useState, useEffect, useRef, useCallback } from 'react';
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
      <div style="position:relative;width:28px;height:28px">
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

// ── Main component ───────────────────────────────────────────────────────────
export default function MapView() {
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
            center={[20.5937, 78.9629]}  // center of India — change to your city
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
              const color = getCategoryColor(c.category);
              const icon  = makeIcon(color, !!isLive); // pulse only for live ones
              const lat   = c.location?.coordinates?.lat;
              const lng   = c.location?.coordinates?.lng;
              if (!lat || !lng) return null;
              return (
                <Marker key={c._id} position={[lat, lng]} icon={icon}>
                  <Popup className="dark:bg-gray-800 dark:text-gray-100 [&_.leaflet-popup-content-wrapper]:dark:bg-gray-800 [&_.leaflet-popup-content-wrapper]:dark:text-gray-100 [&_.leaflet-popup-tip]:dark:bg-gray-800">
                    <div className="min-w-[200px]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate max-w-[140px]">
                          {c.title}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatCategory(c.category)}</p>
                      {c.location?.address && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{c.location.address}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatRelativeTime(c.createdAt)}</p>
                      {isLive && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-green-700 dark:text-green-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                          Just filed
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
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