FROM php:8.4-apache
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN mkdir -p backend/bootstrap/cache \
    backend/storage/logs \
    backend/storage/framework/cache \
    backend/storage/framework/sessions \
    backend/storage/framework/views \
    && chmod -R 775 backend/bootstrap/cache backend/storage
RUN cd backend && composer install --no-dev --optimize-autoloader
# Copier les fichiers frontend
RUN cp index.html backend/public/ 2>/dev/null || true && \
    cp login.html backend/public/ 2>/dev/null || true && \
    cp register.html backend/public/ 2>/dev/null || true && \
    cp dashboard.html backend/public/ 2>/dev/null || true && \
    cp adherent-dashboard.html backend/public/ 2>/dev/null || true && \
    mkdir -p backend/public/css backend/public/js && \
    cp -r css/* backend/public/css/ 2>/dev/null || true && \
    cp -r js/* backend/public/js/ 2>/dev/null || true
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache
# VirtualHost Apache
RUN printf '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/backend/public\n\
    <Directory /var/www/html/backend/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options Indexes FollowSymLinks MultiViews\n\
        DirectoryIndex index.php index.html\n\
    </Directory>\n\
    ErrorLog /proc/self/fd/2\n\
    CustomLog /proc/self/fd/1 combined\n\
</VirtualHost>\n' > /etc/apache2/sites-available/000-default.conf
RUN a2enmod rewrite
# PHP config — debug désactivé en production
RUN printf "display_errors=Off\nlog_errors=On\nerror_log=/proc/self/fd/2\nerror_reporting=E_ALL\n" \
    > /usr/local/etc/php/conf.d/laravel-railway-debug.ini
# MPM prefork
RUN a2dismod -f mpm_event mpm_worker mpm_prefork 2>/dev/null || true && \
    rm -f /etc/apache2/mods-enabled/mpm_*.load 2>/dev/null || true && \
    a2enmod mpm_prefork && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf
# Créer start.sh
RUN printf '#!/bin/bash\n\
set -e\n\
\n\
cd /var/www/html/backend\n\
echo "=== Demarrage MaMutuelle ==="\n\
\n\
# 1. MPM\n\
a2dismod -f mpm_event mpm_worker mpm_prefork 2>/dev/null || true\n\
rm -f /etc/apache2/mods-enabled/mpm_*.load 2>/dev/null || true\n\
a2enmod mpm_prefork\n\
\n\
# 2. PORT Railway\n\
APP_PORT="${PORT:-80}"\n\
echo "Port utilise : $APP_PORT"\n\
printf "Listen 0.0.0.0:%%s\\n" "$APP_PORT" > /etc/apache2/ports.conf\n\
sed -i "s|<VirtualHost \\*:80>|<VirtualHost *:${APP_PORT}>|" /etc/apache2/sites-available/000-default.conf\n\
\n\
# 3. Fichier .env\n\
cat > .env << ENVEOF\n\
APP_NAME=MaMutuelle\n\
APP_ENV=production\n\
APP_KEY=${APP_KEY:-base64:2Fh6U9w3Z8qTs1rV7yN0mJ6LxQ4pRfB2sC0gHjKlMzQ=}\n\
APP_DEBUG=${APP_DEBUG:-false}\n\
APP_URL=${APP_URL:-https://projetdevwebgroupe-production.up.railway.app}\n\
LOG_CHANNEL=stderr\n\
DB_CONNECTION=pgsql\n\
DB_HOST=${DB_HOST:-tramway.proxy.rlwy.net}\n\
DB_PORT=${DB_PORT:-11956}\n\
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
# 4. Clear cache + migrations\n\
php artisan config:clear  || echo "[WARN] config:clear failed"\n\
php artisan cache:clear   || echo "[WARN] cache:clear failed"\n\
php artisan config:cache  || echo "[WARN] config:cache failed"\n\
php artisan route:cache   || echo "[WARN] route:cache failed"\n\
php artisan migrate --force || echo "[WARN] migrate failed"\n\
\n\
# 5. Verif Apache\n\
apache2ctl configtest\n\
\n\
# 6. Lancement\n\
echo "Lancement Apache sur port $APP_PORT..."\n\
exec apache2-foreground\n\
' > /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh
EXPOSE 80
CMD ["/usr/local/bin/start.sh"]