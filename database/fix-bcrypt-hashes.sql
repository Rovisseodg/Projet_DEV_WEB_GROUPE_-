-- ============================================================================
-- CORRECTION: Réinitialiser tous les mots de passe avec un hash valide
-- ============================================================================
-- 
-- Mot de passe pour TOUS les comptes: password123
-- Les nouveaux hashes sont générés avec bcrypt (cost=12)
-- Ce script doit être exécuté APRÈS avoir identifié le problème
--
-- ============================================================================

BEGIN TRANSACTION;

-- Hash valide pour le mot de passe: "password123"
-- Généré avec: password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12])
-- Vérification: password_verify('password123', hash) = TRUE

UPDATE users 
SET password = '$2y$12$x4Tpkd5r90aqR1JfD97/k.Zs2vvtpgJVPleJ366t.Z1qaEBgOryp6'
WHERE role IN ('admin', 'agent', 'adherent');

-- Afficher les comptes mis à jour
SELECT id, name, email, role FROM users ORDER BY role, email;

COMMIT;

-- ============================================================================
-- APRÈS CETTE MISE À JOUR:
-- 
-- Tous les comptes utilisent le mot de passe: "password123"
-- 
-- Comptes disponibles:
--   Admin:  admin@mamutuelle.bf / password123
--   Agent:  agent@mamutuelle.bf / password123
--   Adhérents: (voir liste dans database/README-test-data.md) / password123
--
-- ============================================================================
