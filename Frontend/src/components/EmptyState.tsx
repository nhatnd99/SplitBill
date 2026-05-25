import React from 'react';
import { Button } from '@/components/Button';
import { ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/40 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl min-h-[300px]">
      <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl mb-4 shrink-0 flex items-center justify-center">
        {icon || <ClipboardList className="w-8 h-8" />}
      </div>
      
      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
