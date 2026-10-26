# Chalets Suisses

Application de location de chalets en micro-services (projet « Dév avec Docker »).

| Service    | Techno            | Rôle                          |
|------------|-------------------|-------------------------------|
| `frontend` | Next.js           | Interface web                 |
| `auth`     | Symfony (PHP)     | Comptes, sessions, rôles      |
| `chalet`   | Express (Node/TS) | Catalogue des chalets         |
| `booking`  | Symfony (PHP)     | Réservations, paiement simulé |
| `db`       | PostgreSQL        | Données                       |

## Lancer en local

```bash
cd frontend && npm run dev                                 # http://localhost:3000
cd services/chalet && npm run dev                          # http://localhost:3001 (copier .env.example en .env)
cd services/auth && symfony serve --port=8001
cd services/booking && symfony serve --port=8002
```
