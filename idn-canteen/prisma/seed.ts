import { PrismaClient, Role, PaymentMethod, OrderStatus, TransactionType, TransactionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database IDN Canteen...');

  // ─── Bersihkan data lama ────────────────────────────────────────────────────
  await prisma.walletTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data lama berhasil dihapus');

  // ─── 1. Buat Akun Admin ─────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin IDN Canteen',
      email: 'admin@idncanteen.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      balance: 0,
    },
  });
  console.log(`✅ Admin dibuat: ${admin.email}`);

  // ─── 2. Buat Akun Siswa ─────────────────────────────────────────────────────
  const studentPasswordHash = await bcrypt.hash('student123', 12);
  const student = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@student.ac.id',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      balance: 100000, // Rp 100.000
    },
  });
  console.log(`✅ Siswa dibuat: ${student.email} (Saldo: Rp 100.000)`);

  // Akun Staff bonus
  const staffPasswordHash = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.create({
    data: {
      name: 'Siti Rahayu',
      email: 'siti@staff.ac.id',
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      balance: 150000, // Rp 150.000
    },
  });
  console.log(`✅ Staff dibuat: ${staff.email} (Saldo: Rp 150.000)`);

  // Catat top-up awal untuk student dan staff
  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: student.id,
        type: TransactionType.TOPUP,
        amount: 100000,
        status: TransactionStatus.SUCCESS,
        reference: 'Top-up awal akun siswa',
      },
      {
        userId: staff.id,
        type: TransactionType.TOPUP,
        amount: 150000,
        status: TransactionStatus.SUCCESS,
        reference: 'Top-up awal akun staff',
      },
    ],
  });

  // ─── 3. Buat 10 Menu Kantin Indonesia ───────────────────────────────────────
  const products = await prisma.product.createMany({
    data: [
      // ── Makanan Berat ──
      {
        name: 'Nasi Goreng Spesial',
        description: 'Nasi goreng dengan telur, ayam suwir, dan kerupuk. Disajikan dengan acar timun dan tomat segar.',
        price: 15000,
        category: 'Makanan Berat',
        imageUrl: '/images/products/nasi-goreng.svg',
        stock: 50,
        isAvailable: true,
      },
      {
        name: 'Mie Ayam Bakso',
        description: 'Mie kuning dengan ayam cincang berbumbu, bakso sapi, dan kuah kaldu gurih.',
        price: 14000,
        category: 'Makanan Berat',
        imageUrl: '/images/products/mie-ayam.svg',
        stock: 40,
        isAvailable: true,
      },
      {
        name: 'Nasi Uduk Komplit',
        description: 'Nasi uduk gurih dengan ayam goreng, tempe orek, bihun, dan sambal kacang.',
        price: 16000,
        category: 'Makanan Berat',
        imageUrl: '/images/products/nasi-uduk.svg',
        stock: 30,
        isAvailable: true,
      },
      {
        name: 'Gado-Gado Jakarta',
        description: 'Sayuran segar rebus dengan lontong, tahu, tempe, dan bumbu kacang spesial.',
        price: 13000,
        category: 'Makanan Berat',
        imageUrl: '/images/products/gado-gado.svg',
        stock: 25,
        isAvailable: true,
      },
      {
        name: 'Soto Ayam Kuah Bening',
        description: 'Soto ayam kuah bening segar dengan soun, tomat, daun bawang, dan perkedel kentang.',
        price: 14000,
        category: 'Makanan Berat',
        imageUrl: '/images/products/soto-ayam.svg',
        stock: 35,
        isAvailable: true,
      },
      // ── Snack / Jajanan ──
      {
        name: 'Risoles Mayo',
        description: 'Risoles renyah berisi ayam, wortel, dan mayonaise creamy. 2 pcs per porsi.',
        price: 8000,
        category: 'Snack',
        imageUrl: '/images/products/risoles.svg',
        stock: 60,
        isAvailable: true,
      },
      {
        name: 'Martabak Mini Coklat Keju',
        description: 'Martabak mini tebal dengan topping coklat meses dan keju leleh. 3 pcs per porsi.',
        price: 10000,
        category: 'Snack',
        imageUrl: '/images/products/martabak-mini.svg',
        stock: 45,
        isAvailable: true,
      },
      {
        name: 'Pisang Goreng Crispy',
        description: 'Pisang kepok goreng crispy dengan taburan gula halus dan keju parut. 3 pcs per porsi.',
        price: 7000,
        category: 'Snack',
        imageUrl: '/images/products/pisang-goreng.svg',
        stock: 0,
        isAvailable: false, // Habis untuk demo
      },
      // ── Minuman ──
      {
        name: 'Es Teh Manis',
        description: 'Teh manis segar dengan es batu. Cocok menemani makan siang di kantin.',
        price: 5000,
        category: 'Minuman',
        imageUrl: '/images/products/es-teh.svg',
        stock: 100,
        isAvailable: true,
      },
      {
        name: 'Jus Jeruk Segar',
        description: 'Jus jeruk peras segar tanpa pengawet. Kaya vitamin C, disajikan dingin.',
        price: 10000,
        category: 'Minuman',
        imageUrl: '/images/products/jus-jeruk.svg',
        stock: 50,
        isAvailable: true,
      },
    ],
  });
  console.log(`✅ ${products.count} menu kantin berhasil dibuat`);

  // ─── 4. Buat Contoh Order & Riwayat Transaksi untuk Demo ────────────────────
  const allProducts = await prisma.product.findMany({ take: 3 });

  if (allProducts.length >= 2) {
    // Order completed untuk riwayat
    const completedOrder = await prisma.order.create({
      data: {
        orderCode: `IDN-${Date.now().toString().slice(-6)}`,
        userId: student.id,
        totalAmount: allProducts[0].price + (allProducts[8]?.price ?? 20000),
        paymentMethod: PaymentMethod.BALANCE,
        status: OrderStatus.COMPLETED,
        notes: 'Tidak pakai sambal',
        items: {
          create: [
            {
              productId: allProducts[0].id,
              quantity: 1,
              unitPrice: allProducts[0].price,
              subtotal: allProducts[0].price,
              itemNote: 'Tidak pakai sambal',
            },
          ],
        },
      },
    });

    // Kurangi saldo student untuk order demo
    await prisma.user.update({
      where: { id: student.id },
      data: { balance: { decrement: allProducts[0].price } },
    });

    await prisma.walletTransaction.create({
      data: {
        userId: student.id,
        type: TransactionType.PAYMENT,
        amount: allProducts[0].price,
        status: TransactionStatus.SUCCESS,
        reference: `Pembayaran Pesanan #${completedOrder.orderCode}`,
      },
    });

    // Order pending (aktif)
    await prisma.order.create({
      data: {
        orderCode: `IDN-${(Date.now() + 1).toString().slice(-6)}`,
        userId: student.id,
        totalAmount: allProducts[1].price,
        paymentMethod: PaymentMethod.CASH,
        status: OrderStatus.PREPARING,
        notes: null,
        items: {
          create: [
            {
              productId: allProducts[1].id,
              quantity: 1,
              unitPrice: allProducts[1].price,
              subtotal: allProducts[1].price,
            },
          ],
        },
      },
    });

    console.log('✅ Contoh order demo berhasil dibuat');
  }

  console.log('\n🎉 Seeding selesai! Ringkasan akun:');
  console.log('─────────────────────────────────────────────');
  console.log('👑 ADMIN  │ admin@idncanteen.com    │ admin123');
  console.log('🎓 SISWA  │ budi@student.ac.id     │ student123');
  console.log('👔 STAFF  │ siti@staff.ac.id       │ staff123');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

