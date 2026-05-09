import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import Alert from '../components/common/Alert';
import { formatDate, getImageUrl } from '../utils/formatters';

const CATEGORIES = ['', 'recycling', 'composting', 'e_waste', 'plastic_reduction', 'general'];
const categoryLabel = c => c.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase());

export default function AwarenessHub() {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', search: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page: filters.page, limit: 9 };
      if (filters.category) params.category = filters.category;
      if (filters.search)   params.search   = filters.search;
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

  const openArticle = async (article) => {
    setArticleLoading(true);
    setSelectedArticle(null);
    try {
      const { data } = await api.get(`/awareness/${article._id}`);
      setSelectedArticle(data.article);
    } catch {
      setSelectedArticle(article);
    } finally {
      setArticleLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(f => ({ ...f, search: searchInput, page: 1 }));
  };

  if (selectedArticle) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          ← Back to Articles
        </button>
        {selectedArticle.coverImage && (
          <img
            src={getImageUrl(selectedArticle.coverImage)}
            alt={selectedArticle.title}
            className="w-full h-56 object-cover rounded-2xl mb-6"
          />
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            {categoryLabel(selectedArticle.category)}
          </span>
          <span className="text-xs text-gray-400">{formatDate(selectedArticle.createdAt)}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-4">{selectedArticle.title}</h1>
        {selectedArticle.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedArticle.tags.map((t, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}
        <div className="prose prose-sm prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {selectedArticle.content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-display">Awareness Hub</h1>
        <p className="text-gray-500 mt-2">Learn about sustainable waste management practices</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <div className="flex flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Search articles..."
            className="flex-1 border border-gray-200 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-r-lg transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilters(f => ({ ...f, category: c, page: 1 }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.category === c
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c ? categoryLabel(c) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Results hint */}
      {filters.search && (
        <div className="flex items-center gap-3 mb-4">
          <p className="text-sm text-gray-500">
            Results for <strong>"{filters.search}"</strong>
          </p>
          <button
            onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '', page: 1 })); }}
            className="text-sm text-red-500 hover:text-red-700"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {articleLoading ? (
        <Loader />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <p className="text-5xl mb-3">📰</p>
                <p>No articles found.</p>
              </div>
            ) : articles.map(article => (
              <button
                key={article._id}
                onClick={() => openArticle(article)}
                className="text-left bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-200 transition-all group"
              >
                {article.coverImage ? (
                  <img
                    src={getImageUrl(article.coverImage)}
                    alt={article.title}
                    className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    onError={e => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                    <span className="text-5xl">🌱</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-medium">
                      {categoryLabel(article.category)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-green-700 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {article.summary || article.content?.slice(0, 100)}
                  </p>
                  {article.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {article.tags.slice(0, 3).map((t, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}