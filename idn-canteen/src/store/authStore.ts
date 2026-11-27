'use client';

import { create } from 'zustand';
import { AuthUser } from '@/types';

interface AuthStore {
  user:      AuthUser | null;
  isLoading: boolean;
  setUser:   (user: AuthUser | null) => void;
  setLoading:(loading: boolean) => void;
  logout:    () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:      null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      set({ user: null, isLoading: false });
    }
  },
}));

