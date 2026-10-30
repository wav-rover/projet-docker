# Rapport de projet « Dév avec Docker » : Chalets Suisses

**Auteur :** Jeremy Deveney (projet réalisé seul)
**Dépôt :** https://github.com/wav-rover/projetfinal
**Date :** 30/10/2026

Ce projet est un site de location de chalets dans les Alpes suisses. Un visiteur peut créer un compte, se connecter, consulter le catalogue, réserver un chalet, payer (paiement simulé), annuler une réservation et supprimer son compte. Un administrateur gère en plus le catalogue (ajout et suppression de chalets) et peut supprimer les comptes standard.

---

## 1. Architecture logicielle

### 1.1 Vue d'ensemble

```
                 Client (navigateur)
                         │  HTTP :8080
                         ▼
┌──────────────── réseau "public" ────────────────┐
│                  frontend (Next.js)             │
└────────────────────────┬────────────────────────┘
                         │
┌──────────────── réseau "backend" (internal) ────────────────┐
│                        │                                     │
│      ┌─────────────────┼──────────────────┐                  │
│      ▼                 ▼                  ▼                  │
│  auth (PHP)       chalet (Node.js)   booking (PHP)           │
│  Symfony 8        Express 5 / TS     Symfony 8               │
│      │   ▲             │   │          │   │   │              │
│      │   └─── /me ─────┘   │          │   │   └─► auth /me   │
│      │                     │          │   └─────► chalet     │
│      │  ◄── supprime les réservations ┘                      │
│      ▼                     ▼          ▼                      │
│                  db (PostgreSQL 18)                          │
│           bases : auth · chalet · booking                    │
└──────────────────────────────────────────────────────────────┘
```

| Service    | Langage / framework            | Rôle                                                    |
|------------|--------------------------------|---------------------------------------------------------|
| `frontend` | TypeScript, Next.js 16 (React) | Interface web, seul service joignable par les clients   |
| `auth`     | PHP 8.5, Symfony 8, FrankenPHP | Comptes, mots de passe, sessions, rôles                 |
| `chalet`   | TypeScript, Node.js 24, Express 5 | Catalogue des chalets                                |
| `booking`  | PHP 8.5, Symfony 8, FrankenPHP | Réservations, paiement simulé, annulation               |
| `db`       | PostgreSQL 18                  | Une base par service : `auth`, `chalet`, `booking`      |

Les contraintes du sujet sont respectées : 1 frontend, 3 backends, 2 langages côté backend (PHP et Node.js), une base SQL, et chaque backend expose une API HTTP REST en JSON.

### 1.2 Découpage des services

**auth** gère les utilisateurs (email, mot de passe haché, rôles `ROLE_USER` / `ROLE_ADMIN`) et les sessions.

| Méthode | Route          | Accès     | Rôle                                             |
|---------|----------------|-----------|--------------------------------------------------|
| POST    | `/register`    | public    | Création d'un compte standard                    |
| POST    | `/login`       | public    | Renvoie un jeton de session                      |
| POST    | `/logout`      | connecté  | Supprime la session                              |
| GET     | `/me`          | connecté  | Utilisateur courant (utilisé par les autres services) |
| DELETE  | `/me`          | connecté  | Suppression de son propre compte                 |
| GET     | `/users`       | admin     | Liste des comptes                                |
| DELETE  | `/users/{id}`  | admin     | Suppression d'un compte standard (403 sur un admin) |
| GET     | `/health`      | public    | Sonde de santé                                   |

Le premier administrateur se crée en ligne de commande : `php bin/console app:create-admin <email> <mot-de-passe>`.

**chalet** expose le catalogue : `GET /chalets` et `GET /chalets/:id` pour les utilisateurs connectés, `POST /chalets` et `DELETE /chalets/:id` pour les administrateurs. Au premier démarrage, il crée sa table et insère 6 chalets si elle est vide.

**booking** gère les réservations : `GET /bookings`, `POST /bookings`, `POST /bookings/{id}/pay`, `DELETE /bookings/{id}`, et `DELETE /users/{id}/bookings`, appelée par `auth` à la suppression d'un compte. Les règles métier (pas de date passée, 30 nuits maximum, capacité du chalet) sont isolées dans la classe `BookingRules`, testée unitairement.

### 1.3 Authentification et frontend sans état

Le sujet impose un frontend sans état. La session n'est donc pas stockée dans le frontend :

1. À la connexion, `auth` génère un jeton aléatoire (`random_bytes(32)`) et l'enregistre en base avec une date d'expiration.
2. Le frontend place ce jeton dans un cookie `httpOnly` et ne stocke rien d'autre.
3. À chaque requête, le frontend transmet le jeton en `Authorization: Bearer`. Les services `chalet` et `booking` le valident en appelant `GET /me` sur `auth`, qui reste la seule source de vérité sur les sessions et les rôles.

