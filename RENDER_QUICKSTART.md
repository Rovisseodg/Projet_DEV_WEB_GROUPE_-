# ⚡ Render Quickstart - 5 minutes

## 🎯 Objectif

Déployer MaMutuelle sur Render **en 5 minutes maximum**.

## 📋 Avant de commencer

- Compte Render: https://render.com (gratuit)
- Ce repository avec les fichiers Render

## 🚀 Step 1: Vérifier la configuration (1 min)

```bash
# Vérifier que tout est prêt
bash scripts/pre-deploy-checklist.sh
```

✅ Tous les contrôles devraient passer.

## 🌐 Step 2: Sur Render Dashboard (3 min)

### 2.1: Créer PostgreSQL
1. Aller: https://dashboard.render.com
2. **+ New** → **PostgreSQL**
3. Remplir:
   ```
   Name: mamutuelle-db
   Database: mamutuelle
   User: mamutuelle_user
   Region: Frankfurt (EU) ou Oregon (US)
   Version: 15
   Plan: Free
   ```
4. **Create** et **attendre 1-2 min**
5. **Copier la connection string** complète

### 2.2: Créer Web Service
1. **+ New** → **Web Service**
2. **Se connecter à GitHub**
3. **Sélectionner** ce repo
4. Remplir:
   ```
   Name: mamutuelle-api
   Region: MÊME que PostgreSQL (important!)
   Branch: master
   Build Command: echo 'Using Docker'
   Start Command: /usr/local/bin/start.sh
   ```
5. **Advanced** → Auto-deploy: **ON**

### 2.3: Ajouter variables (1 min)

**Avant de créer, cliquer "Advanced" et ajouter:**

```bash
# Copier/coller exactement:

APP_ENV=production
APP_DEBUG=false
APP_URL=https://mamutuelle-api.onrender.com

# Remplacer XXXXX par la connection string de PostgreSQL:
# Example: postgresql://mamutuelle_user:pass@host:5432/mamutuelle
DATABASE_URL=postgresql://XXXXX

# Remplacer XXX par mot de passe BD:
DB_DATABASE=mamutuelle
DB_USERNAME=mamutuelle_user
DB_PASSWORD=XXX

# Générer une clé JWT (random 32 chars):
JWT_SECRET=your-random-32-character-secret-key-here
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_ALGORITHM=HS256

# Générer avec: php artisan key:generate --show
APP_KEY=base64:YOUR_KEY_HERE_FROM_ARTISAN

# Première déploiement:
RUN_MIGRATIONS=true
```

## 🎬 Step 3: Lancer le déploiement (1 min)

1. Vérifier toutes les variables
2. Cliquer **Create Web Service**
3. Attendre les logs:
   ```
   Building Docker image...
   ✅ Service started
   ✅ Apache listening on 0.0.0.0:8080
   ```

## ✅ Step 4: Tester (1 min)

```bash
# Tester l'API
curl https://mamutuelle-api.onrender.com/api

# Devrait retourner JSON (pas 502 error)
```

## 🐛 Si erreur 502

1. Aller: Dashboard → **Logs**
2. Chercher `ERROR` ou `FATAL`
3. Problèmes courants:
   - DATABASE_URL mal copiée → Vérifier caractères spéciaux
   - APP_KEY manquant → Générer avec `php artisan key:generate`
   - Port 8080 pas écouté → Vérifier Dockerfile (EXPOSE 8080)

**Solution rapide:** Manual Deploy → Redéployer

## 🎉 Succès!

Si vous voyez:
```
✅ Service started
✅ Apache listening on 0.0.0.0:8080
```

Votre app est **EN LIGNE** 🚀

## 📝 Après le déploiement

### 1. Désactiver RUN_MIGRATIONS

```
Dashboard → Environment → RUN_MIGRATIONS
Mettre: false
Manual Deploy → Redéployer
```

### 2. Tester les endpoints

```bash
# Login (remplacer par vos credentials)
curl -X POST https://mamutuelle-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mamutuelle.local","password":"admin"}'

# Dashboard
open https://mamutuelle-api.onrender.com/dashboard.html
```

### 3. Ajouter domaine personnalisé (optionnel)

Dashboard → **Render Domain** → Configurer DNS

## 🆘 Besoin d'aide?

- Render docs: https://render.com/docs
- Full guide: `docs/DEPLOYMENT_RENDER.md`
- Migration guide: `docs/MIGRATION_RAILWAY_TO_RENDER.md`

---

**C'est tout! Votre app est maintenant sur Render 🎊**

Temps total: ⏱️ ~10 minutes (attente server incluse)
Coût: 🆓 **Gratuit** (plan Free)
