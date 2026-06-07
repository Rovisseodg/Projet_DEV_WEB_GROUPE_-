# 🚀 Déploiement MaMutuelle sur Railway

## 📋 Configuration Docker (RECOMMANDÉ)

Le projet utilise maintenant Docker pour un déploiement plus fiable :

- **`Dockerfile`** : Configuration Docker avec PHP 8.2 + Apache
- **`railway.json`** : Configuration Railway pour Docker
- **`.dockerignore`** : Optimisation du build Docker

Note: le projet contient un `Dockerfile` à la racine et un `Dockerfile` dans `backend/` (utilisé pour construire l'image PHP/Laravel). Le dépôt contient aussi un `docker-compose.yml` pour l'orchestration locale (app + postgres).

## 🏗️ Structure du projet

```
/
├── backend/          # API Laravel (artisan, public/, routes/, app/)
├── css/              # Styles frontend
├── js/               # Scripts frontend
├── Dockerfile        # Dockerfile racine (build global)
├── backend/Dockerfile# Dockerfile spécifique au service backend
├── docker-compose.yml# Orchestration locale (app + db)
├── railway.json      # Configuration Railway
└── *.html             # Pages frontend (index.html, login.html, dashboard.html...)
```

## 🚀 Déploiement

### 1. Préparation

Assurez-vous que :
- ✅ Les dépendances sont installées : `composer install` dans `backend/`
- ✅ Les clés sont configurées dans `backend/.env`
- ✅ Le `Dockerfile` est présent à la racine

### 2. Déploiement sur Railway

1. **Connectez votre repository GitHub** à Railway
2. **Railway détectera automatiquement** :
   - Le `Dockerfile` pour la construction
   - La base PostgreSQL sera provisionnée
   - Les variables d'environnement seront configurées

3. **Configuration automatique** :
   - Railway lira `railway.json`
   - Docker build sera exécuté
   - Base PostgreSQL sera créée

### 3. Variables d'environnement

Railway définit automatiquement :
- `DATABASE_URL` - URL complète PostgreSQL
- `APP_URL` - URL de l'application déployée
- `PORT` - Port d'écoute (80 dans Docker)

### 4. Architecture Déploiement

```
Railway App (Docker)
├── Frontend (HTML/CSS/JS) → Servi depuis /backend/public
├── Backend API (Laravel) → API REST avec JWT
└── Base de Données (PostgreSQL) → Auto-provisionnée
```

### 5. Points d'Accès

- **Application** : `https://your-app.railway.app/`
- **API** : `https://your-app.railway.app/api/`
- **Dashboard** : `https://your-app.railway.app/dashboard.html`

Note: selon la manière dont vous construisez l'image Docker, le frontend peut être servi depuis `backend/public/` ou directement depuis un serveur statique/ CDN. Si vous servez le frontend statiquement, adaptez la configuration Railway en conséquence.

### 6. Fonctionnalités

✅ Authentification JWT
✅ Gestion des adhérents
✅ Gestion des cotisations
✅ Gestion des prêts
✅ Gestion des sinistres
✅ Dashboard avec statistiques
✅ Interface responsive

### 7. Dépannage

**Si le déploiement échoue :**
1. Vérifiez les logs Railway
2. Assurez-vous que le `Dockerfile` est à la racine
3. Vérifiez que `railway.json` est présent
4. Testez localement : `docker build -t mamutuelle .`

**Variables d'environnement manquantes :**
- Railway devrait les définir automatiquement
- Vérifiez dans les settings du projet Railway
```bash
php artisan migrate
php artisan db:seed
```

## 🔧 Configuration personnalisée

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["php82", "composer"]

[phases.install]
cmds = ["cd backend && composer install --no-dev"]

[start]
cmd = "cd backend && php artisan serve --host=0.0.0.0 --port=$PORT"
```

### start.sh
Le script gère :
- Installation des dépendances
- Cache des configurations
- Migrations de base de données
- Démarrage du serveur

## 🌐 Accès à l'application

Après déploiement :
- **Backend API** : `https://your-app.railway.app/api/`
- **Frontend** : Servir statiquement ou via CDN

## 🐛 Dépannage

### Erreur "composer: command not found" ou "php: command not found"
- **Cause** : Railway n'arrive pas à localiser PHP/Composer
- **Solution** : Les fichiers `Procfile` et `nixpacks.toml` devraient résoudre ce problème
- **Vérification** : Assurez-vous que `Procfile` et `nixpacks.toml` sont à la racine

### Erreur "Application failed to respond"
- **Cause** : Le serveur Laravel ne démarre pas
- **Solution** : Vérifiez les logs Railway pour les erreurs spécifiques
- **Commande de debug** : Dans Railway, allez dans "Deployments" → "View Logs"

### Erreur de base de données
- **Cause** : Variables d'environnement incorrectes
- **Solution** : Vérifiez que PostgreSQL est bien attaché au service
- **Variables** : `DATABASE_URL` doit être définie automatiquement par Railway

### Erreur "Migration skipped - database not ready"
- **Cause** : Base de données pas encore disponible lors du déploiement
- **Solution** : Normale lors du premier déploiement, les migrations se feront automatiquement

## 📞 Support

Pour les problèmes de déploiement Railway :
- [Documentation Railway](https://docs.railway.app/)
- [Railpack Documentation](https://railpack.com/)
- Vérifiez les logs de déploiement dans Railway Dashboard