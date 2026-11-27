'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Login gagal');
      }

      const u = json.data.user;
      setUser({
        userId: u.id,
        email: u.email,
        role: u.role,
        name: u.name,
        balance: u.balance,
      });

      if (u.role === 'ADMIN') {
        router.push('/admin');
      } else {
        const params = new URLSearchParams(window.location.search);
        router.push(params.get('redirect') || '/');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center px-5 py-10 relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle className="shadow-md" />
      </div>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-lowest rounded-2xl shadow-xl mb-3">
            <span className="material-symbols-outlined text-primary text-[34px]">restaurant</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">IDN CANTEEN</h1>
          <p className="text-blue-100 text-sm mt-1">Masuk ke akun santri atau staff</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-label-md text-on-surface mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                autoComplete="email"
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-4 pr-11 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container rounded-xl p-3 text-xs flex gap-2 items-start">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-5">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Daftar sekarang
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-primary-fixed/50 rounded-xl text-xs text-on-primary-fixed space-y-0.5">
            <p className="font-bold mb-1">👇 Akun Demo (setelah seed):</p>
            <p>Siswa: <strong>budi@student.ac.id</strong> / student123</p>
            <p>Admin: <strong>admin@idncanteen.com</strong> / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
