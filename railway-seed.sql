-- ============================================================
-- MaMutuelle Railway Seed Script
-- Fusion de seed-data.sql et test-data-additional.sql
-- PostgreSQL compatible
-- ============================================================

BEGIN;

-- Nettoyage des tables dans l'ordre inverse des dépendances
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
INSERT INTO adherents (user_id, numero_adherent, nom, prenom, email, telephone, date_naissance, genre, adresse, ville, code_postal, date_inscription, statut, created_at, updated_at) VALUES
(3, 'ADH001', 'Koné', 'Oumar', 'kone.oumar@email.bf', '+226 62 11 22 33', '1985-03-22', 'homme', 'Secteur 12, Rue 10.45', 'Ouagadougou', '01 BP 000', '2023-01-15', 'actif', NOW(), NOW()),
(4, 'ADH002', 'Zongo', 'Aminata', 'zongo.aminata@email.bf', '+226 76 22 33 44', '1990-07-14', 'femme', 'Secteur 4, Avenue Yennenga', 'Ouagadougou', '01 BP 001', '2023-02-01', 'actif', NOW(), NOW()),
(5, 'ADH003', 'Bambara', 'Brice', 'bambara.brice@email.bf', '+226 65 33 44 55', '1988-11-05', 'homme', 'Rue du Commerce', 'Bobo-Dioulasso', '01 BP 002', '2023-03-10', 'actif', NOW(), NOW()),
(6, 'ADH004', 'Sawadogo', 'Mariam', 'sawadogo.mariam@email.bf', '+226 71 44 55 66', '1992-05-30', 'femme', 'Secteur 7, Rue 8.12', 'Ouagadougou', '01 BP 003', '2023-04-05', 'actif', NOW(), NOW()),
(7, 'ADH005', 'Ouédraogo', 'Issouf', 'ouedraogo.issouf@email.bf', '+226 78 55 66 77', '1980-01-18', 'homme', 'Avenue Kwame Nkrumah', 'Ouagadougou', '01 BP 004', '2023-05-20', 'actif', NOW(), NOW());

