FROM docker.io/library/node:latest
WORKDIR /app

# Installation de toutes les dépendances
COPY package*.json ./
RUN npm install
RUN npm audit fix
RUN npm audit fix --force

# Installation globale de ts-node pour plus de stabilité
RUN npm install -g ts-node typescript

COPY . .

# Dossier pour les images
RUN mkdir -p uploads

EXPOSE 3000

# On lance avec ts-node directement (compatible avec les imports sans extensions)
CMD ["ts-node", "server.ts"]