Plusieurs instances du frontend peuvent donc tourner en parallèle, et la déconnexion invalide réellement la session côté serveur.

**Contrôle d'accès dans le frontend :** un `proxy` Next.js redirige vers `/login` toute page autre que `/`, `/login` et `/register` quand le cookie est absent. Chaque page protégée revérifie ensuite l'utilisateur auprès de `auth` (`requireUser`, `requireAdmin`). Les backends refusent aussi toute requête sans jeton valide (401) ou sans le bon rôle (403). La sécurité ne repose donc pas uniquement sur le frontend.

### 1.4 Suppression d'un compte entre services

Supprimer un compte touche deux bases. `auth` appelle d'abord `booking` pour supprimer les réservations de l'utilisateur, puis supprime le compte. L'ordre est important : `booking` vérifie le jeton auprès de `auth`, il doit donc encore être valide au moment de l'appel. Si `booking` est indisponible, la suppression est annulée (503) pour ne pas laisser de réservations orphelines.

### 1.5 Tests

| Service   | Outil                    | Contenu                                                         |
|-----------|--------------------------|-----------------------------------------------------------------|
| `auth`    | PHPUnit                  | Tests unitaires de l'entité `User`, tests API (inscription, login, logout, droits admin, suppression) |
| `booking` | PHPUnit                  | Tests unitaires de `BookingRules`, tests API (création, paiement, annulation, droits) |
| `chalet`  | Vitest + Supertest       | Tests des routes avec base et service `auth` simulés           |

Dans les tests PHP, les appels HTTP vers les autres services sont simulés (`MockHttpClient`). Chaque service se teste ainsi isolément.

---

## 2. Dockerfiles et docker-compose.yml

### 2.1 Principes communs aux Dockerfiles

- **Images de base légères**, en variante `alpine` quand elle existe :
  | Image | Utilisée pour | Docker Hub |
  |---|---|---|
  | `node:24-alpine` | `frontend`, `chalet` | https://hub.docker.com/_/node |
  | `dunglas/frankenphp:1-php8.5-alpine` | `auth`, `booking` | https://hub.docker.com/r/dunglas/frankenphp |
  | `composer:2` | binaire Composer copié dans les images PHP | https://hub.docker.com/_/composer |
  | `postgres:18-alpine` | `db` (et base de test dans la CI) | https://hub.docker.com/_/postgres |
  | `hadolint/hadolint:v2.12.0` | lint des Dockerfiles dans la CI | https://hub.docker.com/r/hadolint/hadolint |
  | `aquasec/trivy:0.58.1` | scan des images dans la CI | https://hub.docker.com/r/aquasec/trivy |
- **Utilisateur non-root** : `node` pour les services Node, `www-data` pour les services PHP.
- **Cache des couches** : les fichiers de dépendances (`package.json`, `composer.json` et leurs lockfiles) sont copiés et installés avant le code source. Modifier le code ne réinstalle pas les dépendances.
- `.dockerignore` dans chaque service : `node_modules`, `vendor`, `var`, tests, fichiers `.env` locaux, documentation. Le contexte de build reste petit et aucun secret local n'entre dans l'image.
- `HEALTHCHECK` dans chaque image (`wget` sur `/health`, ou sur `/` pour le frontend). Docker Compose s'en sert pour l'ordre de démarrage.
- **Un processus par conteneur**, logs sur la sortie standard.
- **Forme exec** pour `CMD` et `ENTRYPOINT`, pour que les signaux d'arrêt atteignent le processus.

### 2.2 Services Node.js (frontend et chalet) : build en deux étapes

- **Étape** `build` : `npm ci` avec les dépendances de développement, puis compilation (`next build` ou `tsc`).
- **Étape** `runtime` : uniquement le résultat. Pour le frontend, la sortie `standalone` de Next.js embarque seulement les modules nécessaires. Pour `chalet`, `npm ci --omit=dev` puis le dossier `dist`.

TypeScript, le compilateur et les outils de test ne sont donc pas dans l'image finale. `NODE_ENV=production` est défini et la télémétrie Next.js est désactivée.

### 2.3 Services PHP (auth et booking)