-- ============================================================
-- 3. AYANTS DROIT
-- ============================================================
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
INSERT INTO cotisations (adherent_id, montant, date_echeance, date_paiement, statut, reference_paiement, mode_paiement, created_at, updated_at) VALUES
(1, 5000, '2024-01-31', '2024-01-28', 'payée', 'REF-2024-001', 'virement', NOW(), NOW()),
(1, 5000, '2024-02-29', '2024-02-25', 'payée', 'REF-2024-002', 'virement', NOW(), NOW()),
(1, 5000, '2024-03-31', '2024-03-27', 'payée', 'REF-2024-003', 'virement', NOW(), NOW()),
(1, 5000, '2024-04-30', NULL, 'en attente', '', NULL, NOW(), NOW()),
(2, 5000, '2024-01-31', '2024-02-05', 'payée', 'REF-2024-010', 'especes', NOW(), NOW()),
(2, 5000, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
(2, 5000, '2024-03-31', NULL, 'en retard', '', NULL, NOW(), NOW()),
(3, 7500, '2024-01-31', '2024-01-30', 'payée', 'REF-2024-020', 'cheque', NOW(), NOW()),
(3, 7500, '2024-02-29', '2024-02-28', 'payée', 'REF-2024-021', 'cheque', NOW(), NOW()),
(3, 7500, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
(4, 5000, '2024-01-31', '2024-01-29', 'payée', 'REF-2024-030', 'carte', NOW(), NOW()),
(4, 5000, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
(5, 5000, '2024-01-31', '2024-01-31', 'payée', 'REF-2024-040', 'virement', NOW(), NOW()),
(5, 5000, '2024-02-29', '2024-02-29', 'payée', 'REF-2024-041', 'virement', NOW(), NOW()),
(5, 5000, '2024-03-31', '2024-03-31', 'payée', 'REF-2024-042', 'virement', NOW(), NOW());

-- ============================================================
-- 5. PRÊTS
-- ============================================================
INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, date_fin, statut, created_at, updated_at) VALUES
(1, 150000, 2.5, 12, '2024-01-15', '2025-01-15', 'approuvé', NOW(), NOW()),
(3, 300000, 3.0, 24, '2024-02-01', '2026-02-01', 'approuvé', NOW(), NOW()),
(5, 100000, 2.5, 6, '2024-03-01', '2024-09-01', 'remboursé', NOW(), NOW()),
(2, 75000, 3.5, 12, '2024-04-01', '2025-04-01', 'en attente', NOW(), NOW()),
(4, 50000, 4.0, 6, '2024-05-01', '2024-11-01', 'rejeté', NOW(), NOW());

-- ============================================================
-- 6. REMBOURSEMENTS PRÊTS (pour ADH001)
-- ============================================================
INSERT INTO remboursements_prets (pret_id, numero_mensualite, montant, date_echeance, date_paiement, statut, created_at, updated_at) VALUES
(1, 1, 12500, '2024-02-15', '2024-02-14', 'payée', NOW(), NOW()),
(1, 2, 12500, '2024-03-15', '2024-03-15', 'payée', NOW(), NOW()),
(1, 3, 12500, '2024-04-15', '2024-04-16', 'payée', NOW(), NOW()),
(1, 4, 12500, '2024-05-15', NULL, 'en attente', NOW(), NOW());

-- ============================================================
-- 7. SINISTRES
-- ============================================================
INSERT INTO sinistres (adherent_id, type_sinistre, description, date_sinistre, statut, created_at, updated_at) VALUES
(1, 'maladie', 'Crise paludique avec hospitalisation 5 jours', '2024-02-10', 'approuvé', NOW(), NOW()),
(3, 'accident', 'Accident de circulation - fracture bras droit', '2024-01-20', 'approuvé', NOW(), NOW()),
(2, 'maladie', 'Hypertension - suivi médical', '2024-03-05', 'en attente', NOW(), NOW());

-- ============================================================
-- 8. PRESTATIONS
-- ============================================================
INSERT INTO prestations (sinistre_id, type_prestation, description, montant, date_demande, date_approbation, statut, created_at, updated_at) VALUES
(1, 'Remboursement hospitalisation', 'Frais clinique + médicaments paludisme', 70000, '2024-02-15', '2024-02-25', 'approuvée', NOW(), NOW()),
(2, 'Remboursement accident', 'Frais chirurgie et plâtre bras droit', 100000, '2024-01-25', '2024-02-05', 'approuvée', NOW(), NOW());

-- ============================================================
-- 9. ALERTES
-- ============================================================
INSERT INTO alertes (adherent_id, type_alerte, message, statut, created_at, updated_at) VALUES
(2, 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
(2, 'retard_cotisation', 'Cotisation de mars 2024 non payée', 'active', NOW(), NOW()),
(4, 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
(1, 'pret_echeance', 'Mensualité prêt du 15/05/2024 bientôt due', 'active', NOW(), NOW());

-- ============================================================
-- 10. ADDITIONAL USERS
-- ============================================================
INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Diallo Fatoumata', 'diallo.fatoumata@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Traoré Souleymane', 'traore.souleymane@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Kaboré Awa', 'kabore.awa@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Sanou Ibrahim', 'sanou.ibrahim@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Nikiéma Pauline', 'nikiema.pauline@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Ouattara Karim', 'ouattara.karim@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Bado Rasmata', 'bado.rasmata@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Yameogo Blaise', 'yameogo.blaise@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Compaoré Sophie', 'compaore.sophie@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Zida Michel', 'zida.michel@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW());

-- ============================================================
-- 11. ADDITIONAL ADHERENTS
-- ============================================================
INSERT INTO adherents (user_id, numero_adherent, nom, prenom, email, telephone, date_naissance, genre, adresse, ville, code_postal, date_inscription, statut, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'diallo.fatoumata@email.bf'), 'ADH006', 'Diallo', 'Fatoumata', 'diallo.fatoumata@email.bf', '+226 72 66 77 88', '1995-08-12', 'femme', 'Secteur 15, Rue 5.20', 'Ouagadougou', '01 BP 005', '2023-06-01', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'traore.souleymane@email.bf'), 'ADH007', 'Traoré', 'Souleymane', 'traore.souleymane@email.bf', '+226 69 77 88 99', '1982-12-03', 'homme', 'Avenue de l''Indépendance', 'Bobo-Dioulasso', '01 BP 006', '2023-07-15', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'kabore.awa@email.bf'), 'ADH008', 'Kaboré', 'Awa', 'kabore.awa@email.bf', '+226 73 88 99 00', '1998-04-25', 'femme', 'Secteur 9, Rue 12.8', 'Ouagadougou', '01 BP 007', '2023-08-10', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'sanou.ibrahim@email.bf'), 'ADH009', 'Sanou', 'Ibrahim', 'sanou.ibrahim@email.bf', '+226 74 99 00 11', '1975-11-18', 'homme', 'Rue des Banques', 'Ouagadougou', '01 BP 008', '2023-09-05', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'nikiema.pauline@email.bf'), 'ADH010', 'Nikiéma', 'Pauline', 'nikiema.pauline@email.bf', '+226 75 00 11 22', '1991-06-30', 'femme', 'Secteur 3, Avenue Charles de Gaulle', 'Ouagadougou', '01 BP 009', '2023-10-20', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'ouattara.karim@email.bf'), 'ADH011', 'Ouattara', 'Karim', 'ouattara.karim@email.bf', '+226 76 11 22 33', '1987-03-14', 'homme', 'Rue de la Cathédrale', 'Bobo-Dioulasso', '01 BP 010', '2023-11-12', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'bado.rasmata@email.bf'), 'ADH012', 'Bado', 'Rasmata', 'bado.rasmata@email.bf', '+226 77 22 33 44', '1993-09-07', 'femme', 'Secteur 6, Rue 15.3', 'Ouagadougou', '01 BP 011', '2023-12-01', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'yameogo.blaise@email.bf'), 'ADH013', 'Yameogo', 'Blaise', 'yameogo.blaise@email.bf', '+226 78 33 44 55', '1980-01-22', 'homme', 'Avenue de la Nation', 'Ouagadougou', '01 BP 012', '2024-01-08', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'compaore.sophie@email.bf'), 'ADH014', 'Compaoré', 'Sophie', 'compaore.sophie@email.bf', '+226 79 44 55 66', '1996-12-11', 'femme', 'Secteur 11, Rue 7.14', 'Ouagadougou', '01 BP 013', '2024-02-15', 'actif', NOW(), NOW()),
((SELECT id FROM users WHERE email = 'zida.michel@email.bf'), 'ADH015', 'Zida', 'Michel', 'zida.michel@email.bf', '+226 60 55 66 77', '1978-07-05', 'homme', 'Rue de la Révolution', 'Ouagadougou', '01 BP 014', '2024-03-01', 'suspendu', NOW(), NOW());

