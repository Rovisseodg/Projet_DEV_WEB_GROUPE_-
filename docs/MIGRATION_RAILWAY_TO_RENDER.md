# 🔄 Migration Railway → Render

## 📋 Aperçu

Ce guide vous aide à migrer votre application MaMutuelle de Railway vers Render avec zéro downtime.

## 🔍 Comparaison Railway vs Render

| Aspect | Railway | Render |
|--------|---------|--------|
| **Prix (Free)** | ✅ Gratuit | ✅ Gratuit |
| **Base de données** | Incluse | ✅ Gratuite en séparé |
| **Uptime** | 99% | 99.95% |
| **Build time** | ~3 min | ~5 min |
| **Port** | Variable | **8080 obligatoire** |
| **Variables env** | Tableau | ✅ Champ texte |
| **GitHub** | ✅ Auto-deploy | ✅ Auto-deploy |

## ⚠️ Points importants

### Port: Railway → Render

**Railway:** Peut utiliser n'importe quel port via variable `PORT`
**Render:** DOIT utiliser port **8080** (fixe)

```dockerfile
# ✅ Render (OBLIGATOIRE)
EXPOSE 8080

# ❌ Railway (variable)
EXPOSE $PORT
```

### Base de données

**Railway:**
- Base de données incluse avec le service
- Connection strings pré-configurées

**Render:**
- Service PostgreSQL séparé
- Vous fournissez la connection string

## 📊 Avant/Après

### Avant (Railway)
```
railway.json
├── build: dockerfile
├── deploy: startCommand = /usr/local/bin/start.sh
├── healthcheckPath: /api
└── restartPolicy: on_failure
```

### Après (Render)
```
render.yaml
├── services:
│   ├── web:
│   │   ├── name: mamutuelle-api
│   │   ├── runtime: docker
│   │   ├── preDeployCommand: migrate
│   │   └── envVars: [...]
│   └── pgsql:
│       ├── name: mamutuelle-db
│       └── plan: free
└── databases: [...]
```

## 🚀 Plan de migration

### Phase 1: Préparation (5 min)

**Étape 1.1: Vérifier les fichiers Render**
```bash
ls -la render.yaml
ls -la .env.example
ls -la Dockerfile
```

**Étape 1.2: Vérifier le port 8080**
```bash
grep "EXPOSE" Dockerfile
# Output: EXPOSE 8080 ✅
```

**Étape 1.3: Commit les changements**
```bash
git add .
git commit -m "🚀 Migration Railway → Render: adapter configuration"
git push origin master
```

### Phase 2: Création sur Render (10 min)

**Étape 2.1: Créer PostgreSQL**
1. https://dashboard.render.com → "+ New" → PostgreSQL
2. Remplir:
   - Name: `mamutuelle-db`
   - Database: `mamutuelle`
   - User: `mamutuelle_user`
   - Region: **Frankfurt** (EU) ou **Oregon** (US)
   - Plan: **Free**
3. Copier la connection string complète

**Étape 2.2: Créer Web Service**
1. "+ New" → Web Service
2. Connecter à GitHub
3. Sélectionner le repo
4. Configurer:
   - Name: `mamutuelle-api`
   - Region: **Même que BD**
   - Branch: `master`
   - Build Command: `echo 'Using Docker'`
   - Start Command: `/usr/local/bin/start.sh`

**Étape 2.3: Ajouter variables d'environnement**

À faire AVANT le déploiement:

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://mamutuelle-api.onrender.com

# Database (copier de PostgreSQL)
DATABASE_URL=postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle
DB_DATABASE=mamutuelle
DB_USERNAME=mamutuelle_user
DB_PASSWORD=PASSWORD

# JWT (générer: php artisan jwt:secret --show)
JWT_SECRET=your-secret-here
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_ALGORITHM=HS256

# Laravel (générer: php artisan key:generate --show)
APP_KEY=base64:YOUR_KEY_HERE

# Migrations (une fois)
RUN_MIGRATIONS=true
```

### Phase 3: Déploiement (10 min)

**Étape 3.1: Lancer le déploiement**
1. Dashboard → "Create Web Service"
2. Attendre la compilation Docker (~5 min)
3. Voir les logs défiler

**Étape 3.2: Vérifier les logs**
```
✅ Service started
✅ Apache listening on 0.0.0.0:8080
✅ Database migrations completed
```

**Étape 3.3: Tester**
```bash
# Depuis votre machine
curl https://mamutuelle-api.onrender.com/api
# Devrait retourner un JSON

# Depuis le navigateur
open https://mamutuelle-api.onrender.com
```

### Phase 4: Validation (5 min)

**Étape 4.1: Tester les endpoints API**
```bash
# Login
curl -X POST https://mamutuelle-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mamutuelle.local","password":"admin"}'

