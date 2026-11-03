import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-[#0a231a] text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidth} border border-slate-200/80 dark:border-emerald-900/50 text-slate-800 dark:text-slate-100`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-950/60 px-6 py-4 bg-slate-50/50 dark:bg-[#071912]/80">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-emerald-400/70">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-emerald-950/50 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
