'use server';

import { refresh } from 'next/cache';
import { chaletFetch } from '@/lib/chalet-api';

type CreateChaletState = { error: string } | undefined;

export const createChalet = async (_state: CreateChaletState, formData: FormData): Promise<CreateChaletState> => {
  const response = await chaletFetch('/chalets', {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      location: formData.get('location'),
      description: formData.get('description'),
      pricePerNight: Number(formData.get('pricePerNight')),
      capacity: Number(formData.get('capacity')),
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    return { error };
  }

  refresh();
};

export const deleteChalet = async (id: number) => {
  const response = await chaletFetch(`/chalets/${id}`, { method: 'DELETE' });

  if (!response.ok) throw new Error('La suppression du chalet a échoué.');

  refresh();
};
