import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJWT, getAuthCookieOptions } from '@/lib/auth';
import { LoginSchema } from '@/lib/validations';
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError('Email atau password salah', 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return apiError('Email atau password salah', 401);
    }

    const token = await signJWT({
      userId: user.id,
      email:  user.email,
      role:   user.role,
      name:   user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set({ value: token, ...getAuthCookieOptions() });

    return apiSuccess({
      user: {
        id:      user.id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    return apiServerError(error);
  }
}

