import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Wallet, LogIn, Plus, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GroupCategory } from '@/types';
import { authApi } from '@/api/auth.api';
import { groupsApi } from '@/api/groups.api';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const Landing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppStore();
  const setAuth = useAuthStore(state => state.setAuth);
  
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

  const joinMutation = useMutation({
    mutationFn: async () => {
      // Register user anonymously
      const authRes = await authApi.register({ name: userName.trim(), avatarColor });
      setAuth(authRes.token, authRes.data.user);
      
      // Join group
      const joinRes = await groupsApi.joinGroup(inviteCode.trim().toUpperCase());
      return joinRes.data.group || { id: joinRes.data.groupId, name: 'Group' };
    },
    onSuccess: (group) => {
      useAppStore.getState().addJoinedGroup(group);
      navigate(`/groups/${group.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      // Register user anonymously
      const authRes = await authApi.register({ name: userName.trim(), avatarColor });
      setAuth(authRes.token, authRes.data.user);
      
      // Create group
      const createRes = await groupsApi.createGroup({ 
        name: groupName.trim(), 
        category 
      });
      return createRes.data.group;
    },
    onSuccess: (group) => {
      useAppStore.getState().addJoinedGroup(group);
      toast.success(t('auto.groupCreatedSuccessfully'));
      navigate(`/groups/${group.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !inviteCode.trim()) return;
    joinMutation.mutate();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !groupName.trim()) return;
    createMutation.mutate();
  };

  const isPending = joinMutation.isPending || createMutation.isPending;

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
            {t('auto.splitExpensesInstantlyOverRealApi')}
          </p>
        </div>

        <Card variant="glass" className="p-6 sm:p-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70">
          
          {/* Identity Step */}
          <div className="mb-6">
            <Input
              label={t('auto.yourDisplayName')}
              placeholder="e.g. John Doe"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="text-lg font-bold"
              required
              disabled={isPending}
            />
            
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1 mb-2 block">
                {t('auto.pickAvatarColor')}
              </label>
              <div className="flex gap-2 justify-between">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={isPending}
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
              type="button"
              disabled={isPending}
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'join' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {t('auto.joinGroup')}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {t('auto.createGroup')}
            </button>
          </div>

          {activeTab === 'join' ? (
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <Input
                placeholder={t('auto.enterInviteCodeEGDn2026')}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="uppercase font-bold tracking-widest text-center"
                maxLength={6}
                required
                disabled={isPending}
              />
              <Button disabled={isPending} type="submit" className="w-full h-12 text-base font-bold shadow-lg" leftIcon={joinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}>
                {joinMutation.isPending 
                  ? (t('auto.connecting')) 
                  : (t('auto.joinNow'))}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input
                placeholder={t('auto.groupNameEGDaLat')}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                disabled={isPending}
              />
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={isPending} onClick={() => setCategory('trip')} className={`p-2 rounded-xl text-xs font-bold border ${category === 'trip' ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700'}`}>{t('auto.trip')}</button>
                <button type="button" disabled={isPending} onClick={() => setCategory('home')} className={`p-2 rounded-xl text-xs font-bold border ${category === 'home' ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700'}`}>{t('auto.home')}</button>
              </div>
              <Button disabled={isPending} type="submit" className="w-full h-12 text-base font-bold shadow-lg mt-2" leftIcon={createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}>
                {createMutation.isPending 
                  ? (t('auto.creating')) 
                  : (t('auto.createNewGroup'))}
              </Button>
            </form>
          )}

        </Card>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{t('auto.cloudSyncRealtimeUpdates')}</span>
        </div>
      </motion.div>
    </div>
  );
};
