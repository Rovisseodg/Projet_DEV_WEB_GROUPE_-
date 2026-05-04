# Utiliser l'image PHP officielle avec Apache
FROM php:8.2-apache

# Installer les extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p backend/bootstrap/cache \
    backend/storage/logs \
    backend/storage/framework/cache \
    backend/storage/framework/sessions \
    backend/storage/framework/views \
    && chmod -R 775 backend/bootstrap/cache backend/storage

# Installer les dépendances PHP
RUN cd backend && composer install --no-dev --optimize-autoloader

# Copier les fichiers frontend (ils sont à la RACINE, pas dans frontend/)
RUN cp index.html backend/public/ 2>/dev/null || true && \
    cp login.html backend/public/ 2>/dev/null || true && \
    cp register.html backend/public/ 2>/dev/null || true && \
    cp dashboard.html backend/public/ 2>/dev/null || true && \
    mkdir -p backend/public/css backend/public/js && \
    cp -r css/* backend/public/css/ 2>/dev/null || true && \
    cp -r js/* backend/public/js/ 2>/dev/null || true

RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

# Configurer Apache
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

# Debug PHP
RUN printf "display_errors=On\nlog_errors=On\nerror_log=/proc/self/fd/2\nerror_reporting=E_ALL\n" \
    > /usr/local/etc/php/conf.d/laravel-railway-debug.ini

# MPM prefork
RUN a2dismod -f mpm_event mpm_worker mpm_prefork 2>/dev/null || true && \
    rm -f /etc/apache2/mods-enabled/mpm_*.load 2>/dev/null || true && \
    a2enmod mpm_prefork && \
    echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Script de démarrage séparé (évite les problèmes d'interpolation)
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80

CMD ["/usr/local/bin/start.sh"]
