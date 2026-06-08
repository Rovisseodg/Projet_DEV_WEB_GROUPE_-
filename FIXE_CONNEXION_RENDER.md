# 🔐 Guide de Correction - Problème de Connexion sur Render

## 📌 Le Problème

- ✅ Vous pouvez créer des comptes → C'est normal (ils vont dans `users`)
- ❌ Vous ne pouvez pas vous connecter avec les comptes existants → Ils sont dans `adherents`, pas dans `users`

---

## 🛠️ Solutions (Ordre d'exécution)

### **SOLUTION 1️⃣ : Vérifier/Régénérer les clés secrètes**

Les clés `APP_KEY` et `JWT_SECRET` doivent être identiques entre votre config locale et Render.

#### Générer les clés localement:

```bash
# Dans le dossier backend/
php artisan key:generate --show
# Output: base64:XXXXXXXXXX...

php artisan jwt:secret --show
# Output: YYYYYYYYYY...
```

#### Copier ces valeurs dans Render:

1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Sélectionnez votre service `mamutuelle-api`
3. Onglet "Environment"
4. Modifiez:
   ```
   APP_KEY=base64:XXXXXXXXXX
   JWT_SECRET=YYYYYYYYYY
   ```
5. Cliquez "Save Changes" → Redéploiement automatique

---

### **SOLUTION 2️⃣ : Migrer les adhérents existants**

Vos adhérents doivent avoir un utilisateur associé dans la table `users`.

#### Sur Render (via psql):

```bash
# Option A: Via Render Shell
# 1. Aller dans votre service Render
# 2. Cliquer "Shell"
# 3. Copier cette commande:

php backend/migrate_users.php
```

#### OU localement (si vous avez accès à la BD):

```bash
# Dans la racine du projet
php backend/migrate_users.php
```

---

### **SOLUTION 3️⃣ : Corriger les hachés de mots de passe**

Si les mots de passe existants ne marchent pas, c'est souvent un problème de format bcrypt.

#### Vérifier l'état:

```bash
php backend/diagnose_db.php
```

#### Régénérer les mots de passe existants:

```bash
php backend/check_bcrypt.php
```

---

## 🔍 Diagnostic Complet

Exécutez cet ordre sur Render Shell ou localement:

```bash
# 1. Vérifier l'état de la BD
php backend/diagnose_db.php

# 2. Si des adhérents ne sont pas migrés:
php backend/migrate_users.php

# 3. Si les hashes bcrypt sont invalides:
php backend/check_bcrypt.php

# 4. Vérifier les variables d'environnement
cat .env
```

---

## ✅ Checklist de Vérification

- [ ] APP_KEY est correctement défini dans Render
- [ ] JWT_SECRET est correctement défini dans Render
- [ ] Tous les adhérents ont un user_id (run migrate_users.php)
- [ ] Les hashes bcrypt sont valides (run diagnose_db.php)
- [ ] Vous pouvez créer un nouvel utilisateur ✓
- [ ] Vous pouvez vous connecter avec un utilisateur créé récemment
- [ ] Vous pouvez vous connecter avec un utilisateur migré

---

## 🆘 Si ça ne fonctionne toujours pas

Exécutez ces commandes ET envoyez-moi le résultat:

```bash
php backend/diagnose_db.php
php backend/check_bcrypt.php
```

---

## 📱 Résumé des Fichiers d'Aide

| Fichier | Utilité |
|---------|---------|
| `diagnose_db.php` | Vérifier l'état de la BD |
| `migrate_users.php` | Migrer les adhérents vers `users` |
| `check_bcrypt.php` | Vérifier/corriger les hashes |
| `create_admin.php` | Créer un utilisateur admin |

