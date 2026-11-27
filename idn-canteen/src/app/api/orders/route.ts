import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiServerError, parsePagination } from '@/lib/api-helpers';

// ─── GET /api/orders (Riwayat pesanan user yg login) ─────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const { skip, limit } = parsePagination(searchParams);

    // Admin bisa lihat semua; user hanya miliknya sendiri
    const where: Record<string, unknown> =
      session.role === 'ADMIN' ? {} : { userId: session.userId };

    if (statusFilter) {
      const statuses = statusFilter.split(',');
      where.status = { in: statuses };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: { select: { id: true, name: true, imageUrl: true } } },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess({ orders, total });
  } catch (error) {
    return apiServerError(error);
  }
}

