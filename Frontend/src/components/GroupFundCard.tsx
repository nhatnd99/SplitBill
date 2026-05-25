import { useTranslation } from 'react-i18next';
import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Wallet, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/utils/formatters';
import type { Group } from '@/types';

interface GroupFundCardProps {
  group: Group;
  onAddFund: () => void;
}

export const GroupFundCard: React.FC<GroupFundCardProps> = ({ group, onAddFund }) => {
  const { t } = useTranslation();
  const { language, currency } = useAppStore();
  const user = useAuthStore(state => state.user);

  const totalFundAdded = group.fundBalance || 0;
  const totalBillsAmount = group.totalExpense || 0;
  const remainingBalance = totalFundAdded - totalBillsAmount;

  const isNegative = remainingBalance < 0;
  const isZero = remainingBalance === 0;

  const isOwner = user?.id === group.createdBy;

  return (
    <Card className={`p-4 sm:p-5 flex flex-col gap-4 border-2 transition-all ${isNegative ? 'border-rose-500/50 bg-rose-50 dark:bg-rose-950/20' : 'border-transparent bg-white dark:bg-slate-900'} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isNegative ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-500' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'}`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {t('auto.sharedWallet')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('auto.manageCommonBudget')}
            </p>
          </div>
        </div>
        {isOwner && (
          <Button size="sm" onClick={onAddFund} leftIcon={<Plus className="w-4 h-4" />} className="font-bold shadow-sm">
            {t('auto.addFund')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            {t('auto.initialFund')}
          </span>
          <span className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            {formatCurrency(totalFundAdded, currency)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            {t('auto.totalExpenses')}
          </span>
          <span className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base">
            {formatCurrency(totalBillsAmount, currency)}
          </span>
        </div>
      </div>

      <div className={`mt-2 p-3 sm:p-4 rounded-xl flex items-center justify-between ${isNegative ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800'}`}>
        <div className="flex flex-col">
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isNegative ? 'text-rose-100' : 'text-slate-500 dark:text-slate-400'}`}>
            {t('auto.remainingBalance')}
          </span>
          <span className={`text-lg sm:text-2xl font-black mt-0.5 ${isNegative ? 'text-white' : (isZero ? 'text-slate-800 dark:text-slate-100' : 'text-emerald-500')}`}>
            {isNegative ? "-" + formatCurrency(Math.abs(remainingBalance), currency) : formatCurrency(remainingBalance, currency)}
          </span>
        </div>
      </div>
    </Card>
  );
};
