import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    // Verification statuses
    Verified: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    Pending: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40',
    Rejected: 'bg-rose-50 text-rose-800 border-rose-200 ring-1 ring-rose-600/20 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40',

    // Project statuses
    Active: 'bg-forest-50 text-forest-900 border-forest-200 ring-1 ring-forest-700/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    Planned: 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-600/20 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40',
    Completed: 'bg-teal-50 text-teal-800 border-teal-200 ring-1 ring-teal-600/20 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/40',
    'On Hold': 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',

    // Roles
    admin: 'bg-purple-50 text-purple-800 border-purple-200 ring-1 ring-purple-600/20 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40',
    project_manager: 'bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    viewer: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',

    // Severity
    high: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
    medium: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
    low: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800',

    // Generic
    default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/40',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] font-medium rounded',
    sm: 'px-2 py-0.5 text-xs font-medium rounded-md',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-md',
    lg: 'px-3 py-1.5 text-sm font-semibold rounded-lg',
  };

  const selectedVariant = variants[variant] || variants.default;
  const selectedSize = sizes[size] || sizes.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-tight transition-colors ${selectedVariant} ${selectedSize} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {children}
    </span>
  );
};
