import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiForbidden, apiServerError } from '@/lib/api-helpers';
import { UpdateOrderStatusSchema } from '@/lib/validations';

// ─── GET /api/orders/[id] ─────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();

    const { id } = await params;
    const order  = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
        user:  { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) return apiNotFound('Pesanan tidak ditemukan');

    // User hanya boleh lihat pesanan miliknya
    if (session.role !== 'ADMIN' && order.userId !== session.userId) {
      return apiForbidden('Anda tidak berhak melihat pesanan ini');
    }

    return apiSuccess({ order });
  } catch (error) {
    return apiServerError(error);
  }
}

// ─── PATCH /api/orders/[id] — Update status (Admin only) ─────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();
    if (session.role !== 'ADMIN') return apiForbidden();

    const { id }  = await params;
    const body    = await req.json();
    const parsed  = UpdateOrderStatusSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const { status } = parsed.data;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) return apiNotFound('Pesanan tidak ditemukan');

    // ── Pembatalan: refund saldo jika metode BALANCE ──────────────────────────
    if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id }, data: { status } });

        if (existing.paymentMethod === 'BALANCE' && existing.status !== 'CANCELLED') {
          // Kembalikan stok
          for (const item of existing.items) {
            await tx.product.update({
              where: { id: item.productId },
              data:  { stock: { increment: item.quantity } },
            });
          }

          // Refund saldo
          await tx.user.update({
            where: { id: existing.userId },
            data:  { balance: { increment: existing.totalAmount } },
          });

          await tx.walletTransaction.create({
            data: {
              userId:    existing.userId,
              type:      'REFUND',
              amount:    existing.totalAmount,
              status:    'SUCCESS',
              reference: `Refund Pembatalan Pesanan #${existing.orderCode}`,
            },
          });
        }
      });

      const updated = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } } });
      return apiSuccess({ order: updated });
    }

    const order = await prisma.order.update({ where: { id }, data: { status }, include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } } });
    return apiSuccess({ order });
  } catch (error) {
    return apiServerError(error);
  }
}

