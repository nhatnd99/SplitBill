import i18n from '../i18n';

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
  const currentLang = i18n.language || lang;
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return i18n.t('time.justNow');
  if (diffMins < 60) return i18n.t('time.minsAgo', { count: diffMins });
  if (diffHours < 24) return i18n.t('time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return i18n.t('time.daysAgo', { count: diffDays });
  
  return date.toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
};

// Date formatter
export const formatDate = (dateStr: string, lang: string = 'vi'): string => {
  const currentLang = i18n.language || lang;
  const date = new Date(dateStr);
  return date.toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
};

// Full date formatter
export const formatFullDate = (dateStr: string, lang: string = 'vi'): string => {
  const currentLang = i18n.language || lang;
  const date = new Date(dateStr);
  return date.toLocaleDateString(currentLang === 'vi' ? 'vi-VN' : 'en-US', {
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

export const getCategoryLabel = (category: string, _lang: string = 'vi'): string => {
  // We ignore _lang parameter now as i18next handles language internally
  const validCategories = ['food', 'transport', 'bills', 'entertainment', 'coffee', 'shopping', 'other'];
  if (validCategories.includes(category)) {
    return i18n.t(`category.${category}`);
  }
  return i18n.t('category.other');
};

export const getGroupCategoryLabel = (category: string, _lang: string = 'vi'): string => {
  const validCategories = ['trip', 'home', 'office', 'couple', 'other'];
  if (validCategories.includes(category)) {
    return i18n.t(`groupCategory.${category}`);
  }
  return i18n.t('groupCategory.other');
};
