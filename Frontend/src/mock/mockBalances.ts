import type { GroupBalanceSummary, UserBalance } from '../types';
import { mockUsers } from './mockUsers';

export const mockGlobalBalances: UserBalance[] = [
  {
    userId: 'user-2',
    userName: mockUsers[1].name,
    avatarColor: mockUsers[1].avatarColor,
    amount: 1250000,
  },
  {
    userId: 'user-3',
    userName: mockUsers[2].name,
    avatarColor: mockUsers[2].avatarColor,
    amount: -450000,
  },
  {
    userId: 'user-4',
    userName: mockUsers[3].name,
    avatarColor: mockUsers[3].avatarColor,
    amount: 600000,
  },
  {
    userId: 'user-5',
    userName: mockUsers[4].name,
    avatarColor: mockUsers[4].avatarColor,
    amount: -1200000,
  },
  {
    userId: 'user-6',
    userName: mockUsers[5].name,
    avatarColor: mockUsers[5].avatarColor,
    amount: 280000,
  },
];

export const mockGroupBalances: Record<string, GroupBalanceSummary> = {
  'group-1': {
    groupId: 'group-1',
    totalOwed: 1400000,
    youAreOwed: 2000000,
    youOwe: 600000,
    balances: [
      { userId: 'user-2', userName: mockUsers[1].name, avatarColor: mockUsers[1].avatarColor, amount: 875000 },
      { userId: 'user-3', userName: mockUsers[2].name, avatarColor: mockUsers[2].avatarColor, amount: 1125000 },
      { userId: 'user-4', userName: mockUsers[3].name, avatarColor: mockUsers[3].avatarColor, amount: -600000 },
    ],
  },
  'group-2': {
    groupId: 'group-2',
    totalOwed: -920000,
    youAreOwed: 280000,
    youOwe: 1200000,
    balances: [
      { userId: 'user-5', userName: mockUsers[4].name, avatarColor: mockUsers[4].avatarColor, amount: -1200000 },
      { userId: 'user-6', userName: mockUsers[5].name, avatarColor: mockUsers[5].avatarColor, amount: 280000 },
    ],
  },
};
