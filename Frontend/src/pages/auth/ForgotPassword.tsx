import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../../store';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Wallet, Mail, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addToast, language } = useAppStore();
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    setTimeout(() => {
      addToast(
        language === 'vi'
          ? 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!'
          : 'Password reset link sent to your email!',
        'success'
      );
      setIsLoading(false);
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-2xl shadow-xl shadow-primary-500/10 mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {language === 'vi' ? 'Khôi phục mật khẩu' : 'Reset Password'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {language === 'vi' ? 'Chúng tôi sẽ gửi liên kết khôi phục qua email' : "We'll email you a recovery link"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <Input
              label={language === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
              type="email"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button type="submit" isLoading={isLoading} className="w-full font-bold mt-2">
              {language === 'vi' ? 'Gửi liên kết khôi phục' : 'Send Recovery Link'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {language === 'vi' ? 'Quay lại đăng nhập' : 'Back to login'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
