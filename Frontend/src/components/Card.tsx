import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  animate?: boolean;
  variant?: 'default' | 'glass' | 'accent' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  animate = false,
  variant = 'default',
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-200 overflow-hidden';
  
  const variantClasses = {
    default: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 shadow-md shadow-slate-200/40 dark:shadow-none',
    glass: 'glass shadow-lg shadow-slate-200/30 dark:shadow-none',
    accent: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-primary-500 before:to-accent-500 shadow-md shadow-slate-200/40 dark:shadow-none',
    outlined: 'bg-transparent border-slate-200 dark:border-slate-800',
  };

  const interactiveClasses = onClick || hoverable
    ? 'cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-0.5'
    : '';

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
    >
      {children}
    </div>
  );
};
