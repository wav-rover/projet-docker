import { getSessionToken } from '@/lib/session';

export type Chalet = {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  capacity: number;
};

const chaletFetch = async (path: string) =>
  fetch(`${process.env.CHALET_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${await getSessionToken()}` },
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
