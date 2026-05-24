import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
// import { formatCurrency } from '../utils/formatters';
import { Sun, Moon, Plus, Users, LogIn, ChevronRight, Receipt, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { groupsApi } from '../api/groups.api';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { language, theme, setTheme, joinedGroups, addJoinedGroup } = useAppStore();
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  // Local state for modals (Quick Actions)
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await groupsApi.joinGroup(inviteCode.trim().toUpperCase());
      return res.data.group || { id: res.data.groupId, name: 'Group' };
    },
    onSuccess: (group) => {
      addJoinedGroup(group);
      setIsJoinOpen(false);
      navigate(`/groups/${group.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await groupsApi.createGroup({ name: newGroupName.trim(), category: 'trip' });
      return res.data.group;
    },
    onSuccess: (group) => {
      addJoinedGroup(group);
      setIsCreateOpen(false);
      navigate(`/groups/${group.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  });

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    joinMutation.mutate();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createMutation.mutate();
  };

  if (!user) return null;

  // Animation variants

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100">

      {/* 1. HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tight text-lg">SplitBill</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (theme === 'system') setTheme('light');
              else if (theme === 'light') setTheme('dark');
              else setTheme('system');
            }}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center relative group"
            title={`Theme: ${theme}`}
          >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'system' && (
              <div className="relative">
                <Sun className="w-5 h-5 absolute opacity-0 dark:opacity-100 transition-opacity" />
                <Moon className="w-5 h-5 dark:opacity-0 transition-opacity" />
                <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-primary-500 text-white rounded-full w-3 h-3 flex items-center justify-center">A</span>
              </div>
            )}
          </button>
          <Link to="/profile" className="block hover:opacity-80 transition-opacity">
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              avatarColor={user.avatarColor}
              size="sm"
              showBorder
            />
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-6 p-4 sm:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-8">

        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-8">

          {/* Greeting */}
          <motion.div variants={item} className="pt-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {language === 'vi' ? `Chào ${user.name.split(' ')[0]} 👋` : `Hello ${user.name.split(' ')[0]} 👋`}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === 'vi' ? 'Sẵn sàng chia sẻ chi phí cùng bạn bè chưa?' : 'Ready to share expenses with friends?'}
            </p>
          </motion.div>

          {/* 2. QUICK ACTIONS */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="flex items-center gap-3 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all text-left group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                  {language === 'vi' ? 'Vào Nhóm' : 'Join Group'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
                  {language === 'vi' ? 'Bằng mã mời' : 'With invite code'}
                </p>
              </div>
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-3 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all text-left group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-50 dark:bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                  {language === 'vi' ? 'Tạo Nhóm' : 'Create Group'}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">
                  {language === 'vi' ? 'Bắt đầu chia sẻ' : 'Start sharing'}
                </p>
              </div>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            {/* 3. RECENT GROUPS */}
            <motion.div variants={item} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                  {language === 'vi' ? 'Nhóm Của Bạn' : 'Recent Groups'}
                </h3>
                <Link to="/groups" className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-0.5">
                  {language === 'vi' ? 'Tất cả' : 'View All'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Empty State */}
              {joinedGroups.length === 0 ? (
                <Card className="p-8 text-center border-dashed bg-transparent shadow-none border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-1">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">
                      {language === 'vi' ? 'Bạn chưa có nhóm nào 👋' : 'You haven’t joined any groups yet 👋'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'vi' ? 'Tạo nhóm mới hoặc nhập mã mời để bắt đầu.' : 'Create a new group or enter an invite code to start.'}
                    </p>
                  </div>
                  <Button onClick={() => setIsCreateOpen(true)} className="mt-2 shadow-sm font-bold" size="sm">
                    {language === 'vi' ? 'Tạo Nhóm Ngay' : 'Create a Group'}
                  </Button>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {joinedGroups.slice(0, 3).map((group: any) => {
                    return (
                      <Link key={group.id} to={`/groups/${group.id}`} className="block outline-none group/card">
                        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Group Icon Placeholder */}
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 group-hover/card:scale-105 transition-transform">
                              {group.category === 'trip' ? '🌴' : group.category === 'home' ? '🏠' : '📦'}
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                                {group.name}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                {group.members?.length || 1} {language === 'vi' ? 'thành viên' : 'members'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover/card:translate-x-1 group-hover/card:text-slate-500 transition-all" />
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* 4. RECENT ACTIVITY FEED */}
            <motion.div variants={item} className="flex flex-col gap-4 mt-2">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                {language === 'vi' ? 'Hoạt Động Mới Nhất' : 'Recent Activity'}
              </h3>

              {true ? (
                <p className="text-sm text-slate-500">
                  {language === 'vi' ? 'Tính năng đang được phát triển.' : 'Feature under development.'}
                </p>
              ) : null}
            </motion.div>
          </div>

        </motion.div>
      </main>

      {/* Modals for Quick Actions */}
      <Modal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} title={language === 'vi' ? 'Tham Gia Nhóm' : 'Join Group'} size="sm">
        <form onSubmit={handleJoinGroup} className="flex flex-col gap-4">
          <Input
            placeholder={language === 'vi' ? 'Nhập mã mời (VD: DN2026)' : 'Enter invite code (e.g. DN2026)'}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="uppercase font-bold tracking-widest text-center"
            maxLength={6}
            required
            disabled={joinMutation.isPending}
          />
          <Button disabled={joinMutation.isPending} type="submit" className="w-full h-12 font-bold shadow-md" leftIcon={joinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}>
            {joinMutation.isPending ? (language === 'vi' ? 'Đang kết nối...' : 'Connecting...') : (language === 'vi' ? 'Tham Gia Ngay' : 'Join Now')}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={language === 'vi' ? 'Tạo Nhóm Mới' : 'Create Group'} size="sm">
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
          <Input
            placeholder={language === 'vi' ? 'Tên nhóm (VD: Đi Đà Lạt)' : 'Group Name (e.g. Da Lat Trip)'}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
            disabled={createMutation.isPending}
          />
          <Button disabled={createMutation.isPending} type="submit" className="w-full h-12 font-bold shadow-md" leftIcon={createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}>
            {createMutation.isPending ? (language === 'vi' ? 'Đang tạo...' : 'Creating...') : (language === 'vi' ? 'Tạo Nhóm' : 'Create Group')}
          </Button>
        </form>
      </Modal>

    </div>
  );
};
