#!/bin/bash
# Railway deployment script for MaMutuelle

echo "🚀 Starting MaMutuelle deployment..."

# Install dependencies
cd backend
composer install --no-dev --optimize-autoloader

# Cache configuration
php artisan config:cache
php artisan route:cache

# Run migrations (if database is available)
php artisan migrate --force || echo "Migration skipped - database not ready"

# Start the Laravel server
echo "🌐 Starting Laravel server on port $PORT"
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}