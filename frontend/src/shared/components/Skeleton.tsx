import React from "react";

export const CatalogoSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse"
        >
          <div className="h-44 bg-slate-200 dark:bg-slate-800" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="pt-2 flex items-center justify-between">
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};