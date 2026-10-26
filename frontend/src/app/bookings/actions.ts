'use server';

import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { bookingFetch } from '@/lib/booking-api';

type CreateBookingState = { error: string } | undefined;

export const createBooking = async (_state: CreateBookingState, formData: FormData): Promise<CreateBookingState> => {
  const response = await bookingFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      chaletId: Number(formData.get('chaletId')),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      guests: Number(formData.get('guests')),
    }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    return { error };
  }

  redirect('/bookings');
};

export const payBooking = async (id: number) => {
  const response = await bookingFetch(`/bookings/${id}/pay`, { method: 'POST' });

  if (!response.ok) throw new Error('Le paiement a échoué.');

  refresh();
};

export const cancelBooking = async (id: number) => {
  const response = await bookingFetch(`/bookings/${id}`, { method: 'DELETE' });

  if (!response.ok) throw new Error("L'annulation a échoué.");

  refresh();
};
