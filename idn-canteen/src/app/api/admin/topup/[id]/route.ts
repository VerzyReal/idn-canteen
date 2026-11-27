import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiServerError } from '@/lib/api-helpers';

// ─── PATCH /api/admin/topup/[id] — Setujui / Tolak top-up ────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role !== 'ADMIN') return apiForbidden();

    const { id }   = await params;
    const { action } = await req.json(); // "approve" | "reject"

    if (!['approve', 'reject'].includes(action)) {
      return apiError('Action tidak valid. Gunakan "approve" atau "reject"');
    }

    const topup = await prisma.walletTransaction.findUnique({ where: { id } });
    if (!topup) return apiNotFound('Transaksi tidak ditemukan');
    if (topup.type !== 'TOPUP') return apiError('Bukan transaksi top-up');
    if (topup.status !== 'PENDING') return apiError('Transaksi sudah diproses');

    if (action === 'approve') {
      await prisma.$transaction(async (tx) => {
        // Update status transaksi
        await tx.walletTransaction.update({
          where: { id },
          data:  { status: 'SUCCESS' },
        });
        // Tambah saldo user
        await tx.user.update({
          where: { id: topup.userId },
          data:  { balance: { increment: topup.amount } },
        });
      });
      return apiSuccess({ message: `Top-up Rp ${topup.amount.toLocaleString('id-ID')} berhasil disetujui` });
    } else {
      await prisma.walletTransaction.update({
        where: { id },
        data:  { status: 'FAILED' },
      });
      return apiSuccess({ message: 'Top-up ditolak' });
    }
  } catch (error) {
    return apiServerError(error);
  }
}

