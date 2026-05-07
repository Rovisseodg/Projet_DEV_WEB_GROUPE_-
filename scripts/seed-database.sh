#!/bin/bash

# ============================================================
# MaMutuelle Database Seeding Script for Railway
# PostgreSQL Database
# ============================================================

echo "🚀 Starting MaMutuelle Database Seeding on Railway..."
echo ""

# Check if PostgreSQL environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

echo "📊 Seeding database with test data..."
echo ""

# Execute the SQL seeding script
psql "$DATABASE_URL" -f database/seed-data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeding completed successfully!"
    echo ""
    echo "📝 Test Accounts:"
    echo "  Admin   → admin@mamutuelle.bf   / password123"
    echo "  Agent   → agent@mamutuelle.bf   / password123"
    echo "  Adhérent → kone.oumar@email.bf  / password123"
    echo "  Adhérent → zongo.aminata@email.bf / password123"
    echo ""
else
    echo "❌ Database seeding failed!"
    exit 1
fi
