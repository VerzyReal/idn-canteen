'use client';

import { useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'color-scheme';

function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredTheme(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'light' || val === 'dark') return val;
  } catch {
    // Ignore storage access errors
  }
  return 'system';
}

function applyThemeToMeta(pref: ThemePreference) {
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) {
    meta.setAttribute('content', pref === 'system' ? 'light dark' : pref);
  }
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    setPreference(getStoredTheme());
    setSystemDark(getSystemIsDark());

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mq.addEventListener('change', handleMediaChange);

    // Sync across tabs without overwriting stored preference when system matches
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const next: ThemePreference =
          e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : 'system';
        setPreference(next);
        applyThemeToMeta(next);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mq.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const resolvedTheme: 'light' | 'dark' =
    preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  // 2-state toggle behavior per modern-web-guidance:
  // Target = opposite of currently rendered scheme; if target matches system, remove stored value.
  const toggleTheme = () => {
    const target: 'light' | 'dark' = resolvedTheme === 'dark' ? 'light' : 'dark';
    const currentSys: 'light' | 'dark' = getSystemIsDark() ? 'dark' : 'light';

    if (target === currentSys) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
      setPreference('system');
      applyThemeToMeta('system');
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, target);
      } catch {
        // Ignore
      }
      setPreference(target);
      applyThemeToMeta(target);
    }
  };

  // Explicit 3-state selector for settings surfaces
  const setThemePreference = (next: ThemePreference) => {
    try {
      if (next === 'system') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // Ignore
    }
    setPreference(next);
    applyThemeToMeta(next);
  };

  return { preference, resolvedTheme, systemDark, toggleTheme, setThemePreference };
}

/** Compact 2-state toggle button for headers */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center shrink-0 ${className}`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

/** Explicit 3-state theme selector (System / Light / Dark) for settings panel */
export function ThemeSelector() {
  const { preference, systemDark, setThemePreference } = useTheme();

  const options: { value: ThemePreference; label: string; sub?: string; icon: string }[] = [
    {
      value: 'system',
      label: 'Sistem',
      sub: systemDark ? 'Gelap' : 'Terang',
      icon: 'contrast',
    },
    { value: 'light', label: 'Terang', icon: 'light_mode' },
    { value: 'dark', label: 'Gelap', icon: 'dark_mode' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setThemePreference(opt.value)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl font-label-sm transition-all border-2 ${
              active
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
            <span className="font-semibold">{opt.label}</span>
            {opt.sub && (
              <span className={`text-[10px] ${active ? 'text-on-primary/80' : 'text-outline'}`}>
                ({opt.sub})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
