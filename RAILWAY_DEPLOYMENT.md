# 🚀 Déploiement MaMutuelle sur Railway

## 📋 Fichiers de configuration créés

- **`Procfile`** : Définit le processus web pour Railway
- **`start.sh`** : Script de démarrage avec vérifications d'erreur
- **`nixpacks.toml`** : Configuration Railpack pour PHP/Laravel

## 🏗️ Structure du projet

```
/
├── backend/          # API Laravel (point d'entrée)
├── frontend/         # Interface utilisateur
├── nixpacks.toml     # Configuration Railpack
├── Procfile         # Définition du processus Railway
├── start.sh         # Script de démarrage
└── docker-compose.yml
```

## 🚀 Déploiement

### 1. Préparation

Assurez-vous que :
- ✅ Les dépendances sont installées : `composer install` dans `backend/`
- ✅ Les clés sont configurées dans `backend/.env`
- ✅ Le fichier `start.sh` est exécutable

### 2. Déploiement sur Railway

1. **Connectez votre repository GitHub** à Railway
2. **Railway détectera automatiquement** :
   - Le langage PHP
   - Le fichier `nixpacks.toml`
   - Le script `start.sh`

3. **Ajoutez une base PostgreSQL** :
   - Dans Railway Dashboard → Add → Database → PostgreSQL
   - Railway créera automatiquement les variables d'environnement

### 3. Variables d'environnement

Railway définit automatiquement :
- `DATABASE_URL` - URL complète PostgreSQL
- `PORT` - Port d'écoute (défaut: 8000)

### 4. Migration de la base de données

Après déploiement, exécutez dans Railway :
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