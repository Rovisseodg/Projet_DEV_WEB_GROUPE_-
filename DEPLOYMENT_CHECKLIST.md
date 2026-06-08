# ✅ Render Deployment Checklist

Date: 2026-06-08
Project: MaMutuelle
Status: Ready for Deployment

---

## 📋 PRÉ-DÉPLOIEMENT

### Préparation locale
- [ ] Code pushé sur master
- [ ] Dockerfile vérifié (EXPOSE 8080)
- [ ] database.sql présent et complet
- [ ] .env.render créé avec les bonnes variables
- [ ] Tous les fichiers de déploiement présents:
  - [ ] DEPLOY_RENDER.md
  - [ ] DEPLOY_RENDER_QUICKSTART.md
  - [ ] RENDER_DASHBOARD_GUIDE.md
  - [ ] deploy-render-init-db.sh
  - [ ] .env.render

---

## 🗄️ ÉTAPE 1: INITIALISER LA BASE DE DONNÉES

### Connexion à la base Render

- [ ] PostgreSQL client installé (psql)
- [ ] Accès réseau à Render DB vérifié
- [ ] Paramètres de base:
  ```
  Host:     dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com
  Port:     5432
  Database: mamutuelle_db
  User:     mamutuelle_db_user
  Password: hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR
  ```

### Initialisation

- [ ] Exécuter le script:
  ```bash
  bash deploy-render-init-db.sh
  ```
  
  OU via PowerShell:
  ```powershell
  $env:DATABASE_URL = "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db"
  psql $env:DATABASE_URL -f database/database.sql
  ```

### Vérification de la base

- [ ] Vérifier la connexion
- [ ] Tous les messages "Connection successful"
- [ ] Voir "Database initialization successful!"
- [ ] Vérifier les counts:
  - [ ] Users: 17 records
  - [ ] Adherents: 15 records
  - [ ] Tables créées: 10
  - [ ] Indices créés: 10+

---

## 📤 ÉTAPE 2: POUSSER LE CODE

### Git operations

- [ ] Tous les fichiers ajoutés:
  ```
  git add .
  ```

- [ ] Commit créé:
  ```
  git commit -m "chore: add database consolidation and Render deployment"
  ```

- [ ] Code poussé:
  ```
  git push origin master
  ```

### Vérification GitHub

- [ ] Aller sur: https://github.com/Rovisseodg/Projet_DEV_WEB_GROUPE_-
- [ ] Voir les nouveaux fichiers:
  - [ ] DEPLOY_RENDER.md
  - [ ] DEPLOY_RENDER_QUICKSTART.md
  - [ ] RENDER_DASHBOARD_GUIDE.md
  - [ ] database/database.sql (consolidé)
  - [ ] deploy-render-init-db.sh
  - [ ] .env.render

---

## 🌐 ÉTAPE 3: CRÉER LE SERVICE RENDER

### Connexion et création

- [ ] Accéder à: https://render.com/dashboard
- [ ] Connecté avec GitHub? Si non:
  - [ ] Click "Sign up with GitHub"
  - [ ] Autoriser Render

### Configuration du service

- [ ] Cliquer [New +]
- [ ] Sélectionner "Web Service"
- [ ] Connecter repository: `Rovisseodg/Projet_DEV_WEB_GROUPE_-`
- [ ] Branch: `master`

### Paramètres du service

- [ ] Name: `mamutuelle-api`
- [ ] Region: `Oregon (us-west)` ← IMPORTANT
- [ ] Environment: `Docker`
- [ ] Build Command: (vide)
- [ ] Start Command: (vide)

---

## 🔐 ÉTAPE 4: CONFIGURER ENVIRONMENT VARIABLES

### Ajouter les variables critiques

Aller à: **Environment** (onglet)

Ajouter chaque variable (click [Add Variable +]):

- [ ] `DATABASE_URL`
  ```
  postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db
  ```
  ⚠️ **ATTENTION:** Utiliser l'URL **INTERNE** (sans .oregon-postgres.render.com)

