# Version optimisée avec étapes plus rapides
FROM node:20-alpine AS base

# Installer pnpm une seule fois
RUN npm install -g pnpm

# Étape des dépendances
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Étape de build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Étape de production
FROM base AS runner
WORKDIR /app

# Copier seulement les fichiers nécessaires
COPY --from=builder /app/build ./build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Configuration du port 
EXPOSE 3049
ENV PORT=3049

# Démarrer l'application
CMD ["pnpm", "run", "start"]