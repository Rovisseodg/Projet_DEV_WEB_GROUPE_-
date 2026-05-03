# 🚀 Déploiement MaMutuelle sur Railway

## 📋 Prérequis

- Compte Railway (https://railway.app)
- Base de données PostgreSQL sur Railway

## 🏗️ Structure du projet

```
/
├── backend/          # API Laravel
├── frontend/         # Interface utilisateur
├── nixpacks.toml     # Configuration Railway
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

### Erreur "Script start.sh not found"
- Vérifiez que `start.sh` est à la racine
- Assurez-vous qu'il est exécutable : `chmod +x start.sh`

### Erreur de base de données
- Vérifiez les variables `DATABASE_URL`
- Exécutez manuellement : `php artisan migrate`

### Erreur de dépendances
- Vérifiez que `composer.lock` est présent
- Relancez le déploiement

## 📞 Support

Pour les problèmes de déploiement Railway :
- [Documentation Railway](https://docs.railway.app/)
- [Railpack Documentation](https://railpack.com/)