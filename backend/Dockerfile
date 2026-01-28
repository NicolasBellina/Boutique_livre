# Stage 1: Build dependencies
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Stage 2: Runtime
FROM node:18-bullseye-slim

WORKDIR /app

# Copier les dépendances depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma/

# Copier le code source
COPY package*.json ./
COPY src ./src/

# Exposer le port
EXPOSE 3000

# Santé check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Commande par défaut
CMD ["npm", "run", "dev"]
