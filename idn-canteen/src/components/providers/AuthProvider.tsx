'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Fetch current user saat app pertama kali load
    fetch('/api/auth/me')
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setUser(json.data?.user ?? null);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [setUser]);

  return <>{children}</>;
}

