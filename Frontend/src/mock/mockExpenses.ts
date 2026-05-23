import type { Expense } from '../types';

export const mockExpenses: Expense[] = [
  // Group 1: Trip Đà Nẵng
  {
    id: 'exp-1',
    groupId: 'group-1',
    title: 'Vé máy bay khứ hồi khẩn cấp',
    amount: 6000000,
    paidBy: 'user-1', // Duc
    splitType: 'equal',
    splits: [
      { userId: 'user-1', amount: 1500000 },
      { userId: 'user-2', amount: 1500000 },
      { userId: 'user-3', amount: 1500000 },
      { userId: 'user-4', amount: 1500000 },
    ],
    notes: 'Đặt qua đại lý Bamboo Airways',
    category: 'transport',
    date: '2026-05-11T09:30:00Z',
    createdBy: 'user-1',
  },
  {
    id: 'exp-2',
    groupId: 'group-1',
    title: 'Khách sạn bên bờ biển Mỹ Khê',
    amount: 4500000,
    paidBy: 'user-2', // Anh
    splitType: 'equal',
    splits: [
      { userId: 'user-1', amount: 1125000 },
      { userId: 'user-2', amount: 1125000 },
      { userId: 'user-3', amount: 1125000 },
      { userId: 'user-4', amount: 1125000 },
    ],
    notes: 'Homestay 3 ngày 2 đêm rất đẹp',
    category: 'home',
    date: '2026-05-12T14:00:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'exp-3',
    groupId: 'group-1',
    title: 'Ăn hải sản cực đã tại Năm Đảnh',
    amount: 2500000,
    paidBy: 'user-3', // Nam
    splitType: 'percentage',
    splits: [
      { userId: 'user-1', amount: 625000, percentage: 25 },
      { userId: 'user-2', amount: 625000, percentage: 25 },
      { userId: 'user-3', amount: 625000, percentage: 25 },
      { userId: 'user-4', amount: 625000, percentage: 25 },
    ],
    notes: 'Tôm hùm và cua hoàng đế',
    category: 'food',
    date: '2026-05-12T19:30:00Z',
    createdBy: 'user-3',
  },
  {
    id: 'exp-4',
    groupId: 'group-1',
    title: 'Vé cáp treo Bà Nà Hills',
    amount: 1500000,
    paidBy: 'user-4', // Thao
    splitType: 'exact',
    splits: [
      { userId: 'user-1', amount: 500000 },
      { userId: 'user-2', amount: 300000 },
      { userId: 'user-3', amount: 400000 },
      { userId: 'user-4', amount: 300000 },
    ],
    notes: 'Mỗi người mua quà lưu niệm khác nhau',
    category: 'entertainment',
    date: '2026-05-13T10:15:00Z',
    createdBy: 'user-4',
  },

  // Group 2: Tiền Nhà Tháng 6
  {
    id: 'exp-5',
    groupId: 'group-2',
    title: 'Tiền thuê nhà Tháng 6',
    amount: 6000000,
    paidBy: 'user-5', // Hoang
    splitType: 'equal',
    splits: [
      { userId: 'user-1', amount: 2000000 },
      { userId: 'user-5', amount: 2000000 },
      { userId: 'user-6', amount: 2000000 },
    ],
    notes: 'Chuyển khoản trực tiếp cho chủ nhà',
    category: 'bills',
    date: '2026-05-02T08:00:00Z',
    createdBy: 'user-5',
  },
  {
    id: 'exp-6',
    groupId: 'group-2',
    title: 'Tiền điện & nước',
    amount: 1800000,
    paidBy: 'user-1', // Duc
    splitType: 'percentage',
    splits: [
      { userId: 'user-1', amount: 720000, percentage: 40 },
      { userId: 'user-5', amount: 540000, percentage: 30 },
      { userId: 'user-6', amount: 540000, percentage: 30 },
    ],
    notes: 'EVN tăng cao do bật điều hòa 24/7',
    category: 'bills',
    date: '2026-05-05T17:45:00Z',
    createdBy: 'user-1',
  },

  // Group 3: Ăn BBQ Cuối Tuần
  {
    id: 'exp-8',
    groupId: 'group-3',
    title: 'Thịt bò Mỹ và hải sản nướng',
    amount: 1600000,
    paidBy: 'user-2', // Anh
    splitType: 'equal',
    splits: [
      { userId: 'user-1', amount: 400000 },
      { userId: 'user-2', amount: 400000 },
      { userId: 'user-3', amount: 400000 },
      { userId: 'user-4', amount: 400000 },
    ],
    notes: 'Mua ở siêu thị Winmart',
    category: 'food',
    date: '2026-05-16T12:15:00Z',
    createdBy: 'user-2',
  },
  {
    id: 'exp-9',
    groupId: 'group-3',
    title: 'Trái cây và nước ngọt',
    amount: 750000,
    paidBy: 'user-1', // Duc
    splitType: 'equal',
    splits: [
      { userId: 'user-1', amount: 187500 },
      { userId: 'user-2', amount: 187500 },
      { userId: 'user-3', amount: 187500 },
      { userId: 'user-5', amount: 187500 },
    ],
    notes: 'Bia, nước ngọt, nho và dưa hấu',
    category: 'food',
    date: '2026-05-17T19:00:00Z',
    createdBy: 'user-1',
  },

  // Group 4: Cafe Cuối Tuần
  {
    id: 'exp-10',
    groupId: 'group-4',
    title: 'Trà sữa Phê La uống chiều',
    amount: 350000,
    paidBy: 'user-1', // Duc
    splitType: 'equal',
    splits: [
      { userId: 'user-1', amount: 116666 },
      { userId: 'user-3', amount: 116667 },
      { userId: 'user-4', amount: 116667 },
    ],
    notes: 'Trà ô long sữa',
    category: 'coffee',
    date: '2026-05-19T15:00:00Z',
    createdBy: 'user-1',
  },
];
