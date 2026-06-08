#!/bin/bash
# Script de déploiement sur Render

set -e

echo "🚀 Déploiement MaMutuelle sur Render"
echo "===================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo "1️⃣  Vérification des prérequis..."

# Vérifier les fichiers nécessaires
required_files=("render.yaml" "Dockerfile" ".env.example" "docker-compose.yml")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        info "Fichier trouvé: $file"
    else
        error "Fichier manquant: $file"
    fi
done

# Vérifier que c'est un repo Git
if [ ! -d ".git" ]; then
    error "Ce n'est pas un repository Git!"
fi

info "Repository Git détecté"

echo ""
echo "2️⃣  Vérification du Dockerfile..."

if grep -q "EXPOSE 8080" Dockerfile; then
    info "Port 8080 configuré ✓"
else
    error "Dockerfile doit utiliser EXPOSE 8080 (pas 80)"
fi

if grep -q "mpm_prefork" Dockerfile; then
    info "Apache MPM configuré ✓"
else
    warn "Apache MPM non configuré - peut causer des problèmes"
fi

echo ""
echo "3️⃣  Vérification de la structure..."

dirs_to_check=("backend" "frontend" "docs" "database" "scripts")
for dir in "${dirs_to_check[@]}"; do
    if [ -d "$dir" ]; then
        info "Répertoire trouvé: $dir"
    else
        error "Répertoire manquant: $dir"
    fi
done

echo ""
echo "4️⃣  Vérification Git..."

# Vérifier les changements non commitées
if ! git diff-index --quiet HEAD --; then
    warn "Fichiers modifiés non committés:"
    git diff --name-only
    echo ""
    read -p "Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Déploiement annulé"
    fi
fi

# Vérifier la branche
current_branch=$(git rev-parse --abbrev-ref HEAD)
info "Branche actuelle: $current_branch"

echo ""
echo "5️⃣  Instructions de déploiement:"
echo ""

echo "📋 ÉTAPE 1: Créer la base de données PostgreSQL"
echo "  1. Aller sur https://dashboard.render.com"
echo "  2. Cliquer '+New' → PostgreSQL"
echo "  3. Remplir:"
echo "     - Database: mamutuelle"
echo "     - User: mamutuelle_user"
echo "     - Version: 15"
echo "  4. Copier la connection string"
echo ""

echo "📋 ÉTAPE 2: Créer le Web Service"
echo "  1. Cliquer '+New' → Web Service"
echo "  2. Se connecter à GitHub"
echo "  3. Sélectionner ce repo"
echo "  4. Configurer:"
echo "     - Name: mamutuelle-api"
echo "     - Build Command: echo 'Using Docker'"
echo "     - Start Command: /usr/local/bin/start.sh"
echo "     - Region: Same as DB"
echo ""

echo "📋 ÉTAPE 3: Configurer les variables d'environnement"
echo "  - APP_ENV=production"
echo "  - APP_DEBUG=false"
echo "  - DATABASE_URL=(de la BD PostgreSQL)"
echo "  - JWT_SECRET=(généré avec: php artisan jwt:secret --show)"
echo "  - APP_KEY=(généré avec: php artisan key:generate --show)"
echo "  - RUN_MIGRATIONS=true (premier déploiement)"
echo ""

echo "📋 ÉTAPE 4: Déployer"
echo "  - Cliquer 'Create Web Service'"
echo "  - Attendre la compilation Docker"
echo "  - Vérifier les logs pour erreurs"
echo ""

echo "📋 ÉTAPE 5: Tester"
echo "  - Curl: curl https://mamutuelle-api.onrender.com/api"
echo "  - Dashboard: https://your-app.onrender.com"
echo ""

echo "✅ Vérifications terminées!"
echo ""
echo "Prêt pour le déploiement sur Render 🎉"
echo ""
echo "Documentation complète: docs/DEPLOYMENT_RENDER.md"
