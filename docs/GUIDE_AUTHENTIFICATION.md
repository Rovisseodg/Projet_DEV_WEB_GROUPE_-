# 🔐 GUIDE D'AUTHENTIFICATION - MAMUTUELLE

**Document:** Guide des données de connexion pour les tests  
**Date:** Mai 2026  
**Version:** 2.0 - Harmonisée

---

## ✅ Mot de Passe Universel de Test

**Tous les comptes utilisent le même mot de passe pour les tests :**

```
Mot de passe en clair : password123
Hash Bcrypt (12 rounds) : $2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK
```

---

## Comptes de Test Disponibles

### 🔐 Admin
- **Email:** `admin@mamutuelle.bf`
- **Mot de passe:** `password123`
- **Rôle:** Administrateur système
- **Accès:** Gestion complète du système

### 👤 Agent
- **Email:** `agent@mamutuelle.bf`
- **Mot de passe:** `password123`
- **Rôle:** Agent de service
- **Accès:** Gestion des demandes et cotisations

### 👥 Adhérents (15 comptes)

Tous les adhérents utilisent le mot de passe : `password123`

| Email | N° Adhérent | Statut | Cas de Test |
|-------|-------------|--------|-------------|
| kone.oumar@email.bf | ADH001 | Actif | Prêt approuvé, sinistre remboursé |
| zongo.aminata@email.bf | ADH002 | Actif | Cotisations en retard |
| bambara.brice@email.bf | ADH003 | Actif | Prêt approuvé, sinistre approuvé |
| sawadogo.mariam@email.bf | ADH004 | Actif | Cotisation en retard |
| ouedraogo.issouf@email.bf | ADH005 | Actif | Prêt remboursé |
| diallo.fatoumata@email.bf | ADH006 | Actif | Prêt approuvé, cotisations à jour |
| traore.souleymane@email.bf | ADH007 | Actif | Prêt approuvé, cotisations en retard |
| kabore.awa@email.bf | ADH008 | Actif | Prêt approuvé, bonnes pratiques |
| sanou.ibrahim@email.bf | ADH009 | Actif | Sinistre approuvé, prêt remboursé |
| nikiema.pauline@email.bf | ADH010 | Actif | Cotisations en retard, prêt en attente |
| ouattara.karim@email.bf | ADH011 | Actif | Prêt approuvé, sinistre approuvé |
| bado.rasmata@email.bf | ADH012 | Actif | Prêt en attente, sinistre en cours |
| yameogo.blaise@email.bf | ADH013 | Actif | Excellent profil, prêt important |
| compaore.sophie@email.bf | ADH014 | Actif | Prêt rejeté, sinistre déclaré |
| zida.michel@email.bf | ADH015 | Suspendu | Compte désactivé pour tests |

---

## Détails Techniques

### Hachage des Mots de Passe
```
Algorithme: Bcrypt
Rounds: 12
Coût de calcul: ~100-130ms par vérification
Sécurité: Résistant aux attaques par brute-force
```

### Vérification en Production
```bash
# Pour vérifier qu'un compte utilise le bon hash
psql "postgresql://[user]:[pass]@[host]:[port]/railway"

# Afficher tous les mots de passe hashés
SELECT email, password FROM users;

# Vérifier un compte spécifique
SELECT email, password FROM users WHERE email = 'admin@mamutuelle.bf';
```

---

## ⚠️ IMPORTANT - Sécurité en Production

**NE JAMAIS utiliser ces données de test en production !**

✅ **À faire :**
- Modifier TOUS les mots de passe avec des valeurs fortes uniques
- Utiliser au minimum 12 rounds Bcrypt
- Implémenter des règles de complexité des mots de passe
- Mettre en place une politique de réinitialisation
- Monitorer les tentatives de connexion échouées

### Script de Réinitialisation (Exemple)
```sql
-- Générer un mot de passe fort avec Laravel Artisan
-- php artisan make:password 'nouveau_password_fort'

UPDATE users SET password = 'NOUVEAU_HASH_BCRYPT' WHERE email = 'email@example.bf';
```

### Hash Set 1 - Mot de passe inconnu:
```
Hash: $2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK
Mot de passe: À vérifier (non identifié comme hash standard)
```

---

## Actions à Effectuer

### Priorité 1: Standardiser
```bash
# 1. Générer un nouveau hash cohérent
php artisan tinker
> Hash::make('SecurePassword2024!')  # Utilisez un mot de passe fort

# 2. Utiliser ce hash partout
# 3. Documenter le mot de passe de manière sécurisée (manager password)
```

### Priorité 2: Documenter
```
- Créer un fichier d'authentification sécurisé (non versionné)
- Utiliser un password manager (Vault, LastPass, 1Password)
- Partager les credentials via canaux sécurisés uniquement
```

### Priorité 3: Mettre à jour le code
```bash
# Mettre à jour railway-seed.sql
# Redéployer sur Railway

# Appliquer migrations:
php artisan migrate:fresh --seed
```

---

## Rappel de Sécurité

⚠️ **IMPORTANT:**
- Jamais de mots de passe en clair dans le code/git
- Jamais de mots de passe dans les fichiers documentés publiquement
- Utiliser un password manager d'équipe
- Rotationner les mots de passe régulièrement
- Les hashes Bcrypt ne sont jamais stockés "à l'envers" (irréversibles par conception)

---

**Checklist avant Production:**

- [ ] Utiliser 12 rounds minimum pour Bcrypt
- [ ] Générer des passwords forts et uniques
- [ ] Stocker passwords dans un password manager sécurisé
- [ ] Supprimer tout password en clair du code/docs
- [ ] Activer l'authentification 2FA si possible
- [ ] Configurer des AlerteSilogin échouées
- [ ] Audit logs en place

---

**Rapport généré:** Mai 2026  
**État:** ⚠️ CORRECTION REQUISE (Hashes non uniformes)
