# 🌐 GUIDE D'HÉBERGEMENT - Déploiement 100% Gratuit

## 🎯 Vue d'ensemble

MaMutuelle utilise une architecture **serverless gratuite** pour le minimum de coûts:

| Composant | Service | Coût | Justification |
|-----------|---------|------|---------------|
| **Frontend** | GitHub Pages | €0 | HTML/CSS/JS statique |
| **Backend** | Railway.app | €0-5 | Pay-as-you-go gratuit initial |
| **Database** | PostgreSQL Cloud | €0-15 | Neon/Railway free tier |
| **Email** | SendGrid | €0 | 100 emails/jour gratuit |
| **Domain** | Namecheap | €12/an | Optional |
| **TOTAL** | **GRATUIT** | **€0/mois** | Scaling: €50-100/mois à 10k users |

---

## 1️⃣ GITHUB PAGES - Frontend

### Étape 1: Créer la Repository

```bash
# Sur GitHub.com
1. Click: "New repository"
2. Name: "MaMutuelle"
3. Description: "Mutual aid management system"
4. Visibility: Public
5. Create repository
```

### Étape 2: Configurer GitHub Pages

```bash
# Dans Settings → Pages
1. Source: Deploy from a branch
2. Branch: main
3. Folder: /docs
4. Click: Save
```

**OU** utiliser `/frontend/` directement:

```bash
git remote add origin https://github.com/USERNAME/MaMutuelle.git
git branch -M main
git push -u origin main
```

### Étape 3: URL publique

```
https://username.github.io/MaMutuelle
OU (avec domaine custom)
https://mamutuelle.example.com
```

### Configuration Custom Domain

Si vous avez un domaine custom:

```bash
# Settings → Pages
Custom domain: mamutuelle.example.com

# Puis chez votre registrar (Namecheap, GoDaddy):
DNS CNAME: username.github.io
```

---

## 2️⃣ RAILWAY.APP - Backend & Database

### Étape 1: Créer Compte Railway

```bash
# Sur railway.app
1. Sign up with GitHub
2. Autoriser Railway
3. Create new project
```

### Étape 2: Déployer Backend (Laravel)

```bash
# Via GitHub
1. Click: "Deploy from GitHub"
2. Connect repository: MaMutuelle
3. Click: Deploy
```

### Étape 3: Configurer Variables d'Environnement

```bash
# Dans Railway → Project → Variables
APP_NAME=MaMutuelle
APP_ENV=production
APP_DEBUG=false
APP_URL=https://mamutuelle-backend.up.railway.app

# Database
DB_CONNECTION=pgsql
DB_HOST=containers-us-west-...
DB_DATABASE=mamutuelle
DB_USERNAME=postgres
DB_PASSWORD=generated-password

# JWT
JWT_SECRET=generate-strong-key-here
JWT_EXPIRES=3600

# Mail
MAIL_MAILER=sendgrid
MAIL_PASSWORD=SG.your-key-here
```

### Étape 4: Configurer PostgreSQL

```bash
# Dans Railway → Add Service → PostgreSQL
1. Select "PostgreSQL"
2. Click: Add PostgreSQL
3. Variables auto-added
4. Note les credentials
```

### Étape 5: Migrer la Database

```bash
# Via Railway terminal
php artisan migrate
php artisan db:seed  # Optional
```

---

## 3️⃣ SENDGRID - Email (Gratuit)

### Étape 1: Créer Compte SendGrid

```bash
# Sur sendgrid.com
1. Sign up (gratuit)
2. Vérifier email
3. Créer API key
```

### Étape 2: Générer API Key

```bash
# Dans Settings → API Keys
1. Click: "Create API Key"
2. Name: MaMutuelle
3. Permissions: Full Access
4. Create
5. Copy la clé
```

### Étape 3: Configurer dans .env

```env
MAIL_MAILER=sendgrid
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxx
MAIL_FROM_ADDRESS=noreply@mamutuelle.fr
MAIL_FROM_NAME=MaMutuelle
```

### Étape 4: Tester Email

```php
Mail::send('emails.test', [], function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email');
});
```

---

## 4️⃣ GITHUB ACTIONS - CI/CD

### Étape 1: Créer Workflow

Fichier: `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
    - uses: actions/checkout@v3
    - uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'

    - name: Install dependencies
      run: |
        cd backend
        composer install

    - name: Run tests
      run: |
        cd backend
        php artisan test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Railway
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      run: |
        npm i -g @railway/cli
        railway up
```

### Étape 2: Configurer Secrets GitHub

