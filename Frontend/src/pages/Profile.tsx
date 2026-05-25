import { useTranslation } from 'react-i18next';
import React from 'react';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  DollarSign, Sun, Moon,
  Settings, LogOut, BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const {
    theme, setTheme,
    currency, setCurrency, addToast
  } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(t('auto.areYouSureYouWantTo'))) {
      logout();
      navigate('/welcome');
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">

      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-500" />
          {t('auto.systemSettings')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {t('auto.configureLocalizationSettingsMockCurrencyValues')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Left Column: User Profile Info */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {t('auto.activeProfile')}
          </h4>

          {user && (
            <Card variant="accent" className="p-6 flex flex-col items-center text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Avatar src={user.avatarUrl} name={user.name} avatarColor={user.avatarColor} size="2xl" showBorder />

              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-4 flex items-center gap-1">
                {user.name}
                <BadgeCheck className="w-4 h-4 text-primary-500 shrink-0" />
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {user.email || 'Anonymous Session'}
              </p>

              {user.phone && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 rounded-full mt-3">
                  {user.phone}
                </span>
              )}
            </Card>
          )}

          {/* Quick Sandbox user switching */}
          <Card className="p-5 flex flex-col gap-3 bg-white dark:bg-slate-900">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider text-rose-500 dark:text-rose-500">
              <LogOut className="w-4 h-4" />
              {t('auto.logout')}
            </h5>
            <p className="text-[10px] text-slate-400 leading-normal">
              {t('auto.loggingOutClearsYourCurrentSession')}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="mt-2 font-bold"
            >
              {t('auto.logoutNow')}
            </Button>
          </Card>
        </div>

        {/* Right Columns: Settings panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {t('auto.localizationDisplay')}
          </h4>

          <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">

            {/* 1. Theme Settings */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-primary-500" />
                {t('auto.displayTheme')}
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`
                    p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
                    ${theme === 'light'
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>{t('auto.lightMode')}</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`
                    p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
                    ${theme === 'dark'
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>{t('auto.darkMode')}</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-2" />

            {/* 2. Currency Settings */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary-500" />
                {t('auto.displayCurrency')}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {['VND', 'USD', 'EUR'].map((curr) => {
                  const isActive = currency === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr as any);
                        addToast(t('auto.switchedCurrencyTo', { curr }), 'success');
                      }}
                      className={`
                        p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all cursor-pointer select-none
                        ${isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400'
                        }
                      `}
                    >
                      {curr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
