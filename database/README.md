# 📊 MaMutuelle Database - Guide d'utilisation

## 📋 Résumé

Depuis 2024, le projet utilise un **unique fichier SQL consolidé** `database.sql` qui remplace les anciens fichiers fragmentés:
- ❌ `schema.sql` (archivé)
- ❌ `seed-data.sql` (archivé)
- ❌ `test-data-additional.sql` (archivé)
- ✅ `database.sql` (NOUVEAU - à utiliser)

## 🎯 Avantages

✅ **Un seul fichier** - Plus facile à gérer et maintenir
✅ **Cohérent** - Pas de risque de désynchronisation entre schema et données
✅ **Complet** - Schema + données initiales + données de test
✅ **Bien documenté** - Commentaires structurés dans le fichier
✅ **Prêt pour production** - Inclut tous les indices et contraintes

## 🚀 Utilisation rapide

### Option 1: Depuis pgAdmin (interface Web - recommandé)

```
1. Ouvrir pgAdmin
2. Sélectionner votre database
3. Query Tool → File → Open → database.sql
4. Cliquer "Execute" (F5)
5. Vérifier "Database setup complete!" dans les logs
```

### Option 2: Depuis la ligne de commande (psql)

```bash
# Depuis votre machine
psql -h your-render-host -U mamutuelle_user -d mamutuelle < database.sql

# Ou avec le mot de passe en paramètre
psql -h your-render-host -U mamutuelle_user -d mamutuelle \
  -c "$(cat database.sql)"
```

### Option 3: Depuis Docker Compose (développement local)

```bash
# Démarrer les services
docker-compose up -d

# Exécuter le script
docker-compose exec db psql -U mamutuelle_user -d mamutuelle < database.sql
```

### Option 4: Depuis Laravel (migrations)

```bash
# Si vous gérez les migrations via Laravel
cd backend
php artisan migrate

# Pour exécuter un raw SQL après
php artisan db:seed
```

## 📊 Ce que le fichier contient

### 1. Schéma complet (10 tables)

| Table | Purpose | Records |
|-------|---------|---------|
| `users` | Authentification | 17 (2 admin/agent + 15 adhérents) |
| `adherents` | Adhérents et leurs infos | 15 |
| `ayants_droit` | Dépendants | 25 |
| `cotisations` | Cotisations/adhésions | 29 |
| `prets` | Prêts accordés | 5 |
| `remboursements_prets` | Échéances de prêts | 4 |
| `sinistres` | Réclamations/sinistres | 3 |
| `prestations` | Prestations accordées | 2 |
| `alertes` | Alertes système | 4 |
| `audit_logs` | Logs d'audit | (vide, prêt) |

### 2. Indices pour performance

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_adherents_numero ON adherents(numero_adherent);
CREATE INDEX idx_cotisations_statut ON cotisations(statut);
-- ... et 7 autres indices
```

### 3. Contraintes d'intégrité

- Foreign keys pour maintenir la cohérence
- Check constraints pour les énumérations
- Unique constraints pour les emails et numéros

### 4. Données prédéfinies

#### Users
- Admin: `admin@mamutuelle.bf` / password (bcrypt)
- Agent: `agent@mamutuelle.bf` / password
- 15 adhérents avec comptes actifs

#### Adhérents
- 15 adhérents (5 base + 10 supplémentaires)
- Statuts: `actif`, `suspendu`, `retraite`
- Répartition: Ouagadougou + Bobo-Dioulasso

#### Données liées
- Cotisations avec différents statuts (payées, en retard, en attente)
- Prêts approuvés, rejetés, en remboursement
- Sinistres avec prestations associées
- Alertes système (retards de paiement, etc.)

## 🔐 Credentials par défaut

**Admin account:**
```
Email: admin@mamutuelle.bf
Password: admin (à changer en production!)
```

**Agent account:**
```
Email: agent@mamutuelle.bf
Password: agent (à changer en production!)
```

**Adhérents:** Utiliser les emails (ex: `kone.oumar@email.bf`)
```
Password: Pour tous les tests = même password bcrypt
```

## ⚠️ Avant de passer en production

### 1. Changer les passwords

```sql
-- Générer des bcrypt hashes et les mettre à jour
UPDATE users SET password = '$2y$12$NEW_BCRYPT_HASH' WHERE role = 'admin';
```

### 2. Vérifier les données

```sql
-- Vérifier la cohérence
SELECT COUNT(*) as adherents_without_user 
FROM adherents WHERE user_id IS NULL;

-- Vérifier les contraintes
SELECT * FROM cotisations WHERE montant <= 0;
```

### 3. Purger les données de test

```sql
-- Garder seulement les utilisateurs de production
DELETE FROM alertes;
DELETE FROM sinistres WHERE adherent_id > X;
-- ...
```

## 📝 Gestion des versions

### Structure de versioning

```
database.sql          ← Version actuelle (à jour)
database.v1.0.sql    ← Archive v1.0
database.v0.9.sql    ← Archive v0.9
```

### Ajouter des données

```sql
-- Dans database.sql, ajouter avant le COMMIT final:

INSERT INTO users (...) VALUES (...);
INSERT INTO adherents (...) VALUES (...);
-- etc

-- Puis remonter la version
-- Version: 1.1 (en haut du fichier)
```

## 🔄 Synchronisation avec migrations Laravel

### Option A: Laravel manage migrations

```bash
# Les migrations Laravel créent automatiquement
cd backend/database/migrations
# Les fichiers de migration existent-ils?
```

### Option B: SQL pur (recommandé pour ce projet)

```bash
# Exécuter database.sql directement
# Puis utiliser Laravel comme interface
```

## 🐛 Troubleshooting

### Erreur: "relation already exists"

```
→ Table existe déjà (DROP IF EXISTS gère ça normalement)
→ Vérifier les permissions
→ Exécuter avec un user qui a droit de DROP
```

### Erreur: "password authentication failed"

```
→ Vérifier les credentials dans .env
→ Vérifier que PostgreSQL est accessible
→ Tester la connexion: psql -h host -U user -d database
```

### Erreur: "foreign key violation"

```
→ Les user_id n'existent pas
→ Vérifier que les USERS s'insèrent d'abord (ils s'insèrent)
→ Exécuter le script complet (ne pas arrêter au milieu)
```

### Les indices ne se créent pas

```
→ Vous êtes probablement en transaction partiellement
→ Exécuter le fichier en entier, pas line by line
```

## 📚 Liens utiles

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin Guide](https://www.pgadmin.org/docs/)
- [Laravel Database Documentation](https://laravel.com/docs/database)
- [Render PostgreSQL](https://render.com/docs/databases)

## ✅ Checklist avant déploiement

- [ ] database.sql exécuté sans erreurs
- [ ] Vérifier "Database setup complete!" dans les logs
- [ ] Compter les records insérés ✓
- [ ] Tester les connexions avec les credentials
- [ ] Tester l'API avec les données
- [ ] Vérifier que les indices sont créés
- [ ] Vérifier les backups PostgreSQL

## 📞 Support

Pour toute question:
1. Vérifier le fichier `database.sql` (bien commenté)
2. Lire cette documentation
3. Consulter [PostgreSQL docs](https://www.postgresql.org/docs/)
4. Ouvrir une issue GitHub

---

**Version:** 1.0 - 2024
**Statut:** ✅ Production Ready
**Dernière mise à jour:** 2024
