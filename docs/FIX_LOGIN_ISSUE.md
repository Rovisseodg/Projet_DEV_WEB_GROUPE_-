# 🔐 Guide de Correction - Problème de Connexion

## Le Problème

❌ Vous ne pouvez **pas** vous connecter avec les comptes existants dans la BD  
✅ Vous **pouvez** créer de nouveaux comptes qui fonctionnent

### Cause Trouvée

Le hash bcrypt dans les données initiales de la BD est **invalide** et ne correspond à aucun mot de passe réel :

```
Hash invalide dans la BD: 
$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK
```

## La Solution

### Option 1: Via pgAdmin (Recommandé)

1. **Ouvrir pgAdmin** et se connecter
2. **Accéder à la Query Tool** du serveur PostgreSQL
3. **Copier-coller** le contenu du fichier: [`database/fix-bcrypt-hashes.sql`](../database/fix-bcrypt-hashes.sql)
4. **Exécuter** (F5)

### Option 2: Via Terminal

```bash
# Local (Docker)
cd /path/to/backend
docker-compose exec db psql -U mamutuelle_user -d mamutuelle < ../database/fix-bcrypt-hashes.sql

# Ou directement via psql
psql -h your-host -U mamutuelle_user -d mamutuelle < database/fix-bcrypt-hashes.sql
```

### Option 3: Via Render (Production)

```bash
# Depuis votre terminal local
psql -h your-render-postgres-url.onrender.com \
     -U mamutuelle_user \
     -d mamutuelle_production \
     < database/fix-bcrypt-hashes.sql
```

## ✅ Après la Correction

### Tous les comptes utilisent le mot de passe: `password123`

#### Comptes Admin/Agent:
- **Email:** `admin@mamutuelle.bf` / **Password:** `password123`
- **Email:** `agent@mamutuelle.bf` / **Password:** `password123`

#### Comptes Adhérents Disponibles:
| Email | Mot de passe |
|-------|--------------|
| kone.oumar@email.bf | password123 |
| zongo.aminata@email.bf | password123 |
| bambara.brice@email.bf | password123 |
| sawadogo.mariam@email.bf | password123 |
| ouedraogo.issouf@email.bf | password123 |
| *(et 10 autres selon le fichier database.sql)* | password123 |

## 🔒 Important pour la Production

⚠️ **NE PAS** utiliser le même mot de passe pour tous les comptes en production!

Pour changer les mots de passe individuellement:

```sql
-- Exemple: changer le password de l'admin
UPDATE users 
SET password = '$2y$12$[YOUR_NEW_BCRYPT_HASH]' 
WHERE email = 'admin@mamutuelle.bf';
```

Pour générer un hash bcrypt valide en PHP:
```php
$new_hash = password_hash('your_password_here', PASSWORD_BCRYPT, ['cost' => 12]);
echo $new_hash;
```

## 📋 Checklist

- [ ] Backup de la BD (avant de modifier)
- [ ] Exécution du script `fix-bcrypt-hashes.sql`
- [ ] Vérifier que la connexion fonctionne avec `admin@mamutuelle.bf / password123`
- [ ] Tester un compte adhérent
- [ ] Supprimer les comptes de test après le passage en production

## 🚀 Vérification Rapide

### Via cURL
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mamutuelle.bf",
    "password": "password123"
  }'
```

### Via Postman
1. **Method:** POST
2. **URL:** `http://localhost:8000/api/login`
3. **Body (JSON):**
```json
{
  "email": "admin@mamutuelle.bf",
  "password": "password123"
}
```

Si vous recevez un **token JWT**, la connexion fonctionne! ✅

---

**Questions?** Consultez le fichier [`GUIDE_AUTHENTIFICATION.md`](../docs/GUIDE_AUTHENTIFICATION.md)
