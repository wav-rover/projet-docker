# Chalets Suisses

Application de location de chalets dans les Alpes suisses, en micro-services (projet « Dév avec Docker »).

| Service    | Techno                       | Rôle                                      | Port interne |
|------------|------------------------------|-------------------------------------------|--------------|
| `frontend` | Next.js 16                   | Interface web (seul service exposé)       | 3000         |
| `auth`     | Symfony 8 (PHP, FrankenPHP)  | Comptes, sessions, rôles                  | 8080         |
| `chalet`   | Express (Node.js, TypeScript)| Catalogue des chalets                     | 3000         |
| `booking`  | Symfony 8 (PHP, FrankenPHP)  | Réservations, paiement simulé             | 8080         |
| `db`       | PostgreSQL 18                | Une base par service : `auth`, `chalet`, `booking` | 5432 |

Seul `frontend` est joignable depuis l'hôte. Les backends et la base sont sur un réseau Docker interne.

## Démarrage rapide (Docker)

Prérequis : [Docker](https://docs.docker.com/get-docker/) avec Docker Compose v2.

**1. Créer le fichier `.env`** à partir du modèle, avec des secrets aléatoires :

```bash
cp .env.example .env && for key in POSTGRES_PASSWORD AUTH_APP_SECRET BOOKING_APP_SECRET; do perl -pi -e "s/^$key=.*/$key=$(openssl rand -hex 16)/" .env; done
```

**2. Construire et lancer l'application** (environ 2 minutes au premier lancement) :

```bash
docker compose up -d --build --wait
```

**3. Créer un compte administrateur :**

```bash
docker compose exec auth php bin/console app:create-admin admin@chalets.ch motdepasse
```

**4. Ouvrir http://localhost:8080** et se connecter avec ce compte.

Les comptes standard se créent depuis le site, avec le bouton « Créer un compte ».

> Le port se change avec `FRONTEND_PORT` dans `.env`.

> **Fichiers `.env` :** avec Docker, seul le `.env` de la racine (étape 1) est nécessaire. Les fichiers `.env` présents dans les services ne servent qu'au développement local, il n'y a rien à y modifier.

## Commandes utiles

| Action | Commande |
|---|---|
| État des services | `docker compose ps` |
| Logs d'un service | `docker compose logs -f auth` |
| Arrêter (les données sont conservées) | `docker compose down` |
| Tout réinitialiser (**supprime les données**) | `docker compose down -v` |
| Reconstruire après une modification | `docker compose up -d --build --wait` |

## Environnements TEST / UAT / PROD

Le même `docker-compose.yml` sert partout : seul le fichier de variables change. Créer un fichier par environnement à partir de `.env.example` (`.env.test`, `.env.uat`, `.env.prod`, jamais commités), puis :

```bash
docker compose --env-file .env.prod up -d --wait
```

`REGISTRY` et `TAG` choisissent l'image à déployer, par exemple `ghcr.io/<compte>/<dépôt>` et le SHA du commit.

## Tests

| Service | Commande |
|---|---|
| auth | `cd services/auth && php bin/phpunit` |
| booking | `cd services/booking && php bin/phpunit` |
| chalet | `cd services/chalet && npm test` |

Les tests Symfony utilisent une base PostgreSQL locale (port 5433, bases `*_test`) : le conteneur `chalets-db` doit être démarré.
