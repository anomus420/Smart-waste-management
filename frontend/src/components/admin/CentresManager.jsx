import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';

const emptyForm = {
  name: '',
  address: '',
  phone: '',
  email: '',
  operatingHours: '',
  acceptedWaste: '',
  lat: '',
  lng: '',
};

export default function CentresManager() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCentres = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/ewaste/centers');
      setCentres(data.centers || []);
    } catch {
      setError('Failed to load centres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCentres(); }, [fetchCentres]);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.address.trim()) return 'Address is required.';
    if (!form.phone.trim()) return 'Phone is required.';
    if (form.lat && isNaN(parseFloat(form.lat))) return 'Latitude must be a number.';
    if (form.lng && isNaN(parseFloat(form.lng))) return 'Longitude must be a number.';
    return '';
  };

  const handleCreate = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormLoading(true); setFormError('');
    try {
      const payload = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        operatingHours: form.operatingHours,
        acceptedWaste: form.acceptedWaste
          ? form.acceptedWaste.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      };
      if (form.lat && form.lng) {
        payload.location = {
          coordinates: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
        };
      }
      await api.post('/admin/centers', payload);
      setShowCreate(false);
      setForm(emptyForm);
      fetchCentres();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create centre.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/admin/centers/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchCentres();
    } catch {
      setFormError('Failed to delete centre.');
    } finally {
      setFormLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{centres.length} centre{centres.length !== 1 ? 's' : ''} registered</p>
        <button
          onClick={() => { setForm(emptyForm); setFormError(''); setShowCreate(true); }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Add Centre
        </button>
      </div>

      {loading ? <Loader /> : error ? <Alert type="error" message={error} /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centres.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-400">No centres added yet.</div>
          ) : centres.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow relative">
              <button
                onClick={() => setDeleteTarget(c)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors text-lg"
                title="Delete centre"
              >
                ×
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-lg">♻</span>
                </div>
                <div className="min-w-0 flex-1 pr-4">
                  <h3 className="font-semibold text-gray-900 leading-snug">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{c.address}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                {c.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400 w-4 text-center">📞</span>
                    {c.phone}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400 w-4 text-center">✉</span>
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.operatingHours && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400 w-4 text-center">⏰</span>
                    {c.operatingHours}
                  </div>
                )}
                {c.acceptedWaste?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.acceptedWaste.slice(0, 3).map((w, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {w}
                      </span>
                    ))}
                    {c.acceptedWaste.length > 3 && (
                      <span className="text-xs text-gray-400">+{c.acceptedWaste.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal isOpen onClose={() => setShowCreate(false)} title="Add E-Waste Centre">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('Centre Name *', 'name', 'text', 'e.g. GreenTech Recyclers')}
              {field('Phone *', 'phone', 'tel', '+91 98765 43210')}
            </div>
            {field('Address *', 'address', 'text', 'Full address')}
            {field('Email', 'email', 'email', 'contact@centre.com')}
            {field('Operating Hours', 'operatingHours', 'text', 'e.g. Mon–Sat, 9am–6pm')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accepted Waste Types (comma-separated)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.acceptedWaste}
                onChange={e => setForm(f => ({ ...f, acceptedWaste: e.target.value }))}
                placeholder="Laptops, Batteries, Phones"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {field('Latitude', 'lat', 'number', '28.6139')}
              {field('Longitude', 'lng', 'number', '77.2090')}
            </div>

            {formError && <Alert type="error" message={formError} />}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={formLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {formLoading ? 'Adding...' : 'Add Centre'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <Modal isOpen onClose={() => setDeleteTarget(null)} title="Delete Centre">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone.
            </p>
            {formError && <Alert type="error" message={formError} />}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={formLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {formLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}