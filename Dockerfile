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

# Configuration Apache VirtualHost - FIXED RewriteBase inside <Directory>
RUN cat > /etc/apache2/sites-available/000-default.conf << 'EOF'
<VirtualHost *:8080>
    DocumentRoot /var/www/html/backend/public
    <Directory /var/www/html/backend/public>
        AllowOverride All
        Require all granted
        Options Indexes FollowSymLinks MultiViews
        DirectoryIndex index.php index.html
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteBase /
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^(.*)$ index.php [L]
        </IfModule>
    </Directory>
    ErrorLog /proc/self/fd/2
    CustomLog /proc/self/fd/1 combined
</VirtualHost>
EOF

# Configuration PHP
RUN printf "display_errors=Off\nlog_errors=On\nerror_log=/proc/self/fd/2\nerror_reporting=E_ALL\nmax_execution_time=300\n" \
    > /usr/local/etc/php/conf.d/laravel-prod.ini

# Activation des modules Apache nécessaires
RUN a2enmod rewrite && a2enmod headers

# Configuration MPM et ports
RUN a2dismod -f mpm_event mpm_worker mpm_prefork 2>/dev/null || true && \
    rm -f /etc/apache2/mods-enabled/mpm_*.load 2>/dev/null || true && \
    a2enmod mpm_prefork && \
    echo "Listen 0.0.0.0:8080" > /etc/apache2/ports.conf && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Script de démarrage - NO MIGRATIONS (database.sql handles schema)
RUN cat > /usr/local/bin/start.sh << 'EOF' && chmod +x /usr/local/bin/start.sh
#!/bin/bash
set -e

echo "=== Demarrage MaMutuelle (Render) ==="
cd /var/www/html/backend

# Create .env
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cat > .env << 'ENVEOF'
APP_NAME=MaMutuelle
APP_ENV=production
APP_DEBUG=false
APP_KEY=${APP_KEY}
APP_URL=${APP_URL}
LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

SESSION_DRIVER=file
CACHE_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

JWT_SECRET=${JWT_SECRET}
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_ALGORITHM=HS256
ENVEOF
fi

echo "Préparation de l'application..."
php artisan config:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

echo "✅ Démarrage d'Apache sur port 8080"
exec apache2-foreground
EOF

EXPOSE 8080
CMD ["/usr/local/bin/start.sh"]
