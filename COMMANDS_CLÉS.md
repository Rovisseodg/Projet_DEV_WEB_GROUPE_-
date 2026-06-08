# 🚀 RENDER DEPLOYMENT - 5 COMMANDES CLÉS

## ⚡ Voici les 5 commandes à exécuter pour déployer

---

## 🔑 VOS PARAMÈTRES (Sauvegardez-les!)

```
DATABASE_URL=postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db
```

---

## 📍 COMMANDE 1: Initialiser la Base de Données

### Windows PowerShell:
```powershell
$env:DATABASE_URL = "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"
psql $env:DATABASE_URL -f database/database.sql
```

### Linux/Mac:
```bash
export DATABASE_URL="postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"
psql $DATABASE_URL < database/database.sql
```

### Ou script automatique:
```bash
bash deploy-render-init-db.sh
```

✅ **Attendre:** `Database initialization successful!`

---

## 📍 COMMANDE 2: Vérifier la Base de Données

```bash
# PowerShell:
$env:DATABASE_URL = "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"
psql $env:DATABASE_URL -c "SELECT COUNT(*) as users FROM users;"

# Ou Linux/Mac:
psql postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db -c "SELECT COUNT(*) FROM users;"
```

✅ **Attendre:** Résultat `17` (users)

---

## 📍 COMMANDE 3: Pousser le Code

```bash
# 1. Ajouter tous les fichiers
git add .

# 2. Faire un commit
git commit -m "chore: add Render deployment files and database consolidation"

# 3. Pousser sur master
git push origin master
```

✅ **Attendre:** Push complété, vérifier sur GitHub

---

## 📍 COMMANDE 4: Créer le Service Render

**⚠️ MANUEL - Via Dashboard Render:**

```
1. Aller à: https://render.com/dashboard
2. [New +] → [Web Service]
3. Connecter: Rovisseodg/Projet_DEV_WEB_GROUPE_-
4. Branch: master
5. Configuration:
   Name:       mamutuelle-api
   Region:     Oregon (us-west)
   Environment: Docker
6. [Connect Repo]
```

---

## 📍 COMMANDE 5: Ajouter les Variables d'Environnement

**⚠️ MANUEL - Via Dashboard Render:**

Dans l'onglet **Environment**, ajouter:

```
DATABASE_URL = postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db
APP_NAME = MaMutuelle
APP_ENV = production
APP_DEBUG = false
APP_KEY = base64:VOTRE_CLE_GENEREE
JWT_SECRET = VOTRE_SECRET_JWT
LOG_LEVEL = info
PORT = 8080
```

⚠️ **Générer les clés:**
```bash
# APP_KEY:
php artisan key:generate --show

# JWT_SECRET:
openssl rand -base64 32
```

✅ **Cliquer:** [Create Web Service]

---

## ✅ ÉTAPE 6: Vérifier le Déploiement

```bash
# Test 1: Service en ligne
curl https://mamutuelle-api.onrender.com/

# Test 2: Base de données
psql postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db -c "SELECT COUNT(*) FROM adherents;"

# Test 3: Frontend
# Ouvrir: https://mamutuelle-api.onrender.com/login.html
```

✅ **Succès si tout répond sans erreurs!**

---

## 🎯 RÉSUMÉ FINAL

```
ÉTAPE 1: psql DATABASE_URL < database/database.sql    ← Shell command
ÉTAPE 2: psql $DATABASE_URL -c "SELECT..."             ← Vérification
ÉTAPE 3: git add . && git commit && git push           ← Shell commands
ÉTAPE 4: Render Dashboard → New Web Service            ← Manual GUI
ÉTAPE 5: Render Dashboard → Environment Variables      ← Manual GUI
ÉTAPE 6: curl + test                                    ← Vérification

⏱️  Temps total: 20-30 minutes
🚀 Résultat: Application en production!
```

---

## 📱 ACCÈS FINAL

```
🌐 Application: https://mamutuelle-api.onrender.com
📧 Admin:       admin@mamutuelle.bf
🔐 Base:        PostgreSQL sur Render
✅ Status:      Live!
```

---

## 📚 DOCUMENTATION

- **START HERE:** ACTION_IMMEDIAT.md
- **Quick:** DEPLOY_RENDER_QUICKSTART.md
- **Complet:** DEPLOY_RENDER.md
- **Visuel:** RENDER_DASHBOARD_GUIDE.md
- **Checklist:** DEPLOYMENT_CHECKLIST.md

---

**Prêt? Exécutez les commandes ci-dessus! 🚀**
