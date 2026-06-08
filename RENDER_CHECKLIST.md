# 🚀 RENDER DEPLOYMENT CHECKLIST

## ✅ Quick Action Plan

Copy-paste ce checklist et complétez-le au fur et à mesure.

---

## 🎯 ÉTAPE 1: Préparer PostgreSQL

```
⬜ Aller à: https://dashboard.render.com
⬜ Cliquez: + New → PostgreSQL
⬜ Remplissez:
   Name: mamutuelle-db
   Database: mamutuelle
   User: mamutuelle_user
   Region: Frankfurt (ou Oregon)
   Plan: Free

⬜ Cliquez: Create Database
⬜ Attendez 1-2 minutes...
⬜ Copier la connection string:
   postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle
   
   📌 Coller ici:
   ___________________________________________________________
```

---

## 🎯 ÉTAPE 2: Préparer les clés

### Générer APP_KEY

```bash
cd backend
php artisan key:generate --show
```

📌 Copier:
```
base64:___________________________________________________
```

### Générer JWT_SECRET

```bash
openssl rand -hex 32
```

📌 Copier:
```
_______________________________________________________
```

---

## 🎯 ÉTAPE 3: Créer Web Service

```
⬜ Aller à: https://dashboard.render.com
⬜ Cliquez: + New → Web Service
⬜ Connecter GitHub (autoriser Render)
⬜ Sélectionner: Projet_DEV_WEB_GROUPE_-
⬜ Remplissez:
   Name: mamutuelle-api
   Runtime: Docker
   Region: MÊME QUE POSTGRESQL ⚠️
   Branch: master
   Dockerfile: ./Dockerfile
   Build Command: echo 'Using Docker'
   Start Command: /usr/local/bin/start.sh

⬜ Cliquez: Advanced
⬜ Mettez: Min Instances = 1, Max Instances = 1
```

---

## 🎯 ÉTAPE 4: Ajouter Variables (IMPORTANT!)

Avant de créer, dans le même formulaire Advanced, ajoutez:

```bash
APP_ENV                 = production
APP_DEBUG               = false
APP_URL                 = https://mamutuelle-api.onrender.com
APP_KEY                 = base64:YOUR_KEY_HERE

DATABASE_URL            = postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle
                          (Copié à Étape 1)

JWT_SECRET              = YOUR_SECRET_HERE
                          (Généré à Étape 2)
JWT_TTL                 = 60
JWT_REFRESH_TTL         = 20160
JWT_ALGORITHM           = HS256

RUN_MIGRATIONS          = true
```

```
⬜ Cliquez: Add Environment Variable (pour chaque variable)
⬜ Remplissez EXACTEMENT les variables ci-dessus
⬜ Vérifiez 3 fois! (erreurs fréquentes)
```

---

## 🎯 ÉTAPE 5: Créer!

```
⬜ Vérifiez toutes les variables une dernière fois
⬜ Cliquez: Create Web Service
⬜ Attendez le déploiement (5-10 min)
⬜ Vérifiez les logs affichent "Service is live"

🎉 Première déploiement réussi!
```

---

## 🎯 ÉTAPE 6: Initialiser la Base de Données

### Méthode 1: pgAdmin (Recommandé)

```
⬜ Ouvrez pgAdmin: http://localhost:5050
⬜ Login: admin@pgadmin.org / admin
⬜ Ajouter serveur:
   Name: Render-MaMutuelle
   Host: [HOST de PostgreSQL Render]
   Port: 5432
   User: mamutuelle_user
   Password: [PASSWORD de PostgreSQL]

⬜ Clic droit → Query Tool
⬜ File → Open → database/database.sql
⬜ Execute (F5)
⬜ Vérifiez le succès
```

### Méthode 2: Terminal

```bash
# Remplacer POSTGRES_URL par votre connection string
export DATABASE_URL="postgresql://mamutuelle_user:PASSWORD@HOST:5432/mamutuelle"
psql $DATABASE_URL < database/database.sql
```

```
⬜ Exécutez la commande
⬜ Vérifiez: ✅ Tables créées, données insérées
```

---

## 🎯 ÉTAPE 7: Tester

```bash
# Test 1: API ping
⬜ curl https://mamutuelle-api.onrender.com/api

# Test 2: Vérifier les logs
⬜ Dashboard Render → mamutuelle-api → Logs
⬜ Cherchez: "Database connected", "Ready for requests"

# Test 3: Vérifier les données
⬜ Dashboard Render → PostgreSQL
⬜ Voir si tables existent et données présentes
```

---

## 📊 Status

```
┌─────────────────────────────────────────┐
│ RENDER DEPLOYMENT CHECKLIST             │
├─────────────────────────────────────────┤
│ ⬜ PostgreSQL créée                      │
│ ⬜ Web Service créée                     │
│ ⬜ Variables d'environnement ajoutées    │
│ ⬜ Déploiement réussi                    │
│ ⬜ Base de données initialisée           │
│ ⬜ Tests passés                          │
│ ⬜ En production                         │
├─────────────────────────────────────────┤
│ Status: 0/7 COMPLÉTÉ                    │
└─────────────────────────────────────────┘
```

---

## 🆘 Problèmes fréquents?

### "Connection refused"
→ Lire: RENDER_DEPLOYMENT_COMPLETE.md section Troubleshooting

### "App Key not set"
→ Vérifier que APP_KEY a le préfixe "base64:"

### "Database does not exist"
→ Exécuter database.sql sur PostgreSQL

### "Service won't start"
→ Vérifier les logs Render (voir toutes les erreurs)

---

## ✅ Quand c'est fini

Vous aurez:
- ✅ API en ligne: `https://mamutuelle-api.onrender.com`
- ✅ PostgreSQL en ligne
- ✅ Données initialisées
- ✅ Toutfonctionnel

Félicitations! 🎉

---

## 📖 Pour plus de détails

Lire: **RENDER_DEPLOYMENT_COMPLETE.md**