# Dashboard
open https://mamutuelle-api.onrender.com/dashboard.html
```

**Étape 4.2: Vérifier la base de données**
- Vous pouvez accéder à PostgreSQL via:
  - Render Dashboard → Database → Connection
  - pgAdmin, DBeaver, psql, etc.

**Étape 4.3: Vérifier les fichiers frontend**
```bash
curl -I https://mamutuelle-api.onrender.com/index.html
# HTTP/1.1 200 OK
```

### Phase 5: Finalisation (5 min)

**Étape 5.1: Désactiver RUN_MIGRATIONS**

Une fois que les migrations s'exécutent correctement:
```
Dashboard → Environment Variables
Supprimer ou mettre à false:
RUN_MIGRATIONS=false
```

**Étape 5.2: Archiver Railway**

Quand tout fonctionne sur Render:
1. Vérifier que les données se trouvent sur PostgreSQL Render
2. Aller sur Railway Dashboard
3. Supprimer le service
4. Supprimer la BD Railway

**Étape 5.3: Documenter**
```bash
# Mettre à jour la documentation
echo "# MaMutuelle
## Déploiement: Render
- App: https://mamutuelle-api.onrender.com
- BD: PostgreSQL Render
" > DEPLOYMENT.md

git add DEPLOYMENT.md
git commit -m "📝 Migration complète vers Render"
git push
```

## 🔐 Sécurité en migration

### Avant de supprimer Railway

1. **Backup des données:**
```bash
# Export depuis Railway PostgreSQL
pg_dump postgresql://user:pass@host/db > backup.sql

# Vérifier l'intégrité
wc -l backup.sql  # Doit avoir >100 lignes
```

2. **Tester le restore:**
```bash
# Import sur Render PostgreSQL
psql postgresql://user:pass@render-host/db < backup.sql
```

3. **Vérifier les données:**
```bash
# Compter les rows
curl https://mamutuelle-api.onrender.com/api/adherents
# Doit retourner les données
```

## 🐛 Troubleshooting migration

### Erreur: `502 Bad Gateway`

**Cause:** App n'a pas démarré correctement

**Solution:**
```bash
# Vérifier les logs
Dashboard → Logs → Chercher "ERROR"

# Problèmes courants:
1. DATABASE_URL mal formée → Vérifier la syntaxe
2. APP_KEY manquant → Générer avec key:generate
3. Port 8080 pas écouté → Vérifier Dockerfile
```

### Erreur: `Cannot connect to database`

**Cause:** Connection string ou credentials incorrects

**Solution:**
1. Copier exactement la connection string de PostgreSQL
2. Vérifier le mot de passe (caractères spéciaux!)
3. Tester localement: `psql connection_string`

### Erreur: `Frontend files not found`

**Cause:** Les fichiers ne sont pas copiés

**Solution:**
```bash
# Vérifier dans le repo
ls -la frontend/
ls -la frontend/css/
ls -la frontend/js/

# Vérifier le Dockerfile
grep "cp frontend" Dockerfile
# Doit avoir les bonnes commandes

# Redéployer
Dashboard → Manual Deploy
```

### Migrations ne s'exécutent pas

**Cause:** `RUN_MIGRATIONS=false` ou déjà exécutées

**Solution:**
```bash
# Ajouter la variable
RUN_MIGRATIONS=true

# Redéployer
Dashboard → Manual Deploy

# Vérifier les logs
Logs → Chercher "Exécution des migrations"
```

## 📊 Monitoring post-migration

### Éléments à monitorer

1. **Uptime:**
   - Vérifier que le service tourne 24/7
   - Utiliser une alerte: https://www.site24x7.com (gratuit)

2. **Performance:**
   - Render Dashboard → Metrics
   - Vérifier CPU < 50%, RAM < 300 MB

3. **Logs:**
   - Vérifier pas d'erreurs SQL
   - Chercher les patterns d'erreur

4. **Backups:**
   - PostgreSQL Render a backups automatiques (14 jours)
   - Configurerdes backups externes si nécessaire

## ✅ Checklist de migration

- [ ] Fichiers Render créés (render.yaml, .env.example)
- [ ] Dockerfile adapté (EXPOSE 8080)
- [ ] Port 8080 dans Apache config
- [ ] Railway service arrêté/documenté
- [ ] PostgreSQL Render créé
- [ ] Web Service Render créé
- [ ] Variables d'environnement complètes
- [ ] Migrations exécutées avec succès
- [ ] Frontend accessible et fonctionnel
- [ ] API endpoints testés
- [ ] Données migrated/vérifiées
- [ ] Railway archivé/supprimé
- [ ] Documentation mise à jour

## 🎉 Après la migration

Vous avez maintenant:
✅ Application sur Render (gratuit)
✅ PostgreSQL sur Render (gratuit)
✅ Domaine personnalisé possible
✅ SSL/HTTPS gratuit
✅ Auto-deploy depuis GitHub
✅ Better uptime (99.95%)
✅ Moins cher (Railway payant plus tard)

## 📞 Support

- Problèmes Render: https://render.com/docs
- Problèmes Laravel: https://laravel.com/docs
- Problèmes PostgreSQL: https://www.postgresql.org/docs

Bonne chance avec la migration! 🚀
