# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./
COPY src ./src/

# Installer et builder
RUN npm ci
RUN npm run build

# Stage 2: Runtime (Vite dev)
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances et config
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./
COPY src ./src/

# Copier public si le dossier existe, sinon l'ignorer
COPY public* ./public/

# Installer les dépendances
RUN npm ci

# Exposer le port
EXPOSE 5173

# Variable d'environnement
ENV HOST=0.0.0.0

# Santé check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Commande par défaut (dev mode)
CMD ["npm", "run", "dev"]