- [ ] `APP_NAME`
  ```
  MaMutuelle
  ```

- [ ] `APP_ENV`
  ```
  production
  ```

- [ ] `APP_DEBUG`
  ```
  false
  ```

- [ ] `APP_KEY`
  ```
  base64:YOUR_KEY_HERE_REPLACE_WITH_GENERATED_VALUE
  ```
  ⚠️ **À générer:** `php artisan key:generate --show`

- [ ] `JWT_SECRET`
  ```
  YOUR_JWT_SECRET_REPLACE_WITH_GENERATED_VALUE
  ```
  ⚠️ **À générer:** `openssl rand -base64 32`

- [ ] `LOG_LEVEL`
  ```
  info
  ```

- [ ] `PORT`
  ```
  8080
  ```

### Variables supplémentaires (optionnel)

- [ ] `APP_URL` = `https://mamutuelle-api.onrender.com`
- [ ] `CORS_ALLOWED_ORIGINS` = `https://mamutuelle-api.onrender.com`
- [ ] `DB_CONNECTION` = `pgsql`
- [ ] `LOG_CHANNEL` = `stack`

---

## 💳 ÉTAPE 5: CHOISIR LE PLAN

### Options

- [ ] Starter Plan ($7/month)
  - 0.5 CPU
  - 512 MB RAM
  - Idéal pour développement

- [ ] Pro Plan ($12/month)
  - 1 CPU
  - 2 GB RAM
  - Mieux pour production

### Action

- [ ] Sélectionner un plan
- [ ] Cliquer [Create Web Service]

---

## ⏳ ÉTAPE 6: ATTENDRE LE DÉPLOIEMENT

### Monitoring le déploiement

- [ ] Aller à l'onglet "Logs"
- [ ] Observer les messages:
  - [ ] "Building Docker image..."
  - [ ] "Pulling from registry..."
  - [ ] "Starting Apache..."
  - [ ] "PostgreSQL connecting..."
  - [ ] "Database ready!"
  - [ ] ✅ "Your service is live at https://mamutuelle-api.onrender.com"

### Temps estimé: 2-5 minutes

- [ ] Status change to: 🟢 Live
- [ ] Pas de messages d'erreur critiques
- [ ] Service URL disponible

---

## ✅ ÉTAPE 7: VÉRIFIER LE DÉPLOIEMENT

### Test 1: Service en ligne

```bash
curl https://mamutuelle-api.onrender.com/
```

- [ ] Réponse HTTP (200 ou 404 est OK)
- [ ] Pas d'erreur 502/503

### Test 2: Base de données

```bash
psql "postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a.oregon-postgres.render.com/mamutuelle_db" -c "SELECT COUNT(*) FROM users;"
```

- [ ] Réponse: `17`
- [ ] Pas d'erreur de connexion

### Test 3: Frontend

```
https://mamutuelle-api.onrender.com/login.html
```

- [ ] Page login s'affiche
- [ ] CSS chargé (page stylisée)
- [ ] Pas d'erreurs en console (F12)

### Test 4: API Health Check

```bash
curl https://mamutuelle-api.onrender.com/api/health
```

- [ ] Répond avec JSON
- [ ] Pas d'erreur 500

---

## 🚀 ÉTAPE 8: UTILISER L'APPLICATION

### Accès utilisateur

- [ ] Admin Login:
  ```
  Email:    admin@mamutuelle.bf
  Password: (voir database.sql - bcrypt hash)
  ```

- [ ] Agent Login:
  ```
  Email:    agent@mamutuelle.bf
  Password: (voir database.sql)
  ```

- [ ] Test user logins pour valider l'authentification

### URL Finales

- [ ] Application: `https://mamutuelle-api.onrender.com`
- [ ] Login: `https://mamutuelle-api.onrender.com/login.html`
- [ ] Dashboard: `https://mamutuelle-api.onrender.com/dashboard.html`

