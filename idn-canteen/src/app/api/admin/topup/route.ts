import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from '@/lib/api-helpers';

// ─── GET /api/admin/topup — Daftar pending top-up ─────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role !== 'ADMIN') return apiForbidden();

    const topups = await prisma.walletTransaction.findMany({
      where:   { type: 'TOPUP', status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return apiSuccess({ topups });
  } catch (error) {
    return apiServerError(error);
  }
}

