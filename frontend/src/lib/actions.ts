'use server';

import { refresh } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import authFetch from '@/lib/auth-api';
import { getSessionToken, SESSION_COOKIE } from '@/lib/session';

export const logout = async () => {
  const token = await getSessionToken();

  if (token) await authFetch('/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
};

export const deleteAccount = async () => {
  const token = await getSessionToken();

  if (!token) redirect('/login');

  const response = await authFetch('/me', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

  if (!response.ok) throw new Error('La suppression du compte a échoué.');

  (await cookies()).delete(SESSION_COOKIE);
  redirect('/');
};

export const deleteUser = async (id: number) => {
  const token = await getSessionToken();

  if (!token) redirect('/login');

  const response = await authFetch(`/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

  if (!response.ok) throw new Error('La suppression du compte a échoué.');

  refresh();
};
