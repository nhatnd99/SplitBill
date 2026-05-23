import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Minh Đức',
    email: 'minhduc.nguyen@gmail.com',
    avatarColor: '#10b981',
    phone: '0912345678',
  },
  {
    id: 'user-2',
    name: 'Trần Thị Lan Anh',
    email: 'lananh.tran@gmail.com',
    avatarColor: '#f43f5e',
    phone: '0987654321',
  },
  {
    id: 'user-3',
    name: 'Lê Hoàng Nam',
    email: 'hoangnam.le@gmail.com',
    avatarColor: '#3b82f6',
    phone: '0901234567',
  },
  {
    id: 'user-4',
    name: 'Phạm Thanh Thảo',
    email: 'thanhthao.pham@gmail.com',
    avatarColor: '#a855f7',
    phone: '0934567890',
  },
  {
    id: 'user-5',
    name: 'Vũ Huy Hoàng',
    email: 'huyhoang.vu@gmail.com',
    avatarColor: '#f59e0b',
    phone: '0976543210',
  },
  {
    id: 'user-6',
    name: 'Đặng Minh Tuấn',
    email: 'minhtuan.dang@gmail.com',
    avatarColor: '#06b6d4',
    phone: '0945678901',
  },
];

export const currentUser = mockUsers[0];
