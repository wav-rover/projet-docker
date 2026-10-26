import express, { type RequestHandler } from 'express';
import type { ChaletRepository, GetCurrentUser, NewChalet } from './types.js';

type AppDependencies = { chalets: ChaletRepository; getCurrentUser: GetCurrentUser };

const createApp = ({ chalets, getCurrentUser }: AppDependencies) => {
  const app = express();
  const requireUser = authenticate(getCurrentUser);
  const requireAdmin = authenticate(getCurrentUser, { isAdminOnly: true });

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/chalets', requireUser, async (_req, res) => {
    res.json(await chalets.findAll());
  });

  app.get('/chalets/:id', requireUser, async (req, res) => {
    const id = parseId(req.params.id);
    const chalet = id === null ? null : await chalets.findById(id);

    if (!chalet) {
      res.status(404).json({ error: 'Chalet introuvable.' });
      return;
    }

    res.json(chalet);
  });

  app.post('/chalets', requireAdmin, async (req, res) => {
    const newChalet = parseNewChalet(req.body);

    if (!newChalet) {
      res.status(400).json({ error: 'Nom, lieu et description requis ; prix et capacité doivent être des entiers positifs.' });
      return;
    }

    res.status(201).json(await chalets.create(newChalet));
  });

  app.delete('/chalets/:id', requireAdmin, async (req, res) => {
    const id = parseId(req.params.id);
    const isDeleted = id !== null && (await chalets.remove(id));

    res.status(isDeleted ? 204 : 404).end();
  });

  return app;
};

const authenticate =
  (getCurrentUser: GetCurrentUser, { isAdminOnly = false } = {}): RequestHandler =>
  async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = token ? await getCurrentUser(token) : null;

    if (!user) {
      res.status(401).json({ error: 'Authentification requise.' });
      return;
    }

    if (isAdminOnly && !user.roles.includes('ROLE_ADMIN')) {
      res.status(403).json({ error: 'Réservé aux administrateurs.' });
      return;
    }

    next();
  };

const parseId = (value: string | string[]) => {
  const id = typeof value === 'string' ? Number(value) : NaN;

  return Number.isInteger(id) && id > 0 ? id : null;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !== '';

const isPositiveInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;

const parseNewChalet = (body: unknown): NewChalet | null => {
  if (typeof body !== 'object' || body === null) return null;

  const { name, location, description, pricePerNight, capacity } = body as Record<string, unknown>;

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(location) ||
    !isNonEmptyString(description) ||
    !isPositiveInteger(pricePerNight) ||
    !isPositiveInteger(capacity)
  )
    return null;

  return { name: name.trim(), location: location.trim(), description: description.trim(), pricePerNight, capacity };
};

export default createApp;
