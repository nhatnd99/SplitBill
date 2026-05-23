import type { Activity } from '../types';
import { mockUsers } from './mockUsers';

export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    groupId: 'group-4',
    groupName: 'Cafe Cuối Tuần ☕',
    type: 'expense_add',
    userId: 'user-1',
    userName: mockUsers[0].name,
    avatarColor: mockUsers[0].avatarColor,
    details: {
      expenseId: 'exp-10',
      expenseTitle: 'Trà sữa Phê La uống chiều',
      amount: 350000,
    },
    timestamp: '2026-05-19T15:00:00Z',
  },
  {
    id: 'act-3',
    groupId: 'group-1',
    groupName: 'Trip Đà Nẵng 🌴',
    type: 'settlement',
    userId: 'user-3',
    userName: mockUsers[2].name,
    avatarColor: mockUsers[2].avatarColor,
    details: {
      amount: 1500000,
      recipientId: 'user-1',
      recipientName: mockUsers[0].name,
    },
    timestamp: '2026-05-18T18:00:00Z',
  },
  {
    id: 'act-4',
    groupId: 'group-3',
    groupName: 'Ăn BBQ Cuối Tuần 🍱',
    type: 'expense_add',
    userId: 'user-1',
    userName: mockUsers[0].name,
    avatarColor: mockUsers[0].avatarColor,
    details: {
      expenseId: 'exp-9',
      expenseTitle: 'Trái cây và nước ngọt',
      amount: 750000,
    },
    timestamp: '2026-05-17T19:00:00Z',
  },
  {
    id: 'act-13',
    groupId: 'group-1',
    groupName: 'Trip Đà Nẵng 🌴',
    type: 'group_create',
    userId: 'user-1',
    userName: mockUsers[0].name,
    avatarColor: mockUsers[0].avatarColor,
    details: {
      groupName: 'Trip Đà Nẵng 🌴',
    },
    timestamp: '2026-05-10T10:00:00Z',
  },
  {
    id: 'act-14',
    groupId: 'group-1',
    groupName: 'Trip Đà Nẵng 🌴',
    type: 'member_joined',
    userId: 'user-2',
    userName: mockUsers[1].name,
    avatarColor: mockUsers[1].avatarColor,
    details: {
      memberName: mockUsers[1].name,
    },
    timestamp: '2026-05-10T10:05:00Z',
  }
];
