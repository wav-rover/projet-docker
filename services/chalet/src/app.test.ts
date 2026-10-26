import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import createApp from './app.js';
import type { Chalet, ChaletRepository, GetCurrentUser, NewChalet } from './types.js';

const USERS = {
  'user-token': { id: 1, email: 'user@test.fr', roles: ['ROLE_USER'] },
  'admin-token': { id: 2, email: 'admin@test.fr', roles: ['ROLE_ADMIN', 'ROLE_USER'] },
};

const VALID_CHALET: NewChalet = {
  name: 'Chalet Test',
  location: 'Zermatt, Valais',
  description: 'Un chalet de test.',
  pricePerNight: 300,
  capacity: 4,
};

const fakeGetCurrentUser: GetCurrentUser = async (token) => USERS[token as keyof typeof USERS] ?? null;

const createFakeRepository = (initialChalets: Chalet[]): ChaletRepository => {
  const chalets = [...initialChalets];

  return {
    findAll: async () => chalets,
    findById: async (id) => chalets.find((chalet) => chalet.id === id) ?? null,
    create: async (chalet) => {
      const created = { id: chalets.length + 1, ...chalet };
      chalets.push(created);
      return created;
    },
    remove: async (id) => {
      const index = chalets.findIndex((chalet) => chalet.id === id);
      if (index === -1) return false;
      chalets.splice(index, 1);
      return true;
    },
  };
};

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp({
    chalets: createFakeRepository([{ id: 1, ...VALID_CHALET }]),
    getCurrentUser: fakeGetCurrentUser,
  });
});

describe('GET /health', () => {
  it('is public', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /chalets', () => {
  it('requires a token', async () => {
    const response = await request(app).get('/chalets');

    expect(response.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const response = await request(app).get('/chalets').set('Authorization', 'Bearer fake');

    expect(response.status).toBe(401);
  });

  it('lists chalets for a logged-in user', async () => {
    const response = await request(app).get('/chalets').set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 1, ...VALID_CHALET }]);
  });
});

describe('GET /chalets/:id', () => {
  it('returns the chalet', async () => {
    const response = await request(app).get('/chalets/1').set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Chalet Test');
  });

  it('returns 404 for an unknown or invalid id', async () => {
    const unknown = await request(app).get('/chalets/999').set('Authorization', 'Bearer user-token');
    const invalid = await request(app).get('/chalets/abc').set('Authorization', 'Bearer user-token');

    expect(unknown.status).toBe(404);
    expect(invalid.status).toBe(404);
  });
});

describe('POST /chalets', () => {
  it('is forbidden for a standard user', async () => {
    const response = await request(app).post('/chalets').set('Authorization', 'Bearer user-token').send(VALID_CHALET);

    expect(response.status).toBe(403);
  });

  it('creates a chalet as admin', async () => {
    const response = await request(app).post('/chalets').set('Authorization', 'Bearer admin-token').send(VALID_CHALET);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 2, ...VALID_CHALET });
  });

  it('rejects invalid data', async () => {
    const response = await request(app)
      .post('/chalets')
      .set('Authorization', 'Bearer admin-token')
      .send({ ...VALID_CHALET, name: '  ', pricePerNight: -10 });

    expect(response.status).toBe(400);
  });
});

describe('DELETE /chalets/:id', () => {
  it('is forbidden for a standard user', async () => {
    const response = await request(app).delete('/chalets/1').set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
  });

  it('deletes a chalet as admin', async () => {
    const deleted = await request(app).delete('/chalets/1').set('Authorization', 'Bearer admin-token');
    const afterDelete = await request(app).get('/chalets/1').set('Authorization', 'Bearer admin-token');

    expect(deleted.status).toBe(204);
    expect(afterDelete.status).toBe(404);
  });

  it('returns 404 for an unknown chalet', async () => {
    const response = await request(app).delete('/chalets/999').set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(404);
  });
});