-- ============================================================
-- 12. ADDITIONAL AYANTS DROIT
-- ============================================================
INSERT INTO ayants_droit (adherent_id, nom, prenom, relation, date_naissance, created_at, updated_at) VALUES
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 'Diallo', 'Mamadou', 'conjoint', '1993-05-20', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 'Diallo', 'Aminata', 'enfant', '2018-02-15', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'Traoré', 'Mariam', 'conjoint', '1985-08-10', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'Traoré', 'Abdoulaye', 'enfant', '2012-11-08', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'Traoré', 'Fatima', 'enfant', '2015-03-22', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH008'), 'Kaboré', 'Ousmane', 'conjoint', '1995-01-30', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 'Sanou', 'Halimatou', 'conjoint', '1978-04-15', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 'Sanou', 'Yacouba', 'enfant', '2005-09-12', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 'Sanou', 'Rokia', 'enfant', '2008-06-28', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 'Nikiéma', 'Jean', 'conjoint', '1988-11-05', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 'Nikiéma', 'Lucie', 'enfant', '2016-07-19', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH011'), 'Ouattara', 'Zahra', 'conjoint', '1989-12-08', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 'Bado', 'Issa', 'conjoint', '1990-03-25', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 'Bado', 'Nadia', 'enfant', '2019-10-14', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 'Yameogo', 'Christelle', 'conjoint', '1983-07-18', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 'Yameogo', 'Pierre', 'enfant', '2010-12-03', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 'Yameogo', 'Marie', 'enfant', '2013-05-27', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH014'), 'Compaoré', 'David', 'conjoint', '1994-02-14', NOW(), NOW());

