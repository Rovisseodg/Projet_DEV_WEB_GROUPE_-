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

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier les fichiers du projet
COPY . .

# Créer les répertoires nécessaires avant l'installation des dépendances
RUN mkdir -p backend/bootstrap/cache backend/storage/logs backend/storage/framework/cache backend/storage/framework/sessions backend/storage/framework/views && \
    chmod -R 775 backend/bootstrap/cache backend/storage

# Installer les dépendances PHP
RUN cd backend && composer install --no-dev --optimize-autoloader

# Copier les fichiers frontend dans le répertoire public de Laravel
RUN cp frontend/*.html backend/public/ 2>/dev/null || true && \
    mkdir -p backend/public/css && \
    mkdir -p backend/public/js && \
    cp -r frontend/css/* backend/public/css/ 2>/dev/null || true && \
    cp -r frontend/js/* backend/public/js/ 2>/dev/null || true

# Donner les permissions appropriées
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

# Configurer Apache pour servir Laravel
RUN echo "<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/backend/public\n\
    <Directory /var/www/html/backend/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        Options Indexes FollowSymLinks MultiViews\n\
        DirectoryIndex index.php index.html\n\
    </Directory>\n\
    ErrorLog \${APACHE_LOG_DIR}/error.log\n\
    CustomLog \${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>" > /etc/apache2/sites-available/000-default.conf && \
    echo "Listen \${PORT:-80}" >> /etc/apache2/ports.conf

# Activer mod_rewrite
RUN a2enmod rewrite

# Configuration MPM - Désactiver tous les MPM et n'activer que prefork
RUN a2dismod mpm_event mpm_worker mpm_prefork && \
    a2enmod mpm_prefork && \
    echo "LoadModule mpm_prefork_module /usr/lib/apache2/modules/mod_mpm_prefork.so" > /etc/apache2/mods-available/mpm_prefork.load

# Créer le script de démarrage
RUN echo '#!/bin/bash\n\
cd /var/www/html/backend\n\
\n\
# Vérifier et corriger la configuration MPM\n\
echo "Vérification MPM..."\n\
apache2ctl -M | grep mpm || echo "Aucun MPM chargé"\n\
\n\
# Forcer la désactivation de tous les MPM sauf prefork\n\
a2dismod mpm_event mpm_worker 2>/dev/null || true\n\
a2enmod mpm_prefork 2>/dev/null || true\n\
\n\
echo "Configuration MPM après correction:"\n\
apache2ctl -M | grep mpm\n\
\n\
# Utiliser les variables d'\''environnement de Railway pour PostgreSQL\n\
if [ -n "$DATABASE_URL" ]; then\n\
    # Extraire les informations de connexion depuis DATABASE_URL\n\
    DB_HOST=$(echo $DATABASE_URL | sed -n '\''s|.*://\([^:]*\):\([^@]*\)@\([^:]*\):\([^/]*\)/\(.*\)|\3|p'\'')\n\
    DB_PORT=$(echo $DATABASE_URL | sed -n '\''s|.*://\([^:]*\):\([^@]*\)@\([^:]*\):\([^/]*\)/\(.*\)|\4|p'\'')\n\
    DB_DATABASE=$(echo $DATABASE_URL | sed -n '\''s|.*://\([^:]*\):\([^@]*\)@\([^:]*\):\([^/]*\)/\(.*\)|\5|p'\'')\n\
    DB_USERNAME=$(echo $DATABASE_URL | sed -n '\''s|.*://\([^:]*\):\([^@]*\)@\([^:]*\):\([^/]*\)/\(.*\)|\1|p'\'')\n\
    DB_PASSWORD=$(echo $DATABASE_URL | sed -n '\''s|.*://\([^:]*\):\([^@]*\)@\([^:]*\):\([^/]*\)/\(.*\)|\2|p'\'')\n\
    \n\
    # Créer le fichier .env avec les bonnes variables\n\
    cat > .env << EOF\n\
DB_CONNECTION=pgsql\n\
DB_HOST=$DB_HOST\n\
DB_PORT=$DB_PORT\n\
DB_DATABASE=$DB_DATABASE\n\
DB_USERNAME=$DB_USERNAME\n\
DB_PASSWORD=$DB_PASSWORD\n\
APP_NAME="MaMutuelle"\n\
APP_ENV=production\n\
APP_KEY=base64:2Fh6U9w3Z8qTs1rV7yN0mJ6LxQ4pRfB2sC0gHjKlMzQ=\n\
APP_DEBUG=false\n\
APP_URL=$APP_URL\n\
JWT_SECRET=secure-jwt-secret-for-production-use-only-change-this\n\
EOF\n\
fi\n\
\n\
php artisan config:cache\n\
php artisan route:cache\n\
php artisan migrate --force || echo "Migration failed, continuing..."\n\
\n\
# Configurer Apache pour utiliser le port Railway\n\
if [ -n "$PORT" ]; then\n\
    sed -i "s/Listen.*/Listen $PORT/" /etc/apache2/ports.conf\n\
    sed -i "s/<VirtualHost \\*:80>/<VirtualHost *:$PORT>/" /etc/apache2/sites-available/000-default.conf\n\
fi\n\
\n\
apache2-foreground' > /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh

# Exposer le port dynamique de Railway
EXPOSE 80

# Démarrer l'application
CMD ["/usr/local/bin/start.sh"]