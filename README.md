# MaMutuelle Repository

## 🚀 Démarrage Rapide

```bash
git clone https://github.com/USERNAME/MaMutuelle.git
cd MaMutuelle
```

Lire: `docs/GUIDE_DEMARRAGE_RAPIDE.md`

## 📁 Structure

```
MaMutuelle/
├── backend/             # Laravel PHP API
├── frontend/            # HTML/CSS/JavaScript
├── database/            # Schémas SQL & migrations
├── docs/                # Documentation complète
└── .github/workflows/   # CI/CD (si configuré)
```

## 🛠 Stack

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js
- **Backend:** PHP 8.1+, Laravel 11, JWT Auth
- **Database:** PostgreSQL 13+
- **Déploiement:** Compatible Nixpacks, Railway, Heroku

## 📖 Documentation

- [GUIDE_DEMARRAGE_RAPIDE.md](docs/GUIDE_DEMARRAGE_RAPIDE.md) - Setup complet
- [MIGRATION_POSTGRESQL.md](docs/MIGRATION_POSTGRESQL.md) - Migration BD
- [RAPPORT_PROJET.md](docs/RAPPORT_PROJET.md) - Specs complètes
- [GUIDE_HEBERGEMENT.md](docs/GUIDE_HEBERGEMENT.md) - Déploiement

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
