import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiNotFound, apiForbidden, apiServerError } from '@/lib/api-helpers';
import { UpdateProductSchema } from '@/lib/validations';

// ─── GET /api/products/[id] ───────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return apiNotFound('Produk tidak ditemukan');
    return apiSuccess({ product });
  } catch (error) {
    return apiServerError(error);
  }
}

// ─── PATCH /api/products/[id] (Admin only) ────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiError('Autentikasi diperlukan', 401);
    if (session.role !== 'ADMIN') return apiForbidden();

    const { id }  = await params;
    const body    = await req.json();
    const parsed  = UpdateProductSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return apiNotFound('Produk tidak ditemukan');

    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    return apiSuccess({ product });
  } catch (error) {
    return apiServerError(error);
  }
}

// ─── DELETE /api/products/[id] (Admin only) ───────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiError('Autentikasi diperlukan', 401);
    if (session.role !== 'ADMIN') return apiForbidden();

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return apiNotFound('Produk tidak ditemukan');

    await prisma.product.delete({ where: { id } });
    return apiSuccess({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    return apiServerError(error);
  }
}