- **Image de base FrankenPHP** (`dunglas/frankenphp`) : un serveur d'application PHP construit sur le serveur web Caddy, avec le moteur PHP intégré. Un seul processus reçoit les requêtes HTTP et exécute le PHP.

  Pour faire ce choix, j'ai demandé à l'IA quelle était la meilleure image de base pour une application Symfony. Elle m'a orienté vers FrankenPHP, qui est l'image utilisée par le modèle officiel « Symfony Docker ». En comparant avec l'image PHP officielle, j'ai vu que sa variante `php:8.5-fpm` n'exécute que le PHP : il m'aurait fallu un conteneur de plus, comme Nginx, pour servir le HTTP. Avec FrankenPHP, ce n'est pas nécessaire. Un seul conteneur par backend suffit, ce qui respecte la règle « un conteneur = un processus » et simplifie le `docker-compose.yml`.

  L'image existe aussi en variante Alpine et se configure par variables d'environnement (`SERVER_NAME=:8080`). Ses fonctions avancées (worker mode, HTTPS automatique, HTTP/3) ne sont pas utilisées : le service est sur un réseau interne, derrière le frontend.
- `install-php-extensions pdo_pgsql` et le `php.ini` de production.
- `composer install --no-dev`, autoloader optimisé.
- **Durcissement** : `setcap -r` retire à FrankenPHP la capability qui permet d'écouter sur les ports < 1024. Le service écoute sur 8080 et tourne en `www-data`.
- **Script d'entrée** (`docker-entrypoint.sh`) : il applique les migrations Doctrine avant de lancer le serveur. La base est donc toujours à jour au démarrage.

### 2.4 docker-compose.yml

L'application démarre en une commande : `docker compose up -d --build`.

- **Champ** `build` **+** `image` : en développement, Compose reconstruit les images. En recette ou en production, `REGISTRY` et `TAG` désignent les images publiées par la CI.
- **Réseaux** :
  - `public` : seul le frontend y est, et c'est le seul service qui publie un port (`${FRONTEND_PORT:-8080}:3000`).
  - `backend` (`internal: true`) : backends et base, sans port publié et sans accès à Internet. Le frontend est sur les deux réseaux pour appeler les API.
- **Ordre de démarrage** : `depends_on` avec `condition: service_healthy`. La base démarre d'abord, puis `auth` et `chalet`, puis `booking`, puis le frontend.
- **Limites de ressources** : `deploy.resources.limits` (CPU et mémoire) pour chaque service. Les valeurs laissent de la marge par rapport à la consommation mesurée avec `docker stats` (par exemple 128 Mo pour `chalet`, qui consomme environ 30 Mo).
- `restart: unless-stopped` sur tous les services.
- **Persistance** : volume nommé `db-data` pour PostgreSQL. Un script `init-databases.sh` crée les bases `chalet` et `booking` au premier démarrage, la base `auth` étant créée par `POSTGRES_DB`.
- **Healthcheck de la base** avec `pg_isready`.

### 2.5 Variables et environnements TEST / UAT / PROD

- Toute la configuration passe par des variables d'environnement. Les secrets (`POSTGRES_PASSWORD`, `AUTH_APP_SECRET`, `BOOKING_APP_SECRET`) sont obligatoires : la syntaxe `${VAR:?message}` bloque le démarrage s'ils manquent.
- `.env.example` est versionné. Les vrais fichiers `.env`, `.env.test`, `.env.uat` et `.env.prod` sont ignorés par Git.
- Le même `docker-compose.yml` sert à tous les environnements, seul le fichier de variables change :
  ```bash
  docker compose -f docker-compose.yml --env-file .env.prod up -d --wait
  ```
- `docker-compose.override.example.yml` sert au développement local. Copié en `docker-compose.override.yml` (non versionné), il publie PostgreSQL sur `127.0.0.1:5433` pour lancer les tests depuis la machine. Le `-f docker-compose.yml` explicite garantit que cette surcharge n'est jamais chargée hors du poste de développement.

---

## 3. Dépôt Git et pipeline CI/CD

### 3.1 Dépôt

J'ai choisi un **dépôt unique** (monorepo) sur GitHub, avec un dossier par micro-service (`frontend/`, `services/auth`, `services/chalet`, `services/booking`). Travaillant seul, cela simplifie le versionnage : un commit peut modifier un service et le `docker-compose.yml` en même temps. Chaque service reste indépendant (son Dockerfile, ses dépendances, ses tests, son image). Il serait très simple de découper par la suite les services en plusieurs repository.

### 3.2 Pipeline GitHub Actions

Le fichier `.github/workflows/ci.yml` se déclenche **à chaque push sur n'importe quelle branche, à chaque tag** et sur les pull requests.

Chaque micro-service a deux jobs enchaînés : un job de test, puis un job d'image qui ne démarre que si les tests réussissent (`needs`). Toute étape en erreur fait échouer le job immédiatement, et l'image n'est alors ni construite ni publiée.

**Jobs de test**

