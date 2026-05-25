import { api } from '@/api/client';
import type { Expense } from '@/types';

export const billsApi = {
  getExpenses: async (groupId: string): Promise<{ data: { expenses: Expense[] } }> => {
    const { data } = await api.get(`/groups/${groupId}/expenses`);
    return data;
  },
  createExpense: async (groupId: string, expenseData: any) => {
    const { data } = await api.post(`/groups/${groupId}/expenses`, expenseData);
    return data;
  },
  deleteExpense: async (groupId: string, expenseId: string) => {
    const { data } = await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
    return data;
  }
};
