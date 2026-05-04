#!/bin/bash
set -e

cd /var/www/html/backend

echo "=== Démarrage MaMutuelle ==="

# ── 1. MPM : s'assurer qu'un seul MPM est actif ──────────────────────────────
a2dismod -f mpm_event mpm_worker mpm_prefork 2>/dev/null || true
rm -f /etc/apache2/mods-enabled/mpm_*.load 2>/dev/null || true
a2enmod mpm_prefork

# ── 2. PORT Railway ──────────────────────────────────────────────────────────
# Railway injecte $PORT dynamiquement (ex: 3000, 8080…)
# On remplace le port dans ports.conf ET dans le VirtualHost
APP_PORT="${PORT:-80}"
echo "Port utilisé : $APP_PORT"

# Réécrire ports.conf proprement
printf "Listen 0.0.0.0:%s\n" "$APP_PORT" > /etc/apache2/ports.conf

# Mettre à jour le VirtualHost
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${APP_PORT}>/" \
    /etc/apache2/sites-available/000-default.conf

# ── 3. Fichier .env ──────────────────────────────────────────────────────────
cat > .env << EOF
APP_NAME=MaMutuelle
APP_ENV=production
APP_KEY=${APP_KEY:-base64:2Fh6U9w3Z8qTs1rV7yN0mJ6LxQ4pRfB2sC0gHjKlMzQ=}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

LOG_CHANNEL=stderr

DB_CONNECTION=pgsql
DATABASE_URL=${DATABASE_URL:-}

SESSION_DRIVER=file

JWT_SECRET=${JWT_SECRET:-secure-jwt-secret-change-me}
EOF

# ── 4. Laravel : cache config + migrations ───────────────────────────────────
php artisan config:cache  || echo "[WARN] config:cache failed"
php artisan route:cache   || echo "[WARN] route:cache failed"
php artisan migrate --force || echo "[WARN] migrate failed, continuing..."

# ── 5. Vérification Apache ───────────────────────────────────────────────────
echo "Test configuration Apache..."
apache2ctl configtest

# ── 6. Lancement ─────────────────────────────────────────────────────────────
echo "Lancement Apache sur port $APP_PORT..."
exec apache2-foreground
