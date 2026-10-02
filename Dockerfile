FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de package
COPY package.json package-lock.json* ./

# Installation des dépendances de production
RUN npm install --production

# Copie du reste des fichiers
COPY . .

# Construction du build statique (si nécessaire, bien que Vite soit utilisé ici, on s'assure que le dist est généré)
# On installe les devDependencies temporairement pour build
RUN npm install && npm run build

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]
