# ============================================
# Stage 1: Builder - Build de l'application
# ============================================
FROM node:20-alpine AS builder

# Installer les dépendances système nécessaires (optionnel, pour certaines dépendances natives)
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Installer les dépendances (en utilisant npm ci pour une installation plus rapide et reproductible)
RUN npm ci --only=production=false

# Copier les fichiers source
COPY . .

# Build de l'application pour la production
RUN npm run build

# ============================================
# Stage 2: Runtime - Serveur web léger (nginx)
# ============================================
FROM nginx:alpine AS runtime

# Installer les outils nécessaires pour la configuration
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1000 jeffrey && \
    adduser -D -u 1000 -G jeffrey jeffrey

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder --chown=jeffrey:jeffrey /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée (optionnel)
# Si vous avez besoin d'une config nginx spécifique, créez un fichier nginx.conf
# COPY --chown=jeffrey:jeffrey nginx.conf /etc/nginx/conf.d/default.conf

# Créer un fichier de configuration nginx optimisé pour SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Compression gzip \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript; \
    \
    # Cache des assets statiques \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Gestion des routes SPA (fallback vers index.html) \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Sécurité - masquer la version nginx \
    server_tokens off; \
    \
    # Headers de sécurité \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
}' > /etc/nginx/conf.d/default.conf

# Créer le répertoire de logs avec les bonnes permissions
RUN mkdir -p /var/log/nginx /var/cache/nginx /var/run \
    && chown -R jeffrey:jeffrey /usr/share/nginx/html /var/log/nginx /var/cache/nginx /var/run

# Passer à l'utilisateur non-root
# Note: nginx nécessite généralement root pour écouter sur le port 80
# On peut utiliser un port non-privilégié ou configurer nginx différemment
USER jeffrey

# Exposer le port (nginx en mode non-root nécessite un port > 1024)
EXPOSE 8080

# Modifier la configuration pour écouter sur le port 8080
RUN sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