---

## 📊 ÉTAPE 9: MONITORING ET MAINTENANCE

### Vérifications régulières

- [ ] Aller à Dashboard → Metrics
- [ ] Vérifier:
  - [ ] CPU Usage < 80%
  - [ ] Memory Usage < 80%
  - [ ] No 5xx errors
  - [ ] Response time < 1s

### Logs monitoring

- [ ] Vérifier les logs régulièrement:
  ```
  Dashboard → Logs → Voir les messages
  ```

- [ ] Chercher:
  - [ ] Pas de "Connection refused"
  - [ ] Pas de "Out of memory"
  - [ ] Pas de erreurs critiques

### Mises à jour de code

- [ ] Pour mettre à jour:
  ```bash
  git push origin master
  ```
  
  Render redéploiera automatiquement

- [ ] Vérifier le déploiement:
  - [ ] Aller à Dashboard → Deploys
  - [ ] Voir le nouveau commit
  - [ ] Attendre le statut "Live"

---

## 🆘 TROUBLESHOOTING

### Si erreur "Connection refused" (Database)

- [ ] Vérifier DATABASE_URL
- [ ] Doit être: `postgresql://mamutuelle_db_user:hlHnsoU20JqIPDdeUUjJaxLSAxIJs0HR@dpg-d8ivcmm47okc739op5mg-a/mamutuelle_db`
- [ ] ⚠️ **SANS** `.oregon-postgres.render.com` pour Render service
- [ ] Utiliser `.oregon-postgres.render.com` seulement pour connexion externe
- [ ] Redéployer avec [Manual Deploy]

### Si erreur "Build Failed"

- [ ] Aller à Logs et lire l'erreur complète
- [ ] Vérifier Dockerfile existe et est valide
- [ ] Vérifier pas de erreurs de syntaxe Python/PHP
- [ ] Réessayer le déploiement

### Si service très lent

- [ ] Vérifier Metrics:
  - [ ] CPU < 80%?
  - [ ] RAM < 80%?
- [ ] Si > 80%, upgrade le plan
- [ ] Vérifier les requêtes DB sont optimisées
- [ ] Voir si les indices sont utilisés

### Si data n'est pas synchronisée

- [ ] Vérifier que database.sql a été exécuté
- [ ] Vérifier le compte rendu: `database initialization successful!`
- [ ] Réexécuter si nécessaire:
  ```bash
  bash deploy-render-init-db.sh
  ```

---

## 📚 DOCUMENTATION

- [ ] Lire: DEPLOY_RENDER.md (guide complet)
- [ ] Lire: DEPLOY_RENDER_QUICKSTART.md (quick ref)
- [ ] Lire: RENDER_DASHBOARD_GUIDE.md (guide visuel)
- [ ] Garder: .env.render (pour future reference)

---

## 🎉 RÉSUMÉ FINAL

- [ ] **Étape 1:** Base de données initialisée ✅
- [ ] **Étape 2:** Code pushé ✅
- [ ] **Étape 3:** Service créé sur Render ✅
- [ ] **Étape 4:** Variables configurées ✅
- [ ] **Étape 5:** Plan choisi ✅
- [ ] **Étape 6:** Déploiement complété ✅
- [ ] **Étape 7:** Vérifications passées ✅
- [ ] **Étape 8:** Application accessible ✅
- [ ] **Étape 9:** Monitoring en place ✅

---

## 🚀 STATUS: DEPLOYMENT COMPLETE

```
✅ Application Live at: https://mamutuelle-api.onrender.com
✅ Database: PostgreSQL on Render
✅ Auto-Scaling: Configured
✅ Monitoring: Active
✅ Backups: Available (via Render)

🎉 Your MaMutuelle app is now in production!
```

---

**Date Completion:** ____________
**Person:** ____________
**Notes:** ____________

---

Pour toute question: Voir DEPLOY_RENDER.md
