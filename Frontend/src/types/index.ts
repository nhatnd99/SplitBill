export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  avatarColor?: string; // For anonymous users who pick a color
  phone?: string;
}

export type GroupCategory = 'trip' | 'home' | 'couple' | 'office' | 'other';

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  inviteCode: string; // Unique 6-char code for sharing
  members: User[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  category: GroupCategory;
  totalExpense: number;
}

export type SplitType = 'equal' | 'percentage' | 'exact' | 'item';

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage?: number;
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  sharedBy: string[]; // User IDs
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: string; // User ID who paid
  splitType: SplitType;
  splits: ExpenseSplit[];
  items?: BillItem[]; // For item-based split
  notes?: string;
  category: string;
  date: string; // ISO format
  createdBy: string;
}

export type ActivityType = 'expense_add' | 'expense_update' | 'expense_delete' | 'settlement' | 'group_create' | 'member_joined';

export interface Activity {
  id: string;
  groupId?: string;
  groupName?: string;
  type: ActivityType;
  userId: string;
  userName: string;
  avatarUrl?: string;
  avatarColor?: string;
  details: {
    expenseId?: string;
    expenseTitle?: string;
    amount?: number;
    recipientId?: string;
    recipientName?: string;
    groupName?: string;
    memberName?: string;
  };
  timestamp: string; // ISO format
}

export interface UserBalance {
  userId: string;
  userName: string;
  avatarUrl?: string;
  avatarColor?: string;
  amount: number; // Positive: current user is owed, Negative: current user owes
}

export interface GroupBalanceSummary {
  groupId: string;
  totalOwed: number;
  youOwe: number;
  youAreOwed: number;
  balances: UserBalance[];
}

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  recipientId: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed';
}