-- ============================================================
-- 13. ADDITIONAL COTISATIONS
-- ============================================================
INSERT INTO cotisations (adherent_id, montant, date_echeance, date_paiement, statut, reference_paiement, mode_paiement, created_at, updated_at) VALUES
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 5000, '2024-01-31', '2024-01-30', 'payée', 'REF-2024-050', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 5000, '2024-02-29', '2024-02-28', 'payée', 'REF-2024-051', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 5000, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 7500, '2024-01-31', '2024-02-02', 'payée', 'REF-2024-060', 'especes', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 7500, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 7500, '2024-03-31', NULL, 'en retard', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH008'), 5000, '2024-01-31', '2024-01-29', 'payée', 'REF-2024-070', 'carte', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH008'), 5000, '2024-02-29', '2024-02-27', 'payée', 'REF-2024-071', 'carte', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH008'), 5000, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 6000, '2024-01-31', '2024-01-31', 'payée', 'REF-2024-080', 'cheque', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 6000, '2024-02-29', '2024-02-29', 'payée', 'REF-2024-081', 'cheque', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 6000, '2024-03-31', '2024-03-30', 'payée', 'REF-2024-082', 'cheque', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 5000, '2024-01-31', NULL, 'en retard', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 5000, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH011'), 5500, '2024-01-31', '2024-01-28', 'payée', 'REF-2024-100', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH011'), 5500, '2024-02-29', '2024-02-26', 'payée', 'REF-2024-101', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH011'), 5500, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 5000, '2024-01-31', '2024-01-30', 'payée', 'REF-2024-110', 'especes', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 5000, '2024-02-29', NULL, 'en attente', '', NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 7000, '2024-01-31', '2024-01-31', 'payée', 'REF-2024-120', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 7000, '2024-02-29', '2024-02-28', 'payée', 'REF-2024-121', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 7000, '2024-03-31', '2024-03-29', 'payée', 'REF-2024-122', 'virement', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH014'), 5000, '2024-01-31', '2024-01-29', 'payée', 'REF-2024-130', 'carte', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH014'), 5000, '2024-02-29', NULL, 'en attente', '', NULL, NOW(), NOW());

-- ============================================================
-- 14. ADDITIONAL PRÊTS
-- ============================================================
INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, date_fin, statut, created_at, updated_at) VALUES
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 200000, 2.5, 18, '2024-01-10', '2025-07-10', 'approuvé', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 350000, 3.0, 24, '2024-02-15', '2026-02-15', 'approuvé', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH008'), 80000, 2.5, 8, '2024-03-01', '2024-11-01', 'approuvé', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 150000, 3.5, 12, '2024-01-20', '2025-01-20', 'approuvé', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH011'), 120000, 2.5, 10, '2024-04-01', '2025-02-01', 'approuvé', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 250000, 3.0, 20, '2024-02-10', '2025-10-10', 'approuvé', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 60000, 4.0, 6, '2024-05-01', '2024-11-01', 'en attente', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 90000, 3.5, 9, '2024-06-01', '2025-03-01', 'en attente', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH014'), 40000, 4.5, 4, '2024-03-15', '2024-07-15', 'rejeté', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 100000, 2.5, 8, '2023-06-01', '2024-02-01', 'remboursé', NOW(), NOW());

