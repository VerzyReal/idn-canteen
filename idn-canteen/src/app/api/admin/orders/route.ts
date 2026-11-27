import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiServerError, parsePagination } from '@/lib/api-helpers';

// ─── GET /api/admin/orders — Semua pesanan (Admin only) ───────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role !== 'ADMIN') return apiForbidden();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const { skip, limit } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (statusFilter) where.status = { in: statusFilter.split(',') };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          user:  { select: { id: true, name: true, email: true } },
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

