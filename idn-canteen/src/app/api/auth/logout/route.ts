import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-helpers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name:    COOKIE_NAME,
    value:   '',
    maxAge:  0,
    path:    '/',
    httpOnly: true,
  });
  return apiSuccess({ message: 'Berhasil logout' });
}

