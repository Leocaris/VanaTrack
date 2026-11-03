import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral' | 'warning'
  accent = 'emerald',
  onClick,
}) => {
  const accentClasses = {
    forest: 'bg-forest-50 text-forest-800 border-forest-100 dark:bg-forest-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    sage: 'bg-sage-50 text-sage-800 border-sage-100 dark:bg-sage-950/60 dark:text-emerald-300 dark:border-emerald-800/40',
    amber: 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40',
    rose: 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/40',
    blue: 'bg-blue-50 text-blue-800 border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40',
  }[accent] || 'bg-slate-50 text-slate-800 border-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800';

  const trendColors = {
    positive: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300',
    negative: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300',
    warning: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300',
    neutral: 'text-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-300',
  }[trendType] || 'text-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-300';

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#0b241b] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 p-5 shadow-card hover:shadow-elevated transition-all duration-200 relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-emerald-400/80 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trendColors}`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{subtext}</p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${accentClasses} transition-transform group-hover:scale-105`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
