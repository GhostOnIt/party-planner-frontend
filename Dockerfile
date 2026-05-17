# ============================================
# Stage 1: Builder - Build de l'application
# ============================================
FROM node:20-alpine AS builder

# Installer les dépendances système nécessaires (certaines deps natives)
RUN apk add --no-cache libc6-compat

# Activer pnpm via corepack (inclus dans Node 20+)
RUN corepack enable && corepack prepare pnpm@10 --activate

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de lockfile en premier pour profiter du cache Docker
COPY package.json pnpm-lock.yaml ./

# Installation reproductible (échoue si le lockfile est désynchronisé)
RUN pnpm install --frozen-lockfile

# Copier le reste des sources (filtrées par .dockerignore)
COPY . .

# Build de production
RUN pnpm build

# ============================================
# Stage 2: Runtime - Serveur web léger (nginx)
# ============================================
FROM nginx:alpine AS runtime

# Installer les outils nécessaires pour le healthcheck
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1000 jeffrey && \
    adduser -D -u 1000 -G jeffrey jeffrey

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder --chown=jeffrey:jeffrey /app/dist /usr/share/nginx/html

# Créer un fichier de configuration nginx optimisé pour SPA
# (port 8080 car nginx tourne en non-root et ne peut pas binder < 1024)
RUN echo 'server { \
    listen 8080; \
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

# Configuration nginx pour tourner en non-root :
#  - PID file dans /tmp (jeffrey a les droits)
#  - directive `user` retirée (warnings sinon, et inutile pour non-root)
#  - conf.d writable (l'entrypoint nginx modifie default.conf pour IPv6)
RUN sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
    && sed -i 's|^user .*|# user removed (running as non-root);|' /etc/nginx/nginx.conf \
    && mkdir -p /var/log/nginx /var/cache/nginx \
    && chown -R jeffrey:jeffrey \
        /usr/share/nginx/html \
        /var/log/nginx \
        /var/cache/nginx \
        /etc/nginx/conf.d

# Passer à l'utilisateur non-root
USER jeffrey

# Exposer le port (nginx en mode non-root nécessite un port > 1024)
EXPOSE 8080

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
