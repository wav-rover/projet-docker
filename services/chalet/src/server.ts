import pg from 'pg';
import createApp from './app.js';
import createGetCurrentUser from './auth.js';
import { createChaletRepository, initDatabase } from './db.js';

const { AUTH_API_URL, DATABASE_URL, PORT = '3000' } = process.env;

if (!AUTH_API_URL || !DATABASE_URL) throw new Error('AUTH_API_URL and DATABASE_URL must be set.');

const pool = new pg.Pool({ connectionString: DATABASE_URL });

await initDatabase(pool);

const app = createApp({
  chalets: createChaletRepository(pool),
  getCurrentUser: createGetCurrentUser(AUTH_API_URL),
});

app.listen(Number(PORT), () => {
  console.log(`Chalet service listening on port ${PORT}`);
});
