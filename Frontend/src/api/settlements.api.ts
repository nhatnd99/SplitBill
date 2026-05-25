import { api } from '@/api/client';

export const settlementsApi = {
  getBalances: async (groupId: string) => {
    const { data } = await api.get(`/groups/${groupId}/balances`);
    return data;
  },
  settleDebt: async (groupId: string, recipientId: string, amount: number) => {
    const { data } = await api.post(`/groups/${groupId}/settlements`, { recipientId, amount });
    return data;
  }
};
