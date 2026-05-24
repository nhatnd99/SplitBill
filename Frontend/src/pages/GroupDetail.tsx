import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatters';
import {
  ArrowLeft, Copy, Receipt, Trash2, Users, FileText,
  CheckCircle2, PieChart, Activity, DollarSign, ArrowRight, Wallet, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { GroupFundCard } from '../components/GroupFundCard';
import { FundHistoryTab } from '../components/FundHistoryTab';
import { AddFundModal } from '../components/AddFundModal';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups.api';
import { billsApi } from '../api/bills.api';
import { settlementsApi } from '../api/settlements.api';
import { queryKeys } from '../api/queryKeys';
import { connectSocket } from '../sockets/socket';
import toast from 'react-hot-toast';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { language, currency, addToast } = useAppStore();
  const user = useAuthStore(state => state.user);

  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'settlements' | 'members' | 'fund'>('overview');
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAddFundModalOpen, setIsAddFundModalOpen] = useState(false);

  // --- QUERIES ---
  const { data: groupData, isLoading: isGroupLoading } = useQuery({
    queryKey: queryKeys.group(id!),
    queryFn: () => groupsApi.getGroup(id!),
    enabled: !!id
  });

  const { data: expensesData, isLoading: isExpensesLoading } = useQuery({
    queryKey: queryKeys.expenses(id!),
    queryFn: () => billsApi.getExpenses(id!),
    enabled: !!id
  });

  const { data: balancesData, isLoading: isBalancesLoading } = useQuery({
    queryKey: queryKeys.balances(id!),
    queryFn: () => settlementsApi.getBalances(id!),
    enabled: !!id
  });

  // --- MUTATIONS ---
  const deleteMutation = useMutation({
    mutationFn: (expenseId: string) => billsApi.deleteExpense(id!, expenseId),
    onSuccess: () => {
      toast.success(language === 'vi' ? 'Đã xóa hóa đơn' : 'Bill deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(id!) });
      setIsDeleteDialogOpen(false);
      setSelectedBillId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    }
  });

  const settleMutation = useMutation({
    mutationFn: ({ recipientId, amount }: { recipientId: string, amount: number }) => 
      settlementsApi.settleDebt(id!, recipientId, amount),
    onSuccess: () => {
      toast.success(language === 'vi' ? 'Đã đánh dấu thanh toán!' : 'Settlement marked as paid!');
      queryClient.invalidateQueries({ queryKey: queryKeys.balances(id!) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to settle debt');
    }
  });

  // --- SOCKETS ---
  useEffect(() => {
    if (!id) return;
    const socket = connectSocket();
    socket.emit('join:group', id);

    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances(id) });
    };

    socket.on('member:joined', (data: any) => {
      toast.success(`${data.userName} ${language === 'vi' ? 'đã tham gia nhóm!' : 'joined the group!'}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.group(id) });
    });
    socket.on('fund:updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.group(id) });
    });
    socket.on('bill:created', () => invalidateAll());
    socket.on('bill:deleted', () => invalidateAll());
    socket.on('settlement:updated', () => invalidateAll());

    return () => {
      socket.emit('leave:group', id);
      socket.off('member:joined');
      socket.off('fund:updated');
      socket.off('bill:created');
      socket.off('bill:deleted');
      socket.off('settlement:updated');
    };
  }, [id, queryClient, language]);

  const group = groupData?.data?.group;
  const groupExpenses = expensesData?.data?.expenses || [];
  const summary = balancesData?.data?.rawBalances;
  const optimizedSettlements = balancesData?.data?.optimizedTransactions || [];
  const selectedBill = useMemo(() => groupExpenses.find(e => e.id === selectedBillId), [groupExpenses, selectedBillId]);

  if (isGroupLoading || isExpensesLoading || isBalancesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!group || !user) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-[#090d16] min-h-screen">
        <p className="text-slate-500">{language === 'vi' ? 'Không tìm thấy nhóm' : 'Group not found'}</p>
        <Button onClick={() => navigate('/')} className="mt-4">{language === 'vi' ? 'Quay lại' : 'Go back'}</Button>
      </div>
    );
  }

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setIsCopied(true);
    addToast(language === 'vi' ? 'Đã sao chép mã mời!' : 'Invite code copied!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDeleteBill = () => {
    if (selectedBillId) {
      deleteMutation.mutate(selectedBillId);
    }
  };

  const handleSettle = (tx: any) => {
    settleMutation.mutate({ recipientId: tx.recipientId, amount: tx.amount });
  };

  // Group bills by date
  const groupedBills = (() => {
    const grouped: Record<string, typeof groupExpenses> = {};
    groupExpenses.forEach(bill => {
      const date = new Date(bill.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' });
      if (date.toDateString() === today.toDateString()) {
        key = language === 'vi' ? 'Hôm nay' : 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = language === 'vi' ? 'Hôm qua' : 'Yesterday';
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(bill);
    });
    return grouped;
  })();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-slate-100 pb-safe">

      {/* 1. GROUP HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/80">
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-slate-100 leading-tight">
                {group.name}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {group.members.length} {language === 'vi' ? 'thành viên' : 'members'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-bold text-xs"
          >
            {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {language === 'vi' ? 'Mã mời' : 'Invite'}: {group.inviteCode}
            </span>
            <span className="sm:hidden">{group.inviteCode}</span>
          </button>
        </div>

        {/* 2. TAB NAVIGATION */}
        <div className="px-4 sm:px-6 max-w-4xl mx-auto flex items-center gap-4 sm:gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-1 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <PieChart className="w-4 h-4" />
            {language === 'vi' ? 'Tổng Quan' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bills'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Receipt className="w-4 h-4" />
            {language === 'vi' ? 'Hóa Đơn' : 'Expenses'}
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'settlements'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Wallet className="w-4 h-4" />
            {language === 'vi' ? 'Thanh Toán' : 'Settlements'}
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'members'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Users className="w-4 h-4" />
            {language === 'vi' ? 'Thành Viên' : 'Members'}
          </button>
          <button
            onClick={() => setActiveTab('fund')}
            className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'fund'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Wallet className="w-4 h-4" />
            {language === 'vi' ? 'Lịch Sử Quỹ' : 'Fund History'}
          </button>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 max-w-4xl mx-auto w-full pb-24 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ================= OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 sm:gap-6"
            >
              <GroupFundCard group={group} onAddFund={() => setIsAddFundModalOpen(true)} />

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-500">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{language === 'vi' ? 'Tổng Chi Phí' : 'Total Expense'}</p>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{formatCurrency(group.totalExpense, currency)}</h3>
                </Card>

                <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{language === 'vi' ? 'Tổng Hóa Đơn' : 'Total Bills'}</p>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{groupExpenses.length}</h3>
                </Card>

                <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-none shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{language === 'vi' ? 'Thành Viên' : 'Members'}</p>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{group.members.length}</h3>
                </Card>

                <Card className="p-4 sm:p-5 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 text-white border-none shadow-md flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="p-2 rounded-xl bg-white/10 text-white">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{language === 'vi' ? 'Trạng Thái' : 'Status'}</p>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    {optimizedSettlements.length > 0 ? (language === 'vi' ? 'Còn nợ' : 'Pending') : (language === 'vi' ? 'Đã xong' : 'Settled')}
                  </h3>
                </Card>
              </div>

              {optimizedSettlements.length > 0 && (
                <motion.div variants={item} className="mt-2">
                  <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-l-4 border-l-orange-500 border-y-slate-100 border-r-slate-100 dark:border-y-slate-800 dark:border-r-slate-800">
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <AlertTriangleIcon /> {language === 'vi' ? 'Cần Thanh Toán' : 'Action Required'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'vi' ? 'Nhóm còn ' : 'There are '} <span className="font-bold text-slate-700 dark:text-slate-300">{optimizedSettlements.length}</span> {language === 'vi' ? ' khoản cần thanh toán.' : ' pending settlements.'}
                    </p>
                    <Button size="sm" className="mt-3" onClick={() => setActiveTab('settlements')}>
                      {language === 'vi' ? 'Xem chi tiết' : 'View Settlements'}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ================= BILLS TAB ================= */}
          {activeTab === 'bills' && (
            <motion.div
              key="bills"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {groupExpenses.length === 0 ? (
                <motion.div variants={item} className="py-12">
                  <Card className="p-8 text-center border-dashed bg-transparent shadow-none border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-1">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-200">
                        {language === 'vi' ? 'Chưa có hóa đơn nào 👋' : 'No bills yet 👋'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {language === 'vi' ? 'Thêm hóa đơn đầu tiên để bắt đầu chia sẻ.' : 'Add your first bill to start sharing.'}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                Object.entries(groupedBills).map(([dateLabel, bills]) => (
                  <div key={dateLabel} className="flex flex-col gap-3">
                    <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1 sticky top-32 z-10 py-1 bg-slate-50/80 dark:bg-[#090d16]/80 backdrop-blur-sm">
                      {dateLabel}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {bills.map(bill => {
                        const memberSource = bill.paymentSources?.find(s => s.type === 'MEMBER');
                        const creator = group.members.find((m: any) => m.id === memberSource?.memberId) || user;
                        return (
                          <motion.div variants={item} key={bill.id}>
                            <Card
                              className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group/bill"
                              onClick={() => setSelectedBillId(bill.id)}
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-lg shrink-0 group-hover/bill:scale-105 transition-transform">
                                  🧾
                                </div>
                                <div className="flex flex-col">
                                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-1">
                                    {bill.title}
                                  </h4>
                                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {creator?.name} • {new Date(bill.date).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100">
                                  {formatCurrency(bill.amount, currency)}
                                </span>
                                <div className="flex -space-x-1.5">
                                  {bill.splits.slice(0, 3).map(split => {
                                    const participant = group.members.find((m: any) => m.id === split.userId);
                                    return participant ? (
                                      <div key={split.userId} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white dark:border-slate-900 overflow-hidden bg-slate-200">
                                        {participant.avatarUrl ?
                                          <img src={participant.avatarUrl} alt={participant.name} className="w-full h-full object-cover" /> :
                                          <div className="w-full h-full" style={{ backgroundColor: participant.avatarColor }}></div>
                                        }
                                      </div>
                                    ) : null;
                                  })}
                                  {bill.splits.length > 3 && (
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[7px] sm:text-[8px] font-bold text-slate-500">
                                      +{bill.splits.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* ================= SETTLEMENTS TAB ================= */}
          {activeTab === 'settlements' && (
            <motion.div
              key="settlements"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 p-4 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                  {language === 'vi'
                    ? 'Thuật toán tối ưu hóa của chúng tôi đã gộp các khoản nợ để giảm thiểu số lần chuyển tiền.'
                    : 'Our optimization algorithm simplified the debts to minimize total transactions.'}
                </p>
              </div>

              {optimizedSettlements.length === 0 ? (
                <motion.div variants={item} className="py-8">
                  <Card className="p-8 text-center border-dashed bg-transparent shadow-none border-2 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-200">
                        {language === 'vi' ? 'Đã thanh toán hết!' : 'All settled up!'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {language === 'vi' ? 'Không còn ai nợ ai trong nhóm này.' : 'Nobody owes anything in this group.'}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  {optimizedSettlements.map((tx: any, idx: number) => {
                    const isMePayer = tx.payerId === user.id;
                    const isMeRecipient = tx.recipientId === user.id;

                    return (
                      <motion.div variants={item} key={idx}>
                        <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                          <div className="flex items-center justify-between gap-2 relative">
                            {/* Visual Flow Line */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 border-t-2 border-dashed border-slate-200 dark:border-slate-700 z-0"></div>

                            {/* Payer */}
                            <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                              <div className={`p-1 rounded-full ${isMePayer ? 'bg-rose-100 dark:bg-rose-500/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                <Avatar name={tx.payerName} avatarColor={tx.payerAvatar} size="md" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                                {isMePayer ? (language === 'vi' ? 'Bạn' : 'You') : tx.payerName}
                              </span>
                            </div>

                            {/* Amount & Arrow */}
                            <div className="flex flex-col items-center justify-center z-10 bg-white dark:bg-slate-900 px-2">
                              <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                                {formatCurrency(tx.amount, currency)}
                              </span>
                              <div className="text-slate-300 dark:text-slate-600 mt-1">
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Recipient */}
                            <div className="flex flex-col items-center gap-2 z-10 w-1/3">
                              <div className={`p-1 rounded-full ${isMeRecipient ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                <Avatar name={tx.recipientName} avatarColor={tx.recipientAvatar} size="md" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                                {isMeRecipient ? (language === 'vi' ? 'Bạn' : 'You') : tx.recipientName}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                            <Button size="sm" onClick={() => handleSettle(tx)} className="shadow-sm" disabled={settleMutation.isPending}>
                              {language === 'vi' ? 'Đánh dấu đã trả' : 'Mark as Paid'}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ================= MEMBERS TAB ================= */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-3"
            >
              {group.members.map((member: any) => {
                if (!member) return null;
                const balanceAmt = summary?.[member.id] || 0;

                return (
                  <motion.div variants={item} key={member.id || Math.random()}>
                    <Card className="p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} src={member.avatarUrl} avatarColor={member.avatarColor} size="md" />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {member.name}
                            {member.id === group.createdBy && (
                              <span className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[9px] uppercase tracking-wider rounded-md">Admin</span>
                            )}
                          </span>
                          {member.id === user?.id && (
                            <span className="text-[10px] text-slate-500">{language === 'vi' ? '(Bạn)' : '(You)'}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        {balanceAmt !== 0 ? (
                          <>
                            <div className={`text-xs sm:text-sm font-black ${balanceAmt > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {balanceAmt > 0 ? '+' : ''}{formatCurrency(balanceAmt, currency)}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {balanceAmt > 0
                                ? (language === 'vi' ? 'Được nhận' : 'Gets back')
                                : (language === 'vi' ? 'Còn nợ' : 'Owes')
                              }
                            </span>
                          </>
                        ) : (
                          <div className="text-xs text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                            {language === 'vi' ? 'Đã thanh toán' : 'Settled'}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ================= FUND HISTORY TAB ================= */}
          {activeTab === 'fund' && (
            <FundHistoryTab key="fund" group={group} />
          )}
        </AnimatePresence>
      </main>

      {/* 5. BILL DETAIL MODAL */}
      <Modal
        isOpen={!!selectedBillId && !isDeleteDialogOpen}
        onClose={() => setSelectedBillId(null)}
        title={language === 'vi' ? 'Chi tiết hóa đơn' : 'Bill Details'}
        size="md"
      >
        {selectedBill && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-3xl mb-4">
                🧾
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1 text-center">{selectedBill.title}</h2>
              <div className="text-2xl font-black text-primary-500">{formatCurrency(selectedBill.amount, currency)}</div>

              <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{new Date(selectedBill.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>•</span>
                <span>{new Date(selectedBill.date).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest pl-1">
                {language === 'vi' ? 'Chi tiết chia sẻ' : 'Split Details'}
              </h3>

              <div className="flex flex-col gap-2">
                {/* Paid By Row */}
                <div className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 mb-1">{language === 'vi' ? 'Nguồn thanh toán' : 'Payment Sources'}</div>
                  {selectedBill.paymentSources?.map((source: any, idx: number) => {
                    const isFund = source.type === 'GROUP_FUND';
                    const memberName = isFund ? (language === 'vi' ? 'Quỹ Nhóm' : 'Group Fund') : (group.members.find((m: any) => m.id === source.memberId)?.name || 'Someone');

                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isFund ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                            {isFund ? <Wallet className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {memberName}
                          </span>
                        </div>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-100">{formatCurrency(source.amount, currency)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Participants Rows */}
                {selectedBill.splits.map((split: any) => {
                  const participant = group.members.find((m: any) => m.id === split.userId);
                  if (!participant) return null;

                  return (
                    <div key={split.userId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-transparent">
                      <div className="flex items-center gap-3">
                        <Avatar name={participant.name} src={participant.avatarUrl} avatarColor={participant.avatarColor} size="sm" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{participant.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {formatCurrency(split.amount, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            {selectedBill.createdBy === user.id && (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  {language === 'vi' ? 'Xóa' : 'Delete'}
                </Button>
                <Button className="flex-1 font-bold" onClick={() => setSelectedBillId(null)}>
                  {language === 'vi' ? 'Đóng' : 'Close'}
                </Button>
              </div>
            )}
            {selectedBill.createdBy !== user.id && (
              <Button className="w-full font-bold" onClick={() => setSelectedBillId(null)}>
                {language === 'vi' ? 'Đóng' : 'Close'}
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title={language === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete'}
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium text-center border border-rose-100 dark:border-rose-500/20">
            {language === 'vi'
              ? 'Bạn có chắc chắn muốn xóa hóa đơn này? Hành động này không thể hoàn tác và sẽ cập nhật lại số dư của mọi người.'
              : 'Are you sure you want to delete this bill? This cannot be undone and will recalculate everyone\'s balances.'}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="flex-1 font-bold" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
              {language === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button className="flex-1 bg-rose-500 hover:bg-rose-600 font-bold shadow-md shadow-rose-500/20 text-white border-none" onClick={handleDeleteBill} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'vi' ? 'Xóa Hóa Đơn' : 'Delete Bill')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Fund Modal */}
      <AddFundModal
        isOpen={isAddFundModalOpen}
        onClose={() => setIsAddFundModalOpen(false)}
        groupId={group.id}
      />

    </div>
  );
};

// Extracted Alert Triangle icon because it was missing in imports previously
function AlertTriangleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-alert-triangle ${props.className || ''}`}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
