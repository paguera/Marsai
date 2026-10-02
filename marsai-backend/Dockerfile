# Étape 1 : Build de l'application TypeScript
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Image d'exécution de production allégée et durcie
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/services/welcome.jpg ./services/welcome.jpg

# Création des dossiers d'uploads avec permissions attribuées à l'utilisateur non-root 'node'
RUN mkdir -p uploads/videos uploads/images && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
