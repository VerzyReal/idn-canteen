import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiServerError, getTodayRange } from '@/lib/api-helpers';

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role !== 'ADMIN') return apiForbidden();

    const { start, end } = getTodayRange();

    const [todayOrders, todayRevenue, activeMenuCount, pendingTopups, recentOrders] =
      await Promise.all([
        // Total pesanan hari ini
        prisma.order.count({
          where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
        }),
        // Omzet hari ini (pesanan COMPLETED atau READY)
        prisma.order.aggregate({
          where: {
            createdAt: { gte: start, lte: end },
            status: { in: ['COMPLETED', 'READY', 'PREPARING'] },
          },
          _sum: { totalAmount: true },
        }),
        // Jumlah menu aktif
        prisma.product.count({ where: { isAvailable: true } }),
        // Top-up menunggu verifikasi
        prisma.walletTransaction.count({ where: { type: 'TOPUP', status: 'PENDING' } }),
        // 10 pesanan terbaru
        prisma.order.findMany({
          where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
          include: {
            items: { include: { product: { select: { name: true } } } },
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

    return apiSuccess({
      todayOrders,
      todayRevenue: todayRevenue._sum.totalAmount ?? 0,
      activeMenuCount,
      pendingTopups,
      recentOrders,
    });
  } catch (error) {
    return apiServerError(error);
  }
}

