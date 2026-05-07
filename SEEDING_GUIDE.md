# 🌱 Database Seeding Guide for Railway

## 📋 Files Created

### 1. `database/seed-data.sql`
Fichier SQL complet avec toutes les données de test pour MaMutuelle.

**Contient:**
- 7 utilisateurs (1 admin + 1 agent + 5 adhérents)
- 5 adhérents
- 7 ayants droit
- 15 cotisations
- 5 prêts
- 4 remboursements de prêts
- 3 sinistres
- 2 prestations
- 4 alertes

### 2. `scripts/seed-database.sh`
Script bash pour exécuter le seeding automatiquement sur Railway.

### 3. `scripts/seed-database.cmd`
Script Windows CMD pour exécuter le seeding sur Windows.

### 4. `scripts/seed-database.ps1`
Script PowerShell pour une exécution Windows plus propre.

## 🚀 How to Use on Railway

### Option 1: Manual SQL Execution (Recommended for First Setup)

1. **Connect to PostgreSQL on Railway:**
   - Go to your Railway project
   - Click on your PostgreSQL service
   - Copy the Database URL from the variables tab

2. **Run the SQL script:**
   ```bash
   psql "your-database-url" -f database/seed-data.sql
   ```

3. **Verify the data:**
   ```bash
   psql "your-database-url" -c "SELECT 'Users:' AS info, COUNT(*) FROM users UNION ALL SELECT 'Adherents:', COUNT(*) FROM adherents UNION ALL SELECT 'Cotisations:', COUNT(*) FROM cotisations;"
   ```

### Option 2: Via Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Install PostgreSQL client (`psql`) on Windows:**
   - Via Chocolatey:
     ```powershell
     choco install postgresql
     ```
   - Ou via PostgreSQL installer from https://www.postgresql.org/download/windows/

3. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Connect to your project:**
   ```bash
   railway link
   ```

4. **Run the seeding script**

   - On macOS/Linux:
     ```bash
     railway run bash scripts/seed-database.sh
     ```

   - On Windows CMD:
     ```cmd
     railway run cmd /c scripts\seed-database.cmd
     ```

   - On Windows PowerShell:
     ```powershell
     railway run powershell -File scripts\seed-database.ps1
     ```

### Option 3: Via Railway Web Interface

1. Go to your Railway project → PostgreSQL service
2. Click "Query" button
3. Copy-paste the contents of `database/seed-data.sql`
4. Execute the query

## 🔐 Test Accounts After Seeding

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mamutuelle.bf | password123 |
| Agent | agent@mamutuelle.bf | password123 |
| Adhérent | kone.oumar@email.bf | password123 |
| Adhérent | zongo.aminata@email.bf | password123 |

## 📊 Data Summary

After seeding, you'll have:
- **7 Users** (roles: admin, agent, adherent)
- **5 Adherents** (with contact info and addresses)
- **7 Ayants Droit** (family members)
- **15 Cotisations** (subscription payments, various statuses)
- **5 Prêts** (loans, various statuses)
- **4 Remboursements Prêts** (loan repayments)
- **3 Sinistres** (claims)
- **2 Prestations** (benefits)
- **4 Alertes** (alerts/notifications)

## ⚠️ Important Notes

1. **Password Hash**: The password hash in the SQL script is for `password123`
   - Hash: `$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK`

2. **Timestamps**: All `created_at` and `updated_at` are set to `NOW()` (current time when executed)

3. **Foreign Keys**: The script temporarily disables and re-enables PostgreSQL foreign key constraints for performance

4. **Idempotent**: The script uses `DELETE FROM` statements to clean existing data before inserting, so it's safe to run multiple times

## 🐛 Troubleshooting

### Connection Error
```bash
# Check if DATABASE_URL is correctly set
echo $DATABASE_URL

# Or use explicit connection string
psql -h host -U user -d database -f database/seed-data.sql
```

### Permission Error
Make sure your Railway PostgreSQL user has the necessary permissions (should be automatic for the owner)

### Constraint Violations
If you get foreign key errors:
1. Ensure the schema.sql has been run first
2. Run the seed-data.sql script immediately after creating tables

## 📝 Modifying the Data

To add or modify test data:
1. Edit `database/seed-data.sql`
2. Follow the same INSERT statement format
3. Ensure all foreign key references are valid
4. Test locally before deploying to Railway

## ✅ Verification Queries

After seeding, you can verify the data with these queries:

```sql
-- Check all users
SELECT * FROM users;

-- Check adherents with their users
SELECT a.numero_adherent, a.nom, a.prenom, u.email 
FROM adherents a
JOIN users u ON a.user_id = u.id;

-- Check cotisations by adherent
SELECT a.numero_adherent, COUNT(*) as total_cotisations, 
       SUM(CASE WHEN c.statut = 'payée' THEN c.montant ELSE 0 END) as paid
FROM cotisations c
JOIN adherents a ON c.adherent_id = a.id
GROUP BY a.numero_adherent;

-- Check prets
SELECT a.numero_adherent, p.montant, p.statut
FROM prets p
JOIN adherents a ON p.adherent_id = a.id;
```
