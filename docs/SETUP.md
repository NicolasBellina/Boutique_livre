# Setup & Installation Guide - LibrairiePro

## Prérequis

### Logiciels Nécessaires

- **Git** (>= 2.30)
- **Node.js** (>= 16.14.0) avec **npm** (>= 7.0.0)
- **PostgreSQL** (>= 12)
- **Visual Studio Code** ou équivalent (optionnel mais recommandé)

### Vérifier les versions

```bash
git --version
node --version
npm --version
psql --version
```

---

## Installation Initiale

### 1. Cloner le Projet

```bash
git clone https://github.com/votre-org/livre.git
cd livre
```

### 2. Initialiser Git (si pas déjà fait)

```bash
git config --global user.email "your.email@example.com"
git config --global user.name "Your Name"
```

---

## Configuration Backend

### 1. Installer Dépendances

```bash
cd backend
npm install
```

### 2. Créer la Base de Données PostgreSQL

#### Option A: Via `psql` (Recommandé pour développement local)

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Dans la console PostgreSQL:
CREATE DATABASE livre_db;
CREATE USER livre_user WITH PASSWORD 'securepassword123';
GRANT ALL PRIVILEGES ON DATABASE livre_db TO livre_user;
\q  # Quitter psql
```

#### Option B: Via Docker (Alternative)

```bash
# Démarrer PostgreSQL en container
docker run --name postgres-livre \
  -e POSTGRES_DB=livre_db \
  -e POSTGRES_USER=livre_user \
  -e POSTGRES_PASSWORD=securepassword123 \
  -p 5432:5432 \
  -d postgres:14

# Vérifier démarrage
docker ps | grep postgres-livre
```

### 3. Configurer Variables d'Environnement

```bash
# Créer fichier .env à partir du template
cp .env.example .env

# Éditer .env avec vos valeurs
```

**Contenu `.env`:**
```
# Database
DATABASE_URL="postgresql://livre_user:securepassword123@localhost:5432/livre_db"

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:5173"

# Logging
LOG_LEVEL=debug
```

### 4. Exécuter Migrations Prisma

```bash
# Générer Prisma Client
npm run prisma:generate

# Exécuter migrations
npm run prisma:migrate

# Optionnel: Vérifier status
npm run prisma:status
```

### 5. Remplir la Base (Seeders)

```bash
# Charger données d'exemple
npm run prisma:seed

# Ou manuellement:
psql -U livre_user -d livre_db -f prisma/seeders.sql
```

### 6. Démarrer le Serveur Backend

```bash
# Mode développement (auto-reload)
npm run dev

# Mode production (build + start)
npm run build
npm run start
```

**Résultat attendu:**
```
✅ Server running on http://localhost:3000
✅ Database connected
✅ API ready
```

---

## Configuration Frontend

### 1. Installer Dépendances

```bash
cd ../frontend
npm install
```

### 2. Configurer Variables d'Environnement

```bash
# Créer fichier .env.local
cp .env.example .env.local
```

**Contenu `.env.local`:**
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=LibrairiePro
```

### 3. Démarrer le Serveur Frontend

```bash
npm run dev
```

**Résultat attendu:**
```
  VITE v4.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Ouvrir http://localhost:5173 dans le navigateur.

---

## Vérifier que Tout Fonctionne

### Backend

```bash
# Terminal: cd backend

# Vérifier API est active
curl http://localhost:3000/api/books

# Résultat attendu: JSON avec list de livres (ou empty array [])
```

### Frontend

```bash
# Ouvrir http://localhost:5173 dans le navigateur
# Devrait afficher page d'accueil sans erreurs de connexion
```

### Base de Données

```bash
# Vérifier connexion PostgreSQL
psql -U livre_user -d livre_db -c "SELECT COUNT(*) FROM books;"

# Résultat attendu: count > 0 (si seeded)
```

---

## Commandes Utiles

### Backend

```bash
# Développement
npm run dev              # Mode watch avec auto-reload

# Tests
npm run test             # Tests unitaires
npm run test:watch      # Mode watch
npm run test:coverage   # Rapport de couverture
npm run test:api        # Tests API (Supertest)

# Database
npm run prisma:migrate  # Appliquer migrations
npm run prisma:reset    # ⚠️ Réinitialise BD complètement
npm run prisma:seed     # Charger seeders
npm run prisma:studio   # Interface GUI Prisma (http://localhost:5555)

# Production
npm run build            # Compiler TypeScript (optionnel)
npm run start            # Lancer serveur production

# Linting
npm run lint            # Vérifier code style
npm run lint:fix        # Corriger automatiquement
```

### Frontend

```bash
# Développement
npm run dev              # Mode dev avec Vite

# Tests
npm run test             # Tests unitaires (Vitest)
npm run test:watch      # Mode watch
npm run test:ui         # Interface tests (navigateur)
npm run test:e2e        # Tests E2E (Playwright)

# Build
npm run build            # Build production
npm run preview          # Prévisualiser production build

