import React from 'react';
import { useAppStore } from '../store';
import { EmptyState } from '../components/EmptyState';
import { History, FileSpreadsheet } from 'lucide-react';

export const ActivityHistory: React.FC = () => {
  const { language } = useAppStore();

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      
      {/* Header title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-primary-500" />
          {language === 'vi' ? 'Lịch Sử Hoạt Động' : 'Activity Timeline'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {language === 'vi' ? 'Xem dòng thời gian thanh toán và thêm chi tiêu' : 'Trace audit logs of splits and settlement transactions'}
        </p>
      </div>

      <EmptyState
        title={language === 'vi' ? 'Tính năng đang được phát triển' : 'Feature Under Development'}
        description={language === 'vi' ? 'Sắp ra mắt trong phiên bản tới.' : 'Coming soon in the next update.'}
        icon={<FileSpreadsheet className="w-8 h-8" />}
      />

    </div>
  );
};
