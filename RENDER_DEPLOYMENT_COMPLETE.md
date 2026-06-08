# 🚀 Render Deployment - Guide Complet

## ⏱️ Temps estimé: 15 minutes

---

## 📋 Prérequis

- ✅ Compte Render gratuit: https://render.com/register
- ✅ Repository Github connecté (vous l'avez déjà)
- ✅ `render.yaml` dans le repo (✅ présent)
- ✅ `Dockerfile` configuré (✅ présent)
- ✅ `database.sql` consolidé (✅ présent)

---

## 🎯 Vue d'ensemble du plan

```
Étape 1: Créer PostgreSQL sur Render          (3 min)
         ↓
Étape 2: Configurer Web Service              (5 min)
         ↓
Étape 3: Ajouter variables d'environnement   (3 min)
         ↓
Étape 4: Déclencher le déploiement           (1 min)
         ↓
Étape 5: Initialiser la base de données      (2 min)
         ↓
Étape 6: Tester l'application                (1 min)
```

---

## ✅ Étape 1: Créer PostgreSQL sur Render (3 min)

### 1.1 Ouvrir le Dashboard Render

1. Allez à: https://dashboard.render.com
2. Connectez-vous avec votre compte
3. Cliquez **+ New** en haut à droite
4. Sélectionnez **PostgreSQL**

### 1.2 Configurer la base de données

Remplissez les champs comme suit:

```
┌─────────────────────────────────────────┐
│ PostgreSQL Configuration                │
├─────────────────────────────────────────┤
│ Name:           mamutuelle-db           │
│ Database:       mamutuelle              │
│ User:           mamutuelle_user         │
│ Region:         Frankfurt (ou Oregon)   │
│ PostgreSQL:     15                      │
│ Plan:           Free                    │
└─────────────────────────────────────────┘
```

> ℹ️ **Important**: Notez la région choisie (Frankfurt ou Oregon) - vous devrez utiliser la MÊME région pour le Web Service!

### 1.3 Créer la base de données

1. Cliquez **Create Database**
2. ⏳ Attendez 1-2 minutes (la base se crée)
3. Quand c'est prêt, la page affichera:
   ```
   ✅ Database created
   ```

### 1.4 Copier la connection string

Cette page affiche la **Internal Connection String**:

```
postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle
```

📌 **COPIER ET SAUVEGARDER** cette chaîne - vous en aurez besoin dans Étape 3!

---

## ✅ Étape 2: Créer Web Service (5 min)

### 2.1 Nouvelle Web Service

1. Retournez au Dashboard: https://dashboard.render.com
2. Cliquez **+ New**
3. Sélectionnez **Web Service**

### 2.2 Connecter GitHub

1. **Connect account** → Sélectionnez votre GitHub
2. **Authorize Render** (si demandé)
3. **Sélectionnez le repository**: `Projet_DEV_WEB_GROUPE_-`
4. ✅ Confirmez

### 2.3 Configuration du Service

Remplissez les champs:

```
┌──────────────────────────────────────────┐
│ Web Service Configuration                │
├──────────────────────────────────────────┤
│ Name:          mamutuelle-api            │
│ Runtime:       Docker                    │
│ Region:        MÊME QUE BD (important!) │
│ Branch:        master                    │
│ Dockerfile:    ./Dockerfile              │
│ Build Command: echo 'Using Docker'       │
│ Start Command: /usr/local/bin/start.sh   │
│ Plan:          Free                      │
│ Auto-deploy:   Yes                       │
└──────────────────────────────────────────┘
```

> ⚠️ **TRÈS IMPORTANT**: Utilisez la MÊME région que PostgreSQL!
> Par exemple: Si BD = Frankfurt, Web Service = Frankfurt

### 2.4 Advanced Settings

⚙️ Avant de créer, ouvrez les paramètres avancés:

1. Cliquez sur **Advanced**
2. Cherchez **Max Instances** et **Min Instances**
3. Mettez les deux à **1** (plan Free)

---

## ✅ Étape 3: Variables d'Environnement (3 min)

### 3.1 Préparer les variables

Vous avez besoin de:

1. **DATABASE_URL** → Copié à l'Étape 1.4
2. **APP_KEY** → Générer avec Laravel
3. **JWT_SECRET** → Chaîne aléatoire sécurisée

### 3.2 Générer APP_KEY

```bash
# En local (terminal), allez au dossier backend:
cd backend
php artisan key:generate --show
```

Cela affiche quelque chose comme:
```
base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

📌 **COPIER** cette clé complète (avec "base64:" au début)

### 3.3 Générer JWT_SECRET

```bash
# Option 1: Générer avec openssl (recommandé)
openssl rand -hex 32

# Option 2: Utiliser un générateur en ligne
# https://www.random.org/strings/?num=1&len=32&digits=on&upperalpha=on&loweralpha=on

# Exemple de résultat:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

📌 **COPIER** cette chaîne

### 3.4 Ajouter les variables dans Render

De retour au formulaire de création du Web Service:

1. Scrollez jusqu'à **Environment Variables**
2. Cliquez **Add Environment Variable** autant de fois que nécessaire
3. Remplissez EXACTEMENT comme suit:

```
┌─────────────────────────────────────────────────────────┐
│ Environment Variables                                   │
├──────────────┬──────────────────────────────────────────┤
│ KEY          │ VALUE                                    │
├──────────────┼──────────────────────────────────────────┤
│ APP_ENV      │ production                               │
│ APP_DEBUG    │ false                                    │
│ APP_URL      │ https://mamutuelle-api.onrender.com     │
│ APP_KEY      │ base64:VOTRE_CLE_ARTISAN                │
│              │                                          │
│ DATABASE_URL │ postgresql://USER:PASS@HOST:5432/BD    │
│              │ (Copié à Étape 1.4)                      │
│              │                                          │
│ JWT_SECRET   │ VOTRE_CLE_ALEATOIRE_32_CHARS            │
│ JWT_TTL      │ 60                                       │
│ JWT_REFRESH  │ 20160                                    │
│ JWT_ALGO     │ HS256                                    │
│              │                                          │
│ RUN_MIGR     │ true                                     │
└──────────────┴──────────────────────────────────────────┘
```

> 💡 **Exemple complet de DATABASE_URL:**
> ```
> postgresql://mamutuelle_user:sup3rS3cur3P@ss@postgres.c2.render.com:5432/mamutuelle
> ```

---

## ✅ Étape 4: Créer et Déployer (2 min)

### 4.1 Lancer le déploiement

1. **Vérifiez** que toutes les variables sont correctes
2. Cliquez **Create Web Service**
3. ⏳ Render va:
   - Cloner le repo
   - Construire l'image Docker
   - Lancer le conteneur
   - Déployer l'application

### 4.2 Surveiller le déploiement

Vous verrez l'écran **Logs**:

```
📋 Deployment Logs:
─────────────────────────────────────────
Building Docker image...
[████████████████] 100%
Pushing image to registry...
[████████████████] 100%
Running container...
✅ Deploying app...
Apache started on port 8080
✅ Service is live at:
   https://mamutuelle-api.onrender.com
```

> ✅ Si vous voyez "Service is live", c'est bon! Passez à Étape 5.

---

## ✅ Étape 5: Initialiser la Base de Données (2 min)

### 5.1 Accéder à PostgreSQL

1. Retournez au PostgreSQL dans Render Dashboard
2. Cherchez **External Connection String**:
   ```
   postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle
   ```

### 5.2 Initialiser les données

**Option A: Via pgAdmin (recommandé pour débutants)**

1. Ouvrez pgAdmin localement: http://localhost:5050
2. Connectez-vous (admin@pgadmin.org / admin)
3. **Ajouter un serveur**:
   ```
   Name: Render-MaMutuelle
   Host: [HOST de Render]
   Port: 5432
   User: mamutuelle_user
   Password: [PASSWORD de Render]
   ```
4. **Exécuter le script**:
   - Clic droit → Query Tool
   - File → Open → `database/database.sql`
   - Execute (F5)

**Option B: Via terminal (Linux/Mac)**

```bash
# Exécuter directement
DATABASE_URL="postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle" \
psql $DATABASE_URL < database/database.sql
```

**Option C: Via Render CLI**

```bash
# Si vous avez installé Render CLI
render deploy --name mamutuelle-api
```

### 5.3 Vérifier

Après exécution, vous devriez voir:
```
✅ 10 tables créées
✅ 100+ records insérés
✅ Indices créés
✅ Données vérifiées
```

---

## ✅ Étape 6: Tester l'Application (2 min)

### 6.1 Test de l'API

```bash
# Tester l'endpoint API
curl https://mamutuelle-api.onrender.com/api

# Résultat attendu:
# {"status":"ok","message":"MaMutuelle API"}
```

### 6.2 Tester la connexion

```bash
# URL: https://mamutuelle-api.onrender.com
# Utilisateur: admin@mamutuelle.bf
# Mot de passe: [Voir credentials dans database.sql]
```

### 6.3 Vérifier les logs

1. Dashboard Render → mamutuelle-api
2. Cherchez **Logs** en bas
3. Vous devriez voir:
   ```
   ✅ Database connected
   ✅ Server running on :8080
   ✅ Ready for requests
   ```

---

## 🔧 Troubleshooting

### ❌ "Error: Connection refused"

```
Solution:
1. Vérifier DATABASE_URL dans variables
2. Vérifier que PostgreSQL est démarrée
3. Vérifier la région (PostgreSQL ≠ Web Service)
4. Attendre 2 minutes (Render peut être lent)
```

### ❌ "Error: No such file or directory: start.sh"

```
Solution:
1. Vérifier que start.sh existe dans /usr/local/bin/
2. Dans Dockerfile, vérifier: COPY scripts/start.sh /usr/local/bin/
3. Rebuild et redeploy
```

### ❌ "Error: App Key not set"

```
Solution:
1. Générer APP_KEY: php artisan key:generate --show
2. Ajouter la variable complète (avec "base64:")
3. Redeploy
```

### ❌ "Error: Database does not exist"

```
Solution:
1. Exécuter database.sql sur Render PostgreSQL
2. Vérifier que database.sql a bien 10 tables
3. Checker les logs de la Web Service
```

---

## 📊 Vue d'ensemble post-déploiement

### URLs
- **API**: `https://mamutuelle-api.onrender.com/api`
- **Dashboard**: `https://mamutuelle-api.onrender.com`
- **pgAdmin** (local): `http://localhost:5050`

### Credentials

| Type | Email | Password |
|------|-------|----------|
| Admin | admin@mamutuelle.bf | bcrypt (voir database.sql) |
| Agent | agent@mamutuelle.bf | bcrypt (voir database.sql) |
| User | kone.oumar@email.bf | bcrypt (voir database.sql) |

### Base de données

| Property | Value |
|----------|-------|
| Type | PostgreSQL 15 |
| Host | postgres.c2.render.com (ou autre) |
| Database | mamutuelle |
| User | mamutuelle_user |
| Tables | 10 |
| Records | 100+ |

---

## 🔒 Sécurité - Actions recommandées

### En production (Important!)

```sql
-- 1. Changer les passwords de test
UPDATE users 
SET password = bcrypt_hash('NEW_PASSWORD') 
WHERE email = 'admin@mamutuelle.bf';

-- 2. Désactiver les comptes de test
UPDATE users 
SET active = false 
WHERE email LIKE '%test%' OR email = 'kone.oumar@email.bf';

-- 3. Activer les sauvegardes
-- (Dans Render Dashboard → PostgreSQL → Backups)

-- 4. Configurer SSL/TLS
-- (Render le fait automatiquement)
```

### Checklist de sécurité

- [ ] APP_KEY généré et stocké
- [ ] JWT_SECRET généré avec openssl
- [ ] Passwords changés
- [ ] Sauvegardes activées
- [ ] Logs configurés
- [ ] HTTPS activé (automatique sur Render)

---

## ✅ Validation finale

Checklist de vérification:

- [x] PostgreSQL créée sur Render
- [x] Web Service créée sur Render
- [x] Variables d'environnement définies
- [x] Déploiement lancé et réussi
- [x] Base de données initialisée
- [x] API testée et fonctionnelle
- [x] Logs affichent "Ready for requests"

---

## 🎉 Bravo!

Votre application est maintenant **déployée sur Render en production**!

### Prochaines étapes recommandées:

1. **Configurer un domaine personnalisé** (optionnel)
   - Render Dashboard → Custom Domain → Ajouter votre domaine

2. **Mettre en place les monitoring**
   - Render Dashboard → Logs & Metrics

3. **Tester les workflows principaux**
   - Login, créer adhérent, cotisations, etc.

4. **Configurer les alertes**
   - Render Dashboard → Alerts

5. **Documenter vos endpoints**
   - Créer un README API

---

## 📞 Besoin d'aide?

### Ressources:
- Render Docs: https://render.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/15/
- Laravel Docs: https://laravel.com/docs

### Commandes utiles:

```bash
# Voir les logs en temps réel
render logs mamutuelle-api

# Redeploy après changements
render deploy --name mamutuelle-api

# Vérifier l'état du service
render status mamutuelle-api
```

---

**Status**: ✅ **READY FOR PRODUCTION**
**Deployed**: Render Platform
**Database**: PostgreSQL 15
**Framework**: Laravel
**Version**: 1.0
