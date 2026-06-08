#!/usr/bin/env bash
# Checklist de vérification avant déploiement Render
# Usage: bash scripts/pre-deploy-checklist.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

checks_passed=0
checks_total=0

check() {
    checks_total=$((checks_total + 1))
    local name="$1"
    local condition="$2"
    
    if eval "$condition"; then
        echo -e "${GREEN}✓${NC} $name"
        checks_passed=$((checks_passed + 1))
    else
        echo -e "${RED}✗${NC} $name"
    fi
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

echo "🔍 Vérifications pré-déploiement Render"
echo "============================================="

section "📁 Fichiers de configuration"

check "render.yaml existe" "test -f render.yaml"
check ".env.example existe" "test -f .env.example"
check "Dockerfile existe" "test -f Dockerfile"
check "docker-compose.yml existe" "test -f docker-compose.yml"

section "🐳 Configuration Docker"

check "Dockerfile expose port 8080" "grep -q 'EXPOSE 8080' Dockerfile"
check "Dockerfile basé sur php:8.4" "grep -q 'php:8.4' Dockerfile"
check "Apache configuration pour port 8080" "grep -q ':8080' Dockerfile"
check "Apache MPM configuré" "grep -q 'mpm_prefork' Dockerfile || grep -q 'mpm_event' Dockerfile"

section "📂 Structure de projet"

check "backend/ existe" "test -d backend"
check "frontend/ existe" "test -d frontend"
check "frontend/css/ existe" "test -d frontend/css"
check "frontend/js/ existe" "test -d frontend/js"
check "docs/ existe" "test -d docs"
check "scripts/ existe" "test -d scripts"
check "database/ existe" "test -d database"

section "📝 Documentation"

check "DEPLOYMENT_RENDER.md existe" "test -f docs/DEPLOYMENT_RENDER.md"
check "MIGRATION_RAILWAY_TO_RENDER.md existe" "test -f docs/MIGRATION_RAILWAY_TO_RENDER.md"
check "GUIDE_DEMARRAGE_RAPIDE.md existe" "test -f docs/GUIDE_DEMARRAGE_RAPIDE.md"

section "🔐 Variables d'environnement"

check ".env.example contient APP_ENV" "grep -q 'APP_ENV' .env.example"
check ".env.example contient DATABASE_URL" "grep -q 'DATABASE_URL' .env.example"
check ".env.example contient JWT_SECRET" "grep -q 'JWT_SECRET' .env.example"
check ".env.example contient APP_KEY" "grep -q 'APP_KEY' .env.example"

section "🔄 Git et version control"

check "Repository Git valide" "git rev-parse --git-dir > /dev/null 2>&1"
check "Fichiers commitées" "! git diff-index --quiet HEAD -- 2>/dev/null || echo 'Pas de changements locaux'"
check "remote origin configuré" "git remote | grep -q origin"

section "🧪 Tests basiques"

check "backend/composer.json existe" "test -f backend/composer.json"
check "backend/.env.example existe" "test -f backend/.env.example || test -f backend/.env"
check "backend/artisan existe" "test -f backend/artisan"
check "backend/app/Models/User.php existe" "test -f backend/app/Models/User.php"

section "✅ Résumé"

echo ""
if [ $checks_passed -eq $checks_total ]; then
    echo -e "${GREEN}✅ TOUS LES CONTRÔLES PASSÉS!${NC}"
    echo ""
    echo "🚀 Prêt pour déploiement sur Render"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Lire: docs/DEPLOYMENT_RENDER.md"
    echo "2. Aller à: https://dashboard.render.com"
    echo "3. Suivre les étapes du guide"
    echo ""
else
    echo -e "${RED}❌ $((checks_total - checks_passed)) contrôles échoués${NC}"
    echo ""
    echo "Action requise:"
    echo "- Vérifier les fichiers manquants"
    echo "- Corriger la configuration Docker"
    echo "- Committer les changements"
    exit 1
fi

echo ""
echo "Informations système:"
echo "- Shell: $SHELL"
echo "- OS: $(uname -s)"
echo "- Git version: $(git --version | awk '{print $3}')"
echo ""
