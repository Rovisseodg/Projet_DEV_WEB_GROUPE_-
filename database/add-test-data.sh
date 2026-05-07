#!/bin/bash

# Script pour ajouter les données de test supplémentaires
# Usage: ./add-test-data.sh [mysql|pgsql]

DB_TYPE=${1:-mysql}

echo "=== Ajout des données de test supplémentaires ==="
echo "Base de données: $DB_TYPE"
echo ""

if [ "$DB_TYPE" = "mysql" ]; then
    echo "Connexion MySQL..."
    echo "Veuillez entrer vos identifiants MySQL:"
    mysql -u root -p < database/test-data-additional.sql

elif [ "$DB_TYPE" = "pgsql" ]; then
    echo "Connexion PostgreSQL..."
    echo "Veuillez entrer vos identifiants PostgreSQL:"
    psql -U postgres -d mamutuelle -f database/test-data-additional.sql

else
    echo "Usage: $0 [mysql|pgsql]"
    echo "Exemple: $0 mysql"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Données de test ajoutées avec succès!"
    echo ""
    echo "📊 Statistiques ajoutées:"
    echo "   • 10 nouveaux adhérents"
    echo "   • 25 nouvelles cotisations"
    echo "   • 10 nouveaux prêts"
    echo "   • 10 nouveaux sinistres"
    echo "   • 9 nouvelles alertes"
    echo ""
    echo "📋 Comptes de test disponibles dans README-test-data.md"
else
    echo ""
    echo "❌ Erreur lors de l'ajout des données"
    exit 1
fi