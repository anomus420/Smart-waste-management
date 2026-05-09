import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, opts) => addToast({ type: 'success', message, ...opts }),
    error: (message, opts) => addToast({ type: 'error', message, ...opts }),
    info: (message, opts) => addToast({ type: 'info', message, ...opts }),
    warning: (message, opts) => addToast({ type: 'warning', message, ...opts }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const styles = {
    success: { bar: 'bg-green-500', icon: '✓', bg: 'bg-white border-green-500', text: 'text-green-700' },
    error:   { bar: 'bg-red-500',   icon: '✕', bg: 'bg-white border-red-500',   text: 'text-red-700'   },
    warning: { bar: 'bg-yellow-500',icon: '⚠', bg: 'bg-white border-yellow-500',text: 'text-yellow-700'},
    info:    { bar: 'bg-blue-500',  icon: 'ℹ', bg: 'bg-white border-blue-500',  text: 'text-blue-700'  },
  };
  const s = styles[toast.type] || styles.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-lg border-l-4 p-4 ${s.bg} animate-slide-in`}
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <span className={`font-bold text-lg leading-none mt-0.5 ${s.text}`}>{s.icon}</span>
      <p className="flex-1 text-sm text-gray-800 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1 mt-0.5"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}