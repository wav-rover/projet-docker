'use server';

import { redirect } from 'next/navigation';
import authFetch from '@/lib/auth-api';
import { createSession } from '@/lib/session';

type LoginState = { error: string } | undefined;

export const login = async (_state: LoginState, formData: FormData): Promise<LoginState> => {
  const response = await authFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    return { error };
  }

  const { token } = await response.json();
  await createSession(token);

  redirect('/chalets');
};
