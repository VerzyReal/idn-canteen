import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiServerError, parsePagination } from '@/lib/api-helpers';

// ─── GET /api/admin/products — Semua produk (Admin only) ─────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role !== 'ADMIN') return apiForbidden();

    const { searchParams } = new URL(req.url);
    const { skip, limit }  = parsePagination(searchParams);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: [{ isAvailable: 'desc' }, { category: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    return apiSuccess({ products, total });
  } catch (error) {
    return apiServerError(error);
  }
}

