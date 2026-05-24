import React, { useMemo } from 'react';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { formatCurrency } from '../utils/formatters';
import { useAppStore } from '../store';
import type { Group } from '../types';
import { Wallet, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface FundHistoryTabProps {
  group: Group;
}

export const FundHistoryTab: React.FC<FundHistoryTabProps> = ({ group }) => {
  const { language, currency } = useAppStore();

  const history = useMemo(() => {
    return [...(group.fundHistory || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [group.fundHistory]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (history.length === 0) {
    return (
      <motion.div variants={item} className="py-12">
        <Card className="p-8 text-center border-dashed bg-transparent shadow-none border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-1">
            <Wallet className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-200">
              {language === 'vi' ? 'Chưa có giao dịch quỹ nào 👋' : 'No fund history yet 👋'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'vi' ? 'Chủ nhóm chưa thêm quỹ nào.' : 'The group owner hasn\'t added any funds yet.'}
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <div className="relative pl-4 sm:pl-6 border-l-2 border-slate-100 dark:border-slate-800/80 pb-4">
        {history.map((tx) => {
          return (
            <motion.div variants={item} key={tx.id} className="mb-8 last:mb-0 relative">
              <div className="absolute -left-[25px] sm:-left-[33px] top-1 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-100 dark:bg-indigo-500/20 border-2 border-white dark:border-[#090d16] rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-indigo-500 font-bold" />
              </div>
              <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={tx.userName} size="sm" />
                    <div className="flex flex-col">
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{tx.userName}</span>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(tx.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg text-sm">
                    +{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
                {tx.note && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <span className="font-semibold text-slate-700 dark:text-slate-400 mr-2">{language === 'vi' ? 'Ghi chú:' : 'Note:'}</span>
                    {tx.note}
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
