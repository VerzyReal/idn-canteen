import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const RegisterSchema = z.object({
  name:     z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role:     z.enum(['STUDENT', 'STAFF']).default('STUDENT'),
});

// ─── Product ──────────────────────────────────────────────────────────────────
export const CreateProductSchema = z.object({
  name:        z.string().min(2, 'Nama produk minimal 2 karakter').max(100),
  description: z.string().max(500).optional(),
  price:       z.number().int().positive('Harga harus lebih dari 0'),
  category:    z.string().min(1, 'Kategori wajib diisi'),
  imageUrl:    z.string().url().optional().or(z.literal('')),
  stock:       z.number().int().min(0, 'Stok tidak boleh negatif'),
  isAvailable: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

// ─── Checkout ─────────────────────────────────────────────────────────────────
export const CheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid('ID produk tidak valid'),
    quantity:  z.number().int().positive('Jumlah minimal 1'),
    itemNote:  z.string().max(200).optional(),
  })).min(1, 'Keranjang tidak boleh kosong'),
  paymentMethod: z.enum(['BALANCE', 'QRIS', 'CASH']),
  notes:         z.string().max(500).optional(),
});

// ─── Top-Up ───────────────────────────────────────────────────────────────────
export const TopUpSchema = z.object({
  amount:    z.number().int().min(10000, 'Minimal top-up Rp 10.000').max(5000000, 'Maksimal top-up Rp 5.000.000'),
  reference: z.string().max(200).optional(),
});

// ─── Admin order status update ────────────────────────────────────────────────
export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
  reason: z.string().max(200).optional(),
});

export type LoginInput          = z.infer<typeof LoginSchema>;
export type RegisterInput       = z.infer<typeof RegisterSchema>;
export type CreateProductInput  = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput  = z.infer<typeof UpdateProductSchema>;
export type CheckoutInput       = z.infer<typeof CheckoutSchema>;
export type TopUpInput          = z.infer<typeof TopUpSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

