// Currency formatting utility — shared across the entire app
export const formatCurrency = (val: number, currency: string = 'VND'): string => {
  const absVal = Math.abs(val);
  if (currency === 'VND') {
    return `${Math.round(absVal).toLocaleString('vi-VN')}đ`;
  }
  if (currency === 'USD') {
    const usd = absVal / 25000;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  }
  const eur = absVal / 27000;
  return `€${eur.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
};

// Relative time formatter
export const formatRelativeTime = (dateStr: string, lang: string = 'vi'): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return lang === 'vi' ? 'Vừa xong' : 'Just now';
  if (diffMins < 60) return lang === 'vi' ? `${diffMins} phút trước` : `${diffMins}m ago`;
  if (diffHours < 24) return lang === 'vi' ? `${diffHours} giờ trước` : `${diffHours}h ago`;
  if (diffDays < 7) return lang === 'vi' ? `${diffDays} ngày trước` : `${diffDays}d ago`;
  
  return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
};

// Date formatter
export const formatDate = (dateStr: string, lang: string = 'vi'): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
};

// Full date formatter
export const formatFullDate = (dateStr: string, lang: string = 'vi'): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate a random group invite code
export const generateGroupCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Category emoji and label mappings
export const getCategoryEmoji = (category: string): string => {
  const map: Record<string, string> = {
    food: '🍔', transport: '✈️', bills: '⚡', entertainment: '🎡',
    coffee: '☕', shopping: '🛍️', other: '💰',
  };
  return map[category] || '💰';
};

export const getCategoryLabel = (category: string, lang: string = 'vi'): string => {
  if (lang === 'vi') {
    const map: Record<string, string> = {
      food: 'Ăn uống', transport: 'Đi lại', bills: 'Hóa đơn', entertainment: 'Giải trí',
      coffee: 'Cà phê', shopping: 'Mua sắm', other: 'Khác',
    };
    return map[category] || 'Khác';
  }
  const map: Record<string, string> = {
    food: 'Food', transport: 'Transport', bills: 'Bills', entertainment: 'Entertainment',
    coffee: 'Coffee', shopping: 'Shopping', other: 'Other',
  };
  return map[category] || 'Other';
};

export const getGroupCategoryLabel = (category: string, lang: string = 'vi'): string => {
  if (lang === 'vi') {
    const map: Record<string, string> = {
      trip: '🌴 Du lịch', home: '🏠 Nhà cửa', office: '🍱 Văn phòng',
      couple: '❤️ Cặp đôi', other: '📦 Khác',
    };
    return map[category] || '📦 Khác';
  }
  const map: Record<string, string> = {
    trip: '🌴 Trip', home: '🏠 Home', office: '🍱 Office',
    couple: '❤️ Couple', other: '📦 Other',
  };
  return map[category] || '📦 Other';
};
