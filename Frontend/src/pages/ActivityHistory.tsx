import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/EmptyState';
import { History, FileSpreadsheet } from 'lucide-react';

export const ActivityHistory: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      
      {/* Header title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-primary-500" />
          {t('activity.title')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {t('activity.subtitle')}
        </p>
      </div>

      <EmptyState
        title={t('activity.featureDev')}
        description={t('activity.featureDevDesc')}
        icon={<FileSpreadsheet className="w-8 h-8" />}
      />

    </div>
  );
};
