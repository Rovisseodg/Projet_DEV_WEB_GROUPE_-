#!/bin/bash
# Railway deployment script for MaMutuelle

echo "🚀 Starting MaMutuelle deployment..."

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    exit 1
fi

cd backend

# Install dependencies
echo "📦 Installing Composer dependencies..."
if ! composer install --no-dev --optimize-autoloader; then
    echo "❌ Composer install failed!"
    exit 1
fi

# Cache configuration
echo "⚙️ Caching Laravel configuration..."
if ! php artisan config:cache; then
    echo "❌ Config cache failed!"
    exit 1
fi

if ! php artisan route:cache; then
    echo "❌ Route cache failed!"
    exit 1
fi

# Run migrations (if database is available)
echo "🗄️ Running database migrations..."
php artisan migrate --force || echo "Migration skipped - database not ready"

# Start the Laravel server
echo "🌐 Starting Laravel server on port $PORT"
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}