# 🚀 MaMutuelle - Render Deployment Guide

## ⚡ Quick Deploy (5 minutes)

### Vos paramètres Render

```
🗄️ DATABASE
Hostname:    dpg-d8ivcmm47okc739op5mg-a
Port:        5432
Database:    mamutuelle_db
Username:    mamutuelle_db_user
Password:    hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR
Internal:    postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db
External:    postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db
```

---

## 📋 ÉTAPE 1: Initialiser la Base de Données

### Exécuter le script SQL

```bash
# Utiliser l'URL externe pour initialiser depuis votre machine
export DATABASE_URL="postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"

# Exécuter le script
psql $DATABASE_URL < database/database.sql
```

**Ou sur Windows (PowerShell):**
```powershell
$env:DATABASE_URL = "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"
psql $env:DATABASE_URL -f database/database.sql
```

**Ou via le script (Linux/Mac):**
```bash
bash database/init-database.sh render
```

**Ou via pgAdmin (GUI):**
```
1. Ouvrir pgAdmin
2. Servers → New → Server
3. Host: dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com
4. Port: 5432
5. Username: mamutuelle_db_user
6. Password: hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR
7. Query Tool → File → Open → database/database.sql → Execute
```

✅ **Vérification:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) as users FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) as adherents FROM adherents;"
```

---

## 🐳 ÉTAPE 2: Préparer l'Application pour Render

### Vérifier le Dockerfile

```bash
# Vérifier que le Dockerfile expose le port 8080
cat Dockerfile | grep EXPOSE
# Résultat attendu: EXPOSE 8080
```

### Vérifier le fichier .env.example

```bash
# Copier et créer .env si nécessaire
cp .env.example .env
```

### Variables d'environnement à configurer sur Render

```env
# Database (IMPORTANT: utiliser l'URL interne pour Render)
DATABASE_URL=postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db

# Application
APP_NAME=MaMutuelle
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false

# JWT
JWT_SECRET=your_jwt_secret_here

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=info
```

---

## 🌐 ÉTAPE 3: Pousser le Code sur GitHub

```bash
# 1. Ajouter les fichiers consolidés
git add .
git commit -m "chore: add unified database setup and Render deployment files"

# 2. Pousser
git push origin master
```

---

## 🚀 ÉTAPE 4: Créer le Service sur Render

### Via Dashboard Render:

1. **Connexion**
   - Aller sur https://render.com
   - Se connecter avec GitHub

2. **Créer un Web Service**
   - New → Web Service
   - Connecter le repo: `Rovisseodg/Projet_DEV_WEB_GROUPE_-`
   - Branch: `master`
   - Name: `mamutuelle-api`
   - Region: `Oregon (us-west)` (proche du DB)
   - Runtime: `Docker`
   - Build Command: (laissez vide, utilisera Dockerfile)
   - Start Command: (laissez vide, utilisera EXPOSE 8080)

3. **Configuration - Environment**
   - Ajouter les variables:
     ```
     DATABASE_URL=postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db
     APP_NAME=MaMutuelle
     APP_ENV=production
     APP_KEY=base64:YOUR_KEY_HERE
     JWT_SECRET=your_secret_here
     ```

4. **Plan**
   - Starter ($7/mois) ou Pro ($12/mois)
   - Sélectionner et créer

5. **Attendre le déploiement**
   - Logs disponibles dans l'onglet "Logs"
   - Attendre le message: `Your service is live at https://mamutuelle-api.onrender.com`

---

## ✅ ÉTAPE 5: Vérifier le Déploiement

### Test 1: Vérifier le service

```bash
curl https://mamutuelle-api.onrender.com/
```

### Test 2: Tester l'API

```bash
# Test endpoint
curl https://mamutuelle-api.onrender.com/api/health

# Test login
curl -X POST https://mamutuelle-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mamutuelle.bf",
    "password": "password"
  }'
```

### Test 3: Vérifier la base de données

```bash
# Depuis votre machine
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"
```

---

## 🔐 ÉTAPE 6: Configuration Sécurité

### Générer les clés

```bash
# Generate APP_KEY (Laravel)
php artisan key:generate --show

# Generate JWT_SECRET
openssl rand -base64 32
```

### Mettre à jour sur Render

1. Aller au Dashboard
2. Environment → Ajouter/modifier:
   ```
   APP_KEY=base64:VOTRE_CLE_GENEREE
   JWT_SECRET=VOTRE_SECRET_JWT
   ```

3. Redéployer (appuyer sur "Manual Deploy")

---

## 📊 ÉTAPE 7: Monitoring

### Vérifier les logs

```
Dashboard Render → Logs → Voir les messages en temps réel
```

### Vérifier les métriques

```
Dashboard Render → Metrics → Voir CPU, Mémoire, Réseau
```

### Vérifier la base de données

```
Dashboard Render → PostgreSQL → Database → Events
```

---

## 🔄 ÉTAPE 8: Mettre à Jour le Code

```bash
# 1. Modification locale
# ... modifier les fichiers ...

# 2. Commit
git add .
git commit -m "feature: ajout nouvelle fonctionnalité"

# 3. Push
git push origin master

# 4. Render redéploiera automatiquement
# Vérifier: Dashboard Render → Deploys
```

---

## ⚠️ Troubleshooting

### Erreur: "Cannot connect to database"
```
→ Vérifier DATABASE_URL dans Environment variables
→ Vérifier que la base existe: psql $DATABASE_URL -c "SELECT 1;"
→ Vérifier le firewall Render
```

### Erreur: "Port already in use"
```
→ Le port 8080 est réservé à Render
→ Vérifier Dockerfile: EXPOSE 8080 ✓
→ Ne pas modifier le port
```

### Erreur: "Build failed"
```
→ Vérifier les logs: Dashboard → Logs
→ Vérifier Dockerfile syntaxe
→ Vérifier que docker-compose.yml n'est pas utilisé
```

### Service très lent
```
→ Vérifier métriques: Dashboard → Metrics
→ Upgrade Plan si nécessaire
→ Optimiser les queries DB
```

---

## 📱 Accéder à votre app

**URL finale:** `https://mamutuelle-api.onrender.com`

### Frontend
- Login: `https://mamutuelle-api.onrender.com/login.html`
- Dashboard: `https://mamutuelle-api.onrender.com/dashboard.html`

### Credentials
- Admin: `admin@mamutuelle.bf`
- Agent: `agent@mamutuelle.bf`
- Adhérents: voir `database/database.sql`

---

## 🎯 Résumé Rapide

```
1. psql $DATABASE_URL < database/database.sql    (Init DB)
2. git push origin master                         (Push code)
3. Render Dashboard → New Web Service             (Create service)
4. Ajouter Environment variables                  (Configure)
5. Attendre déploiement                          (Wait)
6. curl https://mamutuelle-api.onrender.com      (Test)
7. ✅ Live!
```

---

## 📞 Support

- Render Docs: https://render.com/docs
- PostgreSQL Render: https://render.com/docs/databases
- Laravel Render: https://render.com/docs/deploy-laravel

---

**Status**: 🚀 Ready to Deploy
**Estimated Time**: 15-20 minutes
**Difficulty**: Easy ⭐⭐
