# 🐳 Dockerfile - Application Laravel MaMutuelle
FROM php:8.1-fpm-alpine

# Installer les extensions PHP nécessaires
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

RUN docker-php-ext-install pdo pdo_pgsql zip bcmath

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Créer un utilisateur non-root
RUN addgroup -g 1000 -S www && \
    adduser -S -D -H -u 1000 -h /var/www -s /sbin/nologin -G www -g www www

# Définir le répertoire de travail
WORKDIR /var/www

# Copier les fichiers de l'application
COPY . .

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN chown -R www:www /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Générer la clé d'application (sera override par .env)
RUN php artisan key:generate

# Exposer le port
EXPOSE 9000

# Commande par défaut
CMD ["php-fpm"]