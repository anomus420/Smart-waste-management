import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { formatDate, formatStatus, getStatusColor } from '../../utils/formatters';

const STATUSES = ['', 'requested', 'confirmed', 'picked_up', 'cancelled'];

export default function EWasteTable() {
  const [pickups, setPickups] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', adminNotes: '' });
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchPickups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      const { data } = await api.get('/admin/ewaste', { params });
      setPickups(data.pickups || []);
      setPagination(data.pagination || {});
    } catch {
      setError('Failed to load e-waste pickups.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPickups(); }, [fetchPickups]);

  const openDetail = (pickup) => {
    setSelected(pickup);
    setUpdateForm({ status: pickup.status, adminNotes: pickup.adminNotes || '' });
    setUpdateMsg('');
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    setUpdateMsg('');
    try {
      await api.put(`/admin/ewaste/${selected._id}`, updateForm);
      setUpdateMsg('Updated successfully.');
      fetchPickups();
      setSelected(prev => ({ ...prev, ...updateForm }));
    } catch {
      setUpdateMsg('Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const wasteTypeLabel = (t) =>
    t?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '-';

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s ? formatStatus(s) : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {loading ? <Loader /> : error ? <Alert type="error" message={error} /> : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  {['User', 'Waste Type', 'Qty', 'Address', 'Pickup Date', 'Slot', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pickups.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No pickups found.</td></tr>
                ) : pickups.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{p.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{wasteTypeLabel(p.wasteType)}</td>
                    <td className="px-4 py-3 text-gray-700">{p.quantity}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{p.address}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(p.pickupDate)}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{p.pickupTimeSlot}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(p)}
                        className="text-green-600 hover:text-green-800 font-medium text-xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
              <div className="flex gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Manage E-Waste Pickup">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">User:</span> <span className="font-medium">{selected.userId?.name}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selected.contactPhone || '-'}</span></div>
              <div><span className="text-gray-500">Waste Type:</span> <span className="font-medium">{wasteTypeLabel(selected.wasteType)}</span></div>
              <div><span className="text-gray-500">Quantity:</span> <span className="font-medium">{selected.quantity}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(selected.pickupDate)}</span></div>
              <div><span className="text-gray-500">Slot:</span> <span className="font-medium capitalize">{selected.pickupTimeSlot}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium">{selected.address}</span></div>
              {selected.description && (
                <div className="col-span-2"><span className="text-gray-500">Notes:</span> <span>{selected.description}</span></div>
              )}
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={updateForm.status}
                  onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                >
                  {['requested','confirmed','picked_up','cancelled'].map(s => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  value={updateForm.adminNotes}
                  onChange={e => setUpdateForm(f => ({ ...f, adminNotes: e.target.value }))}
                  placeholder="Internal notes..."
                />
              </div>
            </div>

            {updateMsg && (
              <p className={`text-sm ${updateMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                {updateMsg}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setSelected(null)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}