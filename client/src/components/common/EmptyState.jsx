import React from 'react';
import { Sprout } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Sprout,
  title = 'No records found',
  description = 'There are no items matching your criteria or currently available in the database.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-700 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-2 rounded-xl text-xs font-semibold bg-forest-800 text-white hover:bg-forest-900 transition shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
