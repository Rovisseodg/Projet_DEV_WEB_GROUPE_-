# Migration vers PostgreSQL - Guide d'Installation

## Modifications effectuées

Le projet a été adapté pour utiliser **PostgreSQL** au lieu de SQLite.

### 📝 Fichiers modifiés :

1. **`backend/config/database.php`** - Déjà configuré pour PostgreSQL
2. **`backend/setup.php`** - Mis à jour pour utiliser PostgreSQL
3. **`backend/check_db.php`** - Mis à jour pour utiliser PostgreSQL
4. **`backend/add_alerts.php`** - Mis à jour pour utiliser PostgreSQL
5. **`database/schema.sql`** - Converti de MySQL vers PostgreSQL
6. **`backend/.env.example`** - Nouveau fichier de configuration

---

## 🚀 Installation PostgreSQL

### Prérequis

- PostgreSQL 12+ installé et en cours d'exécution
- PHP 8.0+ avec support PDO PostgreSQL
- Composer installé

### Étapes d'installation

#### 1. **Créer la base de données PostgreSQL**

```bash
# Accéder à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE mamutuelle;

# Vérifier la création
\l

# Quitter
\q
```

#### 2. **Configurer les variables d'environnement**

Créer un fichier `.env` à partir de `.env.example` :

```bash
cp backend/.env.example backend/.env
```

Éditer `backend/.env` avec vos identifiants PostgreSQL :

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=mamutuelle
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
```

#### 3. **Installer les dépendances**

```bash
cd backend
composer install
```

#### 4. **Initialiser le schéma de la base de données**

```bash
# Exécuter le script de configuration
php setup.php
```

Résultat attendu :
```
✓ Tables créées avec succès!
✓ Schéma PostgreSQL appliqué
✓ Données d'initialisation insérées
```

#### 5. **Vérifier la connexion**

```bash
# Tester la connexion
php check_db.php
```

Résultat attendu :
```
✓ Connexion PostgreSQL réussie
Date d'aujourd'hui: YYYY-MM-DD

Cotisations en BD:
ID: 1, Adhérent: 1, Date: 2024-02-01, Statut: en attente
```

---

## 📊 Structure de la Base de Données

### Tables principales :

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs du système |
| `adherents` | Adhérents de la mutuelle |
| `ayants_droit` | Personnes à charge |
| `cotisations` | Cotisations mensuelles |
| `prets` | Prêts accordés |
| `remboursements_prets` | Échéances de remboursement |
| `sinistres` | Sinistres déclarés |
| `prestations` | Prestations accordées |
| `alertes` | Alertes système |
| `audit_logs` | Logs d'audit |

---

## 🔄 Changements clés par rapport à SQLite

### 1. **Types de données**
- `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
- `DECIMAL` → `NUMERIC`
- `TEXT` → `VARCHAR` ou `TEXT`

### 2. **Fonctions de date/heure**
- `datetime("now")` → `NOW()`
- `CURRENT_TIMESTAMP` (compatible)

### 3. **Syntaxe des clés étrangères**
PostgreSQL supporte mieux les contraintes de clés étrangères avec `ON DELETE CASCADE`

### 4. **Indexes**
Les indexes sont maintenant explicitement créés pour de meilleures performances

---

## 🧪 Ajouter des données de test

```bash
php add_alerts.php
```

Cela ajoutera des cotisations en retard pour tester le système.

---

## 🔧 Commandes utiles PostgreSQL

```bash
# Se connecter à la base de données
psql -U postgres -d mamutuelle

# Lister les tables
\dt

# Afficher la structure d'une table
\d adherents

# Exécuter un fichier SQL
psql -U postgres -d mamutuelle -f database/schema.sql

# Sauvegarder la base de données
pg_dump -U postgres mamutuelle > backup_mamutuelle.sql

# Restaurer à partir d'une sauvegarde
psql -U postgres mamutuelle < backup_mamutuelle.sql
```

---

## ⚠️ Notes importantes

- **Port PostgreSQL** : Le port par défaut est `5432`
- **Utilisateur par défaut** : `postgres`
- **Droits d'accès** : Assurez-vous que l'utilisateur PostgreSQL a les permissions nécessaires
- **Performance** : PostgreSQL est plus performant que SQLite pour les applications multi-utilisateurs
- **Sauvegardes** : Mettez en place un système de sauvegarde régulière

---

## 🐛 Dépannage

### Erreur : "Connection refused"
- Vérifiez que PostgreSQL est en cours d'exécution
- Vérifiez l'adresse IP et le port dans `.env`

### Erreur : "FATAL: role "postgres" does not exist"
- Créez l'utilisateur PostgreSQL approprié
- Modifiez `DB_USERNAME` dans `.env`

### Erreur : "database "mamutuelle" does not exist"
- Exécutez : `CREATE DATABASE mamutuelle;`
- Relancez le script `setup.php`

---

## 📞 Support

Pour plus d'informations sur PostgreSQL, consultez la [documentation officielle](https://www.postgresql.org/docs/).
