# ⚡ GUIDE DE DÉMARRAGE RAPIDE - 30 MINUTES

## 🎯 Objectif
Créer une **application MaMutuelle fonctionnelle en 30 minutes** avec backend Laravel et frontend HTML/CSS/JS.

---

## ✅ Prérequis (5 min d'installation)

```bash
# Windows/Mac/Linux - Installer si manquant:
✓ PHP 8.1+ (php -v)
✓ Composer (composer -V)
✓ Git (git --version)
✓ PostgreSQL 13+ (psql --version)
✓ Node.js (node --version) - Optional, for builds
```

Si manquant, installer depuis:
- PHP: https://windows.php.net/download/
- Composer: https://getcomposer.org/download/
- PostgreSQL: https://www.postgresql.org/download/

---

## 📦 ÉTAPE 1: Clone du Repo (2 min)

```bash
cd C:\Users\daleo\OneDrive\Bureau\MaMutuelle
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

---

## 🔧 ÉTAPE 2: Setup Backend Laravel (10 min)

### 2.1 Créer l'application Laravel

```bash
cd MaMutuelle
composer create-project laravel/laravel backend
cd backend
```

### 2.2 Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### 2.3 Configurer PostgreSQL dans .env

Ouvrir `backend/.env` et modifier:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mamutuelle
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 2.4 Créer la base de données

```bash
# Via PostgreSQL
createdb mamutuelle

# OU via psql
psql -U postgres
# Puis dans psql:
CREATE DATABASE mamutuelle;
\q
```

### 2.5 Créer les tables

Créer `backend/database/migrations/2024_01_01_000000_create_initial_tables.php`:

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Table adhérents
        Schema::create('adherents', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('telephone')->nullable();
            $table->string('numero_adherent')->unique();
            $table->date('date_inscription');
            $table->enum('statut', ['actif', 'suspendu', 'retraite']);
            $table->timestamps();
        });

        // Table cotisations
        Schema::create('cotisations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adherent_id')->constrained('adherents');
            $table->decimal('montant', 10, 2);
            $table->date('date_echeance');
            $table->date('date_paiement')->nullable();
            $table->enum('statut', ['payee', 'impayee', 'partielle']);
            $table->timestamps();
        });

        // Table prêts
        Schema::create('prets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adherent_id')->constrained('adherents');
            $table->decimal('montant', 10, 2);
            $table->decimal('taux_interet', 5, 2);
            $table->integer('duree_mois');
            $table->date('date_demande');
            $table->date('date_accord')->nullable();
            $table->enum('statut', ['demande', 'accepte', 'rejete', 'rembourse']);
            $table->timestamps();
        });

        // Table sinistres
        Schema::create('sinistres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('adherent_id')->constrained('adherents');
            $table->string('description');
            $table->date('date_sinistre');
            $table->decimal('montant_reclamation', 10, 2)->nullable();
            $table->decimal('montant_rembourse', 10, 2)->nullable();
            $table->enum('statut', ['declare', 'en_cours', 'accepte', 'rejete']);
            $table->timestamps();
        });

        // Table utilisateurs
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'agent', 'adherent']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adherents');
        Schema::dropIfExists('cotisations');
        Schema::dropIfExists('prets');
        Schema::dropIfExists('sinistres');
        Schema::dropIfExists('users');
    }
};
```

### 2.6 Exécuter les migrations

```bash
php artisan migrate
```

---

## 🎨 ÉTAPE 3: Setup Frontend (10 min)

### 3.1 Créer la structure frontend

```bash
cd C:\Users\daleo\OneDrive\Bureau\MaMutuelle
mkdir frontend
cd frontend
```

### 3.2 Créer index.html

