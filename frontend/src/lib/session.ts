import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import authFetch from '@/lib/auth-api';

export const SESSION_COOKIE = 'session';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export type User = { id: number; email: string; roles: string[] };

export const createSession = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_DAY_IN_SECONDS,
  });
};

export const getSessionToken = async () => (await cookies()).get(SESSION_COOKIE)?.value;

export const isAdmin = (user: User) => user.roles.includes('ROLE_ADMIN');

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getSessionToken();

  if (!token) return null;

  const response = await authFetch('/me', { headers: { Authorization: `Bearer ${token}` } });

  return response.ok ? response.json() : null;
});

export const requireUser = async () => {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();

  if (!isAdmin(user)) redirect('/chalets');

  return user;
};