```bash
# Settings → Secrets → New repository secret
RAILWAY_TOKEN=your-railway-token-here
DATABASE_URL=postgresql://user:pass@host/db
```

---

## 5️⃣ MONITORING & LOGS

### Railway Dashboard

```bash
# Vérifier les logs
1. Railway → Project → Deployments
2. Click latest deployment
3. Voir les logs en temps réel
4. Vérifier CPU/Memory
```

### GitHub Actions Status

```bash
# Actions tab
1. Voir les workflow runs
2. Click sur un run
3. Voir les logs de test
4. Vérifier le status
```

### Erreurs Courantes

#### ❌ 502 Bad Gateway
```
Solution: Railway backend crash
→ Vérifier les logs
→ Vérifier variables d'env
→ Redéployer
```

#### ❌ Database Connection Error
```
Solution: DB URL incorrecte
→ Vérifier DATABASE_URL
→ Vérifier credentials
→ Tester connexion locale: psql $DATABASE_URL
```

#### ❌ Email n'arrive pas
```
Solution: SendGrid configuration
→ Vérifier API key valide
→ Vérifier MAIL_FROM_ADDRESS autorisée
→ Vérifier SPF/DKIM records
```

---

## 6️⃣ DOMAINE CUSTOM

### Option 1: GitHub Pages Custom Domain

```bash
# 1. Acheter domaine (namecheap.com)
# 2. Configuration DNS:
#    Type: CNAME
#    Name: @ (ou www)
#    Value: username.github.io
# 3. Attendre propagation (24h)
# 4. GitHub Settings → Pages → Custom domain: mamutuelle.com
```

### Option 2: Railroad/Cloudflare

```bash
# Plus flexible avec sous-domaines
# api.mamutuelle.com → Railway backend
# mamutuelle.com → GitHub Pages
```

---

## 7️⃣ BACKUPS AUTOMATIQUES

### PostgreSQL Backup

```bash
# Via Railway
1. Project → Services → PostgreSQL
2. Backup tab
3. Create manual backup
4. Schedule automatique: enabled
```

### Code Backup

```bash
# GitHub protège automatiquement
# Mais faire backups locaux réguliers:
git clone https://github.com/USERNAME/MaMutuelle.git ./backup-2026-01
```

---

## 8️⃣ SCALING (Optionnel)

### Quand scaler

- **< 100 adhérents**: Free tier suffit
- **100-1,000**: Upgrade Railway (€5-10/mois)
- **1,000-10,000**: Ajouter cache Redis (€5-15/mois)
- **10,000+**: Multi-region + Load balancing (€100+/mois)

### Redis Cache

```bash
# Ajouter Redis via Railway
1. Project → Add Service
2. Select: Redis
3. Click: Add Redis
4. Variables auto-added

# Configurer Laravel
CACHE_DRIVER=redis
REDIS_URL=redis://...
```

---

## 9️⃣ SÉCURITÉ

### HTTPS

```bash
# GitHub Pages: Automatique ✓
# Railway: Automatique ✓
```

### SSL Certificate

```bash
# Cloudflare (gratuit)
1. mamutuelle.com → Cloudflare
2. SSL/TLS: Full
3. Auto-renew: enabled
```

### Security Headers

```php
# Dans header de réponse
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
```

---

## 🔟 CHECKLIST FINAL

- [ ] GitHub repository créé
- [ ] GitHub Pages configuré
- [ ] Railway account créé
- [ ] PostgreSQL database setup
- [ ] Backend déployé sur Railway
- [ ] Frontend déployé sur GitHub Pages
- [ ] Variables d'environnement configurées
- [ ] SendGrid email testé
- [ ] GitHub Actions workflow actif
- [ ] Tests passent en CI/CD
- [ ] Logs monitoring setup
- [ ] Backups configurés
- [ ] Custom domain active
- [ ] SSL certificates valides
- [ ] Performance < 2s pour page load
- [ ] Uptime monitoring setup

---

## 📞 SUPPORT

| Problème | Solution |
|----------|----------|
| Railway deploy fails | Vérifier logs, redéployer |
| Database not connecting | Vérifier DATABASE_URL, credentials |
| GitHub Actions fails | Vérifier secrets, tester localement |
| Email not sending | Vérifier MAIL_PASSWORD SendGrid |
| Domain not resolving | Attendre propagation DNS (24h) |

---

**Coûts estimés:**
- **Gratuit**: € 0/mois (< 5,000 adhérents)
- **Startup**: € 20-50/mois (5,000-50,000 adhérents)
- **Scale**: € 100+/mois (50,000+ adhérents)

**Lancer:** Suivre les 10 sections ci-dessus dans l'ordre!
