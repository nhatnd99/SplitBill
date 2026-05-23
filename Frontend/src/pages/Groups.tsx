import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Avatar } from '../components/Avatar';
import { GroupCard } from '../components/GroupCard';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Search, Plus, Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GroupCategory } from '../types';

export const Groups: React.FC = () => {
  const { groups, addGroup, users, currentUser, language } = useAppStore();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Create Group modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState<GroupCategory>('trip');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Categories list
  const categories = [
    { id: 'all', label: language === 'vi' ? 'Tất cả' : 'All' },
    { id: 'trip', label: language === 'vi' ? '🌴 Du lịch' : '🌴 Trip' },
    { id: 'home', label: language === 'vi' ? '🏠 Nhà cửa' : '🏠 Home' },
    { id: 'office', label: language === 'vi' ? '🍱 Văn phòng' : '🍱 Office' },
    { id: 'couple', label: language === 'vi' ? '❤️ Cặp đôi' : '❤️ Couple' },
  ];

  // Filter groups
  const filteredGroups = groups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = activeCategory === 'all' || g.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  // Handle member toggle
  const toggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    addGroup(
      newGroupName,
      newGroupDesc,
      newGroupCat,
      selectedMemberIds
    );

    // Reset Form
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupCat('trip');
    setSelectedMemberIds([]);
    setIsCreateOpen(false);
  };

  const createGroupForm = (
    <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
      <Input
        label={language === 'vi' ? 'Tên nhóm *' : 'Group Name *'}
        placeholder={language === 'vi' ? 'e.g. Du lịch Sapa 2026, Tiền nhà trọ...' : 'e.g. Sapa Trip, Shared Bills...'}
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
        required
      />

      <Input
        label={language === 'vi' ? 'Mô tả ngắn' : 'Short Description'}
        placeholder={language === 'vi' ? 'e.g. Chuyến đi 3 ngày 2 đêm cuối tuần...' : 'e.g. Shared expenses for Sapa trip...'}
        value={newGroupDesc}
        onChange={(e) => setNewGroupDesc(e.target.value)}
      />

      {/* Category selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
          {language === 'vi' ? 'Danh mục nhóm' : 'Group Category'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['trip', 'home', 'office', 'couple', 'other'] as GroupCategory[]).map((cat) => {
            const isSelected = newGroupCat === cat;
            const labels = {
              trip: language === 'vi' ? '🌴 Du lịch' : '🌴 Trip',
              home: language === 'vi' ? '🏠 Nhà cửa' : '🏠 Home',
              office: language === 'vi' ? '🍱 Công sở' : '🍱 Office',
              couple: language === 'vi' ? '❤️ Cặp đôi' : '❤️ Couple',
              other: language === 'vi' ? '📦 Khác' : '📦 Other',
            };
            return (
              <button
                key={cat}
                type="button"
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

      {/* Members checklists */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1 flex justify-between items-center">
          <span>{language === 'vi' ? 'Thêm thành viên' : 'Add Members'}</span>
          <span className="text-[10px] text-slate-400 font-bold">
            {selectedMemberIds.length} {language === 'vi' ? 'đã chọn' : 'selected'}
          </span>
        </label>
        
        {/* Search member */}
        <Input
          placeholder={language === 'vi' ? 'Tìm kiếm bạn bè...' : 'Search friends...'}
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
          containerClassName="mb-1"
        />

        <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/50">
          {users
            .filter(u => u.id !== currentUser?.id) // exclude current user since they are auto-added
            .filter(u => u.name.toLowerCase().includes(memberSearch.toLowerCase()))
            .map((user) => {
              const isSelected = selectedMemberIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className={`flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors select-none`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} src={user.avatarUrl} avatarColor={user.avatarColor} size="sm" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {user.name}
                    </span>
                  </div>
                  <div
                    className={`
                      w-5 h-5 rounded-md border flex items-center justify-center transition-all
                      ${
                        isSelected
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                  </div>
                </div>
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
        >
          {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
        </Button>
        <Button type="submit" variant="primary" className="w-1/2 font-bold">
          {language === 'vi' ? 'Tạo nhóm' : 'Create Group'}
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
            {language === 'vi' ? 'Nhóm Chi Tiêu' : 'Billing Groups'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {language === 'vi' ? 'Quản lý và chia sẻ hóa đơn nhóm của bạn' : 'Manage your group expenses effortlessly'}
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="font-bold flex items-center gap-1.5 rounded-xl shadow-md"
          leftIcon={<Plus className="w-4 h-4 stroke-[2.5px]" />}
        >
          {language === 'vi' ? 'Tạo nhóm' : 'Create'}
        </Button>
      </div>

      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Search input */}
        <Input
          placeholder={language === 'vi' ? 'Tìm kiếm nhóm chi tiêu...' : 'Search groups...'}
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
          title={language === 'vi' ? 'Không tìm thấy nhóm' : 'No groups found'}
          description={language === 'vi' ? 'Thử tìm kiếm với từ khóa khác hoặc tạo nhóm mới ngay hôm nay.' : 'Try search with other terms or create a new billing group!'}
          actionLabel={language === 'vi' ? 'Tạo nhóm mới' : 'Create New Group'}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGroups.map((group) => (
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
        title={language === 'vi' ? 'Tạo Nhóm Mới' : 'Create New Group'}
        size="md"
      >
        {createGroupForm}
      </Modal>
    </div>
  );
};
