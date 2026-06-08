# 📊 Guide d'Exécution - Fichier SQL Render Unique

## 🎯 Vue d'ensemble

✅ **Fichier créé:** `database/RENDER_COMPLETE_SETUP.sql`

Ce fichier **unique et consolidé** contient:
- ✓ Schéma complet (15 tables)
- ✓ Tous les indexes
- ✓ 17 utilisateurs (2 admins + 15 adhérents)
- ✓ 15 adhérents avec dépendants
- ✓ Données de test complètes (cotisations, prêts, sinistres, etc.)
- ✓ Mots de passe corrigés (bcrypt valides)

---

## 🚀 Exécution via pgAdmin (sur votre machine)

### **Étape 1️⃣ : Télécharger pgAdmin** *(si vous ne l'avez pas)*

- Site officiel: https://www.pgadmin.org/download/
- Version Windows: **pgAdmin 4 (standalone)**

### **Étape 2️⃣ : Se connecter à Render PostgreSQL**

1. **Ouvrir pgAdmin**
2. **Cliquer sur "Servers"** (à gauche)
3. **Créer une nouvelle connexion:**
   - Right-click → **Register** → **Server**
   - **Onglet "General":**
     - **Name:** MaMutuelle-Render
   - **Onglet "Connection":**
     - **Hostname:** `dpg-d8j1v3t8nd3s73e3i92g-a.oregon-postgres.render.com`
     - **Port:** `5432`
     - **Maintenance database:** `mamutuelle_db_j3u7`
     - **Username:** `mamutuelle_db_j3u7_user`
     - **Password:** `Eh3aduCxsg7TlcK3GLfbWkX4O1ijxm9p`
   - **Cliquer "Save"**

### **Étape 3️⃣ : Exécuter le script SQL**

1. **Cliquer sur "MaMutuelle-Render"** pour ouvrir la connexion
2. **Naviguer à:** Databases → mamutuelle_db_j3u7
3. **Cliquer sur l'icône SQL "Query Tool"** (ou right-click → Query Tool)
4. **Une fenêtre "Query Editor" s'ouvre**
5. **Copier TOUT le contenu de:** `database/RENDER_COMPLETE_SETUP.sql`
6. **Coller dans la fenêtre Query Tool**
7. **Appuyer sur F5** ou **cliquer le bouton ▶ Execute**

⏳ **Attendre 5-10 secondes...**

### **Étape 4️⃣ : Vérifier le résultat**

À la fin, vous devriez voir:

```
✅ INSTALLATION COMPLÈTE - RÉSUMÉ
table_name              | count
────────────────────────┼───────
Users                   |    17
Adherents               |    15
Ayants Droit            |    28
Cotisations             |    28
Prêts                   |     5
Remboursements Prêts    |     4
Sinistres               |     3
Prestations             |     2
Alertes                 |     4
```

---

## 📱 Tester la connexion (Frontend)

Après l'exécution, vous pouvez vous connecter avec:

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@mamutuelle.bf` | `password123` |
| **Agent** | `agent@mamutuelle.bf` | `password123` |
| **Adhérent** | `kone.oumar@email.bf` | `password123` |
| **Adhérent** | `zongo.aminata@email.bf` | `password123` |
| *... autres adhérents* | (voir table users) | `password123` |

---

## ⚠️ Troubleshooting

### **Erreur: "Connection refused"**
- ✓ Vérifier les paramètres de connexion pgAdmin
- ✓ Utiliser l'URL **externe** (avec `.oregon-postgres.render.com`)

### **Erreur: "relation already exists"**
- ✓ Le script inclut `DROP TABLE IF EXISTS` - c'est normal
- ✓ Cela nettoiera toutes les anciennes données

### **Erreur: "password authentication failed"**
- ✓ Vérifier le mot de passe PostgreSQL dans les paramètres Render
- ✓ Copier exactement: `Eh3aduCxsg7TlcK3GLfbWkX4O1ijxm9p`

### **Le script s'arrête au milieu?**
- ✓ C'est probablement une erreur de syntaxe SQL
- ✓ Chercher le message d'erreur
- ✓ Relancer le script (il nettoiera et recommencera)

---

## ✅ Après l'exécution

1. **La BD est complètement configurée**
2. **Tous les comptes fonctionnent**
3. **Les données de test sont prêtes**
4. **Vous pouvez vous connecter au frontend**

---

## 📄 Alternative: CLI (si vous préférez)

Si vous avez `psql` installé sur votre machine:

```bash
PGPASSWORD=Eh3aduCxsg7TlcK3GLfbWkX4O1ijxm9p psql \
  -h dpg-d8j1v3t8nd3s73e3i92g-a.oregon-postgres.render.com \
  -U mamutuelle_db_j3u7_user \
  -d mamutuelle_db_j3u7 \
  -f database/RENDER_COMPLETE_SETUP.sql
```

---

## 🎉 Résumé

| Élément | Détail |
|---------|--------|
| **Fichier SQL** | `database/RENDER_COMPLETE_SETUP.sql` |
| **Outil** | pgAdmin (sur votre machine) |
| **BD Render** | `mamutuelle_db_j3u7` |
| **Temps** | 5-10 secondes |
| **Résultat** | ✅ BD complète + données |

**Vous êtes prêt à tester l'application!** 🚀
