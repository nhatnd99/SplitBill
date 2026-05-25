import { api } from '@/api/client';
import type { UserDTO } from '@/types';

export const authApi = {
  login: async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getMe: async (): Promise<{ data: { user: UserDTO } }> => {
    const { data } = await api.get('/auth/me');
    return data;
  }
};
