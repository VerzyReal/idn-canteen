import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiServerError } from '@/lib/api-helpers';
import { TopUpSchema } from '@/lib/validations';

// ─── POST /api/wallet/topup — Request top-up (user) ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role === 'ADMIN') {
      return apiError('Akun admin tidak memerlukan top-up saldo', 403);
    }

    const body   = await req.json();
    const parsed = TopUpSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const { amount, reference } = parsed.data;

    // Buat transaksi top-up dengan status PENDING (menunggu verifikasi admin)
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId:    session.userId,
        type:      'TOPUP',
        amount,
        status:    'PENDING',
        reference: reference || `Top-up saldo Rp ${amount.toLocaleString('id-ID')}`,
      },
    });

    return apiSuccess({ transaction }, 201);
  } catch (error) {
    return apiServerError(error);
  }
}

