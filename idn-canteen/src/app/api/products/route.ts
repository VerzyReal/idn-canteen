import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiServerError, apiForbidden, parsePagination } from '@/lib/api-helpers';
import { CreateProductSchema } from '@/lib/validations';

// ─── GET /api/products ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category  = searchParams.get('category') || undefined;
    const search    = searchParams.get('search')   || undefined;
    const available = searchParams.get('available');
    const { skip, limit } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (category)  where.category    = category;
    if (available === 'true') where.isAvailable = true;
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category:    { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ isAvailable: 'desc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess({ products, total, page: Math.ceil(skip / limit) + 1, limit });
  } catch (error) {
    return apiServerError(error);
  }
}

// ─── POST /api/products (Admin only) ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiError('Autentikasi diperlukan', 401);
    if (session.role !== 'ADMIN') return apiForbidden();

    const body   = await req.json();
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const product = await prisma.product.create({ data: parsed.data });
    return apiSuccess({ product }, 201);
  } catch (error) {
    return apiServerError(error);
  }
}

