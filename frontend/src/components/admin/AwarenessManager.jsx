import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import Modal from '../common/Modal';
import { formatDate, getImageUrl } from '../../utils/formatters';

const CATEGORIES = ['', 'recycling', 'composting', 'e_waste', 'plastic_reduction', 'general'];
const categoryLabel = c => c.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase());

const emptyForm = { title: '', content: '', category: 'general', tags: '', coverImage: null };

export default function AwarenessManager() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', search: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');

  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'delete'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      const { data } = await api.get('/awareness', { params });
      setArticles(data.articles || []);
      setPagination(data.pagination || {});
    } catch {
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openCreate = () => {
    setForm(emptyForm);
    setPreviewUrl('');
    setFormError('');
    setModalMode('create');
  };

  const openEdit = (article) => {
    setSelectedArticle(article);
    setForm({
      title: article.title || '',
      content: article.content || '',
      category: article.category || 'general',
      tags: (article.tags || []).join(', '),
      coverImage: null,
    });
    setPreviewUrl(article.coverImage ? getImageUrl(article.coverImage) : '');
    setFormError('');
    setModalMode('edit');
  };

  const openDelete = (article) => {
    setSelectedArticle(article);
    setModalMode('delete');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, coverImage: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.content.trim()) return 'Content is required.';
    if (!form.category) return 'Category is required.';
    return '';
  };

  const handleSubmit = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormLoading(true); setFormError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      fd.append('category', form.category);
      if (form.tags) {
        form.tags.split(',').map(t => t.trim()).filter(Boolean).forEach(t => fd.append('tags[]', t));
      }
      if (form.coverImage) fd.append('coverImage', form.coverImage);

      if (modalMode === 'create') {
        await api.post('/awareness', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/awareness/${selectedArticle._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModalMode(null);
      fetchArticles();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to save article.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/awareness/${selectedArticle._id}`);
      setModalMode(null);
      fetchArticles();
    } catch {
      setFormError('Failed to delete article.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(f => ({ ...f, search: searchInput, page: 1 }));
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search articles..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-52"
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
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c ? categoryLabel(c) : 'All Categories'}</option>
          ))}
        </select>
        <button
          onClick={openCreate}
          className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> New Article
        </button>
      </div>

      {loading ? <Loader /> : error ? <Alert type="error" message={error} /> : (
        <>
          <div className="grid gap-3">
            {articles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No articles found.</div>
            ) : articles.map(article => (
              <div key={article._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-start hover:shadow-sm transition-shadow">
                {article.coverImage && (
                  <img
                    src={getImageUrl(article.coverImage)}
                    alt={article.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-snug">{article.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {categoryLabel(article.category)}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(article)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(article)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{article.summary || article.content?.slice(0, 120)}</p>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>Page {pagination.page} of {pagination.totalPages}</span>
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

      {/* Create / Edit Modal */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <Modal
          isOpen
          onClose={() => setModalMode(null)}
          title={modalMode === 'create' ? 'New Article' : 'Edit Article'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Article title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.filter(Boolean).map(c => (
                  <option key={c} value={c}>{categoryLabel(c)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="recycling, tips, environment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {previewUrl && (
                <img src={previewUrl} alt="preview" className="mt-2 h-24 rounded-lg object-cover" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write the article content here..."
              />
            </div>

            {formError && <Alert type="error" message={formError} />}

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {formLoading ? 'Saving...' : modalMode === 'create' ? 'Publish Article' : 'Save Changes'}
              </button>
              <button
                onClick={() => setModalMode(null)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modalMode === 'delete' && selectedArticle && (
        <Modal isOpen onClose={() => setModalMode(null)} title="Delete Article">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Are you sure you want to delete <strong>"{selectedArticle.title}"</strong>? This action cannot be undone.
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
                onClick={() => setModalMode(null)}
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