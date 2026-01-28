# 📚 LibrairiePro - Système de Gestion de Librairie

Bienvenue dans **LibrairiePro**, une application web complète pour gérer une librairie (catalogue, panier, commandes, événements).

## 📖 Objectif de ce README
Ce fichier explique comment démarrer le projet en développement (Docker ou local), appliquer les migrations Prisma, lancer le seed de données, et comment accéder à la base de données PostgreSQL.

---

## Prérequis
- Docker & Docker Compose v2
- Node.js >= 16 (si vous voulez lancer le frontend/backend localement)
- psql (optionnel, pour se connecter à la DB depuis l'hôte)

---

## Démarrage rapide (avec Docker)
Le projet contient un `docker-compose.yml` qui démarre :
- `livre_postgres` : le serveur PostgreSQL (DB)
- `livre_backend` : l'API Node.js / Express
- `livre_frontend` : l'application Vue.js

Lancer la stack :

```bash
# depuis la racine du repo
docker compose up -d --build
```

Vérifier l'état :

```bash
docker compose ps -a
```

Accès :
- Frontend : http://localhost:5173
- Backend API : http://localhost:3000 (ex : /api, /health)

---

## Migrations & seed (Prisma)
Après avoir démarré les services ou si vous souhaitez exécuter les migrations manuellement dans le conteneur backend :

```bash
# appliquer les migrations (depuis le conteneur backend)
docker compose exec livre_backend npx prisma migrate deploy

# (optionnel) exécuter le seed pour insérer des données de test
docker compose exec livre_backend node prisma/seed.js
```

Vous pouvez aussi utiliser les scripts npm depuis le dossier `backend` si vous préférez exécuter localement.

---

## Accès à la base de données
Attention : Adminer a été retiré du `docker-compose.yml` (par souci de sécurité). Utilisez l'une des méthodes ci‑dessous pour gérer la base :

1) Via psql (depuis l'hôte si le port est mappé)

```bash
# si psql est installé localement
psql postgresql://root:root@localhost:5432/user

# ou à l'intérieur du conteneur postgres
docker compose exec livre_postgres psql -U root -d user
```

2) Via un client SQL (DataGrip, DBeaver, TablePlus)
- Host : localhost
- Port : 5432
- User : root
- Password : root
- Database : user

3) Requête rapide pour lister les tables depuis le conteneur :

```bash
docker compose exec livre_postgres psql -U root -d user -c '\dt'
```

---

## Pourquoi Adminer a été supprimé ?
Adminer est un client web pratique mais pose des risques si exposé en dev/production sans protection. Il a donc été retiré du `docker-compose.yml` pour éviter toute exposition accidentelle. Si vous avez besoin d'une interface graphique sécurisée pour la DB, préférez un client installé localement (DataGrip, DBeaver) ou configurez un reverse proxy authentifié.

---

## Lancer le projet en local (sans Docker)
### Backend
```bash
cd backend
npm install
# générer le client Prisma (si nécessaire)
npm run prisma:generate
# appliquer migrations et seed si besoin
npm run prisma:migrate
node prisma/seed.js
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Commandes utiles
- Voir les logs : `docker compose logs --tail=200 backend` ou `docker compose logs postgres`
- Arrêter la stack : `docker compose down`
- Supprimer le conteneur Adminer si encore présent : `docker rm -f livre_adminer || true` (normalement non nécessaire après la suppression dans le compose)

---

## Dépannage rapide
- Erreur EADDRINUSE : un processus local écoute sur le port 3000 → arrêter le processus ou changer le mapping Docker.
- Prisma/Libssl : si Prisma se plaint d'une version d'OpenSSL, utilisez une image non-alpine (déjà pris en compte pour l'image backend).

---

## Structure du projet (extrait)
```
backend/   # API, Prisma
frontend/  # Vue3 app
docker-compose.yml
README.md
```

---

Si tu veux que je retire complètement Adminer du repo (supprimer traces éventuelles ailleurs), que j'ajoute une section dans `DOCKER_GUIDE.md` ou que je crée une petite note de sécurité pour la prod — dis‑moi et je l'ajoute.  

---

Créé/Modifié: 28 janvier 2026
# Boutique_livre
