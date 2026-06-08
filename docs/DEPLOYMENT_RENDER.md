# 🚀 Guide Déploiement - Render

## 📋 Prérequis

- Compte Render gratuit ou payant ([render.com](https://render.com))
- Repository Git (GitHub, GitLab, ou Gitea)
- Cette application Laravel

## 🔧 Étape 1: Préparation du code

### 1.1 Vérifier les fichiers nécessaires

Assurez-vous que les fichiers suivants existent:
```
✅ render.yaml         # Configuration Render
✅ Dockerfile          # Optimisé pour Render (port 8080)
✅ docker-compose.yml  # Pour développement local
✅ .env.example        # Template variables
✅ backend/            # Application Laravel
```

### 1.2 Vérifier le Dockerfile

Le Dockerfile doit écouter sur le **port 8080** (Render utilise ce port):
```dockerfile
EXPOSE 8080  # ✅ Correct pour Render
```

## 🌐 Étape 2: Créer les services sur Render

### Étape 2.1: Créer la base de données PostgreSQL

1. **Aller sur [dashboard.render.com](https://dashboard.render.com)**
2. **Cliquer sur "+ New"** → **PostgreSQL**
3. **Configurer:**
   - Name: `mamutuelle-db` (ou votre nom)
   - Database: `mamutuelle`
   - User: `mamutuelle_user`
   - Region: Proche de vous (ex: `Frankfurt` pour EU)
   - PostgreSQL Version: `15`
   - Plan: **Free** ou payant selon les besoins

4. **Copier la connection string:**
   - Elle apparaîtra après création
   - Format: `postgresql://user:password@host:port/database`

### Étape 2.2: Créer l'application Web Service

1. **Cliquer "+ New"** → **Web Service**
2. **Se connecter à GitHub/GitLab**
3. **Sélectionner le repository** `Projet_DEV_WEB_GROUPE_-`
4. **Configurer:**
   - Name: `mamutuelle-api` (ou votre nom)
   - Region: **Même région que BD** (important!)
   - Branch: `master`
   - Build Command: `echo 'Using Docker'`
   - Start Command: `/usr/local/bin/start.sh`

5. **Advanced → Auto-deploy:** ON (pour déployer à chaque push)

## 🔐 Étape 3: Variables d'environnement

### Dans le Dashboard Render:

1. **Aller sur Web Service** → **Environment**
2. **Ajouter ces variables:**

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://mamutuelle-api.onrender.com  # À adapter

# Database (copier de la BD créée)
DATABASE_URL=postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle
DB_DATABASE=mamutuelle
DB_USERNAME=mamutuelle_user
DB_PASSWORD=PASSWORD  # De la BD PostgreSQL

# JWT (générer une clé sécurisée)
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_ALGORITHM=HS256

# Laravel Key (générer en local)
APP_KEY=base64:YOUR_BASE64_ENCODED_KEY
```

### Générer APP_KEY (en local):

```bash
cd backend
php artisan key:generate --show  # Copier la clé affichée
```

### Générer JWT_SECRET (en local ou en ligne):

```bash
# En local
php artisan jwt:secret --show

# Ou générer en ligne
# openssl rand -base64 32
```

## 🚀 Étape 4: Premier déploiement

### 4.1: Activer les migrations au premier déploiement

1. **Ajouter variable d'environnement:**
   ```
   RUN_MIGRATIONS=true
   ```

2. **Deployer:**
   - Render va compiler le Docker
   - Exécuter les migrations
   - Démarrer l'application

3. **Vérifier les logs:**
   - Dashboard → **Logs**
   - Chercher: `✅ Démarrage d'Apache`

### 4.2: Tester l'application

```bash
# Test de l'API
curl https://mamutuelle-api.onrender.com/api

# Devrait retourner une réponse JSON valide
```

## 🔄 Étape 5: Déploiements futurs

### Optionnel: Exécuter des migrations

Si vous ajoutez des migrations:
```bash
# En local, tester d'abord
php artisan migrate

# Commit et push vers master
git push origin master

# Render redéploie automatiquement
```

Pour forcer les migrations au déploiement:
```bash
# Ajouter en env variables
RUN_MIGRATIONS=true
```

## 📊 Statut et monitoring

### Vérifier le statut:
1. **Dashboard** → **Service** → **Logs**
2. **Chercher les erreurs:**
   - `ERROR` ou `FATAL`
   - Problèmes de connexion BD
   - Migrations échouées

### Performance:
- Plan Free: 0.5 vCPU, 512 MB RAM
- Plan Starter: 1 vCPU, 2 GB RAM

## 🐛 Troubleshooting

### Problème: `Error: Database connection failed`

**Solution:**
1. Vérifier `DATABASE_URL` est correcte
2. Vérifier le mot de passe (caractères spéciaux échappés?)
3. Vérifier la région BD = région App

### Problème: `Port 8080 not listening`

**Solution:**
1. Vérifier `EXPOSE 8080` dans Dockerfile
2. Vérifier le port dans Apache config (port.conf)
3. Redéployer manuellement

### Problème: `502 Bad Gateway`

**Solution:**
1. Vérifier les logs Render
2. Vérifier que l'app démarre (pas de crash)
3. Attendre 30-60s après déploiement

### Problème: Les fichiers frontend ne s'affichent pas

**Solution:**
1. Vérifier que `frontend/` est bien dans le repo
2. Vérifier le Dockerfile copie `frontend/css` et `frontend/js`
3. Reconstruire: Dashboard → **Manual Deploy**

## 📝 Fichiers de configuration

### render.yaml

Définit les services et configuration automatique:
- Web Service (app)
- PostgreSQL (database)
- Environment variables
- Healthchecks

### Dockerfile

- Base: PHP 8.4 avec Apache
- Port: **8080** (pour Render)
- Modules: pdo_pgsql, rewrite, headers
- Start: `/usr/local/bin/start.sh`

### Environment Variables

Variables au déploiement (voir Étape 3):
- `APP_*`: Configuration Laravel
- `DB_*`: Connexion base de données
- `JWT_*`: Configuration JWT
- `RUN_MIGRATIONS`: Exécuter les migrations au démarrage

## 🔗 Liens utiles

- [Render Docs - Docker](https://render.com/docs/docker)
- [Render Docs - PostgreSQL](https://render.com/docs/databases)
- [Render Docs - Environment Variables](https://render.com/docs/environment-variables)
- [Laravel Deployment](https://laravel.com/docs/deployment)

## ✅ Checklist avant production

- [ ] `APP_DEBUG=false` en production
- [ ] `APP_KEY` généré et sécurisé
- [ ] `JWT_SECRET` fort et sécurisé
- [ ] Database backup activé
- [ ] HTTPS forcé (`APP_URL=https://...`)
- [ ] Logs en stderr (pour Render)
- [ ] Migrations testées en local
- [ ] Fichiers frontend vérifiés
- [ ] `.env` sécurisé (variables Render)
- [ ] SSL certificate auto (Render gratuit)

## 🎉 Résumé

Vous avez maintenant:
1. ✅ Application Docker compatible Render
2. ✅ PostgreSQL sur Render
3. ✅ Déploiement automatique depuis Git
4. ✅ Migrations automatiques
5. ✅ Frontend servie par l'API

**Prochaines étapes:**
- Configurer domaine personnalisé
- Ajouter logs and monitoring
- Mettre en place backups
- Optimiser performance
