import React from 'react';
import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'pills',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 p-1.5 rounded-2xl ${
        variant === 'pills' 
          ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40' 
          : 'border-b border-slate-200 dark:border-slate-800 rounded-none bg-transparent'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold select-none cursor-pointer transition-all duration-200 w-full md:w-auto
              ${isActive
                ? variant === 'pills'
                  ? 'text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-primary-500'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
              }
            `}
          >
            {/* Sliding Highlight for Pills */}
            {isActive && variant === 'pills' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl -z-10 border border-slate-200/50 dark:border-slate-700/30"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            
            {/* Slide Highlight for Underline */}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            {tab.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
