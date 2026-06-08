# 🌐 Render Dashboard - Guide Visuel

## 📍 Localiser les Éléments sur le Dashboard Render

### Connexion

```
https://render.com/dashboard
└─ Login avec GitHub
```

---

## 1️⃣ CRÉER UN WEB SERVICE

### Position: Bouton en haut à droite

```
┌─────────────────────────────────────────┐
│  Dashboard                              │
│                                    [New +]  ◄─ Cliquer ici
└─────────────────────────────────────────┘
```

### Menu qui apparaît

```
New +
├─ Web Service         ◄─ Cliquer ici
├─ Private Service
├─ PostgreSQL
└─ Redis
```

---

## 2️⃣ CONNECTER GITHUB

### Page: Connect Repository

```
┌─────────────────────────────────────────────────────┐
│  Connect Repository                                 │
│                                                     │
│  Select GitHub repository:                          │
│  [ Rovisseodg / Projet_DEV_WEB_GROUPE_- ]  ◄ OK   │
│                                                     │
│  Branch: [master ▼]                      ◄ OK      │
└─────────────────────────────────────────────────────┘
```

---

## 3️⃣ CONFIGURATION DE BASE

### Page: Web Service Settings

```
┌─────────────────────────────────────────────────────┐
│  Web Service                                        │
│                                                     │
│  Name: [mamutuelle-api____________]                │
│                                                     │
│  Region: [Oregon (us-west)________▼]  ◄ IMPORTANT  │
│                                                     │
│  Environment: [Docker______________▼]  ◄ OK        │
│                                                     │
│  Runtime: (auto-detected)                          │
│                                                     │
│  Build Command: (leave empty)                      │
│  Start Command: (leave empty)                      │
│                                                     │
│  [Connect Repo]  [Cancel]                          │
└─────────────────────────────────────────────────────┘
```

---

## 4️⃣ AJOUTER ENVIRONMENT VARIABLES

### Onglet: Environment

```
┌─────────────────────────────────────────────────────┐
│  Settings                                           │
│                                                     │
│  [Settings] [Redirects] [Environment] ◄ Cliquer    │
│                                                     │
│  Environment Variables:                             │
│  ┌───────────────────────────────────────────────┐ │
│  │ Key                │ Value                     │ │
│  ├───────────────────┼─────────────────────────┤ │
│  │ DATABASE_URL      │ postgresql://mam...    │ │
│  │ APP_NAME          │ MaMutuelle              │ │
│  │ APP_ENV           │ production              │ │
│  │ APP_KEY           │ base64:YOUR_KEY_HERE    │ │
│  │ JWT_SECRET        │ YOUR_JWT_SECRET         │ │
│  │ LOG_LEVEL         │ info                    │ │
│  │ PORT              │ 8080                    │ │
│  └───────────────────┴─────────────────────────┘ │
│  [Add Variable +]                                 │
└─────────────────────────────────────────────────────┘
```

### Comment ajouter une variable:

```
1. Cliquer [Add Variable +]
2. Entrer le KEY (ex: DATABASE_URL)
3. Entrer le VALUE (ex: postgresql://...)
4. Cliquer Enter ou Return
5. Répéter pour chaque variable
```

---

## 5️⃣ CRÉER LE SERVICE

### Bouton en bas

```
┌──────────────────────────────────────────┐
│  Plan                                    │
│                                          │
│  Starter Plan:   $7/month  [Select]    │
│                  • 0.5 CPU               │
│                  • 512 MB RAM             │
│                  • 100 GB outbound/month │
│                                          │
│  Pro Plan:      $12/month [Select]      │
│                  • 1 CPU                 │
│                  • 2 GB RAM               │
│                  • 200 GB outbound/month │
│                                          │
│                 [Create Web Service]     │ ◄ Final
└──────────────────────────────────────────┘
```

---

## 6️⃣ DÉPLOIEMENT EN COURS

### Page: Logs

```
┌────────────────────────────────────────────────┐
│  mamutuelle-api                                │
│                                                │
│  Status: Deploying                             │
│                                                │
│  Logs:                                         │
│  ├─ Building Docker image...                   │
│  ├─ Pulling from registry...                   │
│  ├─ Running...                                 │
│  ├─ [23:45:12] Starting Apache...              │
│  ├─ [23:45:13] PostgreSQL connecting...       │
│  ├─ [23:45:14] Database ready!                │
│  ├─ [23:45:15] ✅ Service is live             │
│  └─ Available at:                              │
│     https://mamutuelle-api.onrender.com  ◄   │
└────────────────────────────────────────────────┘
```

