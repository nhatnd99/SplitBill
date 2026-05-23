import React from 'react';
import type { Expense } from '../types';
import { useAppStore } from '../store';
import { Utensils, Plane, Receipt, Film, Coffee, ShoppingBag, CircleDollarSign } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  onClick?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onClick }) => {
  const { currentUser, currency, language, users } = useAppStore();

  const getCategoryDetails = (cat: string) => {
    const defaultStyle = {
      icon: <CircleDollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
      label: language === 'vi' ? 'Khác' : 'Other',
    };

    switch (cat) {
      case 'food':
        return {
          icon: <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
          bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20',
          label: language === 'vi' ? 'Ăn uống' : 'Food & Drink',
        };
      case 'transport':
        return {
          icon: <Plane className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
          label: language === 'vi' ? 'Đi lại' : 'Transportation',
        };
      case 'bills':
        return {
          icon: <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
          label: language === 'vi' ? 'Hóa đơn' : 'Bills & Utilities',
        };
      case 'entertainment':
        return {
          icon: <Film className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
          bg: 'bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-pink-500/20',
          label: language === 'vi' ? 'Giải trí' : 'Entertainment',
        };
      case 'coffee':
        return {
          icon: <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
          label: language === 'vi' ? 'Cà phê' : 'Coffee & Tea',
        };
      case 'shopping':
        return {
          icon: <ShoppingBag className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
          label: language === 'vi' ? 'Mua sắm' : 'Shopping',
        };
      default:
        return defaultStyle;
    }
  };

  const formatCurrency = (val: number) => {
    if (currency === 'VND') {
      return `${Math.round(val).toLocaleString('vi-VN')} đ`;
    }
    const usd = val / 25000;
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;
  };

  const getPayerName = () => {
    if (expense.paidBy === currentUser?.id) {
      return language === 'vi' ? 'Bạn đã trả' : 'You paid';
    }
    const payer = users.find(u => u.id === expense.paidBy);
    return payer ? `${payer.name}` : (language === 'vi' ? 'Người khác đã trả' : 'Someone paid');
  };

  // Determine what the current user owes or is owed for this expense
  const getContextualBalance = () => {
    const isPayerMe = expense.paidBy === currentUser?.id;
    const mySplit = expense.splits.find(s => s.userId === currentUser?.id);
    const mySplitAmount = mySplit ? mySplit.amount : 0;

    if (isPayerMe) {
      // I paid, so I am owed: Total - mySplitAmount
      const lentAmount = expense.amount - mySplitAmount;
      if (lentAmount <= 0) return null;
      return (
        <div className="text-right">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block uppercase tracking-wider">
            {language === 'vi' ? 'Bạn cho mượn' : 'You lent'}
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(lentAmount)}
          </span>
        </div>
      );
    } else {
      // Someone else paid
      if (mySplitAmount <= 0) {
        return (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider">
              {language === 'vi' ? 'Không liên quan' : 'Not involved'}
            </span>
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
              {formatCurrency(0)}
            </span>
          </div>
        );
      }
      return (
        <div className="text-right">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block uppercase tracking-wider">
            {language === 'vi' ? 'Bạn nợ' : 'You owe'}
          </span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
            -{formatCurrency(mySplitAmount)}
          </span>
        </div>
      );
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const catDetails = getCategoryDetails(expense.category);

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:shadow-sm transition-all duration-200 cursor-pointer select-none group"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Category Icon */}
        <div className={`p-3 rounded-xl border shrink-0 flex items-center justify-center ${catDetails.bg}`}>
          {catDetails.icon}
        </div>

        {/* Title, Date and Payer */}
        <div className="min-w-0">
          <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors truncate">
            {expense.title}
          </h5>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatDate(expense.date)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="truncate max-w-[120px] sm:max-w-[180px]">
              {getPayerName()} <b className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(expense.amount)}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Balance calculation specific to current user */}
      <div className="shrink-0 pl-3">
        {getContextualBalance()}
      </div>
    </div>
  );
};
