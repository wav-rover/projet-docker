import type { Pool } from 'pg';
import type { ChaletRepository, NewChalet } from './types.js';

const CHALET_COLUMNS = 'id, name, location, description, price_per_night AS "pricePerNight", capacity';

const SEED_CHALETS: NewChalet[] = [
  {
    name: 'Chalet Edelweiss',
    location: 'Zermatt, Valais',
    description: 'Vue directe sur le Cervin, sauna privé et accès skis aux pieds.',
    pricePerNight: 650,
    capacity: 8,
  },
  {
    name: 'Le Refuge du Lac',
    location: 'Gstaad, Berne',
    description: 'Chalet en bois au bord du lac, cheminée et grand jardin.',
    pricePerNight: 480,
    capacity: 6,
  },
  {
    name: 'Chalet Alpenrose',
    location: 'Grindelwald, Berne',
    description: "Face à l'Eiger, idéal pour la randonnée l'été et le ski l'hiver.",
    pricePerNight: 390,
    capacity: 5,
  },
  {
    name: 'Les Mélèzes',
    location: 'Verbier, Valais',
    description: 'Grand chalet familial avec jacuzzi extérieur et salle de jeux.',
    pricePerNight: 720,
    capacity: 10,
  },
  {
    name: 'Chalet Arolla',
    location: 'Évolène, Valais',
    description: 'Petit chalet authentique et calme, au cœur du val d’Hérens.',
    pricePerNight: 210,
    capacity: 4,
  },
  {
    name: 'Bergsicht',
    location: 'Davos, Grisons',
    description: 'Chalet moderne avec vue panoramique, à deux pas des remontées.',
    pricePerNight: 540,
    capacity: 7,
  },
];

export const initDatabase = async (pool: Pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chalet (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      price_per_night INTEGER NOT NULL CHECK (price_per_night > 0),
      capacity INTEGER NOT NULL CHECK (capacity > 0)
    )
  `);

  const { rows } = await pool.query<{ count: string }>('SELECT COUNT(*) AS count FROM chalet');

  if (rows[0].count !== '0') return;

  const repository = createChaletRepository(pool);
  // Sequential inserts keep the seed order in the generated ids
  for (const chalet of SEED_CHALETS) await repository.create(chalet);
};

export const createChaletRepository = (pool: Pool): ChaletRepository => ({
  findAll: async () => (await pool.query(`SELECT ${CHALET_COLUMNS} FROM chalet ORDER BY id`)).rows,

  findById: async (id) => (await pool.query(`SELECT ${CHALET_COLUMNS} FROM chalet WHERE id = $1`, [id])).rows[0] ?? null,

  create: async ({ name, location, description, pricePerNight, capacity }) =>
    (
      await pool.query(
        `INSERT INTO chalet (name, location, description, price_per_night, capacity)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${CHALET_COLUMNS}`,
        [name, location, description, pricePerNight, capacity],
      )
    ).rows[0],

  remove: async (id) => ((await pool.query('DELETE FROM chalet WHERE id = $1', [id])).rowCount ?? 0) > 0,
});
