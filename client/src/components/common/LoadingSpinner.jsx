import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className={`animate-spin text-forest-700 ${sizes[size] || sizes.md}`} />
      {text && <p className="mt-3 text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};
