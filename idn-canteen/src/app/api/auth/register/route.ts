import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJWT, getAuthCookieOptions } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validations';
import { apiSuccess, apiError, apiServerError } from '@/lib/api-helpers';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('Email sudah terdaftar', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
    });

    const token = await signJWT({
      userId: user.id,
      email:  user.email,
      role:   user.role,
      name:   user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set({ value: token, ...getAuthCookieOptions() });

    return apiSuccess(
      {
        user: {
          id:      user.id,
          name:    user.name,
          email:   user.email,
          role:    user.role,
          balance: user.balance,
        },
      },
      201
    );
  } catch (error) {
    return apiServerError(error);
  }
}

