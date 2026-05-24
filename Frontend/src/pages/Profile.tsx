import React from 'react';
import { useAppStore } from '../store';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Globe, DollarSign, Sun, Moon, 
  Settings, LogOut, BadgeCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { 
    theme, setTheme, language, setLanguage, 
    currency, setCurrency, addToast 
  } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(language === 'vi' ? 'Bạn chắc chắn muốn đăng xuất?' : 'Are you sure you want to log out?')) {
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
          {language === 'vi' ? 'Cài Đặt Hệ Thống' : 'System Settings'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {language === 'vi' ? 'Quản lý thông tin cá nhân và thiết lập ứng dụng' : 'Configure localization settings, mock currency values, and theme toggles'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: User Profile Info */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {language === 'vi' ? 'Tài khoản hiện tại' : 'Active Profile'}
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
              {language === 'vi' ? 'Đăng xuất' : 'Logout'}
            </h5>
            <p className="text-[10px] text-slate-400 leading-normal">
              {language === 'vi' 
                ? 'Đăng xuất sẽ xóa session hiện tại của bạn. Bạn sẽ cần tạo một tên mới hoặc đăng nhập lại.' 
                : 'Logging out clears your current session. You will need to sign in or create a new anonymous profile.'}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="mt-2 font-bold"
            >
              {language === 'vi' ? 'Đăng xuất ngay' : 'Logout Now'}
            </Button>
          </Card>
        </div>

        {/* Right Columns: Settings panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {language === 'vi' ? 'Tùy chỉnh hệ thống' : 'Localization & Display'}
          </h4>

          <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            
            {/* 1. Theme Settings */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-primary-500" />
                {language === 'vi' ? 'Giao diện ứng dụng' : 'Display Theme'}
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`
                    p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
                    ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  <Sun className="w-5 h-5 text-amber-500" />
                  <span>{language === 'vi' ? 'Chế độ Sáng' : 'Light Mode'}</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`
                    p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
                    ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>{language === 'vi' ? 'Chế độ Tối' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800 my-2" />

            {/* 2. Currency Settings */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary-500" />
                {language === 'vi' ? 'Đơn vị tiền tệ chính' : 'Display Currency'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                {['VND', 'USD', 'EUR'].map((curr) => {
                  const isActive = currency === curr;
                  return (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr as any);
                        addToast(language === 'vi' ? `Đã chuyển đổi tiền tệ sang ${curr}` : `Switched currency to ${curr}`, 'success');
                      }}
                      className={`
                        p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all cursor-pointer select-none
                        ${
                          isActive
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

            <hr className="border-slate-100 dark:border-slate-800 my-2" />

            {/* 3. Language Settings */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary-500" />
                {language === 'vi' ? 'Ngôn ngữ hiển thị' : 'App Language'}
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setLanguage('vi');
                    addToast('Đã đổi ngôn ngữ sang Tiếng Việt!', 'success');
                  }}
                  className={`
                    p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
                    ${
                      language === 'vi'
                        ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  🇻🇳 <span>Tiếng Việt</span>
                </button>

                <button
                  onClick={() => {
                    setLanguage('en');
                    addToast('Language switched to English!', 'success');
                  }}
                  className={`
                    p-4 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer select-none
                    ${
                      language === 'en'
                        ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }
                  `}
                >
                  🇺🇸 <span>English</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
