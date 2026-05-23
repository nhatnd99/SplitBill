import React from 'react';
import type { Group } from '../types';
import { Avatar } from './Avatar';
import { Card } from './Card';
import { Badge } from './Badge';
import { Folder, MapPin, Home, Briefcase, Coffee } from 'lucide-react';
import { useAppStore } from '../store';

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  const { currency, language } = useAppStore();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trip':
        return <MapPin className="w-3.5 h-3.5" />;
      case 'home':
        return <Home className="w-3.5 h-3.5" />;
      case 'office':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'couple':
        return <Folder className="w-3.5 h-3.5" />;
      default:
        return <Coffee className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    if (language === 'vi') {
      switch (category) {
        case 'trip': return 'Du lịch';
        case 'home': return 'Nhà cửa';
        case 'office': return 'Văn phòng';
        case 'couple': return 'Cặp đôi';
        default: return 'Khác';
      }
    } else {
      switch (category) {
        case 'trip': return 'Trip';
        case 'home': return 'Home';
        case 'office': return 'Office';
        case 'couple': return 'Couple';
        default: return 'Other';
      }
    }
  };

  const formatCurrency = (val: number) => {
    if (currency === 'VND') {
      return `${val.toLocaleString('vi-VN')} đ`;
    }
    // Simple conversions for display
    const usd = val / 25000;
    return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 1 })}`;
  };

  return (
    <Card
      onClick={onClick}
      hoverable
      variant="default"
      className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 group"
    >
      {/* Cover Image/Category Color */}
      <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={group.avatarUrl}
          alt={group.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-95"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="primary" className="flex items-center gap-1 glass backdrop-blur-md bg-white/80 border-none shadow-sm dark:bg-slate-900/80 text-primary-600 dark:text-primary-400">
            {getCategoryIcon(group.category)}
            <span>{getCategoryLabel(group.category)}</span>
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-primary-500 transition-colors line-clamp-1">
            {group.name}
          </h4>
          {group.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
              {group.description}
            </p>
          )}
        </div>

        <div>
          {/* Members Avatars Stack */}
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex -space-x-2.5 overflow-hidden">
              {group.members.slice(0, 4).map((member) => (
                <Avatar
                  key={member.id}
                  src={member.avatarUrl}
                  name={member.name}
                  size="sm"
                  showBorder
                />
              ))}
              {group.members.length > 4 && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400">
                  +{group.members.length - 4}
                </div>
              )}
            </div>

            {/* Total Expense Summary */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                {language === 'vi' ? 'Tổng chi tiêu' : 'Total spent'}
              </span>
              <span className="text-sm font-extrabold text-primary-500">
                {formatCurrency(group.totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
