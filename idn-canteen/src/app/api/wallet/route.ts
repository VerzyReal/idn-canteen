import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiServerError } from '@/lib/api-helpers';
import { TopUpSchema } from '@/lib/validations';

// ─── GET /api/wallet — Riwayat transaksi user ─────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));

    const transactions = await prisma.walletTransaction.findMany({
      where:   { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    });

    const user = await prisma.user.findUnique({
      where:  { id: session.userId },
      select: { balance: true },
    });

    return apiSuccess({ transactions, balance: user?.balance ?? 0 });
  } catch (error) {
    return apiServerError(error);
  }
}

