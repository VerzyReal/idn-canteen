import { NextResponse } from 'next/server';

// ─── Standard API success response ───────────────────────────────────────────
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

// ─── Standard API error response ─────────────────────────────────────────────
export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// ─── Unauthorized ─────────────────────────────────────────────────────────────
export function apiUnauthorized(message = 'Autentikasi diperlukan') {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

// ─── Forbidden ────────────────────────────────────────────────────────────────
export function apiForbidden(message = 'Akses ditolak') {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

// ─── Not found ────────────────────────────────────────────────────────────────
export function apiNotFound(message = 'Data tidak ditemukan') {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

// ─── Internal Server Error ────────────────────────────────────────────────────
export function apiServerError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
  console.error('[API ERROR]', error);
  return NextResponse.json({ success: false, message }, { status: 500 });
}

// ─── Format Rupiah ────────────────────────────────────────────────────────────
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Generate order code ──────────────────────────────────────────────────────
export function generateOrderCode(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `IDN-${date}-${random}`;
}

// ─── Parse pagination params ──────────────────────────────────────────────────
export function parsePagination(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get('page')  || '1',  10));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20', 10));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

// ─── Get today date range ─────────────────────────────────────────────────────
export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