# Linting
npm run lint             # Vérifier code style
npm run lint:fix         # Corriger automatiquement
```

---

## Structure Projet - Où Mettre Quoi?

```
livre/
├── backend/
│   ├── src/
│   │   ├── routes/        👈 ENDPOINTS API (GET /books, POST /orders, etc)
│   │   ├── controllers/   👈 LOGIQUE ROUTES (valider, appeler services)
│   │   ├── services/      👈 LOGIQUE MÉTIER (recherche, commande, etc)
│   │   ├── utils/         👈 HELPERS (validation, formatage, etc)
│   │   └── app.js         👈 CONFIG EXPRESS
│   ├── prisma/
│   │   ├── schema.prisma  👈 SCHÉMA BD (modifier ici pour ajouter colonnes)
│   │   ├── migrations/    👈 AUTO-GÉNÉRÉ (ne pas modifier)
│   │   └── seed.js        👈 DONNÉES DE TEST
│   └── tests/
│       ├── unit/          👈 TESTER SERVICES/UTILS
│       └── api/           👈 TESTER ROUTES/API
│
├── frontend/
│   ├── src/
│   │   ├── components/    👈 COMPOSANTS RÉUTILISABLES (BookCard, OrderForm, etc)
│   │   ├── pages/         👈 PAGES COMPLÈTES (BooksPage, CartPage, etc)
│   │   ├── composables/   ���� LOGIQUE PARTAGÉE (useBooks, useOrders, etc)
│   │   ├── services/      👈 APPELS API (fetch /books, POST /orders, etc)
│   │   └── App.vue        👈 ROOT COMPONENT
│   └── tests/
│       ├── unit/          👈 TESTER COMPOSANTS/COMPOSABLES
│       └── e2e/           👈 TESTER SCÉNARIOS UTILISATEUR
│
└── docs/
    ├── API.md             👈 ENDPOINTS DÉTAILLÉS
    └── DATABASE.md        👈 SCHÉMA + REQUÊTES
```

---

## Dépannage Courant

### Erreur: Cannot connect to database

**Cause:** PostgreSQL non démarré ou mauvaise URL

**Solution:**
```bash
# Vérifier PostgreSQL tourne
psql -U postgres -c "SELECT 1"

# Si "connection refused":
# Démarrer PostgreSQL
brew services start postgresql  # macOS
# OU
sudo service postgresql start   # Linux
# OU
docker start postgres-livre     # Docker

# Vérifier DATABASE_URL dans .env
echo $DATABASE_URL
```

### Erreur: "ENOENT: no such file or directory, open '.env'"

**Cause:** Fichier .env n'existe pas

**Solution:**
```bash
cp .env.example .env
# Éditer .env avec bonnes valeurs
```

### Erreur: "migration.sql not found"

**Cause:** Dossier `prisma/migrations` n'existe pas

**Solution:**
```bash
cd backend

# Créer première migration (depuis schema.prisma)
npm run prisma:migrate -- --name init

# Appliquer la migration
npm run prisma:migrate
```

### Frontend affiche "Cannot reach API"

**Cause:** Backend non démarré ou mauvaise URL

**Solution:**
```bash
# 1. Vérifier backend tourne
curl http://localhost:3000/api/books

# 2. Vérifier VITE_API_BASE_URL dans frontend/.env.local
cat .env.local

# 3. Relancer frontend
npm run dev
```

### Tests échouent avec "module not found"

**Cause:** Alias `@` non configuré ou dépendances pas à jour

**Solution:**
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install

# Vérifier vite.config.js ou jest.config.js (alias `@`)
```

### Erreur: "Cannot find module 'express'"

**Cause:** Dépendances pas installées

**Solution:**
```bash
cd backend
npm install
```

### Database pleine de mauvaises données

**Solution de réinitialisation complète:**
```bash
cd backend

# ⚠️ ATTENTION: Cela efface TOUT
npm run prisma:reset

# Puis recharger seeders
npm run prisma:seed
```

---

## Configuration IDE Recommandée

### Visual Studio Code

**Extensions recommandées:**
- Prisma (officiel)
- ESLint
- Prettier
- Thunder Client ou REST Client (tester API)
- Playwright Test for VSCode (E2E)

**File `.vscode/settings.json`:**
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Workflow Développement Recommandé

### Avant de Coder

```bash
# 1. Créer branche
git checkout -b feature/ma-fonctionnalite

# 2. Démarrer serveurs
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Optionnel - Watch tests
npm run test:watch
```

### Pendant le Développement

```bash
# 1. Faire modifications
# 2. Tester manuellement sur http://localhost:5173
# 3. Vérifier tests passent
npm run test

# 4. Vérifier lint
npm run lint:fix

# 5. Faire commits réguliers
git add .
git commit -m "feat: add book search filter"
```

### Avant de Pousser

```bash
# Vérifier tous tests passent
npm run test
npm run test:e2e

# Vérifier pas d'erreurs
npm run lint

# Récupérer derniers changements
git pull origin main

# Pusher branche
git push origin feature/ma-fonctionnalite

# Créer Pull Request sur GitHub
```

---

## Environnements

### Development

```
DATABASE_URL=postgresql://livre_user:local@localhost:5432/livre_db
NODE_ENV=development
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:5173
```

### Production (Template)

```
DATABASE_URL=postgresql://user:pass@prod-db-host/livre_db_prod
NODE_ENV=production
LOG_LEVEL=warn
FRONTEND_URL=https://librairie-pro.example.com
```

---

## Checkliste Post-Installation

- [ ] Base de données créée et connectée
- [ ] `npm install` réussi (frontend et backend)
- [ ] Migrations appliquées: `npm run prisma:migrate`
- [ ] Seeders chargés: `npm run prisma:seed`
- [ ] Backend démarre: `npm run dev` sur port 3000
- [ ] Frontend démarre: `npm run dev` sur port 5173
- [ ] Curl teste API: `curl http://localhost:3000/api/books`
- [ ] Navigateur affiche app: http://localhost:5173 sans erreurs
- [ ] Tests passent: `npm run test`
- [ ] Linting OK: `npm run lint`

---

## Support

**Problèmes?**
1. Consultez la section "Dépannage Courant" ci-dessus
2. Vérifiez [CONTRIBUTING.md](../CONTRIBUTING.md) - section "Dépannage Courant"
3. Consultez les logs: `npm run dev` affiche erreurs détaillées

---

**Dernière mise à jour:** Janvier 2026