-- ============================================================
-- 15. ADDITIONAL REMBOURSEMENTS PRÊTS
-- ============================================================
INSERT INTO remboursements_prets (pret_id, numero_echeance, montant, date_echeance, date_paiement, statut, created_at, updated_at) VALUES
((SELECT id FROM prets WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH006') AND montant = 200000), 1, 12000, '2024-02-10', '2024-02-09', 'payée', NOW(), NOW()),
((SELECT id FROM prets WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH006') AND montant = 200000), 2, 12000, '2024-03-10', '2024-03-08', 'payée', NOW(), NOW()),
((SELECT id FROM prets WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH006') AND montant = 200000), 3, 12000, '2024-04-10', NULL, 'en attente', NOW(), NOW()),
((SELECT id FROM prets WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH007') AND montant = 350000), 1, 16000, '2024-03-15', '2024-03-14', 'payée', NOW(), NOW()),
((SELECT id FROM prets WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH007') AND montant = 350000), 2, 16000, '2024-04-15', '2024-04-13', 'payée', NOW(), NOW()),
((SELECT id FROM prets WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH007') AND montant = 350000), 3, 16000, '2024-05-15', NULL, 'en attente', NOW(), NOW());

-- ============================================================
-- 16. ADDITIONAL SINISTRES
-- ============================================================
INSERT INTO sinistres (adherent_id, description, date_sinistre, type_sinistre, statut, montant_reclamation, montant_remboursement, created_at, updated_at) VALUES
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 'Accouchement à la clinique, césarienne programmée', '2024-01-25', 'hospitalisation', 'approuvé', 150000, 120000, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'Chute à vélo, entorse cheville droite', '2024-03-10', 'accident', 'approuvé', 45000, 35000, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH008'), 'Consultation ophtalmologique et lunettes', '2024-02-15', 'maladie', 'approuvé', 25000, 20000, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 'Décès de la mère, frais funéraires traditionnels', '2024-01-05', 'décès', 'approuvé', 180000, 120000, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH011'), 'Hospitalisation pour appendicite', '2024-04-20', 'hospitalisation', 'approuvé', 80000, 65000, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH013'), 'Accident domestique, brûlure au bras', '2024-03-28', 'accident', 'approuvé', 30000, 25000, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 'Consultation cardiologique et examens', '2024-04-10', 'maladie', 'en cours', 35000, NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 'Hospitalisation enfant pour pneumonie', '2024-05-05', 'hospitalisation', 'en cours', 60000, NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH014'), 'Consultation dentaire et soins', '2024-04-15', 'maladie', 'déclaré', 20000, NULL, NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'Décès du frère, participation funérailles', '2024-02-20', 'décès', 'déclaré', 50000, NULL, NOW(), NOW());

-- ============================================================
-- 17. ADDITIONAL PRESTATIONS
-- ============================================================
INSERT INTO prestations (sinistre_id, type_prestation, description, montant, date_demande, date_approbation, statut, created_at, updated_at) VALUES
((SELECT id FROM sinistres WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH006') AND type_sinistre = 'hospitalisation' AND statut = 'approuvé'), 'Remboursement accouchement', 'Frais clinique + médicaments + suivi postnatal', 120000, '2024-01-30', '2024-02-10', 'approuvée', NOW(), NOW()),
((SELECT id FROM sinistres WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH007') AND type_sinistre = 'accident' AND statut = 'approuvé'), 'Remboursement accident', 'Consultation + radio + médicaments + kinésithérapie', 35000, '2024-03-15', '2024-03-25', 'approuvée', NOW(), NOW()),
((SELECT id FROM sinistres WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH008') AND type_sinistre = 'maladie' AND statut = 'approuvé'), 'Remboursement optique', 'Consultation ophtalmologique + monture + verres', 20000, '2024-02-20', '2024-03-01', 'approuvée', NOW(), NOW()),
((SELECT id FROM sinistres WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH009') AND type_sinistre = 'décès' AND statut = 'approuvé'), 'Remboursement décès', 'Participation aux frais funéraires traditionnels', 120000, '2024-01-10', '2024-01-20', 'approuvée', NOW(), NOW()),
((SELECT id FROM sinistres WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH011') AND type_sinistre = 'hospitalisation' AND statut = 'approuvé'), 'Remboursement hospitalisation', 'Chirurgie appendicite + hospitalisation 3 jours', 65000, '2024-04-25', '2024-05-05', 'approuvée', NOW(), NOW()),
((SELECT id FROM sinistres WHERE adherent_id = (SELECT id FROM adherents WHERE numero_adherent = 'ADH013') AND type_sinistre = 'accident' AND statut = 'approuvé'), 'Remboursement accident domestique', 'Consultation + pansements + médicaments', 25000, '2024-04-02', '2024-04-12', 'approuvée', NOW(), NOW());

-- ============================================================
-- 18. ADDITIONAL ALERTES
-- ============================================================
INSERT INTO alertes (adherent_id, type_alerte, message, statut, created_at, updated_at) VALUES
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'retard_cotisation', 'Cotisation de mars 2024 non payée', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 'retard_cotisation', 'Cotisation de janvier 2024 non payée', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH006'), 'pret_echeance', 'Mensualité prêt du 10/04/2024 bientôt due', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH007'), 'pret_echeance', 'Mensualité prêt du 15/05/2024 bientôt due', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH009'), 'pret_echeance', 'Mensualité prêt du 20/04/2024 bientôt due', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH010'), 'sinistre_en_cours', 'Sinistre cardiologique en cours de traitement', 'active', NOW(), NOW()),
((SELECT id FROM adherents WHERE numero_adherent = 'ADH012'), 'sinistre_en_cours', 'Sinistre hospitalisation enfant en cours', 'active', NOW(), NOW());

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