| Service   | Étapes |
|-----------|--------|
| `auth`, `booking` | PostgreSQL 18 en conteneur de service, PHP 8.5, `composer install`, `composer audit`, création de la base de test et migrations, PHPUnit |
| `chalet`  | Node 24, `npm ci`, `npm audit --omit=dev --audit-level=high`, compilation TypeScript, Vitest |
| `frontend`| Node 24, `npm ci`, `npm audit`, ESLint, build Next.js |

**Jobs d'image**

1. **Lint du Dockerfile** avec hadolint.
2. **Calcul des tags** avec `docker/metadata-action` : le SHA complet du commit (identifiant unique) et le nom du tag Git s'il y en a un.
3. **Build** avec `docker/build-push-action` (`pull: true` pour repartir des images de base à jour).
4. **Scan de vulnérabilités** avec Trivy : le build échoue si une vulnérabilité **critique** corrigeable est trouvée.
5. **Publication** sur le registre GitHub Container Registry (`ghcr.io/wav-rover/projetfinal/<service>`), uniquement sur un push (pas sur une pull request). Authentification par le `GITHUB_TOKEN` du workflow, aucun secret à gérer.

Les ajouts par rapport au minimum demandé sont l'audit des dépendances, le lint du code et des Dockerfiles, et le scan de sécurité des images.

### 3.3 Déploiement à partir du registre

Les images publiées se déploient avec le même `docker-compose.yml`, en renseignant dans le fichier d'environnement `REGISTRY=ghcr.io/wav-rover/projetfinal` et `TAG=<sha du commit ou tag>`.

---

## 4. Gestion de projet

Ayant réalisé le projet seul, l'organisation est restée assez simple : pas de répartition des tâches ni de coordination à gérer.

J'ai procédé en deux grandes phases :

1. **Développement de l'application.** Avec l'aide de l'IA, j'ai d'abord construit une application en micro-services propre et volontairement basique respectant le sujet : le service `auth` et les comptes, puis l'interface, le catalogue `chalet`, les réservations `booking`, et enfin la suppression de compte entre services et les tests. Pendant cette phase, les services tournaient directement sur ma machine.
2. **Conteneurisation et CI/CD.** Une fois l'application terminée et fonctionnelle, j'ai écrit les Dockerfiles et le `docker-compose.yml`, puis la gestion des environnements et le pipeline CI/CD.

L'historique Git suit ce découpage : les fonctionnalités entre le 26 et le 27/10, la partie Docker le 28/10, la CI/CD et la finalisation le 29/10.

---

## 5. Rétrospective

### 5.1 Difficultés rencontrées et solutions

- **Configuration Symfony dans l'image.** Les fichiers `.env` réels ne sont pas versionnés, mais Symfony a besoin d'un `.env` au build. Solution : copier `.env.example` dans l'image puis compiler la configuration avec `composer dump-env prod`. Les vraies valeurs sont fournies par Docker Compose à l'exécution et ont la priorité.
- **FrankenPHP en utilisateur non-root.** L'image de base donne au binaire une capability pour écouter sur les ports 80/443. Je l'ai retirée (`setcap -r`), j'ai fait écouter le serveur sur 8080 et j'ai donné à `www-data` les droits sur les dossiers dont Caddy a besoin.
- **Tests locaux avec un réseau interne.** Le réseau `backend` étant interne, la base n'est pas joignable depuis la machine pour lancer PHPUnit. Le fichier `docker-compose.override.yml`, non versionné, publie le port uniquement sur `127.0.0.1`, sans affaiblir la configuration de production.
- **Ordre de démarrage.** Les services PHP appliquent leurs migrations au démarrage : PostgreSQL doit donc être prêt avant eux. Les healthchecks et `depends_on: condition: service_healthy` le garantissent.
- **Mise au point de la CI.** Il a fallu plusieurs itérations : base PostgreSQL de test pour les services PHP, séparation des jobs de test et d'image, et passage temporaire de Trivy en mode debug pour mettre au point l'étape de scan.

### 5.2 Si c'était à refaire

- **Conteneuriser dès le début.** Développer directement dans les conteneurs aurait fait remonter plus tôt les problèmes de configuration, de réseau et de droits, au lieu de les découvrir tous à la fin.
- **Build en deux étapes pour les services PHP**, pour ne pas laisser Composer dans l'image finale.
- **Un utilisateur PostgreSQL par service**, avec des droits limités à sa propre base, plutôt qu'un utilisateur commun.
- **Centralisation des logs** (Loki ou ELK) et **génération d'un SBOM** dans la CI, comme présenté en cours.
- Découpage en plusieurs repository
- Utilisation de matrix dans la CI
