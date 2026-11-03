import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (title, message) => addToast({ type: 'success', title, message });
  const error = (title, message) => addToast({ type: 'error', title, message });
  const warning = (title, message) => addToast({ type: 'warning', title, message });
  const info = (title, message) => addToast({ type: 'info', title, message });

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              iconColor: 'text-emerald-600',
            },
            error: {
              icon: XCircle,
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              iconColor: 'text-rose-600',
            },
            warning: {
              icon: AlertTriangle,
              bg: 'bg-amber-50 border-amber-200 text-amber-900',
              iconColor: 'text-amber-600',
            },
            info: {
              icon: Info,
              bg: 'bg-blue-50 border-blue-200 text-blue-900',
              iconColor: 'text-blue-600',
            },
          }[toast.type] || {
            icon: Info,
            bg: 'bg-slate-50 border-slate-200 text-slate-900',
            iconColor: 'text-slate-600',
          };

          const IconComponent = config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-elevated transition-all duration-300 animate-slide-up ${config.bg}`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
              <div className="flex-1 text-xs">
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                {toast.message && <div className="mt-0.5 opacity-90">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
