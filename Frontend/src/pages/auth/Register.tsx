import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Wallet, Mail, Lock, User } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setCurrentUser, addToast, language } = useAppStore();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Simulate registering new user
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
      };

      setCurrentUser(newUser);
      addToast(
        language === 'vi' 
          ? 'Đăng ký tài khoản thành công!' 
          : 'Account created successfully!',
        'success'
      );
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-2xl shadow-xl shadow-primary-500/10 mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {language === 'vi' ? 'Tạo tài khoản' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {language === 'vi' ? 'Bắt đầu chia sẻ chi phí cùng mọi người' : 'Start splitting bills with ease'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <Input
              label={language === 'vi' ? 'Họ và tên' : 'Full Name'}
              type="text"
              placeholder="e.g. Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label={language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label={language === 'vi' ? 'Mật khẩu' : 'Password'}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full font-bold mt-2">
              {language === 'vi' ? 'Đăng ký' : 'Sign Up'}
            </Button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'vi' ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
            <Link
              to="/login"
              className="font-bold text-primary-500 hover:text-primary-600 transition-colors"
            >
              {language === 'vi' ? 'Đăng nhập ngay' : 'Sign in here'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
