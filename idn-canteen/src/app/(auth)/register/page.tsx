'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'STAFF',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Registrasi gagal');
      }

      const u = json.data.user;
      setUser({
        userId: u.id,
        email: u.email,
        role: u.role,
        name: u.name,
        balance: u.balance,
      });
      router.push('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registrasi gagal');
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
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-container-lowest rounded-2xl shadow-xl mb-3">
            <span className="material-symbols-outlined text-primary text-[34px]">restaurant</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">IDN CANTEEN</h1>
          <p className="text-blue-100 text-sm mt-1">Buat akun baru</p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block font-label-md text-on-surface mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap Anda"
                required
                minLength={2}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-on-surface mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-on-surface mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-on-surface mb-1.5">Status</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as 'STUDENT' | 'STAFF' })}
                className="w-full h-11 px-4 rounded-xl bg-surface-container-low text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="STUDENT">Mahasiswa / Siswa</option>
                <option value="STAFF">Staff / Karyawan</option>
              </select>
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
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
