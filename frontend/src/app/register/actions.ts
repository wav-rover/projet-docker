'use server';

import { redirect } from 'next/navigation';
import authFetch from '@/lib/auth-api';

type RegisterState = { error: string } | undefined;

export const register = async (_state: RegisterState, formData: FormData): Promise<RegisterState> => {
  const response = await authFetch('/register', {
    method: 'POST',
    body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    return { error };
  }

  redirect('/login');
};
