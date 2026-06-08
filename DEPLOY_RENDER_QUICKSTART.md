# 🚀 Déploiement Render - Étapes Simples

## ✅ VOS PARAMÈTRES RENDER

```
Hostname:    dpg-d8ivcmm47okc739op5mg-a
Port:        5432
Database:    mamutuelle_db
Username:    mamutuelle_db_user
Password:    hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR
Internal URL: postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db
External URL: postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db
```

---

## ⚡ ÉTAPE 1: Initialiser la Base de Données (10 min)

### Sur Windows (PowerShell):

```powershell
# 1. Définir la variable
$env:DATABASE_URL = "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"

# 2. Exécuter le script SQL
psql $env:DATABASE_URL -f database/database.sql

# 3. Vérifier
psql $env:DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Sur Linux/Mac:

```bash
# 1. Définir la variable
export DATABASE_URL="postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"

# 2. Exécuter le script SQL
psql $DATABASE_URL < database/database.sql

# 3. Vérifier
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Ou via le script automatique:

```bash
bash deploy-render-init-db.sh
```

✅ **Succès si vous voyez:**
- `✓ Connection successful`
- `✅ Database initialization successful!`
- Comptes de test créés

---

## 📤 ÉTAPE 2: Pousser le Code sur GitHub (5 min)

```bash
# 1. Ajouter tous les fichiers
git add .

# 2. Commit
git commit -m "chore: add database consolidation and Render deployment files"

# 3. Pousser
git push origin master
```

✅ **Vérifier sur GitHub:**
- Aller sur: https://github.com/Rovisseodg/Projet_DEV_WEB_GROUPE_-
- Voir les nouveaux fichiers: DEPLOY_RENDER.md, database.sql, etc.

---

## 🌐 ÉTAPE 3: Créer le Service sur Render (5 min)

### 1. Accéder à Render Dashboard

```
https://render.com/dashboard
```

### 2. Créer un nouveau Web Service

```
Bouton: "New +"
Sélectionner: "Web Service"
```

### 3. Connecter votre GitHub

```
GitHub → Connect
Repository: Rovisseodg/Projet_DEV_WEB_GROUPE_-
Branch: master
```

### 4. Configurer le Service

```
Name:              mamutuelle-api
Region:            Oregon (us-west) ← IMPORTANT
Environment:       Docker
Build Command:     (vide - utilisera Dockerfile)
Start Command:     (vide - utilisera EXPOSE 8080)
```

### 5. Configurer les Variables d'Environnement

Aller à: **Environment**

Ajouter ces variables:

```
DATABASE_URL = postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db

APP_NAME = MaMutuelle
APP_ENV = production
APP_DEBUG = false

APP_KEY = base64:VOTRE_CLE_ICI

JWT_SECRET = votre_secret_jwt_ici

LOG_LEVEL = info
PORT = 8080
```

⚠️ **IMPORTANT:** 
- `APP_KEY`: Générer avec `php artisan key:generate --show`
- `JWT_SECRET`: Générer avec `openssl rand -base64 32`
- `DATABASE_URL`: Utiliser l'URL INTERNE (sans .oregon-postgres.render.com)

### 6. Choisir le Plan

```
Starter: $7/mois
ou
Pro: $12/mois
```

### 7. Créer le Service

```
Bouton: "Create Web Service"
```

✅ **Attendre le déploiement (~2-5 min)**
- Voir les logs en direct
- Attendre le message: `Your service is live at https://mamutuelle-api.onrender.com`

---

## ✅ ÉTAPE 4: Vérifier le Déploiement (2 min)

### Test 1: Service en ligne

```bash
# Linux/Mac
curl https://mamutuelle-api.onrender.com/

# PowerShell Windows
Invoke-WebRequest -Uri https://mamutuelle-api.onrender.com/
```

### Test 2: Base de données

```bash
# Exécuter une requête
psql "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db" -c "SELECT COUNT(*) as users FROM users;"
```

### Test 3: Accéder au Frontend

```
https://mamutuelle-api.onrender.com/login.html
```

✅ **Succès si:**
- Page login s'affiche
- Base de données répond
- Pas d'erreur 502/503

---

## 🔐 ÉTAPE 5: Credentials de Test

```
Admin:     admin@mamutuelle.bf
Agent:     agent@mamutuelle.bf
Password:  Voir database.sql (bcrypt)
```

---

## 🆘 Problèmes Courants

### ❌ "Connection Refused" Database
```
✓ Solution: Vérifier DATABASE_URL dans Environment
✓ Utiliser l'URL INTERNE: dpg-d8ivcmm47okc739op5mg-a (sans .oregon-postgres.render.com)
```

### ❌ "Build Failed"
```
✓ Vérifier logs: Dashboard → Logs
✓ Vérifier Dockerfile: EXPOSE 8080 ✓
```

### ❌ "Service won't start"
```
✓ Vérifier PORT=8080 dans Environment
✓ Vérifier APP_KEY et JWT_SECRET ne sont pas "HERE_REPLACE_ME"
✓ Voir les logs pour erreurs
```

---

## 📱 Résultat Final

**Votre application est maintenant en ligne!**

```
🌐 URL:       https://mamutuelle-api.onrender.com
📧 Admin:     admin@mamutuelle.bf
🔐 Database:  PostgreSQL sur Render
✅ Status:    Live
```

---

## 📚 Documentation Complète

Voir: **DEPLOY_RENDER.md** pour le guide détaillé

---

## 🎯 Résumé (15-20 minutes)

```
✅ Étape 1: psql init database        (10 min)
✅ Étape 2: git push                  (5 min)
✅ Étape 3: Créer service Render      (5 min)
✅ Étape 4: Vérifier                  (2 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ TOTAL:                             (22 min)
🚀 Votre app est LIVE!
```

---

**Besoin d'aide? → Voir DEPLOY_RENDER.md**
