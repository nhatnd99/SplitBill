import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { 
  PlusCircle, CheckCircle, Trash2, UserPlus, Search, 
  History, Calendar, FileSpreadsheet
} from 'lucide-react';
import type { ActivityType } from '../types';

export const ActivityHistory: React.FC = () => {
  const { activities, language, currency } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const formatCurrency = (val: number) => {
    if (currency === 'VND') {
      return `${Math.round(val).toLocaleString('vi-VN')} đ`;
    }
    const usd = val / 25000;
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;
  };

  const getActivityDetails = (type: ActivityType) => {
    switch (type) {
      case 'group_create':
        return {
          icon: <UserPlus className="w-4 h-4 text-emerald-500" />,
          bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
          label: language === 'vi' ? 'Tạo nhóm' : 'Group Created',
        };
      case 'expense_add':
        return {
          icon: <PlusCircle className="w-4 h-4 text-primary-500" />,
          bg: 'bg-primary-50 dark:bg-primary-500/10 border-primary-100 dark:border-primary-500/20',
          label: language === 'vi' ? 'Thêm chi phí' : 'Added Expense',
        };
      case 'expense_delete':
        return {
          icon: <Trash2 className="w-4 h-4 text-rose-500" />,
          bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
          label: language === 'vi' ? 'Xóa chi phí' : 'Deleted Expense',
        };
      case 'settlement':
        return {
          icon: <CheckCircle className="w-4 h-4 text-accent-500" />,
          bg: 'bg-accent-50 dark:bg-accent-500/10 border-accent-100 dark:border-accent-500/20',
          label: language === 'vi' ? 'Thanh toán nợ' : 'Settle Debt',
        };
      default:
        return {
          icon: <History className="w-4 h-4 text-slate-500" />,
          bg: 'bg-slate-50 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20',
          label: language === 'vi' ? 'Khác' : 'Other',
        };
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesSearch = 
      act.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (act.details.expenseTitle && act.details.expenseTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (act.groupName && act.groupName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesFilter = filterType === 'all' || act.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <Input
          placeholder={language === 'vi' ? 'Tìm kiếm hoạt động...' : 'Search logs...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          containerClassName="sm:max-w-xs"
        />

        {/* Action filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
            { id: 'expense_add', label: language === 'vi' ? '➕ Chi phí' : '➕ Expense' },
            { id: 'settlement', label: language === 'vi' ? '✔️ Trả nợ' : '✔️ Settle' },
            { id: 'group_create', label: language === 'vi' ? '👥 Nhóm mới' : '👥 New Group' },
          ].map((item) => {
            const isSelected = filterType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterType(item.id)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border
                  ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline Layout */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title={language === 'vi' ? 'Không có hoạt động' : 'No activities'}
          description={language === 'vi' ? 'Không tìm thấy nhật ký tương ứng.' : 'No audit records match your query filters.'}
          icon={<FileSpreadsheet className="w-8 h-8" />}
        />
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
          {filteredActivities.map((act) => {
            const details = getActivityDetails(act.type);
            return (
              <div key={act.id} className="relative group select-none">
                
                {/* Timeline dot */}
                <div className={`absolute -left-[35px] top-1.5 p-2 rounded-full border-2 border-white dark:border-[#090d16] flex items-center justify-center shrink-0 shadow-sm ${details.bg}`}>
                  {details.icon}
                </div>

                {/* Content card */}
                <Card variant="default" className="p-4 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={act.avatarUrl} name={act.userName} size="sm" />
                      <div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-normal">
                          <b className="font-extrabold text-slate-900 dark:text-slate-100">{act.userName}</b>{' '}
                          {language === 'vi' ? (
                            <>
                              {act.type === 'group_create' && `đã tạo nhóm "${act.details.groupName}"`}
                              {act.type === 'expense_add' && `đã chi tiêu "${act.details.expenseTitle}" trong ${act.groupName}`}
                              {act.type === 'expense_delete' && `đã xóa chi phí "${act.details.expenseTitle}"`}
                              {act.type === 'settlement' && `đã chuyển tiền thanh toán cho ${act.details.recipientName}`}
                            </>
                          ) : (
                            <>
                              {act.type === 'group_create' && `created billing group "${act.details.groupName}"`}
                              {act.type === 'expense_add' && `logged "${act.details.expenseTitle}" under ${act.groupName}`}
                              {act.type === 'expense_delete' && `deleted expense item "${act.details.expenseTitle}"`}
                              {act.type === 'settlement' && `transferred settlement amount to ${act.details.recipientName}`}
                            </>
                          )}
                        </p>
                        
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(act.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Numeric details if available */}
                    {act.details.amount && (
                      <div className="text-left sm:text-right shrink-0 pl-11 sm:pl-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest block leading-none">
                          {language === 'vi' ? 'Số tiền' : 'Amount'}
                        </span>
                        <span className="text-sm font-extrabold text-primary-500 mt-1 block">
                          {formatCurrency(act.details.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
