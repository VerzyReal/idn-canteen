import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/api-helpers';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return apiUnauthorized();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true, balance: true, createdAt: true },
    });

    if (!user) return apiUnauthorized('Akun tidak ditemukan');

    return apiSuccess({ user });
  } catch (error) {
    return apiServerError(error);
  }
}

