# 🗄️ Database - Quick Start

## ⚡ 30 secondes pour initialiser la base de données

### En local (Docker):
```bash
cd database
bash init-database.sh
```

### Sur Render:
```bash
# Avec DATABASE_URL définie
cd database
bash init-database.sh render
```

### Via pgAdmin (GUI):
```
1. Ouvrir pgAdmin
2. Query Tool → File → Open → database.sql
3. Execute (F5)
4. ✅ Done!
```

---

## 📊 Que se passe-t-il?

Le fichier `database.sql` va:
1. ✅ Créer 10 tables PostgreSQL
2. ✅ Créer 10+ indices de performance
3. ✅ Insérer 17 utilisateurs (admin + 15 adhérents)
4. ✅ Insérer 15 adhérents + 25 dépendants
5. ✅ Insérer données de test (cotisations, prêts, sinistres, etc.)
6. ✅ Valider la cohérence complète

---

## 🔐 Credentials de test

```
Admin:    admin@mamutuelle.bf
Agent:    agent@mamutuelle.bf
Adhérents: kone.oumar@email.bf, zongo.aminata@email.bf, etc.
Password: Voir database.sql (bcrypt hash)
```

---

## 📖 Documentation

| Besoin | Fichier |
|--------|---------|
| **Quick start** | ✅ Vous êtes ici |
| Guide complet | `README.md` |
| Historique consolidation | `MIGRATION_NOTES.md` |
| Résumé technique | `CONSOLIDATION_SUMMARY.md` |
| Dépannage | `README.md` |

---

## 🆘 Ça ne fonctionne pas?

1. ✅ Vérifier PostgreSQL est en cours (docker-compose up -d)
2. ✅ Vérifier DATABASE_URL sur Render
3. ✅ Lire `README.md` section Troubleshooting

---

**C'est tout! Votre base de données est maintenant prête. 🎉**
