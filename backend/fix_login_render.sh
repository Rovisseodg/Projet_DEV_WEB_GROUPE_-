#!/bin/bash

# 🚀 SCRIPT D'EXÉCUTION IMMEDIATE SUR RENDER SHELL
# 
# Copier chaque bloc et exécuter dans l'ordre
# Render Shell: mamutuelle-api → Shell

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🔧 SCRIPT DE RÉPARATION - CONNEXION UTILISATEURS       ║"
echo "╚══════════════════════════════════════════════════════════╝"

# ════════════════════════════════════════════════════════════════
# ÉTAPE 1: Vérifier les clés
# ════════════════════════════════════════════════════════════════

echo ""
echo "📌 ÉTAPE 1: Vérifier les variables d'environnement"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "APP_KEY: ${APP_KEY:0:30}..."
echo "JWT_SECRET: ${JWT_SECRET:0:30}..."
echo ""
echo "⚠️  Si vous voyez 'YOUR_XXXXX_HERE' → Les clés ne sont PAS configurées!"
echo "    Allez à: Dashboard.render.com → Service → Environment → Mettez à jour"
echo ""

# ════════════════════════════════════════════════════════════════
# ÉTAPE 2: Diagnostic
# ════════════════════════════════════════════════════════════════

echo ""
echo "📊 ÉTAPE 2: Diagnostic de la BD"
echo "════════════════════════════════════════════════════════════"
php backend/diagnose_db.php

# ════════════════════════════════════════════════════════════════
# ÉTAPE 3: Migration des adhérents
# ════════════════════════════════════════════════════════════════

echo ""
echo "🔄 ÉTAPE 3: Migrer les adhérents existants"
echo "════════════════════════════════════════════════════════════"
php backend/migrate_users.php

# ════════════════════════════════════════════════════════════════
# ÉTAPE 4: Vérifier les hashes
# ════════════════════════════════════════════════════════════════

echo ""
echo "🔐 ÉTAPE 4: Vérifier les hashes bcrypt"
echo "════════════════════════════════════════════════════════════"
php backend/check_bcrypt.php

# ════════════════════════════════════════════════════════════════
# ÉTAPE 5: Diagnostic final
# ════════════════════════════════════════════════════════════════

echo ""
echo "✅ ÉTAPE 5: Diagnostic Final"
echo "════════════════════════════════════════════════════════════"
php backend/diagnose_db.php

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Réparation terminée!                                 ║"
echo "║  Vous devriez maintenant pouvoir vous connecter.         ║"
echo "╚══════════════════════════════════════════════════════════╝"
