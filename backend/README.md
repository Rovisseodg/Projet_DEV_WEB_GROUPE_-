# 🔧 MaMutuelle Backend - API Laravel

API REST complète pour le système de gestion de mutuelle MaMutuelle, développée avec Laravel 11 et PostgreSQL.

## 🚀 Démarrage rapide

### Prérequis
- PHP 8.1+
- Composer
- PostgreSQL 13+

### Installation

1. **Installer les dépendances**
   ```bash
   composer install
   ```

2. **Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:setup
   ```

3. **Base de données**
   ```bash
   # Créer la BD PostgreSQL
   createdb mamutuelle

   # Appliquer le schéma
   php setup.php
   ```

4. **Démarrer le serveur**
   ```bash
   php artisan serve
   ```

L'API sera accessible sur `http://localhost:8000/api`

## 📚 API Documentation

### 🔐 Authentification

#### Inscription
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "adherent"
}
```

#### Connexion
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Utilisation du token
```http
Authorization: Bearer {token}
```

### 👥 Gestion des Adhérents

#### Lister tous les adhérents
```http
GET /api/adherents
Authorization: Bearer {token}
```

#### Créer un adhérent
```http
POST /api/adherents
Authorization: Bearer {token}
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "telephone": "0123456789",
  "numero_adherent": "ADH001",
  "date_inscription": "2024-01-01"
}
```

### 💰 Gestion des Cotisations

#### Lister les cotisations
```http
GET /api/cotisations
Authorization: Bearer {token}
```

#### Créer une cotisation
```http
POST /api/cotisations
Authorization: Bearer {token}
Content-Type: application/json

{
  "adherent_id": 1,
  "montant": 50.00,
  "date_echeance": "2024-02-01"
}
```

### 💳 Gestion des Prêts

#### Lister les prêts
```http
GET /api/prets
Authorization: Bearer {token}
```

#### Créer un prêt
```http
POST /api/prets
Authorization: Bearer {token}
Content-Type: application/json

{
  "adherent_id": 1,
  "montant": 1000.00,
  "taux_interet": 2.5,
  "duree_mois": 12,
  "date_debut": "2024-01-01"
}
```

### 🏥 Gestion des Sinistres

#### Lister les sinistres
```http
GET /api/sinistres
Authorization: Bearer {token}
```

#### Déclarer un sinistre
```http
POST /api/sinistres
Authorization: Bearer {token}
Content-Type: application/json

{
  "adherent_id": 1,
  "description": "Consultation médicale",
  "date_sinistre": "2024-01-15",
  "type_sinistre": "maladie"
}
```

### 🚨 Alertes Système

#### Voir les alertes
```http
GET /api/alertes
Authorization: Bearer {token}
```

#### Statistiques des alertes
```http
GET /api/alertes/statistics
Authorization: Bearer {token}
```

### 📊 Statistiques Générales

```http
GET /api/stats
Authorization: Bearer {token}
```

## 🏗️ Architecture

### Modèles Eloquent

- **User** : Utilisateurs du système
- **Adherent** : Adhérents de la mutuelle
- **Cotisation** : Cotisations mensuelles
- **Pret** : Prêts accordés
- **Sinistre** : Sinistres déclarés
- **Prestation** : Prestations médicales
- **Alerte** : Système d'alertes

### Contrôleurs

- **AuthController** : Authentification JWT
- **AdherentController** : CRUD Adhérents
- **CotisationController** : CRUD Cotisations
- **PretController** : CRUD Prêts
- **SinistreController** : CRUD Sinistres
- **AlerteController** : Gestion des alertes

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Application
APP_NAME="MaMutuelle"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mamutuelle
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_TTL=60
JWT_REFRESH_TTL=20160
```

## 🧪 Tests

```bash
# Exécuter les tests
php artisan test

# Tests avec couverture
php artisan test --coverage
```

## 📦 Déploiement

### Avec Nixpacks (Railway, Render)

Le fichier `nixpacks.toml` est configuré pour PostgreSQL.

### Manuel

```bash
# Production
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🐛 Dépannage

### Erreur JWT
```bash
php artisan jwt:secret
php artisan config:clear
```

### Erreur Base de données
- Vérifier la connexion PostgreSQL
- Exécuter `php setup.php`

### Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## 📚 Ressources

- [Documentation Laravel](https://laravel.com/docs/11.x)
- [JWT Auth Documentation](https://jwt-auth.readthedocs.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**MaMutuelle Backend API** - Prêt pour la production ! 🚀