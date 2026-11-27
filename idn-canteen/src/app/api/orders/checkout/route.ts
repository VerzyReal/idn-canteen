import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CheckoutSchema } from '@/lib/validations';
import { apiSuccess, apiError, apiUnauthorized, apiServerError, generateOrderCode } from '@/lib/api-helpers';

// ─── POST /api/orders/checkout ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();

    const body   = await req.json();
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const { items, paymentMethod, notes } = parsed.data;
    const userId = session.userId;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validasi stok & hitung ulang total dari DB (cegah manipulasi harga frontend)
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          throw new Error(`Produk tidak ditemukan`);
        }
        if (!product.isAvailable) {
          throw new Error(`Menu "${product.name}" sedang tidak tersedia`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Stok "${product.name}" tidak mencukupi. Tersisa: ${product.stock}`
          );
        }

        const subtotal = product.price * item.quantity;
        totalAmount   += subtotal;

        orderItemsData.push({
          productId: product.id,
          quantity:  item.quantity,
          unitPrice: product.price,
          subtotal,
          itemNote: item.itemNote || null,
        });

        // Kurangi stok produk
        await tx.product.update({
          where: { id: product.id },
          data:  { stock: { decrement: item.quantity } },
        });
      }

      // 2. Jika bayar pakai saldo, cek & potong secara atomik
      if (paymentMethod === 'BALANCE') {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user || user.balance < totalAmount) {
          throw new Error(
            `Saldo IDN Canteen tidak mencukupi. Saldo: Rp ${(user?.balance ?? 0).toLocaleString('id-ID')}, Total: Rp ${totalAmount.toLocaleString('id-ID')}`
          );
        }
        await tx.user.update({
          where: { id: userId },
          data:  { balance: { decrement: totalAmount } },
        });
      }

      // 3. Buat Order & OrderItems
      const orderCode = generateOrderCode();
      const newOrder  = await tx.order.create({
        data: {
          orderCode,
          userId,
          totalAmount,
          paymentMethod,
          notes: notes || null,
          status: 'PENDING',
          items: { create: orderItemsData },
        },
        include: {
          items: {
            include: { product: { select: { id: true, name: true, imageUrl: true } } },
          },
        },
      });

      // 4. Catat mutasi dompet jika pakai saldo
      if (paymentMethod === 'BALANCE') {
        await tx.walletTransaction.create({
          data: {
            userId,
            type:      'PAYMENT',
            amount:    totalAmount,
            status:    'SUCCESS',
            reference: `Pembayaran Pesanan #${orderCode}`,
          },
        });
      }

      return newOrder;
    });

    return apiSuccess({ order: result }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
    return apiError(message);
  }
}

