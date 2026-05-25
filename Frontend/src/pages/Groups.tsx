import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { GroupCard } from '../components/GroupCard';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Search, Plus, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GroupCategory } from '../types';
import { useMutation } from '@tanstack/react-query';
import { groupsApi } from '../api/groups.api';
import toast from 'react-hot-toast';

export const Groups: React.FC = () => {
  const { t } = useTranslation();
  const { joinedGroups, addJoinedGroup, language } = useAppStore();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Create Group modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState<GroupCategory>('trip');

  // Categories list
  const categories = [
    { id: 'all', label: t('auto.all') },
    { id: 'trip', label: t('auto.trip') },
    { id: 'home', label: t('auto.home') },
    { id: 'office', label: t('auto.office') },
    { id: 'couple', label: t('auto.couple') },
  ];

  // Filter groups
  const filteredGroups = joinedGroups.filter((g: any) => {
    if (!g) return false;
    const gName = g.name || '';
    const matchesSearch = gName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategory === 'all' || g.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await groupsApi.createGroup({ 
        name: newGroupName.trim(), 
        description: newGroupDesc.trim(),
        category: newGroupCat 
      });
      return res.data.group;
    },
    onSuccess: (group) => {
      addJoinedGroup(group);
      toast.success(t('auto.groupCreatedSuccessfully'));
      
      // Reset Form
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupCat('trip');
      setIsCreateOpen(false);
      navigate(`/groups/${group.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createMutation.mutate();
  };

  const createGroupForm = (
    <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
      <Input
        label={t('auto.groupName')}
        placeholder={t('auto.eGSapaTripSharedBills')}
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
        required
        disabled={createMutation.isPending}
      />

      <Input
        label={t('auto.shortDescription')}
        placeholder={t('auto.eGSharedExpensesForSapa')}
        value={newGroupDesc}
        onChange={(e) => setNewGroupDesc(e.target.value)}
        disabled={createMutation.isPending}
      />

      {/* Category selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
          {t('auto.groupCategory')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['trip', 'home', 'office', 'couple', 'other'] as GroupCategory[]).map((cat) => {
            const isSelected = newGroupCat === cat;
            const labels = {
              trip: t('auto.trip'),
              home: t('auto.home'),
              office: t('auto.office'),
              couple: t('auto.couple'),
              other: t('auto.other'),
            };
            return (
              <button
                key={cat}
                type="button"
                disabled={createMutation.isPending}
                onClick={() => setNewGroupCat(cat)}
                className={`
                  p-2.5 rounded-xl border text-xs font-bold text-center transition-all select-none cursor-pointer
                  ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }
                `}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCreateOpen(false)}
          className="w-1/2"
          disabled={createMutation.isPending}
        >
          {t('auto.cancel')}
        </Button>
        <Button type="submit" variant="primary" className="w-1/2 font-bold" disabled={createMutation.isPending} leftIcon={createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}>
          {createMutation.isPending ? (t('auto.creating')) : (t('auto.createGroup'))}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-500" />
            {t('auto.billingGroups')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {t('auto.manageYourGroupExpensesEffortlessly')}
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="font-bold flex items-center gap-1.5 rounded-xl shadow-md"
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5px]" />}
        >
          {t('auto.create')}
        </Button>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Search input */}
        <Input
          placeholder={t('auto.searchGroups')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          containerClassName="md:max-w-xs"
        />

        {/* Categories sliding filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap select-none transition-all cursor-pointer border
                  ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                      : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }
                `}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Groups Grid List with Framer Motion Layout animations */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          title={t('auto.noGroupsFound')}
          description={t('auto.trySearchWithOtherTermsOr')}
          actionLabel={t('auto.createNewGroup')}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGroups.map((group: any) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              key={group.id}
            >
              <GroupCard
                group={group}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('auto.createNewGroup')}
        size="md"
      >
        {createGroupForm}
      </Modal>
    </div>
  );
};
