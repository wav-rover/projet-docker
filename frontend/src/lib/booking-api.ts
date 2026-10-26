import { getSessionToken } from '@/lib/session';

export type Booking = {
  id: number;
  chaletId: number;
  chaletName: string;
  startDate: string;
  endDate: string;
  nights: number;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'paid';
};

export const bookingFetch = async (path: string, init?: RequestInit) =>
  fetch(`${process.env.BOOKING_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getSessionToken()}`,
      ...init?.headers,
    },
  });

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await bookingFetch('/bookings');

  if (!response.ok) throw new Error('Impossible de charger les réservations.');

  return response.json();
};
