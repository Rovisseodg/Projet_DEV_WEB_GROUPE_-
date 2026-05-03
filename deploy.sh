#!/bin/bash

# 🚀 Script de Déploiement Rapide - MaMutuelle
# Usage: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Déploiement MaMutuelle - Environnement: $ENVIRONMENT"
echo "📁 Répertoire: $PROJECT_ROOT"

# Vérifier les prérequis
check_prerequisites() {
    echo "🔍 Vérification des prérequis..."

    if ! command -v php &> /dev/null; then
        echo "❌ PHP n'est pas installé"
        exit 1
    fi

    if ! command -v composer &> /dev/null; then
        echo "❌ Composer n'est pas installé"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        echo "❌ Node.js n'est pas installé"
        exit 1
    fi

    echo "✅ Prérequis OK"
}

# Configuration Laravel
setup_laravel() {
    echo "🔧 Configuration Laravel..."

    cd "$PROJECT_ROOT/backend"

    # Installer les dépendances
    composer install --no-dev --optimize-autoloader

    # Copier la configuration d'environnement
    if [ "$ENVIRONMENT" = "prod" ]; then
        cp .env.production .env
    else
        cp .env.example .env
    fi

    # Générer la clé d'application
    php artisan key:generate

    # Configuration pour production
    if [ "$ENVIRONMENT" = "prod" ]; then
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
    fi

    echo "✅ Laravel configuré"
}

# Configuration base de données
setup_database() {
    echo "🗄️ Configuration base de données..."

    cd "$PROJECT_ROOT/backend"

    # Exécuter les migrations
    php artisan migrate --force

    # Seeders (uniquement en dev)
    if [ "$ENVIRONMENT" = "dev" ]; then
        php artisan db:seed
    fi

    echo "✅ Base de données configurée"
}

# Tests
run_tests() {
    echo "🧪 Exécution des tests..."

    cd "$PROJECT_ROOT/backend"

    if [ "$ENVIRONMENT" = "dev" ]; then
        php artisan test
    fi

    echo "✅ Tests exécutés"
}

# Build frontend
build_frontend() {
    echo "🎨 Build frontend..."

    cd "$PROJECT_ROOT/frontend"

    # Installer les dépendances
    npm install

    # Build pour production
    if [ "$ENVIRONMENT" = "prod" ]; then
        npm run build
    fi

    echo "✅ Frontend buildé"
}

# Sécurité
setup_security() {
    echo "🔒 Configuration sécurité..."

    cd "$PROJECT_ROOT/backend"

    # Générer des clés JWT si nécessaire
    php artisan jwt:secret

    # Autres configurations de sécurité
    echo "✅ Sécurité configurée"
}

# Nettoyage
cleanup() {
    echo "🧹 Nettoyage..."

    cd "$PROJECT_ROOT/backend"

    # Nettoyer le cache
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear

    echo "✅ Nettoyage terminé"
}

# Fonction principale
main() {
    echo "🎯 Démarrage du déploiement..."

    check_prerequisites
    setup_laravel
    setup_database
    run_tests
    build_frontend
    setup_security
    cleanup

    echo ""
    echo "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Configurer votre serveur web (Apache/Nginx)"
    echo "2. Configurer SSL/HTTPS"
    echo "3. Configurer les variables d'environnement production"
    echo "4. Tester l'application"
    echo ""
    echo "🚀 Commande pour démarrer: cd backend && php artisan serve"
}

# Gestion des erreurs
error_handler() {
    echo "❌ Erreur lors du déploiement à l'étape: $1"
    echo "🔍 Vérifiez les logs ci-dessus"
    exit 1
}

# Exécuter avec gestion d'erreur
trap 'error_handler $STEP' ERR

STEP="Vérification prérequis" && check_prerequisites
STEP="Configuration Laravel" && setup_laravel
STEP="Configuration BD" && setup_database
STEP="Tests" && run_tests
STEP="Build frontend" && build_frontend
STEP="Sécurité" && setup_security
STEP="Nettoyage" && cleanup

main