import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Group, Expense, Activity, UserBalance, GroupBalanceSummary, SplitType, GroupCategory } from '../types';
import { mockUsers } from '../mock/mockUsers';
import { mockGroups } from '../mock/mockGroups';
import { mockExpenses } from '../mock/mockExpenses';
import { mockActivities } from '../mock/mockActivities';
import { mockGlobalBalances, mockGroupBalances } from '../mock/mockBalances';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // Theme & Settings
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  currency: 'VND' | 'USD' | 'EUR';
  
  // Data lists
  currentUser: User | null;
  users: User[];
  groups: Group[];
  expenses: Expense[];
  activities: Activity[];
  globalBalances: UserBalance[];
  groupBalances: Record<string, GroupBalanceSummary>;
  
  // Toasts
  toasts: Toast[];
  
  // Setters & Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'vi' | 'en') => void;
  setCurrency: (curr: 'VND' | 'USD' | 'EUR') => void;
  setCurrentUser: (user: User | null) => void;
  
  // Group Operations
  joinGroup: (inviteCode: string, userName: string, avatarColor: string) => string | null;
  addGroup: (name: string, description: string, category: GroupCategory, userName: string, avatarColor: string) => string;
  updateGroup: (groupId: string, data: Partial<Group>) => void;
  
  // Expense Operations
  addExpense: (data: Omit<Expense, 'id' | 'date' | 'createdBy'>) => void;
  deleteExpense: (expenseId: string) => void;
  
  // Debt Settlement
  settleDebt: (groupId: string, payerId: string, recipientId: string, amount: number) => void;
  
  // Toast notifications
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme & Settings default
      theme: 'system',
      language: 'vi',
      currency: 'VND',
      
      // Data lists initial
      currentUser: null, // Starts null, user enters name to join/create
      users: mockUsers,
      groups: mockGroups,
      expenses: mockExpenses,
      activities: mockActivities,
      globalBalances: mockGlobalBalances,
      groupBalances: mockGroupBalances,
      
      toasts: [],
      
      // Setters
      setTheme: (theme) => {
        set({ theme });
        let isDark = theme === 'dark';
        if (theme === 'system' && typeof window !== 'undefined') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      
      setCurrentUser: (currentUser) => set({ currentUser }),
      
      // Toast operations
      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

      // Join an existing group
      joinGroup: (inviteCode, userName, avatarColor) => {
        const group = get().groups.find(g => g.inviteCode === inviteCode);
        if (!group) {
          get().addToast(get().language === 'vi' ? 'Mã nhóm không hợp lệ' : 'Invalid invite code', 'error');
          return null;
        }

        const newUser: User = {
          id: generateId('user'),
          name: userName,
          avatarColor,
        };

        const newActivity: Activity = {
          id: generateId('act'),
          groupId: group.id,
          groupName: group.name,
          type: 'member_joined',
          userId: newUser.id,
          userName: newUser.name,
          avatarColor: newUser.avatarColor,
          details: {
            memberName: newUser.name,
          },
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          currentUser: newUser,
          users: [...state.users, newUser],
          groups: state.groups.map(g => {
            if (g.id === group.id) {
              return { ...g, members: [...g.members, newUser] };
            }
            return g;
          }),
          activities: [newActivity, ...state.activities],
          groupBalances: {
            ...state.groupBalances,
            [group.id]: {
              ...state.groupBalances[group.id],
              balances: [
                ...state.groupBalances[group.id].balances,
                { userId: newUser.id, userName: newUser.name, avatarColor: newUser.avatarColor, amount: 0 }
              ]
            }
          }
        }));

        get().addToast(
          get().language === 'vi' ? `Bạn đã tham gia nhóm "${group.name}"` : `Joined group "${group.name}"`,
          'success'
        );

        return group.id;
      },

      // Group Operations
      addGroup: (name, description, category, userName, avatarColor) => {
        const newGroupId = generateId('group');
        const newUser: User = {
          id: generateId('user'),
          name: userName,
          avatarColor,
        };
        
        const newGroup: Group = {
          id: newGroupId,
          name,
          description,
          inviteCode: generateInviteCode(),
          members: [newUser],
          createdBy: newUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category,
          totalExpense: 0,
        };
        
        const newGroupBalances: GroupBalanceSummary = {
          groupId: newGroupId,
          totalOwed: 0,
          youOwe: 0,
          youAreOwed: 0,
          balances: [],
        };
        
        const newActivity: Activity = {
          id: generateId('act'),
          groupId: newGroupId,
          groupName: name,
          type: 'group_create',
          userId: newUser.id,
          userName: newUser.name,
          avatarColor: newUser.avatarColor,
          details: {
            groupName: name,
          },
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          currentUser: newUser,
          users: [...state.users, newUser],
          groups: [newGroup, ...state.groups],
          activities: [newActivity, ...state.activities],
          groupBalances: {
            ...state.groupBalances,
            [newGroupId]: newGroupBalances,
          },
        }));
        
        get().addToast(
          get().language === 'vi' ? `Đã tạo nhóm "${name}" thành công!` : `Group "${name}" created successfully!`,
          'success'
        );

        return newGroupId;
      },
      
      updateGroup: (groupId, data) => {
        set((state) => ({
          groups: state.groups.map(g => g.id === groupId ? { ...g, ...data, updatedAt: new Date().toISOString() } : g),
        }));
      },
      
      // Expense Operations
      addExpense: (data) => {
        const newId = generateId('exp');
        const creator = get().currentUser;
        if (!creator) return;
        
        const newExpense: Expense = {
          ...data,
          id: newId,
          date: new Date().toISOString(),
          createdBy: creator.id,
        };
        
        const newActivity: Activity = {
          id: generateId('act'),
          groupId: data.groupId,
          groupName: get().groups.find(g => g.id === data.groupId)?.name || 'Nhóm',
          type: 'expense_add',
          userId: creator.id,
          userName: creator.name,
          avatarColor: creator.avatarColor,
          details: {
            expenseId: newId,
            expenseTitle: data.title,
            amount: data.amount,
          },
          timestamp: new Date().toISOString(),
        };
        
        set((state) => {
          // Update Group Total Expense
          const updatedGroups = state.groups.map((g) => {
            if (g.id === data.groupId) {
              return { ...g, totalExpense: g.totalExpense + data.amount, updatedAt: new Date().toISOString() };
            }
            return g;
          });
          
          // Update local balances for this group
          const currentGrpBalances = state.groupBalances[data.groupId];
          let updatedGrpBalances = { ...currentGrpBalances };
          
          if (currentGrpBalances) {
            const isPaidByMe = data.paidBy === creator.id;
            let youAreOwedDelta = 0;
            let youOweDelta = 0;
            
            const nextBalances = currentGrpBalances.balances.map((b) => {
              const split = data.splits.find(s => s.userId === b.userId);
              const splitAmount = split ? split.amount : 0;
              
              let delta = 0;
              if (isPaidByMe) {
                delta = splitAmount;
                youAreOwedDelta += splitAmount;
              } else {
                if (b.userId === data.paidBy) {
                  const mySplit = data.splits.find(s => s.userId === creator.id);
                  const mySplitAmount = mySplit ? mySplit.amount : 0;
                  delta = -mySplitAmount;
                  youOweDelta += mySplitAmount;
                }
              }
              return { ...b, amount: b.amount + delta };
            });
            
            updatedGrpBalances = {
              groupId: data.groupId,
              totalOwed: currentGrpBalances.totalOwed + (isPaidByMe ? (data.amount - (data.splits.find(s => s.userId === creator.id)?.amount || 0)) : -(data.splits.find(s => s.userId === creator.id)?.amount || 0)),
              youAreOwed: currentGrpBalances.youAreOwed + youAreOwedDelta,
              youOwe: currentGrpBalances.youOwe + youOweDelta,
              balances: nextBalances,
            };
          }
          
          // Global balances
          const nextGlobalBalances = state.globalBalances.map((b) => {
            const split = data.splits.find(s => s.userId === b.userId);
            if (split) {
              const isPaidByMe = data.paidBy === creator.id;
              let delta = 0;
              if (isPaidByMe) {
                delta = split.amount;
              } else if (b.userId === data.paidBy) {
                const mySplit = data.splits.find(s => s.userId === creator.id);
                delta = -(mySplit ? mySplit.amount : 0);
              }
              return { ...b, amount: b.amount + delta };
            }
            return b;
          });
          
          return {
            expenses: [newExpense, ...state.expenses],
            activities: [newActivity, ...state.activities],
            groups: updatedGroups,
            groupBalances: {
              ...state.groupBalances,
              [data.groupId]: updatedGrpBalances,
            },
            globalBalances: nextGlobalBalances,
          };
        });
        
        get().addToast(
          get().language === 'vi' ? `Đã thêm chi phí "${data.title}"!` : `Added expense "${data.title}"!`,
          'success'
        );
      },
      
      deleteExpense: (expenseId) => {
        const expense = get().expenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        const creator = get().currentUser;
        if (!creator) return;

        const newActivity: Activity = {
          id: generateId('act'),
          groupId: expense.groupId,
          groupName: get().groups.find(g => g.id === expense.groupId)?.name || 'Nhóm',
          type: 'expense_delete',
          userId: creator.id,
          userName: creator.name,
          avatarColor: creator.avatarColor,
          details: {
            expenseTitle: expense.title,
            amount: expense.amount,
          },
          timestamp: new Date().toISOString(),
        };
        
        set((state) => {
          const updatedGroups = state.groups.map((g) => {
            if (g.id === expense.groupId) {
              return { ...g, totalExpense: Math.max(0, g.totalExpense - expense.amount), updatedAt: new Date().toISOString() };
            }
            return g;
          });
          
          const currentGrpBalances = state.groupBalances[expense.groupId];
          let updatedGrpBalances = { ...currentGrpBalances };
          
          if (currentGrpBalances) {
            const isPaidByMe = expense.paidBy === creator.id;
            let youAreOwedDelta = 0;
            let youOweDelta = 0;
            
            const nextBalances = currentGrpBalances.balances.map((b) => {
              const split = expense.splits.find(s => s.userId === b.userId);
              const splitAmount = split ? split.amount : 0;
              
              let delta = 0;
              if (isPaidByMe) {
                delta = -splitAmount;
                youAreOwedDelta += splitAmount;
              } else {
                if (b.userId === expense.paidBy) {
                  const mySplit = expense.splits.find(s => s.userId === creator.id);
                  const mySplitAmount = mySplit ? mySplit.amount : 0;
                  delta = mySplitAmount;
                  youOweDelta += mySplitAmount;
                }
              }
              return { ...b, amount: b.amount + delta };
            });
            
            updatedGrpBalances = {
              groupId: expense.groupId,
              totalOwed: currentGrpBalances.totalOwed - (isPaidByMe ? (expense.amount - (expense.splits.find(s => s.userId === creator.id)?.amount || 0)) : -(expense.splits.find(s => s.userId === creator.id)?.amount || 0)),
              youAreOwed: Math.max(0, currentGrpBalances.youAreOwed - youAreOwedDelta),
              youOwe: Math.max(0, currentGrpBalances.youOwe - youOweDelta),
              balances: nextBalances,
            };
          }
          
          return {
            expenses: state.expenses.filter((e) => e.id !== expenseId),
            activities: [newActivity, ...state.activities],
            groups: updatedGroups,
            groupBalances: {
              ...state.groupBalances,
              [expense.groupId]: updatedGrpBalances,
            },
          };
        });
        
        get().addToast(
          get().language === 'vi' ? `Đã xóa chi phí "${expense.title}"` : `Deleted expense "${expense.title}"`,
          'info'
        );
      },
      
      settleDebt: (groupId, payerId, recipientId, amount) => {
        const creator = get().currentUser;
        if (!creator) return;

        const payerName = get().users.find(u => u.id === payerId)?.name || 'Người dùng';
        const recipientName = get().users.find(u => u.id === recipientId)?.name || 'Người nhận';
        const payerAvatar = get().users.find(u => u.id === payerId)?.avatarColor || creator.avatarColor;
        
        const newActivity: Activity = {
          id: generateId('act'),
          groupId,
          groupName: get().groups.find(g => g.id === groupId)?.name || 'Nhóm',
          type: 'settlement',
          userId: payerId,
          userName: payerName,
          avatarColor: payerAvatar,
          details: {
            amount,
            recipientId,
            recipientName,
          },
          timestamp: new Date().toISOString(),
        };
        
        set((state) => {
          const currentGrpBalances = state.groupBalances[groupId];
          let updatedGrpBalances = { ...currentGrpBalances };
          
          if (currentGrpBalances) {
            const isPayerMe = payerId === creator.id;
            const isRecipientMe = recipientId === creator.id;
            
            let youAreOwedDelta = 0;
            let youOweDelta = 0;
            
            const nextBalances = currentGrpBalances.balances.map((b) => {
              let currentAmount = b.amount;
              if (isPayerMe && b.userId === recipientId) {
                currentAmount += amount;
                youOweDelta += amount;
              } else if (isRecipientMe && b.userId === payerId) {
                currentAmount -= amount;
                youAreOwedDelta += amount;
              }
              return { ...b, amount: currentAmount };
            });
            
            updatedGrpBalances = {
              groupId,
              totalOwed: currentGrpBalances.totalOwed + (isPayerMe ? amount : -amount),
              youAreOwed: Math.max(0, currentGrpBalances.youAreOwed - youAreOwedDelta),
              youOwe: Math.max(0, currentGrpBalances.youOwe - youOweDelta),
              balances: nextBalances,
            };
          }
          
          const nextGlobalBalances = state.globalBalances.map((b) => {
            let currentAmount = b.amount;
            if (payerId === creator.id && b.userId === recipientId) {
              currentAmount += amount;
            } else if (recipientId === creator.id && b.userId === payerId) {
              currentAmount -= amount;
            }
            return { ...b, amount: currentAmount };
          });
          
          return {
            activities: [newActivity, ...state.activities],
            groupBalances: {
              ...state.groupBalances,
              [groupId]: updatedGrpBalances,
            },
            globalBalances: nextGlobalBalances,
          };
        });
        
        get().addToast(
          get().language === 'vi'
            ? `${payerName} đã chuyển ${amount.toLocaleString('vi-VN')}đ cho ${recipientName} để thanh toán nợ!`
            : `${payerName} sent ${amount.toLocaleString()} VND to ${recipientName} for settlement!`,
          'success'
        );
      },
    }),
    {
      name: 'splitbill-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        language: state.language, 
        currency: state.currency,
        currentUser: state.currentUser,
        users: state.users,
        groups: state.groups,
        expenses: state.expenses,
        activities: state.activities,
        globalBalances: state.globalBalances,
        groupBalances: state.groupBalances,
      }),
    }
  )
);
