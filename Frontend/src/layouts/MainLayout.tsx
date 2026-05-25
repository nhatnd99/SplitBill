import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAppStore, type Toast } from '@/store';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { 
  Wallet, LayoutDashboard, FolderHeart, History, User2, Plus, 
  LogOut, Sun, Moon, CheckCircle2, AlertTriangle, Info, X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CreateBillFlow } from '@/components/features/CreateBillFlow';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const MainLayout: React.FC = () => {
  const { 
    theme, setTheme, toasts, removeToast, 
    joinedGroups, addToast
  } = useAppStore();
  const { t } = useTranslation();
  
  const { user, logout } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  // Add Expense modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Protect route
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  const handleLogout = () => {
    logout();
    addToast(t('common.loggedOutSuccessfully'), 'info');
    navigate('/welcome');
  };

  const toggleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const navItems = [
    { id: 'dashboard', label: t('navbar.dashboard'), path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'groups', label: t('navbar.groups'), path: '/groups', icon: <FolderHeart className="w-5 h-5" /> },
    { id: 'activities', label: t('navbar.activities'), path: '/activities', icon: <History className="w-5 h-5" /> },
    { id: 'profile', label: t('navbar.profile'), path: '/profile', icon: <User2 className="w-5 h-5" /> },
  ];

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getToastBg = (type: Toast['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
      case 'error': return 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20';
      default: return 'bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. Sidebar for Desktop / Tablet */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shrink-0 h-screen sticky top-0 justify-between p-6">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 px-2">
            <div className="p-2 bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-xl shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Antigravity <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Split</span>
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold select-none transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Settings footer */}
        <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatarUrl} name={user.name} avatarColor={user.avatarColor} size="md" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {user.email || 'Anonymous'}
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer flex items-center justify-center relative"
              title={`Theme: ${theme}`}
            >
              {theme === 'light' && <Sun className="w-4 h-4" />}
              {theme === 'dark' && <Moon className="w-4 h-4" />}
              {theme === 'system' && (
                <div className="relative">
                  <Sun className="w-4 h-4 absolute opacity-0 dark:opacity-100 transition-opacity" />
                  <Moon className="w-4 h-4 dark:opacity-0 transition-opacity" />
                  <span className="absolute -bottom-1 -right-1 text-[7px] font-bold bg-primary-500 text-white rounded-full w-[10px] h-[10px] flex items-center justify-center">A</span>
                </div>
              )}
            </button>
            <LanguageSwitcher />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            {t('navbar.signOut')}
          </Button>
        </div>
      </aside>

      {/* 2. Top Header for Mobile */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-lg">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-sm font-extrabold tracking-tight">
            Antigravity <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Split</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 dark:text-slate-500 flex items-center justify-center relative"
          >
            {theme === 'light' && <Sun className="w-4 h-4" />}
            {theme === 'dark' && <Moon className="w-4 h-4" />}
            {theme === 'system' && (
              <div className="relative">
                <Sun className="w-4 h-4 absolute opacity-0 dark:opacity-100 transition-opacity" />
                <Moon className="w-4 h-4 dark:opacity-0 transition-opacity" />
                <span className="absolute -bottom-1 -right-1 text-[7px] font-bold bg-primary-500 text-white rounded-full w-[10px] h-[10px] flex items-center justify-center">A</span>
              </div>
            )}
          </button>
          <Link to="/profile">
            <Avatar src={user.avatarUrl} name={user.name} avatarColor={user.avatarColor} size="sm" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* 3. Main Outlet Content */}
      <main className="flex-grow flex flex-col min-w-0 md:max-h-screen md:overflow-y-auto pb-24 md:pb-6 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full mx-auto flex-grow flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* 4. Bottom Sticky Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-3 py-2 flex items-center justify-around z-40 pb-safe shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-primary-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Global Floating Action Button for Mobile embedded directly in bottom bar! */}
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/20 active:scale-95 transition-all transform -translate-y-4 border-4 border-white dark:border-[#090d16] cursor-pointer"
          aria-label="Add expense"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
        </button>
      </nav>

      {/* 5. Desktop Floating Action Button (Lower Right) */}
      <button
        onClick={() => setIsAddExpenseOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 p-4 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/10 hover:shadow-primary-500/30 hover:scale-105 transition-all active:scale-95 items-center gap-2 cursor-pointer z-40 select-none font-bold"
      >
        <Plus className="w-5 h-5 stroke-[2.5px]" />
        <span>{t('common.addExpense')}</span>
      </button>

      {/* 6. Toast Notification Portal */}
      <div className="fixed top-4 md:top-auto md:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xl backdrop-blur-md pointer-events-auto ${getToastBg(toast.type)}`}
            >
              <div className="flex items-center gap-3">
                {getToastIcon(toast.type)}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {toast.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 7. Reusable Add Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title={t('common.addNewExpense')}
        size="md"
      >
        {joinedGroups.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('common.createGroupBeforeExpense')}
            </p>
          </div>
        ) : (
          <CreateBillFlow onClose={() => setIsAddExpenseOpen(false)} />
        )}
      </Modal>
    </div>
  );
};
