import React from 'react';
import type { UserBalance } from '../types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { useAppStore } from '../store';
import { ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface BalanceCardProps {
  balance: UserBalance;
  onSettleUp?: (userId: string, amount: number) => void;
  showAction?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onSettleUp,
  showAction = true,
}) => {
  const { currency, language } = useAppStore();

  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val);
    if (currency === 'VND') {
      return `${absVal.toLocaleString('vi-VN')} đ`;
    }
    const usd = absVal / 25000;
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;
  };

  const isOwed = balance.amount > 0;
  const isSettled = balance.amount === 0;

  return (
    <div
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Avatar and Peer Name */}
      <div className="flex items-center gap-3">
        <Avatar src={balance.avatarUrl} name={balance.userName} size="md" />
        <div>
          <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {balance.userName}
          </h5>
          <div className="flex items-center gap-1 mt-0.5 text-xs">
            {isSettled ? (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {language === 'vi' ? 'Đã thanh toán hết' : 'All settled up'}
              </span>
            ) : isOwed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                {language === 'vi' ? 'Nợ bạn' : 'owes you'}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                {language === 'vi' ? 'Bạn nợ' : 'you owe'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Debt Amount & Action */}
      <div className="flex items-center gap-4 shrink-0 pl-3">
        {!isSettled && (
          <div className="text-right">
            <span
              className={`text-sm font-extrabold ${
                isOwed ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {isOwed ? '+' : '-'}{formatCurrency(balance.amount)}
            </span>
          </div>
        )}

        {showAction && !isSettled && onSettleUp && (
          <Button
            variant={isOwed ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => onSettleUp(balance.userId, Math.abs(balance.amount))}
            className="rounded-xl px-3 py-1.5 text-xs font-bold"
          >
            {isOwed
              ? language === 'vi' ? 'Đòi tiền' : 'Remind'
              : language === 'vi' ? 'Trả nợ' : 'Settle Up'
            }
          </Button>
        )}
      </div>
    </div>
  );
};
