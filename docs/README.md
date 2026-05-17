# 📋 MaMutuelle - Système de Gestion d'une Mutuelle

## 🎯 Vue d'ensemble

MaMutuelle est une application complète de **gestion d'une mutuelle** permettant de simplifier l'administration des adhérents, des cotisations, des prêts et des prestations sociales/santé.

**Thème:** Blanc dominant avec accents bleu (#0066CC) et vert (#00AA55)  
**Stack:** PHP/Laravel, JavaScript, PostgreSQL, GitHub Pages + Railway  
**Déploiement:** 100% gratuit

---

## 📁 Structure du Projet (réelle)

Le dossier `docs/` contient les guides et les fichiers d'accompagnement pour les développeurs, DevOps et PO. Voici la structure attendue du dépôt et où trouver chaque chose :

```
MaMutuelle/
├── backend/                  # Laravel API (artisan, composer.json, public/, routes/, app/)
├── css/                      # Styles du frontend (login.css, dashboard.css...)
├── js/                       # Scripts frontend (login.js, api.js, dashboard.js...)
├── database/                 # Schémas SQL et scripts de seed
├── docs/                     # Documentation (ce dossier)
├── Dockerfile                # Build Docker racine
├── docker-compose.yml        # Orchestration locale
├── RAILWAY_DEPLOYMENT.md     # Guide déploiement Railway (racine)
└── *.html                    # Pages frontend (index.html, login.html, dashboard.html...)
```

---

## 🚀 Démarrage Rapide (local)

1. Cloner le dépôt et ouvrir le répertoire :

```bash
git clone <repo-url>
cd Projet_DEV_WEB_GROUPE_-
```

2. Backend :

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

3. Frontend : ouvrir `index.html` / `login.html` dans votre navigateur ou servir statiquement depuis `backend/public/` si vous avez configuré le serveur web.

4. Déploiement local avec Docker :

```bash
docker compose up --build
```

### Pour DevOps

Lire: `docs/GUIDE_HEBERGEMENT.md`
- Railway.app setup
- PostgreSQL cloud
- GitHub Actions CI/CD

### Pour Managers/PMs

Lire: `docs/CHECKLIST_LANCEMENT.md`
- 350+ validation points
- Jalons du projet
- Timeline

---

## 🎨 Design System

| Élément | Valeur |
|---------|--------|
| **Couleur primaire** | Bleu #0066CC |
| **Couleur secondaire** | Vert #00AA55 |
| **Couleur de fond** | Blanc #FFFFFF |
| **Font** | Inter (sans-serif) |
| **Responsive** | Mobile-first |

---

## 📊 Fonctionnalités Principales

### 1. **Gestion des Adhérents**
- ✅ Inscription rapide
- ✅ Gestion des ayants droit
- ✅ Mise à jour du profil
- ✅ Historique des opérations

### 2. **Gestion des Cotisations**
- ✅ Enregistrement automatique
- ✅ Suivi des paiements
- ✅ Alertes retard (30, 60, 90 jours)
- ✅ Intérêts automatiques (+1% par mois)

### 3. **Gestion des Prêts**
- ✅ Demande en ligne
- ✅ Attribution rapide
- ✅ Amortissement calculé
- ✅ Suivi des remboursements

### 4. **Gestion des Sinistres**
- ✅ Déclaration en ligne
- ✅ Suivi du dossier
- ✅ Gestion des remboursements
- ✅ Document management

### 5. **Tableau de Bord**
- ✅ Analytics temps réel
- ✅ Graphiques de cotisations
- ✅ Alertes personnalisées
- ✅ Exports rapides

---

## 🔐 Sécurité

- ✅ JWT Authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ HTTPS enforced
- ✅ OWASP Top 10 compliant
- ✅ RGPD compliant

---

## 📚 Documentation Complète

| Document | Durée | Description |
|----------|-------|-------------|
| **RAPPORT_PROJET.md** | 30 min | Architecture & spécifications |
| **GUIDE_DEMARRAGE_RAPIDE.md** | 30 min | Setup complet du projet |
| **GUIDE_HEBERGEMENT.md** | 15 min | Déploiement gratuit |
| **CHECKLIST_LANCEMENT.md** | 45 min | 350+ points de validation |
| **PROMPT_CLAUDE_OPUS.md** | 150 min | Spec ultra-détaillée |

---

## 🛠 Stack Technique

| Couche | Tech |
|--------|------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+, Bootstrap 5 |
| **Backend** | PHP 8.1+, Laravel 10 |
| **Database** | PostgreSQL 13+ |
| **Auth** | JWT + Sanctum |
| **API** | REST API, JSON |
| **Charts** | Chart.js |
| **Hosting** | GitHub Pages + Railway.app |
| **CI/CD** | GitHub Actions |

---

## 📅 Timeline Estimation

- **Semaine 1:** Infrastructure setup
- **Semaines 2-3:** Backend core (DB, auth, API)
- **Semaines 4-5:** Frontend (adhérent dashboard)
- **Semaines 5-6:** Frontend (admin/agent interfaces)
- **Semaine 7:** Security audit & tests
- **Semaine 8:** Production deployment
- **Semaines 9+:** Post-launch support

---

## 👥 Rôles & Responsabilités

### **Manager/PM**
→ Lire: `RAPPORT_PROJET.md` + `CHECKLIST_LANCEMENT.md`

### **Developer Backend**
→ Lire: `GUIDE_DEMARRAGE_RAPIDE.md` + `PROMPT_CLAUDE_OPUS.md`

### **Developer Frontend**
→ Lire: `GUIDE_DEMARRAGE_RAPIDE.md` + design system section

### **DevOps**
→ Lire: `GUIDE_HEBERGEMENT.md`

### **Testeur/QA**
→ Lire: `CHECKLIST_LANCEMENT.md`

---

## 💰 Coûts

- **Infrastructure:** €0/mois (GitHub + Railway + PostgreSQL free tier)
- **Email:** €0/mois (SendGrid 100 emails/jour gratuit)
- **Total:** €0-100/mois selon charge

---

## 📞 Support & Issues

- **Questions?** Lire `INDEX_COMPLET.md` (navigation)
- **Bloqué?** Consulter la section troubleshooting du guide correspondant
- **Bug?** Créer une issue GitHub

---

## 📝 License & Auteurs

**Projet:** MaMutuelle  
**Version:** 1.0  
**Créé:** 2026  
**Équipe:** [Votre équipe]

---

**🎉 Prêts à démarrer? Lire `GUIDE_DEMARRAGE_RAPIDE.md` maintenant!**
