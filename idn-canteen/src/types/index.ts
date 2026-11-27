// ─── Re-export Prisma enums & types ──────────────────────────────────────────
export type { User, Product, Order, OrderItem, WalletTransaction } from '@prisma/client';
export { Role, OrderStatus, PaymentMethod, TransactionType, TransactionStatus } from '@prisma/client';

// ─── API Response helpers ─────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  userId: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  name: string;
  balance?: number;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface ProductWithMeta {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Cart (Zustand store) ─────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  itemNote?: string;
  stock: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (product: ProductWithMeta, quantity?: number, itemNote?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface OrderWithItems {
  id: string;
  orderCode: string;
  userId: string;
  totalAmount: number;
  paymentMethod: 'BALANCE' | 'QRIS' | 'CASH';
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    itemNote: string | null;
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  }>;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
export interface CheckoutPayload {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    itemNote?: string;
  }>;
  paymentMethod: 'BALANCE' | 'QRIS' | 'CASH';
  notes?: string;
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export interface WalletTransactionWithMeta {
  id: string;
  userId: string;
  type: 'TOPUP' | 'PAYMENT' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference: string | null;
  createdAt: Date;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  todayRevenue: number;
  todayOrders: number;
  activeMenuCount: number;
  pendingTopups: number;
}

// ─── Validation ───────────────────────────────────────────────────────────────
export const PRODUCT_CATEGORIES = [
  'Makanan Berat',
  'Snack',
  'Minuman',
  'Dessert',
  'Paket',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const TOPUP_DENOMINATIONS = [10000, 20000, 50000, 100000] as const;
export type TopupDenomination = typeof TOPUP_DENOMINATIONS[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING:   'Menunggu',
  PREPARING: 'Diproses',
  READY:     'Siap Diambil',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  BALANCE: 'Saldo IDN Canteen',
  QRIS:    'QRIS',
  CASH:    'Tunai',
};

