import { getSessionToken } from '@/lib/session';

export type Chalet = {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  capacity: number;
};

export const chaletFetch = async (path: string, init?: RequestInit) =>
  fetch(`${process.env.CHALET_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getSessionToken()}`,
      ...init?.headers,
    },
  });

export const getChalets = async (): Promise<Chalet[]> => {
  const response = await chaletFetch('/chalets');

  if (!response.ok) throw new Error('Impossible de charger les chalets.');

  return response.json();
};

export const getChalet = async (id: string): Promise<Chalet | null> => {
  const response = await chaletFetch(`/chalets/${id}`);

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Impossible de charger le chalet.');

  return response.json();
};
