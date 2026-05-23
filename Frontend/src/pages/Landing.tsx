import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Wallet, LogIn, Plus, Users, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GroupCategory } from '../types';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { joinGroup, addGroup, language } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [userName, setUserName] = useState('');
  
  // Join Group State
  const [inviteCode, setInviteCode] = useState('');
  
  // Create Group State
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState<GroupCategory>('trip');

  // Random color picker for avatar
  const colors = ['#10b981', '#3b82f6', '#f43f5e', '#a855f7', '#f59e0b', '#06b6d4'];
  const [avatarColor, setAvatarColor] = useState(colors[0]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !inviteCode.trim()) return;
    
    const groupId = joinGroup(inviteCode.trim().toUpperCase(), userName.trim(), avatarColor);
    if (groupId) {
      navigate(`/groups/${groupId}`);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !groupName.trim()) return;
    
    const groupId = addGroup(
      groupName.trim(), 
      '', 
      category, 
      userName.trim(), 
      avatarColor
    );
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16] relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-primary-500 to-accent-500 text-white rounded-2xl shadow-xl shadow-primary-500/20 mb-4 mx-auto animate-float">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Antigravity <span className="gradient-text">Split</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {language === 'vi' ? 'Chia sẻ hóa đơn nhanh chóng không cần đăng nhập' : 'Split expenses instantly without signing up'}
          </p>
        </div>

        <Card variant="glass" className="p-6 sm:p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70">
          
          {/* Identity Step */}
          <div className="mb-6">
            <Input
              label={language === 'vi' ? 'Tên hiển thị của bạn' : 'Your display name'}
              placeholder="e.g. John Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-lg font-bold"
              required
            />
            
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1 mb-2 block">
                {language === 'vi' ? 'Chọn màu đại diện' : 'Pick avatar color'}
              </label>
              <div className="flex gap-2 justify-between">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${avatarColor === c ? 'scale-125 border-white dark:border-slate-800 shadow-md' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'join' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {language === 'vi' ? 'Tham gia nhóm' : 'Join Group'}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {language === 'vi' ? 'Tạo nhóm mới' : 'Create Group'}
            </button>
          </div>

          {activeTab === 'join' ? (
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <Input
                placeholder={language === 'vi' ? 'Nhập mã nhóm (VD: DN2026)' : 'Enter invite code (e.g. DN2026)'}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="uppercase font-bold tracking-widest text-center"
                maxLength={6}
                required
              />
              <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg" leftIcon={<LogIn className="w-5 h-5" />}>
                {language === 'vi' ? 'Tham Gia Ngay' : 'Join Now'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input
                placeholder={language === 'vi' ? 'Tên nhóm (VD: Đi Đà Lạt)' : 'Group Name (e.g. Da Lat Trip)'}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setCategory('trip')} className={`p-2 rounded-xl text-xs font-bold border ${category === 'trip' ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700'}`}>{language === 'vi' ? '🌴 Du lịch' : '🌴 Trip'}</button>
                <button type="button" onClick={() => setCategory('home')} className={`p-2 rounded-xl text-xs font-bold border ${category === 'home' ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700'}`}>{language === 'vi' ? '🏠 Nhà cửa' : '🏠 Home'}</button>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg mt-2" leftIcon={<Plus className="w-5 h-5" />}>
                {language === 'vi' ? 'Tạo Nhóm Mới' : 'Create New Group'}
              </Button>
            </form>
          )}

        </Card>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{language === 'vi' ? 'Không cần đăng ký. Dữ liệu lưu cục bộ.' : 'No sign up required. Local storage only.'}</span>
        </div>
      </motion.div>
    </div>
  );
};