✅ **Attendre ce message:**
```
Your service is live at https://mamutuelle-api.onrender.com
```

---

## 7️⃣ SERVICE ACTIF

### Page: Overview

```
┌─────────────────────────────────────────────┐
│  mamutuelle-api                             │
│                                             │
│  Status:     🟢 Live                        │
│  URL:        https://mamutuelle-api...      │
│  Region:     Oregon                         │
│  Plan:       Starter                        │
│                                             │
│  Tabs:                                      │
│  [Overview] [Logs] [Metrics] [Settings]     │
│                                             │
│  Last Deploy: 2 minutes ago                 │
│  Last Commit: Fix deployment files          │
│                                             │
│  Recent Activity:                           │
│  └─ Deployed at 23:45:15 UTC               │
└─────────────────────────────────────────────┘
```

---

## 📊 VÉRIFIER LE STATUT

### Onglet: Metrics

```
┌─────────────────────────────────────────┐
│  Metrics                                │
│                                         │
│  CPU Usage:      [20%]  ████░░░░░      │
│  Memory Usage:   [15%]  ███░░░░░░░      │
│  Network In:     125 KB/s                │
│  Network Out:    234 KB/s                │
│                                         │
│  Response Time:  250ms                  │
│  Requests/min:   42                     │
│                                         │
│  Status Codes:                          │
│  2xx:   95%                             │
│  4xx:   4%                              │
│  5xx:   1%                              │
└─────────────────────────────────────────┘
```

---

## 🔄 METTRE À JOUR LE CODE

### Après un `git push`:

```
1. Render détecte automatiquement le push
2. Dashboard affiche: "New commit - Deploy"
3. Cliquer [Manual Deploy] ou
4. Render redéploie automatiquement en ~2 min

┌─────────────────────────────┐
│  Deploys                    │
│                             │
│  Latest:                    │
│  ├─ Status: Live            │
│  ├─ Duration: 2m 30s        │
│  └─ Commit: abc1234         │
│                             │
│  Previous:                  │
│  ├─ Status: Completed       │
│  └─ Commit: xyz5678         │
└─────────────────────────────┘
```

---

## 🆘 VÉRIFIER LES ERREURS

### Onglet: Logs

```
Chercher les messages:
┌────────────────────────────────────────┐
│ ❌ ERROR:                              │
│    - Connection refused                │
│    → Vérifier DATABASE_URL             │
│                                        │
│ ❌ WARN:                               │
│    - Port already in use               │
│    → Vérifier PORT=8080                │
│                                        │
│ ✅ INFO:                               │
│    - Database connected                │
│    - Service started                   │
│    - Listening on 8080                 │
└────────────────────────────────────────┘
```

---

## 📍 CHEMINS IMPORTANTS SUR RENDER

### Base de Données

```
Render Dashboard
└─ Databases
   └─ mamutuelle_db
      ├─ Connection Info
      └─ Database Events
```

### Service Logs

```
Render Dashboard
└─ Your Service (mamutuelle-api)
   ├─ Logs           ◄ Messages en temps réel
   ├─ Metrics        ◄ CPU, Mémoire, Réseau
   ├─ Deploys        ◄ Historique des déploiements
   └─ Settings       ◄ Variables d'environnement
```

---

## 🎯 RÉSUMÉ NAVIGATION

```
Render Dashboard
│
├─ [New +] ──────► Web Service
│                  ├─ GitHub Repo
│                  ├─ Name: mamutuelle-api
│                  ├─ Region: Oregon
│                  ├─ Environment: Docker
│                  └─ Environment Variables ← IMPORTANT
│
├─ Services
│  └─ mamutuelle-api
│     ├─ Overview (Status 🟢 Live)
│     ├─ Logs (Voir les erreurs)
│     ├─ Metrics (Monitoring)
│     └─ Settings (Variables)
│
└─ Databases
   └─ mamutuelle_db
      └─ Info + SQL Commands
```

---

## ✅ CHECKLIST VISUELLE

- [ ] Créer Web Service
- [ ] Connecter GitHub Repo
- [ ] Configurer nom et région (Oregon)
- [ ] Ajouter Environment Variables
- [ ] Choisir Plan
- [ ] Créer le service
- [ ] Attendre le message "Live"
- [ ] Vérifier les Logs (pas d'erreurs)
- [ ] Tester: curl https://mamutuelle-api.onrender.com
- [ ] ✅ Deployment réussi!

---

**Guide complet:** Voir DEPLOY_RENDER.md
