import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { formatDate, formatStatus, formatCategory, getStatusColor, getPriorityColor, getImageUrl } from '../../utils/formatters';

const STATUSES   = ['', 'pending', 'in_progress', 'resolved', 'rejected'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['', 'garbage_overflow', 'illegal_dumping', 'littering', 'hazardous_waste', 'drainage_blockage', 'other'];

export default function ComplaintTable() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');

  // Detail modal
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', priority: '', adminNotes: '', statusMessage: '' });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  const fetchComplaints = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.status)   params.status   = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.search)   params.search   = filters.search;
      const { data } = await api.get('/admin/complaints', { params });
      setComplaints(data.complaints || []);
      setPagination(data.pagination || {});
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const openDetail = async (complaint) => {
    setDetailLoading(true);
    setUpdateMsg({ type: '', text: '' });
    setUpdateForm({
      status:        complaint.status || 'pending',
      priority:      complaint.priority || 'medium',
      adminNotes:    complaint.adminNotes || '',
      statusMessage: '',
    });
    try {
      const { data } = await api.get(`/complaints/${complaint._id}`);
      setSelected(data.complaint);
    } catch {
      setSelected(complaint);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdateLoading(true); setUpdateMsg({ type: '', text: '' });
    try {
      await api.put(`/admin/complaints/${selected._id}`, updateForm);
      setUpdateMsg({ type: 'success', text: 'Complaint updated successfully.' });
      fetchComplaints();
      setSelected(prev => ({ ...prev, ...updateForm }));
    } catch (e) {
      setUpdateMsg({ type: 'error', text: e.response?.data?.message || 'Update failed.' });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(f => ({ ...f, search: searchInput, page: 1 }));
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search complaints..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
        >
          Search
        </button>
        {[
          { key: 'status',   opts: STATUSES,   label: 'All Statuses',   fmt: formatStatus   },
          { key: 'priority', opts: PRIORITIES, label: 'All Priorities', fmt: v => v.charAt(0).toUpperCase() + v.slice(1) },
          { key: 'category', opts: CATEGORIES, label: 'All Categories', fmt: formatCategory },
        ].map(({ key, opts, label, fmt }) => (
          <select
            key={key}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filters[key]}
            onChange={e => setFilters(f => ({ ...f, [key]: e.target.value, page: 1 }))}
          >
            <option value="">{label}</option>
            {opts.filter(Boolean).map(o => <option key={o} value={o}>{fmt(o)}</option>)}
          </select>
        ))}
      </div>

      {loading ? <Loader /> : error ? <Alert type="error" message={error} /> : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  {['Title', 'User', 'Category', 'Status', 'Priority', 'Date', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No complaints found.</td></tr>
                ) : complaints.map(c => (
                  <tr
                    key={c._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openDetail(c)}
                  >
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="font-medium text-gray-900 truncate">{c.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{c.userId?.name || 'Anonymous'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatCategory(c.category)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                        {formatStatus(c.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(c.priority)}`}>
                        {c.priority?.charAt(0).toUpperCase() + c.priority?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium text-xs">View →</td>
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

      {/* Detail Modal */}
      {(selected || detailLoading) && (
        <Modal
          isOpen
          onClose={() => { setSelected(null); setUpdateMsg({ type: '', text: '' }); }}
          title="Complaint Detail"
        >
          {detailLoading ? <Loader /> : selected ? (
            <div className="space-y-5">
              {/* Basic info */}
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{selected.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selected.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Filed by: </span><span className="font-medium">{selected.userId?.name || 'Anonymous'}</span></div>
                <div><span className="text-gray-500">Category: </span><span className="font-medium">{formatCategory(selected.category)}</span></div>
                <div><span className="text-gray-500">Location: </span><span className="font-medium">{selected.location?.address || '-'}</span></div>
                <div><span className="text-gray-500">Filed: </span><span className="font-medium">{formatDate(selected.createdAt)}</span></div>
              </div>

              {selected.image && (
                <img
                  src={getImageUrl(selected.image)}
                  alt="complaint"
                  className="w-full h-40 object-cover rounded-xl"
                  onError={e => e.target.style.display = 'none'}
                />
              )}

              {/* Timeline */}
              {selected.timeline?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Timeline</p>
                  <div className="space-y-2">
                    {selected.timeline.map((t, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 shrink-0" />
                          {i < selected.timeline.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${getStatusColor(t.status)}`}>
                            {formatStatus(t.status)}
                          </span>
                          <span className="text-gray-600">{t.message}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr className="border-gray-100" />

              {/* Update form */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-800">Update Complaint</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={updateForm.status}
                      onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                    >
                      {STATUSES.filter(Boolean).map(s => (
                        <option key={s} value={s}>{formatStatus(s)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={updateForm.priority}
                      onChange={e => setUpdateForm(f => ({ ...f, priority: e.target.value }))}
                    >
                      {PRIORITIES.filter(Boolean).map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status Message (shown to user)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={updateForm.statusMessage}
                    onChange={e => setUpdateForm(f => ({ ...f, statusMessage: e.target.value }))}
                    placeholder="e.g. Team dispatched to location"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Admin Notes (internal)</label>
                  <textarea
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    value={updateForm.adminNotes}
                    onChange={e => setUpdateForm(f => ({ ...f, adminNotes: e.target.value }))}
                    placeholder="Internal notes..."
                  />
                </div>
              </div>

              {updateMsg.text && <Alert type={updateMsg.type} message={updateMsg.text} />}

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={updateLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {updateLoading ? 'Saving...' : 'Save Update'}
                </button>
                <button
                  onClick={() => { setSelected(null); setUpdateMsg({ type: '', text: '' }); }}
                  className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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