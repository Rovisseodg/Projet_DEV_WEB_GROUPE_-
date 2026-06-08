FROM php:8.4-apache

# Installation des dépendances
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath \
    && rm -rf /var/lib/apt/lists/*

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration du répertoire de travail
WORKDIR /var/www/html
COPY . .

# Création des répertoires nécessaires
RUN mkdir -p backend/bootstrap/cache \
    backend/storage/logs \
    backend/storage/framework/cache \
    backend/storage/framework/sessions \
    backend/storage/framework/views \
    && chmod -R 775 backend/bootstrap/cache backend/storage

# Installation des dépendances PHP
RUN cd backend && composer install --no-dev --optimize-autoloader

# Copie des fichiers frontend
RUN cp frontend/index.html backend/public/ 2>/dev/null || true && \
    cp frontend/login.html backend/public/ 2>/dev/null || true && \
    cp frontend/register.html backend/public/ 2>/dev/null || true && \
    cp frontend/dashboard.html backend/public/ 2>/dev/null || true && \
    cp frontend/adherent-dashboard.html backend/public/ 2>/dev/null || true && \
    mkdir -p backend/public/css backend/public/js && \
    cp -r frontend/css/* backend/public/css/ 2>/dev/null || true && \
    cp -r frontend/js/* backend/public/js/ 2>/dev/null || true

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

# Configuration Apache VirtualHost
RUN printf '<VirtualHost *:8080>\n\
    DocumentRoot /var/www/html/backend/public\n\
    <Directory /var/www/html/backend/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options Indexes FollowSymLinks MultiViews\n\
        DirectoryIndex index.php index.html\n\
    </Directory>\n\
    <IfModule mod_rewrite.c>\n\
        RewriteEngine On\n\
        RewriteBase /\n\
        RewriteCond %%{REQUEST_FILENAME} !-f\n\
        RewriteCond %%{REQUEST_FILENAME} !-d\n\
        RewriteRule ^(.*)$ index.php [L]\n\
    </IfModule>\n\
    ErrorLog /proc/self/fd/2\n\
    CustomLog /proc/self/fd/1 combined\n\
</VirtualHost>\n' > /etc/apache2/sites-available/000-default.conf

# Configuration PHP
RUN printf "display_errors=Off\nlog_errors=On\nerror_log=/proc/self/fd/2\nerror_reporting=E_ALL\nmax_execution_time=300\n" \
    > /usr/local/etc/php/conf.d/laravel-prod.ini

# Activation des modules Apache nécessaires
RUN a2enmod rewrite
RUN a2enmod headers

# Configuration MPM et ports
RUN a2dismod -f mpm_event mpm_worker mpm_prefork 2>/dev/null || true && \
    rm -f /etc/apache2/mods-enabled/mpm_*.load 2>/dev/null || true && \
    a2enmod mpm_prefork && \
    echo "Listen 0.0.0.0:8080" > /etc/apache2/ports.conf && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Script de démarrage
RUN printf '#!/bin/bash\nset -e\n\necho "=== Demarrage MaMutuelle (Render) ==="\n\ncd /var/www/html/backend\n\n# Variables d'\''environnement\nexport APP_ENV=${APP_ENV:-production}\nexport APP_DEBUG=${APP_DEBUG:-false}\n\n# Création fichier .env\nif [ ! -f .env ]; then\n    echo "Création du fichier .env..."\n    cat > .env << ENVEOF\nAPP_NAME=MaMutuelle\nAPP_ENV=production\nAPP_DEBUG=false\nAPP_KEY=${APP_KEY}\nAPP_URL=${APP_URL}\nLOG_CHANNEL=stderr\n\nDB_CONNECTION=pgsql\nDB_HOST=${DATABASE_URL}\nDB_PORT=5432\nDB_DATABASE=${DB_DATABASE}\nDB_USERNAME=${DB_USERNAME}\nDB_PASSWORD=${DB_PASSWORD}\n\nSESSION_DRIVER=file\nCACHE_DRIVER=file\nCACHE_STORE=file\nQUEUE_CONNECTION=sync\n\nJWT_SECRET=${JWT_SECRET}\nJWT_TTL=60\nJWT_REFRESH_TTL=20160\nJWT_ALGORITHM=HS256\nENVEOF\nfi\n\n# Cache et migrations\necho "Préparation de l'\''application..."\nphp artisan config:clear  2>/dev/null || true\nphp artisan cache:clear   2>/dev/null || true\nphp artisan config:cache  2>/dev/null || true\nphp artisan route:cache   2>/dev/null || true\n\n# Migration BD\nif [ "$RUN_MIGRATIONS" = "true" ] || [ -z "$DB_MIGRATED" ]; then\n    echo "Exécution des migrations..."\n    php artisan migrate --force 2>/dev/null || echo "[INFO] Migration skipped"\nfi\n\necho "✅ Démarrage d'\''Apache sur port 8080"\nexec apache2-foreground\n' > /usr/local/bin/start.sh && chmod +x /usr/local/bin/start.sh

EXPOSE 8080
CMD ["/usr/local/bin/start.sh"]
DB_DATABASE=${DB_DATABASE:-railway}\n\
DB_USERNAME=${DB_USERNAME:-postgres}\n\
DB_PASSWORD=${DB_PASSWORD:-QRHXAkivTmqedTaebHEgRQNptkPfCPip}\n\
SESSION_DRIVER=file\n\
CACHE_DRIVER=file\n\
CACHE_STORE=file\n\
QUEUE_CONNECTION=sync\n\
JWT_SECRET=${JWT_SECRET:-5xTQ8uD6jR2nY1pFvG4kLz7wHx9sC3mV}\n\
JWT_TTL=60\n\
JWT_REFRESH_TTL=20160\n\
JWT_ALGORITHM=HS256\n\
ENVEOF\n\
\n\
