-- ============================================================
-- MaMutuelle Database Seeding Script
-- PostgreSQL Syntax - Complete Test Data
-- ============================================================

BEGIN TRANSACTION;

-- Clear existing data in reverse dependency order
DELETE FROM prestations;
DELETE FROM alertes;
DELETE FROM sinistres;
DELETE FROM remboursements_prets;
DELETE FROM cotisations;
DELETE FROM ayants_droit;
DELETE FROM prets;
DELETE FROM adherents;
DELETE FROM audit_logs;
DELETE FROM users;

-- ============================================================
-- 1. USERS
-- ============================================================

INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Admin MaMutuelle', 'admin@mamutuelle.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'admin', NOW(), NOW()),
('Agent Service', 'agent@mamutuelle.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'agent', NOW(), NOW()),
('Koné Oumar', 'kone.oumar@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Zongo Aminata', 'zongo.aminata@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Bambara Brice', 'bambara.brice@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Sawadogo Mariam', 'sawadogo.mariam@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Ouédraogo Issouf', 'ouedraogo.issouf@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW());

-- ============================================================
-- 2. ADHERENTS
-- ============================================================
DELETE FROM adherents;

INSERT INTO adherents (user_id, numero_adherent, nom, prenom, email, telephone, date_naissance, genre, adresse, ville, code_postal, date_inscription, statut, created_at, updated_at) VALUES
(3, 'ADH001', 'Koné', 'Oumar', 'kone.oumar@email.bf', '+226 62 11 22 33', '1985-03-22', 'homme', 'Secteur 12, Rue 10.45', 'Ouagadougou', '01 BP 000', '2023-01-15', 'actif', NOW(), NOW()),
(4, 'ADH002', 'Zongo', 'Aminata', 'zongo.aminata@email.bf', '+226 76 22 33 44', '1990-07-14', 'femme', 'Secteur 4, Avenue Yennenga', 'Ouagadougou', '01 BP 001', '2023-02-01', 'actif', NOW(), NOW()),
(5, 'ADH003', 'Bambara', 'Brice', 'bambara.brice@email.bf', '+226 65 33 44 55', '1988-11-05', 'homme', 'Rue du Commerce', 'Bobo-Dioulasso', '01 BP 002', '2023-03-10', 'actif', NOW(), NOW()),
(6, 'ADH004', 'Sawadogo', 'Mariam', 'sawadogo.mariam@email.bf', '+226 71 44 55 66', '1992-05-30', 'femme', 'Secteur 7, Rue 8.12', 'Ouagadougou', '01 BP 003', '2023-04-05', 'actif', NOW(), NOW()),
(7, 'ADH005', 'Ouédraogo', 'Issouf', 'ouedraogo.issouf@email.bf', '+226 78 55 66 77', '1980-01-18', 'homme', 'Avenue Kwame Nkrumah', 'Ouagadougou', '01 BP 004', '2023-05-20', 'actif', NOW(), NOW());

-- ============================================================
-- 3. AYANTS DROIT
-- ============================================================
DELETE FROM ayants_droit;

INSERT INTO ayants_droit (adherent_id, nom, prenom, relation, date_naissance, created_at, updated_at) VALUES
(1, 'Koné', 'Aïcha', 'epoux', '1987-06-10', NOW(), NOW()),
(1, 'Koné', 'Ibrahim', 'enfant', '2010-03-15', NOW(), NOW()),
(2, 'Zongo', 'Moussa', 'epoux', '1988-04-20', NOW(), NOW()),
(2, 'Zongo', 'Salimata', 'enfant', '2015-11-05', NOW(), NOW()),
(3, 'Bambara', 'Marie', 'epoux', '1990-02-28', NOW(), NOW()),
(4, 'Sawadogo', 'Adama', 'epoux', '1989-07-17', NOW(), NOW()),
(5, 'Ouédraogo', 'Kadiatou', 'epoux', '1982-09-12', NOW(), NOW());

-- ============================================================
-- 4. COTISATIONS
-- ============================================================
DELETE FROM cotisations;

INSERT INTO cotisations (adherent_id, montant, date_echeance, date_paiement, statut, reference_paiement, mode_paiement, created_at, updated_at) VALUES
-- ADH001 — Koné Oumar
(1, 5000, '2024-01-31', '2024-01-28', 'payée', 'REF-2024-001', 'virement', NOW(), NOW()),
(1, 5000, '2024-02-29', '2024-02-25', 'payée', 'REF-2024-002', 'virement', NOW(), NOW()),
(1, 5000, '2024-03-31', '2024-03-27', 'payée', 'REF-2024-003', 'virement', NOW(), NOW()),
(1, 5000, '2024-04-30', NULL, 'en attente', '', NULL, NOW(), NOW()),
-- ADH002 — Zongo Aminata
(2, 5000, '2024-01-31', '2024-02-05', 'payée', 'REF-2024-010', 'especes', NOW(), NOW()),
(2, 5000, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
(2, 5000, '2024-03-31', NULL, 'en retard', '', NULL, NOW(), NOW()),
-- ADH003 — Bambara Brice
(3, 7500, '2024-01-31', '2024-01-30', 'payée', 'REF-2024-020', 'cheque', NOW(), NOW()),
(3, 7500, '2024-02-29', '2024-02-28', 'payée', 'REF-2024-021', 'cheque', NOW(), NOW()),
(3, 7500, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
-- ADH004 — Sawadogo Mariam
(4, 5000, '2024-01-31', '2024-01-29', 'payée', 'REF-2024-030', 'carte', NOW(), NOW()),
(4, 5000, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
-- ADH005 — Ouédraogo Issouf
(5, 5000, '2024-01-31', '2024-01-31', 'payée', 'REF-2024-040', 'virement', NOW(), NOW()),
(5, 5000, '2024-02-29', '2024-02-29', 'payée', 'REF-2024-041', 'virement', NOW(), NOW()),
(5, 5000, '2024-03-31', '2024-03-31', 'payée', 'REF-2024-042', 'virement', NOW(), NOW());

-- ============================================================
-- 5. PRÊTS
-- ============================================================
DELETE FROM prets;

INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, date_fin, statut, created_at, updated_at) VALUES
(1, 150000, 2.5, 12, '2024-01-15', '2025-01-15', 'approuvé', NOW(), NOW()),
(3, 300000, 3.0, 24, '2024-02-01', '2026-02-01', 'approuvé', NOW(), NOW()),
(5, 100000, 2.5, 6, '2024-03-01', '2024-09-01', 'remboursé', NOW(), NOW()),
(2, 75000, 3.5, 12, '2024-04-01', '2025-04-01', 'en attente', NOW(), NOW()),
(4, 50000, 4.0, 6, '2024-05-01', '2024-11-01', 'rejeté', NOW(), NOW());

-- ============================================================
-- 6. REMBOURSEMENTS PRÊTS (pour ADH001)
-- ============================================================
DELETE FROM remboursements_prets;

INSERT INTO remboursements_prets (pret_id, numero_mensualite, montant, date_echeance, date_paiement, statut, created_at, updated_at) VALUES
(1, 1, 12500, '2024-02-15', '2024-02-14', 'payée', NOW(), NOW()),
(1, 2, 12500, '2024-03-15', '2024-03-15', 'payée', NOW(), NOW()),
(1, 3, 12500, '2024-04-15', '2024-04-16', 'payée', NOW(), NOW()),
(1, 4, 12500, '2024-05-15', NULL, 'en attente', NOW(), NOW());

-- ============================================================
-- 7. SINISTRES
-- ============================================================
DELETE FROM sinistres;

INSERT INTO sinistres (adherent_id, type_sinistre, description, date_sinistre, statut, created_at, updated_at) VALUES
(1, 'maladie', 'Crise paludique avec hospitalisation 5 jours', '2024-02-10', 'approuvé', NOW(), NOW()),
(3, 'accident', 'Accident de circulation - fracture bras droit', '2024-01-20', 'approuvé', NOW(), NOW()),
(2, 'maladie', 'Hypertension - suivi médical', '2024-03-05', 'en attente', NOW(), NOW());

-- ============================================================
-- 8. PRESTATIONS
-- ============================================================
DELETE FROM prestations;

INSERT INTO prestations (sinistre_id, type_prestation, description, montant, date_demande, date_approbation, statut, created_at, updated_at) VALUES
(1, 'Remboursement hospitalisation', 'Frais clinique + médicaments paludisme', 70000, '2024-02-15', '2024-02-25', 'approuvée', NOW(), NOW()),
(2, 'Remboursement accident', 'Frais chirurgie et plâtre bras droit', 100000, '2024-01-25', '2024-02-05', 'approuvée', NOW(), NOW());

-- ============================================================
-- 9. ALERTES
-- ============================================================
DELETE FROM alertes;

INSERT INTO alertes (adherent_id, type_alerte, message, statut, created_at, updated_at) VALUES
(2, 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
(2, 'retard_cotisation', 'Cotisation de mars 2024 non payée', 'active', NOW(), NOW()),
(4, 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
(1, 'pret_echeance', 'Mensualité prêt du 15/05/2024 bientôt due', 'active', NOW(), NOW());

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'Users:' AS info, COUNT(*) FROM users
UNION ALL
SELECT 'Adherents:', COUNT(*) FROM adherents
UNION ALL
SELECT 'Ayants Droit:', COUNT(*) FROM ayants_droit
UNION ALL
SELECT 'Cotisations:', COUNT(*) FROM cotisations
UNION ALL
SELECT 'Prêts:', COUNT(*) FROM prets
UNION ALL
SELECT 'Remboursements:', COUNT(*) FROM remboursements_prets
UNION ALL
SELECT 'Sinistres:', COUNT(*) FROM sinistres
UNION ALL
SELECT 'Prestations:', COUNT(*) FROM prestations
UNION ALL
SELECT 'Alertes:', COUNT(*) FROM alertes;
