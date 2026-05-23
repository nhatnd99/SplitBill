import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
        />
      ))}
    </>
  );
};

export const SkeletonGroupCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[280px]">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-5/6 mb-1" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex -space-x-2">
            <Skeleton className="w-8 h-8 rounded-full" count={3} />
          </div>
          <div className="w-16">
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonExpenseCard: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
      <div className="flex items-center gap-4 min-w-0 flex-grow">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-grow">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="w-16 shrink-0">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 ml-auto" />
      </div>
    </div>
  );
};

export const SkeletonBalanceCard: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
      <div className="flex items-center gap-3 flex-grow">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-grow">
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="w-12 h-4 rounded-md" />
        <Skeleton className="w-16 h-8 rounded-xl" />
      </div>
    </div>
  );
};
