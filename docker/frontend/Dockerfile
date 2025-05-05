# Étape de build
FROM node:18 AS build-stage

WORKDIR /app

COPY package*.json ./

# Configure npm pour éviter les timeouts
RUN npm config set fetch-timeout 600000 \
    && npm config set fetch-retries 5 \
    && npm install

COPY . .

# Construire l'application Angular
RUN npm run build --prod

# Étape de production
FROM nginx:alpine

# Supprimer la configuration par défaut de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers statiques générés
COPY --from=build-stage /app/dist/book-network-ui /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80