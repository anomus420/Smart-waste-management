import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import EWasteForm from '../components/ewaste/EWasteForm';
import CenterCard from '../components/ewaste/CenterCard';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { formatDate, formatStatus, getStatusColor } from '../utils/formatters';

const WASTE_TYPE_LABELS = {
  mobile_phones: 'Mobile Phones', laptops: 'Laptops', tablets: 'Tablets',
  televisions: 'Televisions', refrigerators: 'Refrigerators', washing_machines: 'Washing Machines',
  printers: 'Printers', batteries: 'Batteries', cables_accessories: 'Cables & Accessories', other: 'Other',
};

export default function EWasteRequest() {
  return (
    <ProtectedRoute>
      <EWasteRequestInner />
    </ProtectedRoute>
  );
}

function EWasteRequestInner() {
  const [activeTab, setActiveTab] = useState('request');
  const [pickups, setPickups] = useState([]);
  const [pickupsLoading, setPickupsLoading] = useState(false);
  const [pickupsError, setPickupsError] = useState('');
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);
  const [centerFilter, setCenterFilter] = useState('');

  // Detail modal
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [detailPickup, setDetailPickup] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Cancel
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState({ type: '', text: '' });

  const fetchPickups = async () => {
    setPickupsLoading(true); setPickupsError('');
    try {
      const { data } = await api.get('/ewaste');
      setPickups(data.pickups || []);
    } catch {
      setPickupsError('Failed to load your pickups.');
    } finally {
      setPickupsLoading(false);
    }
  };

  const fetchCenters = async () => {
    setCentersLoading(true);
    try {
      const { data } = await api.get('/ewaste/centers');
      setCenters(data.centers || []);
    } catch {
      // silent
    } finally {
      setCentersLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
    fetchCenters();
  }, []);

  const openPickupDetail = async (pickup) => {
    setSelectedPickup(pickup);
    setDetailLoading(true);
    setCancelMsg({ type: '', text: '' });
    try {
      const { data } = await api.get(`/ewaste/${pickup._id}`);
      setDetailPickup(data.pickup || pickup);
    } catch {
      setDetailPickup(pickup);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!detailPickup) return;
    setCancelling(true); setCancelMsg({ type: '', text: '' });
    try {
      await api.put(`/ewaste/${detailPickup._id}`, { status: 'cancelled' });
      setCancelMsg({ type: 'success', text: 'Pickup cancelled successfully.' });
      fetchPickups();
      setDetailPickup(prev => ({ ...prev, status: 'cancelled' }));
    } catch (e) {
      setCancelMsg({ type: 'error', text: e.response?.data?.message || 'Failed to cancel pickup.' });
    } finally {
      setCancelling(false);
    }
  };

  const filteredCenters = centers.filter(c =>
    !centerFilter || c.name?.toLowerCase().includes(centerFilter.toLowerCase()) || c.address?.toLowerCase().includes(centerFilter.toLowerCase())
  );

  const statusBadge = (status) => (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {formatStatus(status)}
    </span>
  );

  const TABS = [
    { id: 'request', label: 'Schedule Pickup' },
    { id: 'my',      label: `My Requests (${pickups.length})` },
    { id: 'centers', label: 'Drop-off Centres' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">E-Waste Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Responsibly dispose of your electronic waste</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'request' && (
        <EWasteForm onSuccess={() => { setActiveTab('my'); fetchPickups(); }} />
      )}

      {activeTab === 'my' && (
        <div>
          {pickupsLoading ? <Loader /> : pickupsError ? <Alert type="error" message={pickupsError} /> : pickups.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">📦</p>
              <p className="text-gray-500">No pickup requests yet.</p>
              <button
                onClick={() => setActiveTab('request')}
                className="mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Schedule a Pickup
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {pickups.map(pickup => (
                <div
                  key={pickup._id}
                  onClick={() => openPickupDetail(pickup)}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-sm hover:border-green-200 dark:hover:border-green-500 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-green-600 dark:text-green-400 text-lg">♻</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {WASTE_TYPE_LABELS[pickup.wasteType] || pickup.wasteType}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Qty: {pickup.quantity} · {pickup.pickupTimeSlot && pickup.pickupTimeSlot.charAt(0).toUpperCase() + pickup.pickupTimeSlot.slice(1)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate max-w-xs">{pickup.address}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {statusBadge(pickup.status)}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(pickup.pickupDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'centers' && (
        <div>
          <input
            type="text"
            placeholder="Search centres..."
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-5"
            value={centerFilter}
            onChange={e => setCenterFilter(e.target.value)}
          />
          {centersLoading ? <Loader /> : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredCenters.length === 0 ? (
                <p className="col-span-2 text-center text-gray-400 py-10">No centres found.</p>
              ) : filteredCenters.map(center => (
                <CenterCard key={center._id} center={center} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pickup Detail Modal */}
      {selectedPickup && (
        <Modal
          isOpen
          onClose={() => { setSelectedPickup(null); setDetailPickup(null); }}
          title="Pickup Request Details"
        >
          {detailLoading ? <Loader /> : detailPickup ? (
            <div className="space-y-5 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between">
                {statusBadge(detailPickup.status)}
                <span className="text-sm text-gray-500 dark:text-gray-400">#{detailPickup._id?.slice(-6).toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Waste Type</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{WASTE_TYPE_LABELS[detailPickup.wasteType] || detailPickup.wasteType}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Quantity</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{detailPickup.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Pickup Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailPickup.pickupDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Time Slot</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{detailPickup.pickupTimeSlot}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Address</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{detailPickup.address}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Contact Phone</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{detailPickup.contactPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Requested On</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(detailPickup.createdAt)}</p>
                </div>
                {detailPickup.description && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Description</p>
                    <p className="text-gray-700 dark:text-gray-300">{detailPickup.description}</p>
                  </div>
                )}
              </div>

              {detailPickup.adminNotes && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">Admin Notes</p>
                  <p className="text-blue-600 dark:text-blue-300">{detailPickup.adminNotes}</p>
                </div>
              )}

              {cancelMsg.text && <Alert type={cancelMsg.type} message={cancelMsg.text} />}

              <div className="flex gap-3 pt-1">
                {detailPickup.status === 'requested' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Pickup'}
                  </button>
                )}
                <button
                  onClick={() => { setSelectedPickup(null); setDetailPickup(null); }}
                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}