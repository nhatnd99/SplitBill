import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Tabs } from '../components/Tabs';
import { Badge } from '../components/Badge';
import { ExpenseCard } from '../components/ExpenseCard';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { 
  ArrowLeft, Search, Trash2, Calendar, FileText, 
  MapPin, Home, Briefcase, Coffee, DollarSign, Users, Info, ChevronDown, Copy, Check, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    groups, expenses, groupBalances, deleteExpense, settleDebt, activities,
    currentUser, addToast, language, currency 
  } = useAppStore();

  const group = groups.find((g) => g.id === id);
  
  // States
  const [activeTab, setActiveTab] = useState('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Expense detail modal
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  
  // Settlement states
  const [settlePayerId, setSettlePayerId] = useState('');
  const [settleRecipientId, setSettleRecipientId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          {language === 'vi' ? 'Không tìm thấy nhóm chi tiêu!' : 'Group not found!'}
        </p>
        <Button variant="primary" onClick={() => navigate('/groups')} className="mt-4">
          {language === 'vi' ? 'Quay lại danh sách' : 'Back to Groups'}
        </Button>
      </div>
    );
  }

  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const groupActivities = activities.filter(a => a.groupId === group.id);
  const balanceSummary = groupBalances[group.id];

  const filteredExpenses = groupExpenses.filter(
    (e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trip': return <MapPin className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'office': return <Briefcase className="w-4 h-4" />;
      case 'couple': return <Users className="w-4 h-4" />;
      default: return <Coffee className="w-4 h-4" />;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopied(true);
    addToast(language === 'vi' ? 'Đã sao chép mã nhóm' : 'Invite code copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm(language === 'vi' ? 'Bạn chắc chắn muốn xóa chi phí này chứ?' : 'Are you sure you want to delete this expense?')) {
      deleteExpense(expenseId);
      setSelectedExpense(null);
    }
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlePayerId || !settleRecipientId || !settleAmount) return;

    const amountNum = parseFloat(settleAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast(language === 'vi' ? 'Số tiền không hợp lệ' : 'Invalid amount', 'error');
      return;
    }

    if (settlePayerId === settleRecipientId) {
      addToast(language === 'vi' ? 'Người trả nợ và người nhận không thể trùng nhau' : 'Payer and Recipient cannot be the same', 'error');
      return;
    }

    setIsSettling(true);
    setTimeout(() => {
      settleDebt(group.id, settlePayerId, settleRecipientId, amountNum);
      setIsSettling(false);
      setIsSettleOpen(false);
      setSettleAmount('');
    }, 1000);
  };

  const openSettleModal = (debtorId: string, creditorId: string, debtAmount: number) => {
    setSettlePayerId(debtorId);
    setSettleRecipientId(creditorId);
    setSettleAmount(Math.abs(debtAmount).toString());
    setIsSettleOpen(true);
  };

  const getPayerName = (id: string) => {
    return group.members.find(m => m.id === id)?.name || (language === 'vi' ? 'Người dùng' : 'Member');
  };

  const tabsData = [
    { id: 'expenses', label: language === 'vi' ? 'Hóa đơn' : 'Expenses' },
    { id: 'members', label: language === 'vi' ? 'Thành viên' : 'Members' },
    { id: 'balances', label: language === 'vi' ? 'Nợ nần' : 'Balances' },
    { id: 'activity', label: language === 'vi' ? 'Hoạt động' : 'Activity' },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      
      {/* 1. Back button & Copy Code */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/groups')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {language === 'vi' ? 'Quay lại' : 'Back'}
        </button>
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {language === 'vi' ? `Mã: ${group.inviteCode}` : `Code: ${group.inviteCode}`}
        </button>
      </div>

      {/* 2. Banner/Header */}
      <Card variant="accent" className="p-6 relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              {group.avatarUrl ? (
                <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{getCategoryIcon(group.category)}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                  {group.name}
                </h2>
                <Badge variant="primary" className="flex items-center gap-1">
                  {getCategoryIcon(group.category)}
                  <span className="capitalize">{group.category}</span>
                </Badge>
              </div>
              {group.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              {language === 'vi' ? 'Tổng chi tiêu' : 'Total spent'}
            </span>
            <span className="text-2xl font-black text-primary-500 mt-1 block">
              {formatCurrency(group.totalExpense, currency)}
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Sliding Tabs Control */}
      <Tabs
        tabs={tabsData}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {/* 4. Tab Views Contents */}
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          {/* A. Expenses List View */}
          {activeTab === 'expenses' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex flex-col gap-4"
              key="expenses-tab"
            >
              <div className="flex items-center justify-between gap-4">
                <Input
                  placeholder={language === 'vi' ? 'Tìm kiếm hóa đơn...' : 'Search bills...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  containerClassName="md:max-w-xs"
                />
              </div>

              {filteredExpenses.length === 0 ? (
                <EmptyState
                  title={language === 'vi' ? 'Chưa có hóa đơn' : 'No expenses'}
                  description={language === 'vi' ? 'Bắt đầu thêm chi phí cho nhóm bằng nút Thêm Chi Phí ở dưới.' : 'Add your group first bills using the Add Expense button!'}
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {filteredExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onClick={() => setSelectedExpense(expense)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* B. Members List View */}
          {activeTab === 'members' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              key="members-tab"
            >
              {group.members.map((member) => {
                const isMe = member.id === currentUser?.id;
                return (
                  <Card key={member.id} className="p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar src={member.avatarUrl} name={member.name} avatarColor={member.avatarColor} size="md" />
                      <div>
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {member.name} {isMe && <span className="text-xs text-primary-500 font-extrabold ml-1">({language === 'vi' ? 'Bạn' : 'You'})</span>}
                        </h5>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {/* C. Group Balances Summary View */}
          {activeTab === 'balances' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex flex-col gap-6"
              key="balances-tab"
            >
              {balanceSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        {language === 'vi' ? 'Bạn được trả tổng cộng' : 'You are owed in total'}
                      </span>
                      <span className="text-xl font-extrabold text-emerald-500 mt-1 block">
                        {formatCurrency(balanceSummary.youAreOwed, currency)}
                      </span>
                    </div>
                  </Card>

                  <Card className="p-4 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                        {language === 'vi' ? 'Bạn nợ tổng cộng' : 'You owe in total'}
                      </span>
                      <span className="text-xl font-extrabold text-rose-500 mt-1 block">
                        {formatCurrency(balanceSummary.youOwe, currency)}
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {language === 'vi' ? 'Đề xuất thanh toán nợ' : 'Settle Debts Summary'}
                </h4>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSettleOpen(true)}
                  className="rounded-xl font-bold"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                >
                  {language === 'vi' ? 'Ghi nhận thanh toán' : 'Record Payment'}
                </Button>
              </div>

              <div className="flex flex-col gap-2.5">
                {!balanceSummary || balanceSummary.balances.every(b => b.amount === 0) ? (
                  <Card className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-slate-400 font-medium">
                      {language === 'vi' ? 'Tuyệt vời, tất cả đã được giải quyết xong!' : 'Perfect, this group is all settled up!'}
                    </span>
                  </Card>
                ) : (
                  balanceSummary.balances.map((balance) => {
                    const isOwed = balance.amount > 0;
                    const isSettled = balance.amount === 0;

                    if (isSettled) return null;

                    return (
                      <div
                        key={balance.userId}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={balance.avatarUrl} name={balance.userName} avatarColor={balance.avatarColor} size="md" />
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {balance.userName}
                            </h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {isOwed 
                                ? (language === 'vi' ? 'đang nợ bạn' : 'owes you') 
                                : (language === 'vi' ? 'bạn đang nợ' : 'you owe')
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-extrabold ${isOwed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isOwed ? '+' : '-'}{formatCurrency(balance.amount, currency)}
                          </span>

                          <Button
                            variant={isOwed ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={() => {
                              if (isOwed) {
                                openSettleModal(balance.userId, currentUser!.id, balance.amount);
                              } else {
                                openSettleModal(currentUser!.id, balance.userId, balance.amount);
                              }
                            }}
                            className="rounded-xl px-2.5 py-1.5 text-xs font-bold"
                          >
                            {language === 'vi' ? 'Thanh toán' : 'Settle'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* D. Activity Timeline */}
          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex flex-col gap-4"
              key="activity-tab"
            >
              {groupActivities.length === 0 ? (
                <EmptyState
                  title={language === 'vi' ? 'Chưa có hoạt động' : 'No Activity'}
                  description={language === 'vi' ? 'Nhóm chưa có hoạt động nào.' : 'This group has no activity yet.'}
                />
              ) : (
                <Card className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                  {groupActivities.map(activity => (
                    <div key={activity.id} className="p-4 flex gap-4">
                      <div className="shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'expense_add' ? 'bg-primary-50 text-primary-500 dark:bg-primary-500/10' :
                          activity.type === 'settlement' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' :
                          activity.type === 'member_joined' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' :
                          'bg-slate-50 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {activity.type === 'expense_add' && <Receipt className="w-4 h-4" />}
                          {activity.type === 'settlement' && <DollarSign className="w-4 h-4" />}
                          {activity.type === 'member_joined' && <Users className="w-4 h-4" />}
                          {activity.type === 'group_create' && <MapPin className="w-4 h-4" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          <span className="font-bold">{activity.userName}</span>
                          {activity.type === 'expense_add' && (language === 'vi' ? ' đã thêm chi phí ' : ' added expense ')}
                          {activity.type === 'settlement' && (language === 'vi' ? ' đã thanh toán cho ' : ' settled up with ')}
                          {activity.type === 'group_create' && (language === 'vi' ? ' đã tạo nhóm ' : ' created group ')}
                          {activity.type === 'member_joined' && (language === 'vi' ? ' đã tham gia nhóm.' : ' joined the group.')}
                          
                          {activity.type === 'settlement' && <span className="font-bold">{activity.details.recipientName}</span>}
                          {activity.type === 'expense_add' && <span className="font-bold">"{activity.details.expenseTitle}"</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{formatRelativeTime(activity.timestamp, language)}</span>
                          {activity.details.amount && (
                            <>
                              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                              <span className={`text-xs font-bold ${activity.type === 'settlement' ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                {formatCurrency(activity.details.amount, currency)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={selectedExpense !== null}
        onClose={() => setSelectedExpense(null)}
        title={language === 'vi' ? 'Chi Tiết Chi Phí' : 'Expense Details'}
      >
        {selectedExpense && (
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-500/10 text-primary-500 border border-primary-100 dark:border-primary-500/20 rounded-xl">
                {getCategoryIcon(group.category)}
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                  {selectedExpense.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{new Date(selectedExpense.date).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-2 py-1">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest block">
                  {language === 'vi' ? 'Tổng số tiền' : 'Total Amount'}
                </span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1 block">
                  {formatCurrency(selectedExpense.amount, currency)}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest block">
                  {language === 'vi' ? 'Người chi trả' : 'Paid By'}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1 block">
                  {getPayerName(selectedExpense.paidBy)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest block px-1">
                {language === 'vi' ? 'Chi tiết chia hóa đơn' : 'Split Breakdown'}
              </span>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                {selectedExpense.splits.map((split: any) => {
                  const splitUser = group.members.find(m => m.id === split.userId);
                  if (!splitUser) return null;
                  const isMe = split.userId === currentUser?.id;
                  
                  return (
                    <div key={split.userId} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={splitUser.avatarUrl} name={splitUser.name} avatarColor={splitUser.avatarColor} size="sm" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {splitUser.name} {isMe && <span className="text-[10px] text-primary-500 ml-1 font-extrabold">({language === 'vi' ? 'Bạn' : 'You'})</span>}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {formatCurrency(split.amount, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedExpense.notes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
                    {language === 'vi' ? 'Ghi chú' : 'Notes'}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {selectedExpense.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedExpense(null)}
                className="w-1/2"
              >
                {language === 'vi' ? 'Đóng lại' : 'Close'}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteExpense(selectedExpense.id)}
                className="w-1/2 font-bold"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                {language === 'vi' ? 'Xóa chi phí' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        title={language === 'vi' ? 'Ghi Nhận Thanh Toán Nợ' : 'Record Settlement'}
      >
        <form onSubmit={handleSettleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
                {language === 'vi' ? 'Người trả nợ' : 'Payer'}
              </label>
              <div className="relative">
                <select
                  value={settlePayerId}
                  onChange={(e) => setSettlePayerId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-slate-800 dark:text-slate-100"
                >
                  <option value="">{language === 'vi' ? '-- Chọn --' : '-- Select --'}</option>
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
                {language === 'vi' ? 'Người nhận' : 'Recipient'}
              </label>
              <div className="relative">
                <select
                  value={settleRecipientId}
                  onChange={(e) => setSettleRecipientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none text-slate-800 dark:text-slate-100"
                >
                  <option value="">{language === 'vi' ? '-- Chọn --' : '-- Select --'}</option>
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <Input
            label={language === 'vi' ? 'Số tiền thanh toán (VND)' : 'Amount (VND)'}
            type="number"
            placeholder="e.g. 150000"
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            required
          />

          <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 p-3.5 rounded-2xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span className="text-[10px] text-sky-700 dark:text-sky-400 leading-normal">
              {language === 'vi' 
                ? 'Ghi nhận thanh toán này sẽ giảm số dư nợ tương ứng giữa hai người dùng trực tiếp trong nhóm này.' 
                : 'Recording this payment directly settles the corresponding debt between these two users in this group.'}
            </span>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSettleOpen(false)}
              className="w-1/2"
            >
              {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSettling}
              className="w-1/2 font-bold"
            >
              {language === 'vi' ? 'Ghi nhận' : 'Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
