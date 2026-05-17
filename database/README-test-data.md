# Données de Test - MaMutuelle

Ce document explique comment utiliser les données de test pour le système MaMutuelle.

## Comptes de Test Disponibles

### ⚠️ Identifiants Universels de Test
**Tous les comptes utilisent le même mot de passe : `password123`**

### Comptes Administrateur et Agent
- **Admin** : `admin@mamutuelle.bf` / `password123`
- **Agent** : `agent@mamutuelle.bf` / `password123`

### Comptes Adhérents (15 comptes)
Tous les mots de passe sont identiques : `password123`

**Note de Sécurité:** En production, chaque utilisateur doit avoir un mot de passe unique et fort.

| Email | Nom | Prénom | N° Adhérent | Statut |
|-------|-----|--------|-------------|--------|
| kone.oumar@email.bf | Koné | Oumar | ADH001 | Actif |
| zongo.aminata@email.bf | Zongo | Aminata | ADH002 | Actif |
| bambara.brice@email.bf | Bambara | Brice | ADH003 | Actif |
| sawadogo.mariam@email.bf | Sawadogo | Mariam | ADH004 | Actif |
| ouedraogo.issouf@email.bf | Ouédraogo | Issouf | ADH005 | Actif |
| diallo.fatoumata@email.bf | Diallo | Fatoumata | ADH006 | Actif |
| traore.souleymane@email.bf | Traoré | Souleymane | ADH007 | Actif |
| kabore.awa@email.bf | Kaboré | Awa | ADH008 | Actif |
| sanou.ibrahim@email.bf | Sanou | Ibrahim | ADH009 | Actif |
| nikiema.pauline@email.bf | Nikiéma | Pauline | ADH010 | Actif |
| ouattara.karim@email.bf | Ouattara | Karim | ADH011 | Actif |
| bado.rasmata@email.bf | Bado | Rasmata | ADH012 | Actif |
| yameogo.blaise@email.bf | Yameogo | Blaise | ADH013 | Actif |
| compaore.sophie@email.bf | Compaoré | Sophie | ADH014 | Actif |
| zida.michel@email.bf | Zida | Michel | ADH015 | Suspendu |

## Installation des Données

### 1. Données de Base (Seeder Laravel)
```bash
cd backend
php artisan db:seed
```

### 2. Données Supplémentaires (SQL)
```bash
# Depuis le répertoire racine du projet
mysql -u [username] -p [database_name] < database/test-data-additional.sql
# ou
psql -U [username] -d [database_name] -f database/test-data-additional.sql
```

## Statistiques des Données

### Données de Base (Seeder)
- **5 utilisateurs** (1 admin, 1 agent, 3 adhérents)
- **5 adhérents** avec profils complets
- **7 ayants droit**
- **25 cotisations** (différents statuts)
- **5 prêts** (différents statuts)
- **5 remboursements** de prêt
- **5 sinistres** (différents statuts)
- **6 prestations**
- **6 alertes**

### Données Supplémentaires (SQL)
- **10 utilisateurs** adhérents
- **10 adhérents** avec profils complets
- **18 ayants droit**
- **25 cotisations** (différents statuts)
- **10 prêts** (différents statuts)
- **8 remboursements** de prêt
- **10 sinistres** (différents statuts)
- **6 prestations**
- **9 alertes**

### **TOTAL GLOBAL**
- **15 utilisateurs** (1 admin, 1 agent, 13 adhérents)
- **15 adhérents** avec profils complets
- **25 ayants droit**
- **50 cotisations** (différents statuts)
- **15 prêts** (différents statuts)
- **13 remboursements** de prêt
- **15 sinistres** (différents statuts)
- **12 prestations**
- **15 alertes**

## Scénarios de Test Disponibles

### Gestion des Cotisations
- **ADH002** : 2 cotisations en retard (février et mars 2024)
- **ADH004** : 1 cotisation en retard (février 2024)
- **ADH007** : 2 cotisations en retard (février et mars 2024)
- **ADH010** : 2 cotisations en retard (janvier et février 2024)

### Gestion des Prêts
- **ADH001** : Prêt approuvé (150k FCFA, 12 mois) - 4 échéances payées, 2 en attente
- **ADH003** : Prêt approuvé (300k FCFA, 24 mois)
- **ADH005** : Prêt remboursé (100k FCFA, 6 mois)
- **ADH006** : Prêt approuvé (200k FCFA, 18 mois) - 2 échéances payées, 1 en attente
- **ADH007** : Prêt approuvé (350k FCFA, 24 mois) - 2 échéances payées, 1 en attente

### Gestion des Sinistres
- **ADH001** : Sinistre approuvé (hospitalisation paludisme - 70k remboursés)
- **ADH003** : Sinistre approuvé (accident moto - 100k remboursés)
- **ADH005** : Sinistre approuvé (décès père - 150k remboursés)
- **ADH010** : Sinistre en cours (cardiologie - 35k réclamés)
- **ADH012** : Sinistre en cours (pneumonie enfant - 60k réclamés)

### Alertes Actives
- **6 alertes** de retard de cotisation
- **3 alertes** d'échéance de prêt
- **2 alertes** de sinistre en cours

## Tests Fonctionnels Recommandés

### Pour les Adhérents
1. **Connexion** : Utiliser n'importe quel compte adhérent
2. **Tableau de bord** : Vérifier l'affichage des statistiques
3. **Cotisations** : Consulter l'historique et les statuts
4. **Prêts** : Voir les prêts actifs et remboursements
5. **Sinistres** : Consulter les dossiers et remboursements
6. **Ayants droit** : Gérer les personnes couvertes

### Pour les Agents/Admins
1. **Gestion adhérents** : CRUD complet des profils
2. **Cotisations** : Validation et suivi des paiements
3. **Prêts** : Approbation et suivi des remboursements
4. **Sinistres** : Traitement des demandes et remboursements
5. **Statistiques** : Tableaux de bord et rapports

## Notes Techniques

- **Tous les mots de passe sont identiques :** `password123` (hashés avec bcrypt 12 rounds)
- Hash bcrypt : `$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK`
- Les montants sont en FCFA (Francs CFA)
- Les dates sont réalistes pour 2024
- Les statuts couvrent tous les cas métier possibles
- Les données respectent les contraintes de clés étrangères
- **⚠️ IMPORTANT:** Ces données sont pour les tests uniquement. Ne pas utiliser en production.