# 🚀 Installation et Configuration Laravel - MaMutuelle

## Prérequis

Avant d'installer Laravel, assurez-vous d'avoir :

- **PHP 8.1+** installé
- **Composer** (gestionnaire de dépendances PHP)
- **PostgreSQL 13+** installé et configuré
- **Git** pour le versioning

### Vérification des prérequis

```bash
# Vérifier PHP
php --version

# Vérifier Composer
composer --version

# Vérifier PostgreSQL
psql --version
```

---

## 📦 Installation de Laravel

### 1. Installer les dépendances PHP

```bash
# Extensions PHP nécessaires
composer require tymon/jwt-auth
composer require doctrine/dbal
```

### 2. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Générer la clé JWT
php artisan jwt:secret
```

### 3. Configuration de la base de données

Éditez le fichier `.env` :

```env
# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mamutuelle
DB_USERNAME=votre_username
DB_PASSWORD=votre_password

# Application
APP_NAME="MaMutuelle"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# JWT
JWT_SECRET=votre_clé_jwt
```

### 4. Créer la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE mamutuelle;

# Quitter
\q
```

### 5. Exécuter les migrations et seeders

```bash
# Appliquer le schéma
php backend/setup.php

# Ou alternativement avec Artisan (si migrations créées)
php artisan migrate
php artisan db:seed
```

---

## 🏗️ Structure du projet Laravel

```
backend/
├── app/
│   ├── Http/Controllers/     # Contrôleurs API
│   ├── Models/              # Modèles Eloquent
│   └── ...
├── config/                  # Configuration
├── database/                # Migrations et seeders
├── routes/
│   ├── api.php             # Routes API
│   └── web.php             # Routes web
├── resources/              # Vues et assets
├── storage/                # Fichiers temporaires
├── tests/                  # Tests
├── .env                    # Configuration environnement
├── artisan                 # Console Laravel
└── composer.json           # Dépendances
```

---

## 🔧 Configuration des contrôleurs

### AuthController - Authentification

- `register()` : Inscription utilisateur
- `login()` : Connexion utilisateur
- `me()` : Informations utilisateur connecté

### Ressource Controllers

- **AdherentController** : Gestion des adhérents
- **CotisationController** : Gestion des cotisations
- **PretController** : Gestion des prêts
- **SinistreController** : Gestion des sinistres
- **AlerteController** : Alertes système

---

## 📊 Modèles Eloquent

### Relations définies :

```php
// User
$user->adherent() // hasOne

// Adherent
$adherent->cotisations() // hasMany
$adherent->prets() // hasMany
$adherent->sinistres() // hasMany
$adherent->ayantsDroit() // hasMany

// Cotisation
$cotisation->adherent() // belongsTo

// Pret
$pret->adherent() // belongsTo
$pret->remboursements() // hasMany

// Sinistre
$sinistre->adherent() // belongsTo
$sinistre->prestations() // hasMany
```

---

## 🌐 Routes API

### Routes d'authentification
```
POST   /api/register
POST   /api/login
GET    /api/me
```

### Routes ressources
```
GET    /api/adherents
POST   /api/adherents
GET    /api/adherents/{id}
PUT    /api/adherents/{id}
DELETE /api/adherents/{id}
```

### Routes spéciales
```
GET    /api/alertes
GET    /api/alertes/statistics
GET    /api/stats
```

---

## 🚀 Démarrage du serveur

```bash
# Démarrer le serveur de développement
php artisan serve

# Le serveur sera accessible sur http://localhost:8000
```

---

## 🧪 Tests de l'API

### Test d'authentification

```bash
# Inscription
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'

# Connexion
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

### Test des ressources

```bash
# Lister les adhérents
curl http://localhost:8000/api/adherents

# Créer un adhérent
curl -X POST http://localhost:8000/api/adherents \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "telephone": "0123456789",
    "numero_adherent": "ADH001",
    "date_inscription": "2024-01-01"
  }'
```

---

## 🔐 Authentification JWT

L'API utilise JWT pour l'authentification :

1. **Inscription/Connexion** retourne un token
2. **Utiliser le token** dans les headers :
   ```
   Authorization: Bearer {token}
   ```

### Middleware d'authentification

```php
// Dans routes/api.php
Route::middleware('auth:api')->get('/me', [AuthController::class, 'me']);
```

---

## 📈 Statistiques et alertes

### Statistiques générales
```
GET /api/stats
```
Retourne :
```json
{
  "adherents_total": 150,
  "cotisations_payees": 1200,
  "prets_actifs": 45,
  "sinistres_en_cours": 12
}
```

### Alertes système
```
GET /api/alertes
```
Retourne les cotisations en retard et prêts arrivant à échéance.

---

## 🐛 Dépannage

### Erreur "Class not found"
```bash
composer dump-autoload
```

### Erreur de base de données
- Vérifiez la configuration dans `.env`
- Assurez-vous que PostgreSQL est démarré
- Vérifiez les permissions utilisateur

### Erreur JWT
```bash
php artisan jwt:secret
```

### Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

---

## 📚 Ressources supplémentaires

- [Documentation Laravel](https://laravel.com/docs)
- [Documentation JWT Auth](https://jwt-auth.readthedocs.io/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)

---

## 🎯 Prochaines étapes

1. ✅ Installation Laravel
2. ✅ Configuration base de données
3. ⏳ Tests fonctionnels
4. ⏳ Intégration frontend
5. ⏳ Déploiement production

Le backend Laravel est maintenant **prêt à être utilisé** ! 🚀