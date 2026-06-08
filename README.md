# MaMutuelle Repository

## 🚀 Démarrage Rapide

```bash
git clone https://github.com/USERNAME/MaMutuelle.git
cd MaMutuelle
```

Lire: `docs/GUIDE_DEMARRAGE_RAPIDE.md`

## 📁 Structure (vue d'ensemble)

Le dépôt contient à la fois une application frontend statique (HTML/CSS/JS) et une API Laravel dans le dossier `backend/`. Les fichiers sont bien organisés par fonction.

```
MaMutuelle/
├── backend/                 # Laravel PHP API (artisan, composer.json, routes/, app/, public/)
├── frontend/                # Tous les fichiers frontend
│   ├── css/                # Styles frontend (login.css, dashboard.css, etc.)
│   ├── js/                 # Scripts frontend (api.js, dashboard.js, etc.)
│   ├── tests/              # Fichiers de test HTML
│   ├── index.html          # Page d'accueil
│   ├── login.html          # Authentification
│   ├── register.html       # Inscription
│   ├── dashboard.html      # Tableau de bord
│   └── adherent-dashboard.html  # Tableau de bord des adhérents
├── database/                # Schémas SQL & scripts de seed (schema.sql, seed-data.sql)
├── docs/                    # Documentation complète et guides
├── scripts/                 # Scripts d'infrastructure (seeding, déploiement, etc.)
├── Dockerfile               # Dockerfile (optimisé pour Render port 8080)
├── docker-compose.yml       # Orchestration locale (services: app, db, pgadmin)
├── render.yaml              # ⭐ Configuration Render (déploiement automatique)
├── .env.example             # Template variables d'environnement
├── package.json             # Dépendances du projet
├── railway.json             # ℹ️ Configuration Railway (archivée - voir docs/RAILWAY_DEPLOYMENT.md)
└── README.md                # Ce fichier
```

## 🛠 Stack

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js (pages dans `frontend/` avec assets dans `frontend/css/` et `frontend/js/`)
- **Backend:** PHP 8.x, Laravel (dossier `backend/`), JWT Auth possible via package
- **Database:** PostgreSQL 15+
- **Déploiement:** 🎯 **Render** (recommandé - gratuit + PostgreSQL gratuit)

## 🚀 Déploiement

### 📌 Render (RECOMMANDÉ)

```bash
# ⚡ Déploiement rapide (5 min):
# Voir: RENDER_QUICKSTART.md

# 📖 Guide complet (30 min - toutes les étapes):
# Voir: docs/DEPLOYMENT_RENDER.md

# 🔄 Migration depuis Railway:
# Voir: docs/MIGRATION_RAILWAY_TO_RENDER.md
```

**Coût:** 🆓 **Gratuit** (plan Free + PostgreSQL gratuit)
**Temps:** ⏱️ 5-10 minutes

### ℹ️ Ancienne configuration (Railway - archivée)

- Voir: `docs/RAILWAY_DEPLOYMENT.md` pour les archives
- Migration vers Render: `docs/MIGRATION_RAILWAY_TO_RENDER.md`

## 📖 Documentation

- **⚡ [RENDER_QUICKSTART.md](RENDER_QUICKSTART.md)** - **Déploiement rapide (5 min)**
- **[DEPLOYMENT_RENDER.md](docs/DEPLOYMENT_RENDER.md)** ⭐ - **Guide complet Render**
- **[MIGRATION_RAILWAY_TO_RENDER.md](docs/MIGRATION_RAILWAY_TO_RENDER.md)** - Migration depuis Railway
- [GUIDE_DEMARRAGE_RAPIDE.md](docs/GUIDE_DEMARRAGE_RAPIDE.md) - Setup local avec Docker
- [MIGRATION_POSTGRESQL.md](docs/MIGRATION_POSTGRESQL.md) - Migration BD
- [RAPPORT_PROJET.md](docs/RAPPORT_PROJET.md) - Specs complètes
- [GUIDE_HEBERGEMENT.md](docs/GUIDE_HEBERGEMENT.md) - Déploiement général
- [RAILWAY_DEPLOYMENT.md](docs/RAILWAY_DEPLOYMENT.md) - Archives Railway

## ⚠️ **État du Projet - Éléments Manquants**

### ✅ **DÉJÀ IMPLÉMENTÉ**
- ✅ API Laravel REST complète avec JWT
- ✅ Interface frontend responsive
- ✅ Base de données PostgreSQL
- ✅ Authentification et autorisation
- ✅ CRUD pour tous les modules métier

### ❌ **À COMPLÉTER (CRITIQUE)**

#### 1. **Tests (URGENT)**
```bash
cd backend
php artisan make:test AuthTest --feature
php artisan make:test AdherentTest --feature
php artisan test
```

#### 2. **Migrations Laravel**
```bash
cd backend
php artisan migrate  # Au lieu du script SQL manuel
php artisan db:seed  # Données de test
```

#### 3. **Sécurité Avancée**
- CORS configuration
- Rate limiting
- Validation renforcée
- Logs de sécurité

#### 4. **API Documentation**
```bash
composer require darkaonline/l5-swagger
php artisan l5-swagger:generate
# Accès: /api/documentation
```

#### 5. **CI/CD Complet**
- Tests automatisés
- Analyse de code (PHPStan)
- Déploiement automatique

### 🎯 **Commandes Prioritaires**

```bash
# 1. Tests
cd backend && php artisan make:test AuthTest --feature

# 2. Migrations
php artisan migrate:fresh --seed

# 3. Sécurité
composer require fruitcake/laravel-cors

# 4. Documentation API
composer require darkaonline/l5-swagger
php artisan l5-swagger:generate

# 5. Lancer les tests
php artisan test
```

**📋 Checklist complet:** [CHECKLIST_COMPLETION.md](docs/CHECKLIST_COMPLETION.md)

---

## 👥 Équipe

- Lead: @username
- Backend: @dev1, @dev2
- Frontend: @dev3, @dev4
- DevOps: @devops

## 📅 Timeline

- ✅ Migration PostgreSQL
- ✅ Réorganisation structure
- Week 1-2: Backend core
- Week 3-4: Frontend
- Week 5: Security & tests
- Week 6: Deployment

## 🔐 Sécurité

- JWT authentication
- RBAC (3 roles)
- Bcrypt password hashing
- HTTPS enforced
- OWASP Top 10 compliant

## 💬 Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Docs: Lire les fichiers MD

---

**Let's build MaMutuelle! 🎉**