Créer `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MaMutuelle - Gestion de Mutuelle</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="index.html">
                <strong style="color: #0066CC;">Ma</strong><strong style="color: #00AA55;">Mutuelle</strong>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#accueil">Accueil</a></li>
                    <li class="nav-item"><a class="nav-link" href="#adhérents">Adhérents</a></li>
                    <li class="nav-item"><a class="nav-link" href="#cotisations">Cotisations</a></li>
                    <li class="nav-item"><a class="nav-link" href="#prêts">Prêts</a></li>
                    <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="accueil">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1>Bienvenue chez <strong style="color: #0066CC;">Ma</strong><strong style="color: #00AA55;">Mutuelle</strong></h1>
                    <p class="lead">Gestion simplifiée de votre mutuelle, adhérents, cotisations, prêts et sinistres.</p>
                    <a href="login.html" class="btn btn-primary btn-lg">Commencer</a>
                </div>
                <div class="col-md-6">
                    <img src="https://via.placeholder.com/400" alt="Illustration" class="img-fluid">
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">Nos Fonctionnalités</h2>
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="feature-card">
                        <h5>👥 Adhérents</h5>
                        <p>Gestion complète des adhérents et ayants droit</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="feature-card">
                        <h5>💰 Cotisations</h5>
                        <p>Suivi des paiements et alertes automatiques</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="feature-card">
                        <h5>🏦 Prêts</h5>
                        <p>Demandes et gestion des remboursements</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="feature-card">
                        <h5>📋 Sinistres</h5>
                        <p>Déclaration et suivi des sinistres</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4">
        <div class="container text-center">
            <p>&copy; 2026 MaMutuelle. Tous droits réservés.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/script.js"></script>
</body>
</html>
```

### 3.3 Créer CSS personnalisé

Créer `frontend/css/style.css`:

```css
:root {
    --primary: #0066CC;
    --secondary: #00AA55;
    --light: #F5F5F5;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: #FFFFFF;
}

.navbar {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    padding: 100px 0;
}

.hero h1 {
    font-size: 3rem;
    font-weight: bold;
}

.feature-card {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.btn-primary {
    background-color: var(--primary);
    border-color: var(--primary);
}

.btn-primary:hover {
    background-color: #004499;
}

footer {
    background-color: #1a1a1a;
}
```

### 3.4 Créer JavaScript

Créer `frontend/js/script.js`:

```javascript
// MaMutuelle Frontend Script
console.log('MaMutuelle App Loaded');

// API Base URL
const API_URL = 'http://localhost:8000/api';

// Fonction pour récupérer les adhérents
async function getAdherents() {
    try {
        const response = await fetch(`${API_URL}/adherents`);
        const data = await response.json();
        console.log('Adhérents:', data);
        return data;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Fonction login
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Login successful');
        }
        return data;
    } catch (error) {
        console.error('Erreur login:', error);
    }
}

// Export
window.MaMutuelle = { getAdherents, login };
```

---

## 🚀 ÉTAPE 4: Lancer l'Application (3 min)

### Terminal 1: Backend

```bash
cd C:\Users\daleo\OneDrive\Bureau\MaMutuelle\backend
php artisan serve
```

Output:
```
Laravel development server started: http://127.0.0.1:8000
```

### Terminal 2: Frontend (Optional - pour serveur local)

```bash
cd C:\Users\daleo\OneDrive\Bureau\MaMutuelle\frontend
# Si vous avez Python 3:
python -m http.server 8001

# Ou avec PHP:
php -S localhost:8001
```

### Accéder à l'app

- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:8001 (ou ouvrir `frontend/index.html` directement)

---

## ✅ Vérifications (3 min)

```bash
# ✓ Base de données créée?
psql -U postgres -l | grep mamutuelle

# ✓ Tables créées?
psql mamutuelle -c "\dt"

# ✓ Backend tourne?
curl http://localhost:8000

# ✓ Frontend charge?
# Ouvrir http://localhost:8001 dans le navigateur
```

---

## 📝 Prochaines Étapes

1. ✅ **Créer API endpoints** (routes Laravel)
2. ✅ **Créer les contrôleurs** (CRUD pour adhérents)
3. ✅ **Implémenter l'authentification** (JWT)
4. ✅ **Créer les pages frontend** (dashboard, listing, etc.)
5. ✅ **Tests & validation**
6. ✅ **Déploiement** (Railway.app)

---

## 🆘 Troubleshooting

### Erreur: `SQLSTATE[08006]`
→ PostgreSQL n'est pas lancé. Redémarrer le service.

### Erreur: `PHP not found`
→ Ajouter PHP au PATH ou utiliser le chemin complet.

### Port 8000 déjà utilisé
```bash
php artisan serve --port=8001
```

### Base de données vide après migration
```bash
php artisan migrate:refresh --seed
```

---

**🎉 Vous avez une application MaMutuelle fonctionnelle!**

Prochaine étape: Lire `docs/RAPPORT_PROJET.md` pour les détails techniques complets.
