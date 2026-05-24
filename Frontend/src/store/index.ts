import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  currency: 'VND' | 'USD' | 'EUR';
  toasts: Toast[];
  joinedGroups: any[];

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: 'vi' | 'en') => void;
  setCurrency: (curr: 'VND' | 'USD' | 'EUR') => void;

  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addJoinedGroup: (group: any) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'vi',
      currency: 'VND',
      toasts: [],
      joinedGroups: [],

      setTheme: (theme) => {
        set({ theme });
        let isDark = theme === 'dark';
        if (theme === 'system' && typeof window !== 'undefined') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),

      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 4000);
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),

      addJoinedGroup: (group) => set((state) => {
        if (state.joinedGroups.some(g => g.id === group.id)) return state;
        return { joinedGroups: [group, ...state.joinedGroups] };
      }),
    }),
    {
      name: 'splitbill-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        currency: state.currency,
        joinedGroups: state.joinedGroups,
      }),
    }
  )
);
