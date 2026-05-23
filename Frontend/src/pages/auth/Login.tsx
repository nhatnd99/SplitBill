import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Wallet, Mail, Lock, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { users, setCurrentUser, language } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'vi' ? 'Vui lòng điền đầy đủ email và mật khẩu' : 'Please fill all fields');
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Simulate login verification
    setTimeout(() => {
      // Find if email exists in mock users (for simple sandbox testing)
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        setCurrentUser(user);
        navigate('/');
      } else {
        setError(language === 'vi' ? 'Email hoặc mật khẩu không đúng' : 'Invalid email or password');
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleQuickLogin = (userEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const user = users.find(u => u.email === userEmail);
      if (user) {
        setCurrentUser(user);
        navigate('/');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 relative overflow-hidden">
      {/* Floating background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-2xl shadow-xl shadow-primary-500/10 mb-4 animate-bounce">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Antigravity <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">Split</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {language === 'vi' ? 'Chia tiền dễ dàng, giữ bạn bè vui vẻ' : 'Split bills easily, keep friends happy'}
          </p>
        </div>

        {/* Card wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-none mb-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <Input
              label={language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="flex flex-col gap-1">
              <Input
                label={language === 'vi' ? 'Mật khẩu' : 'Password'}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <div className="text-right px-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                </Link>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full font-bold mt-2">
              {language === 'vi' ? 'Đăng nhập' : 'Sign In'}
            </Button>
          </form>

          {/* Prompt to register */}
          <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
            <Link
              to="/register"
              className="font-bold text-primary-500 hover:text-primary-600 transition-colors"
            >
              {language === 'vi' ? 'Đăng ký ngay' : 'Sign up now'}
            </Link>
          </div>
        </div>

        {/* Quick sandbox logins for evaluation */}
        <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-5">
          <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 text-center flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            {language === 'vi' ? 'Tài khoản thử nghiệm nhanh' : 'Quick Sandbox Login'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {users.slice(0, 4).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickLogin(user.email)}
                disabled={isLoading}
                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary-500 dark:hover:border-primary-500/60 text-left transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                    {user.name.split(' ').slice(-2).join(' ')}
                  </p>
                  <p className="text-[8px] text-slate-400 truncate mt-0.5">
                    {user.id === 'user-1' ? 'Chủ nợ/Con nợ' : 'Thành viên'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
