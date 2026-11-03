import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  sublabel = '',
  showPercent = true,
  size = 'md',
  color = 'forest',
}) => {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  const roundedPercent = Number(percentage.toFixed(1));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    forest: 'bg-forest-800',
    sage: 'bg-sage-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    teal: 'bg-teal-600',
  };

  const colorClass = colors[color] || colors.forest;

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-slate-700">{label}</span>
          <div className="flex items-center gap-1.5">
            {sublabel && <span className="text-slate-500">{sublabel}</span>}
            {showPercent && (
              <span className="font-semibold text-slate-900 font-mono">
                {roundedPercent}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <div
          className={`${heights[size] || heights.md} rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
