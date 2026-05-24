import { api } from './client';
import type { GroupDTO } from '../types';

export const groupsApi = {
  createGroup: async (groupData: { name: string; description?: string; category: string }) => {
    const { data } = await api.post('/groups', groupData);
    return data;
  },
  getGroup: async (groupId: string): Promise<{ data: { group: GroupDTO } }> => {
    const { data } = await api.get(`/groups/${groupId}`);
    return data;
  },
  joinGroup: async (inviteCode: string) => {
    const { data } = await api.post('/groups/join', { inviteCode });
    return data;
  },
  addFund: async (groupId: string, amount: number, note?: string) => {
    const { data } = await api.post(`/groups/${groupId}/fund`, { amount, note });
    return data;
  }
};
