#!/bin/bash
# 🗄️ MaMutuelle Database Initialization Script
# 
# Ce script initialise la base de données MaMutuelle de façon simple
# Il remplace l'ancienne approche multi-fichiers par UN SEUL fichier
#
# Usage:
#   bash database/init-database.sh               (development local)
#   bash database/init-database.sh render        (Render deployment)
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗄️  MaMutuelle Database Initialization${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Déterminer l'environnement
ENV="${1:-local}"

if [ "$ENV" = "render" ]; then
    echo -e "${YELLOW}⚠️  Mode Render - Nécessite la variable DATABASE_URL${NC}"
    echo ""
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
        echo ""
        echo "Pour Render, définir la variable dans .env:"
        echo "  DATABASE_URL=postgresql://user:password@host:5432/database"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} DATABASE_URL trouvée"
    echo ""
    
    echo -e "${BLUE}📥 Exécution du script SQL...${NC}"
    psql "$DATABASE_URL" < database/database.sql
    
elif [ "$ENV" = "local" ]; then
    echo -e "${YELLOW}ℹ️  Mode Local (Docker Compose)${NC}"
    echo ""
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ ERROR: docker-compose not found${NC}"
        echo "Veuillez installer Docker et Docker Compose"
        exit 1
    fi
    
    echo -e "${BLUE}📥 Exécution du script SQL dans Docker...${NC}"
    docker-compose exec -T db psql -U mamutuelle_user -d mamutuelle < database/database.sql
    
else
    echo -e "${RED}❌ Environnement inconnu: $ENV${NC}"
    echo ""
    echo "Usage:"
    echo "  bash database/init-database.sh         (local/Docker)"
    echo "  bash database/init-database.sh render  (Render deployment)"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Database initialization complete!${NC}"
echo ""
echo "📊 Statistiques:"
docker-compose exec -T db psql -U mamutuelle_user -d mamutuelle -c "
SELECT COUNT(*) as 'Users' FROM users;
SELECT COUNT(*) as 'Adherents' FROM adherents;
SELECT COUNT(*) as 'Cotisations' FROM cotisations;
" 2>/dev/null || echo "   (Stats não disponíveis neste momento)"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Database prêt pour utilisation!${NC}"
echo ""
echo "👤 Comptes de test:"
echo "   Admin:   admin@mamutuelle.bf"
echo "   Agent:   agent@mamutuelle.bf"
echo "   Adhérents: kone.oumar@email.bf, etc."
echo ""
echo "📖 Pour plus d'infos: database/README.md"
echo ""
