#!/bin/bash
# 🚀 Initialize MaMutuelle Database on Render
# 
# This script initializes the database on Render using the provided credentials
#
# Usage: bash deploy-render-init-db.sh
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║  MaMutuelle Render Database Init      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Render Database Credentials (from Render dashboard)
DB_HOST="dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com"
DB_PORT="5432"
DB_NAME="mamutuelle_db"
DB_USER="mamutuelle_db_user"
DB_PASSWORD="hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR"

# Construct the connection string
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo -e "${YELLOW}📍 Render Database Information${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Host:     ${DB_HOST}"
echo -e "  Port:     ${DB_PORT}"
echo -e "  Database: ${DB_NAME}"
echo -e "  User:     ${DB_USER}"
echo ""

# Test connection
echo -e "${BLUE}🔍 Testing database connection...${NC}"
if psql "$DATABASE_URL" -c "SELECT 1;" &>/dev/null; then
    echo -e "${GREEN}✓${NC} Connection successful"
    echo ""
else
    echo -e "${RED}✗${NC} Connection failed"
    echo ""
    echo -e "${YELLOW}ℹ️  Make sure:${NC}"
    echo "  1. psql is installed (PostgreSQL client)"
    echo "  2. Network can reach: ${DB_HOST}"
    echo "  3. Credentials are correct"
    echo ""
    echo -e "${YELLOW}Installation:${NC}"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS:         brew install postgresql"
    echo "  Windows:       https://www.postgresql.org/download/windows/"
    exit 1
fi

# Initialize the database
echo -e "${BLUE}📥 Initializing database from database.sql...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f "database/database.sql" ]; then
    echo -e "${RED}✗${NC} Error: database/database.sql not found"
    echo ""
    echo "Make sure you're in the project root directory:"
    echo "  cd /path/to/Projet_DEV_WEB_GROUPE_-"
    exit 1
fi

# Execute the SQL script
psql "$DATABASE_URL" < database/database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database initialization successful!${NC}"
    echo ""
    
    # Verify the data
    echo -e "${BLUE}📊 Database Verification${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo ""
    echo "Users:"
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total, role as type FROM users GROUP BY role;"
    
    echo ""
    echo "Adherents:"
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total FROM adherents;"
    
    echo ""
    echo "Cotisations:"
    psql "$DATABASE_URL" -c "SELECT COUNT(*) as total, statut FROM cotisations GROUP BY statut;"
    
    echo ""
    echo -e "${GREEN}✅ All tables created and data inserted successfully!${NC}"
    echo ""
    
else
    echo ""
    echo -e "${RED}✗ Database initialization failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🎯 Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Push code to GitHub:"
echo "   git push origin master"
echo ""
echo "2. Deploy to Render:"
echo "   - Go to https://render.com/dashboard"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Add environment variables (see DEPLOY_RENDER.md)"
echo ""
echo "3. Verify deployment:"
echo "   curl https://mamutuelle-api.onrender.com/"
echo ""
echo -e "${BLUE}📖 Full guide: DEPLOY_RENDER.md${NC}"
echo ""
