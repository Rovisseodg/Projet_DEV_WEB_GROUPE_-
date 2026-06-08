-- ============================================================================
-- 🐘 MaMutuelle Database - PostgreSQL 15+
-- ============================================================================
-- 
-- Fichier unique et consolidé pour:
--   1. Création du schéma complet
--   2. Seeding des données initiales
--   3. Données de test supplémentaires
--
-- Usage:
--   psql -h host -U user -d database < database.sql
--   ou dans pgAdmin: Query Tool → Open → database.sql → Execute
--
-- Version: 1.0
-- Date: 2024
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: NETTOYAGE ET PRÉPARATION
-- ============================================================================

BEGIN TRANSACTION;

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS alertes;
DROP TABLE IF EXISTS prestations;
DROP TABLE IF EXISTS sinistres;
DROP TABLE IF EXISTS remboursements_prets;
DROP TABLE IF EXISTS prets;
DROP TABLE IF EXISTS cotisations;
DROP TABLE IF EXISTS ayants_droit;
DROP TABLE IF EXISTS adherents;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS failed_jobs;
DROP TABLE IF EXISTS personal_access_tokens;
DROP TABLE IF EXISTS migrations;

-- ============================================================================
-- ÉTAPE 2: CRÉATION DU SCHÉMA
-- ============================================================================

-- 1. TABLE USERS - Gestion des authentifications
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'adherent' CHECK (role IN ('admin', 'agent', 'adherent')),
    email_verified_at TIMESTAMP NULL,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. TABLE ADHERENTS - Gestion des adhérents
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE adherents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    numero_adherent VARCHAR(50) UNIQUE NOT NULL,
    date_inscription DATE NOT NULL,
    statut VARCHAR(50) DEFAULT 'actif' CHECK (statut IN ('actif', 'suspendu', 'retraite')),
    adresse VARCHAR(255),
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    date_naissance DATE,
    genre VARCHAR(10) CHECK (genre IN ('homme', 'femme', 'autre')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_adherents_numero ON adherents(numero_adherent);
CREATE INDEX idx_adherents_statut ON adherents(statut);
CREATE INDEX idx_adherents_user_id ON adherents(user_id);

-- 3. TABLE AYANTS_DROIT - Dépendants des adhérents
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE ayants_droit (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    relation VARCHAR(50) CHECK (relation IN ('epoux', 'enfant', 'parent', 'autre', 'conjoint')),
    date_naissance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ayants_droit_adherent ON ayants_droit(adherent_id);

-- 4. TABLE COTISATIONS - Gestion des cotisations/adhésions
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE cotisations (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    montant NUMERIC(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut VARCHAR(50) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'payée', 'en retard', 'annulée')),
    reference_paiement VARCHAR(100),
    mode_paiement VARCHAR(50) CHECK (mode_paiement IN ('virement', 'cheque', 'especes', 'carte')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cotisations_adherent ON cotisations(adherent_id);
CREATE INDEX idx_cotisations_statut ON cotisations(statut);
CREATE INDEX idx_cotisations_date_echeance ON cotisations(date_echeance);

-- 5. TABLE PRETS - Gestion des prêts
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE prets (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    montant NUMERIC(10, 2) NOT NULL,
    taux_interet NUMERIC(5, 2),
    duree_mois INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(50) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'approuvé', 'remboursé', 'rejeté')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prets_adherent ON prets(adherent_id);
CREATE INDEX idx_prets_statut ON prets(statut);

-- 6. TABLE REMBOURSEMENTS_PRETS - Échéances de remboursement
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE remboursements_prets (
    id SERIAL PRIMARY KEY,
    pret_id INTEGER NOT NULL REFERENCES prets(id) ON DELETE CASCADE,
    numero_mensualite INTEGER,
    montant NUMERIC(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut VARCHAR(50) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'payée', 'en retard')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_remboursements_pret ON remboursements_prets(pret_id);
CREATE INDEX idx_remboursements_statut ON remboursements_prets(statut);

-- 7. TABLE SINISTRES - Gestion des sinistres/réclamations
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE sinistres (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    date_sinistre DATE NOT NULL,
    type_sinistre VARCHAR(100) CHECK (type_sinistre IN ('maladie', 'accident', 'décès', 'hospitalisation', 'autre')),
    statut VARCHAR(50) DEFAULT 'déclaré' CHECK (statut IN ('déclaré', 'en attente', 'approuvé', 'rejeté')),
    montant_reclamation NUMERIC(10, 2),
    montant_remboursement NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sinistres_adherent ON sinistres(adherent_id);
CREATE INDEX idx_sinistres_statut ON sinistres(statut);
CREATE INDEX idx_sinistres_type ON sinistres(type_sinistre);

-- 8. TABLE PRESTATIONS - Prestations accordées
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE prestations (
    id SERIAL PRIMARY KEY,
    sinistre_id INTEGER REFERENCES sinistres(id) ON DELETE CASCADE,
    type_prestation VARCHAR(100) NOT NULL,
    description TEXT,
    montant NUMERIC(10, 2) NOT NULL,
    date_demande DATE NOT NULL,
    date_approbation DATE,
    statut VARCHAR(50) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'approuvée', 'payée', 'rejetée')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prestations_sinistre ON prestations(sinistre_id);
CREATE INDEX idx_prestations_statut ON prestations(statut);

-- 9. TABLE ALERTES - Alertes système
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE alertes (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    type_alerte VARCHAR(100),
    message TEXT,
    date_alerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'active' CHECK (statut IN ('active', 'résolue', 'archivée')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alertes_adherent ON alertes(adherent_id);
CREATE INDEX idx_alertes_statut ON alertes(statut);

-- 10. TABLE AUDIT_LOGS - Logs d'audit
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);

-- Tables Laravel supplémentaires (pour migrations futures)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL
);

CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE personal_access_tokens (
    id SERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE failed_jobs (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ÉTAPE 3: DONNÉES INITIALES - USERS
-- ============================================================================

INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES
('Admin MaMutuelle', 'admin@mamutuelle.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'admin', NOW(), NOW()),
('Agent Service', 'agent@mamutuelle.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'agent', NOW(), NOW()),
('Koné Oumar', 'kone.oumar@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Zongo Aminata', 'zongo.aminata@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Bambara Brice', 'bambara.brice@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Sawadogo Mariam', 'sawadogo.mariam@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
('Ouédraogo Issouf', 'ouedraogo.issouf@email.bf', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'adherent', NOW(), NOW()),
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

-- ============================================================================
-- ÉTAPE 4: DONNÉES INITIALES - ADHERENTS
-- ============================================================================

INSERT INTO adherents (user_id, numero_adherent, nom, prenom, email, telephone, date_naissance, genre, adresse, ville, code_postal, date_inscription, statut, created_at, updated_at) VALUES
(3, 'ADH001', 'Koné', 'Oumar', 'kone.oumar@email.bf', '+226 62 11 22 33', '1985-03-22', 'homme', 'Secteur 12, Rue 10.45', 'Ouagadougou', '01 BP 000', '2023-01-15', 'actif', NOW(), NOW()),
(4, 'ADH002', 'Zongo', 'Aminata', 'zongo.aminata@email.bf', '+226 76 22 33 44', '1990-07-14', 'femme', 'Secteur 4, Avenue Yennenga', 'Ouagadougou', '01 BP 001', '2023-02-01', 'actif', NOW(), NOW()),
(5, 'ADH003', 'Bambara', 'Brice', 'bambara.brice@email.bf', '+226 65 33 44 55', '1988-11-05', 'homme', 'Rue du Commerce', 'Bobo-Dioulasso', '01 BP 002', '2023-03-10', 'actif', NOW(), NOW()),
(6, 'ADH004', 'Sawadogo', 'Mariam', 'sawadogo.mariam@email.bf', '+226 71 44 55 66', '1992-05-30', 'femme', 'Secteur 7, Rue 8.12', 'Ouagadougou', '01 BP 003', '2023-04-05', 'actif', NOW(), NOW()),
(7, 'ADH005', 'Ouédraogo', 'Issouf', 'ouedraogo.issouf@email.bf', '+226 78 55 66 77', '1980-01-18', 'homme', 'Avenue Kwame Nkrumah', 'Ouagadougou', '01 BP 004', '2023-05-20', 'actif', NOW(), NOW()),
(8, 'ADH006', 'Diallo', 'Fatoumata', 'diallo.fatoumata@email.bf', '+226 72 66 77 88', '1995-08-12', 'femme', 'Secteur 15, Rue 5.20', 'Ouagadougou', '01 BP 005', '2023-06-01', 'actif', NOW(), NOW()),
(9, 'ADH007', 'Traoré', 'Souleymane', 'traore.souleymane@email.bf', '+226 69 77 88 99', '1982-12-03', 'homme', 'Avenue de l''Indépendance', 'Bobo-Dioulasso', '01 BP 006', '2023-07-15', 'actif', NOW(), NOW()),
(10, 'ADH008', 'Kaboré', 'Awa', 'kabore.awa@email.bf', '+226 73 88 99 00', '1998-04-25', 'femme', 'Secteur 9, Rue 12.8', 'Ouagadougou', '01 BP 007', '2023-08-10', 'actif', NOW(), NOW()),
(11, 'ADH009', 'Sanou', 'Ibrahim', 'sanou.ibrahim@email.bf', '+226 74 99 00 11', '1975-11-18', 'homme', 'Rue des Banques', 'Ouagadougou', '01 BP 008', '2023-09-05', 'actif', NOW(), NOW()),
(12, 'ADH010', 'Nikiéma', 'Pauline', 'nikiema.pauline@email.bf', '+226 75 00 11 22', '1991-06-30', 'femme', 'Secteur 3, Avenue Charles de Gaulle', 'Ouagadougou', '01 BP 009', '2023-10-20', 'actif', NOW(), NOW()),
(13, 'ADH011', 'Ouattara', 'Karim', 'ouattara.karim@email.bf', '+226 76 11 22 33', '1987-03-14', 'homme', 'Rue de la Cathédrale', 'Bobo-Dioulasso', '01 BP 010', '2023-11-12', 'actif', NOW(), NOW()),
(14, 'ADH012', 'Bado', 'Rasmata', 'bado.rasmata@email.bf', '+226 77 22 33 44', '1993-09-07', 'femme', 'Secteur 6, Rue 15.3', 'Ouagadougou', '01 BP 011', '2023-12-01', 'actif', NOW(), NOW()),
(15, 'ADH013', 'Yameogo', 'Blaise', 'yameogo.blaise@email.bf', '+226 78 33 44 55', '1980-01-22', 'homme', 'Avenue de la Nation', 'Ouagadougou', '01 BP 012', '2024-01-08', 'actif', NOW(), NOW()),
(16, 'ADH014', 'Compaoré', 'Sophie', 'compaore.sophie@email.bf', '+226 79 44 55 66', '1996-12-11', 'femme', 'Secteur 11, Rue 7.14', 'Ouagadougou', '01 BP 013', '2024-02-15', 'actif', NOW(), NOW()),
(17, 'ADH015', 'Zida', 'Michel', 'zida.michel@email.bf', '+226 60 55 66 77', '1978-07-05', 'homme', 'Rue de la Révolution', 'Ouagadougou', '01 BP 014', '2024-03-01', 'suspendu', NOW(), NOW());

-- ============================================================================
-- ÉTAPE 5: DONNÉES INITIALES - AYANTS DROIT
-- ============================================================================

INSERT INTO ayants_droit (adherent_id, nom, prenom, relation, date_naissance, created_at, updated_at) VALUES
(1, 'Koné', 'Aïcha', 'epoux', '1987-06-10', NOW(), NOW()),
(1, 'Koné', 'Ibrahim', 'enfant', '2010-03-15', NOW(), NOW()),
(2, 'Zongo', 'Moussa', 'epoux', '1988-04-20', NOW(), NOW()),
(2, 'Zongo', 'Salimata', 'enfant', '2015-11-05', NOW(), NOW()),
(3, 'Bambara', 'Marie', 'epoux', '1990-02-28', NOW(), NOW()),
(4, 'Sawadogo', 'Adama', 'epoux', '1989-07-17', NOW(), NOW()),
(5, 'Ouédraogo', 'Kadiatou', 'epoux', '1982-09-12', NOW(), NOW()),
(6, 'Diallo', 'Mamadou', 'conjoint', '1993-05-20', NOW(), NOW()),
(6, 'Diallo', 'Aminata', 'enfant', '2018-02-15', NOW(), NOW()),
(7, 'Traoré', 'Mariam', 'conjoint', '1985-08-10', NOW(), NOW()),
(7, 'Traoré', 'Abdoulaye', 'enfant', '2012-11-08', NOW(), NOW()),
(7, 'Traoré', 'Fatima', 'enfant', '2015-03-22', NOW(), NOW()),
(8, 'Kaboré', 'Ousmane', 'conjoint', '1995-01-30', NOW(), NOW()),
(9, 'Sanou', 'Halimatou', 'conjoint', '1978-04-15', NOW(), NOW()),
(9, 'Sanou', 'Yacouba', 'enfant', '2005-09-12', NOW(), NOW()),
(9, 'Sanou', 'Rokia', 'enfant', '2008-06-28', NOW(), NOW()),
(10, 'Nikiéma', 'Jean', 'conjoint', '1988-11-05', NOW(), NOW()),
(10, 'Nikiéma', 'Lucie', 'enfant', '2016-07-19', NOW(), NOW()),
(11, 'Ouattara', 'Zahra', 'conjoint', '1989-12-08', NOW(), NOW()),
(12, 'Bado', 'Issa', 'conjoint', '1990-03-25', NOW(), NOW()),
(12, 'Bado', 'Nadia', 'enfant', '2019-10-14', NOW(), NOW()),
(13, 'Yameogo', 'Christelle', 'conjoint', '1983-07-18', NOW(), NOW()),
(13, 'Yameogo', 'Pierre', 'enfant', '2010-12-03', NOW(), NOW()),
(13, 'Yameogo', 'Marie', 'enfant', '2013-05-27', NOW(), NOW()),
(14, 'Compaoré', 'David', 'conjoint', '1994-02-14', NOW(), NOW());

-- ============================================================================
-- ÉTAPE 6: DONNÉES INITIALES - COTISATIONS
-- ============================================================================

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
(5, 5000, '2024-03-31', '2024-03-31', 'payée', 'REF-2024-042', 'virement', NOW(), NOW()),
-- ADH006 — Diallo Fatoumata
(6, 5000, '2024-01-31', '2024-01-30', 'payée', 'REF-2024-050', 'virement', NOW(), NOW()),
(6, 5000, '2024-02-29', '2024-02-28', 'payée', 'REF-2024-051', 'virement', NOW(), NOW()),
(6, 5000, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
-- ADH007 — Traoré Souleymane
(7, 7500, '2024-01-31', '2024-02-02', 'payée', 'REF-2024-060', 'especes', NOW(), NOW()),
(7, 7500, '2024-02-29', NULL, 'en retard', '', NULL, NOW(), NOW()),
(7, 7500, '2024-03-31', NULL, 'en retard', '', NULL, NOW(), NOW()),
-- ADH008 — Kaboré Awa
(8, 5000, '2024-01-31', '2024-01-29', 'payée', 'REF-2024-070', 'carte', NOW(), NOW()),
(8, 5000, '2024-02-29', '2024-02-27', 'payée', 'REF-2024-071', 'carte', NOW(), NOW()),
(8, 5000, '2024-03-31', NULL, 'en attente', '', NULL, NOW(), NOW()),
-- ADH009 — Sanou Ibrahim
(9, 6000, '2024-01-31', '2024-01-31', 'payée', 'REF-2024-080', 'cheque', NOW(), NOW()),
(9, 6000, '2024-02-29', '2024-02-29', 'payée', 'REF-2024-081', 'cheque', NOW(), NOW()),
(9, 6000, '2024-03-31', '2024-03-30', 'payée', 'REF-2024-082', 'cheque', NOW(), NOW());

-- ============================================================================
-- ÉTAPE 7: DONNÉES INITIALES - PRETS
-- ============================================================================

INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, date_fin, statut, created_at, updated_at) VALUES
(1, 150000, 2.5, 12, '2024-01-15', '2025-01-15', 'approuvé', NOW(), NOW()),
(3, 300000, 3.0, 24, '2024-02-01', '2026-02-01', 'approuvé', NOW(), NOW()),
(5, 100000, 2.5, 6, '2024-03-01', '2024-09-01', 'remboursé', NOW(), NOW()),
(2, 75000, 3.5, 12, '2024-04-01', '2025-04-01', 'en attente', NOW(), NOW()),
(4, 50000, 4.0, 6, '2024-05-01', '2024-11-01', 'rejeté', NOW(), NOW());

-- ============================================================================
-- ÉTAPE 8: DONNÉES INITIALES - REMBOURSEMENTS PRETS
-- ============================================================================

INSERT INTO remboursements_prets (pret_id, numero_mensualite, montant, date_echeance, date_paiement, statut, created_at, updated_at) VALUES
(1, 1, 12500, '2024-02-15', '2024-02-14', 'payée', NOW(), NOW()),
(1, 2, 12500, '2024-03-15', '2024-03-15', 'payée', NOW(), NOW()),
(1, 3, 12500, '2024-04-15', '2024-04-16', 'payée', NOW(), NOW()),
(1, 4, 12500, '2024-05-15', NULL, 'en attente', NOW(), NOW());

-- ============================================================================
-- ÉTAPE 9: DONNÉES INITIALES - SINISTRES
-- ============================================================================

INSERT INTO sinistres (adherent_id, type_sinistre, description, date_sinistre, statut, montant_reclamation, montant_remboursement, created_at, updated_at) VALUES
(1, 'maladie', 'Crise paludique avec hospitalisation 5 jours', '2024-02-10', 'approuvé', 70000, 70000, NOW(), NOW()),
(3, 'accident', 'Accident de circulation - fracture bras droit', '2024-01-20', 'approuvé', 100000, 100000, NOW(), NOW()),
(2, 'maladie', 'Hypertension - suivi médical', '2024-03-05', 'en attente', 50000, NULL, NOW(), NOW());

-- ============================================================================
-- ÉTAPE 10: DONNÉES INITIALES - PRESTATIONS
-- ============================================================================

INSERT INTO prestations (sinistre_id, type_prestation, description, montant, date_demande, date_approbation, statut, created_at, updated_at) VALUES
(1, 'Remboursement hospitalisation', 'Frais clinique + médicaments paludisme', 70000, '2024-02-15', '2024-02-25', 'approuvée', NOW(), NOW()),
(2, 'Remboursement accident', 'Frais chirurgie et plâtre bras droit', 100000, '2024-01-25', '2024-02-05', 'approuvée', NOW(), NOW());

-- ============================================================================
-- ÉTAPE 11: DONNÉES INITIALES - ALERTES
-- ============================================================================

INSERT INTO alertes (adherent_id, type_alerte, message, statut, created_at, updated_at) VALUES
(2, 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
(2, 'retard_cotisation', 'Cotisation de mars 2024 non payée', 'active', NOW(), NOW()),
(4, 'retard_cotisation', 'Cotisation de février 2024 non payée', 'active', NOW(), NOW()),
(1, 'pret_echeance', 'Mensualité prêt du 15/05/2024 bientôt due', 'active', NOW(), NOW());

-- ============================================================================
-- COMMIT TRANSACTION
-- ============================================================================

COMMIT;

-- ============================================================================
-- VÉRIFICATION ET STATISTIQUES
-- ============================================================================

COMMIT;

-- Afficher un résumé des données insérées
SELECT 'Database setup complete! 🎉' AS Status;
SELECT COUNT(*) as "Total Users" FROM users;
SELECT COUNT(*) as "Total Adherents" FROM adherents;
SELECT COUNT(*) as "Total Ayants Droit" FROM ayants_droit;
SELECT COUNT(*) as "Total Cotisations" FROM cotisations;
SELECT COUNT(*) as "Total Prets" FROM prets;
SELECT COUNT(*) as "Total Remboursements" FROM remboursements_prets;
SELECT COUNT(*) as "Total Sinistres" FROM sinistres;
SELECT COUNT(*) as "Total Prestations" FROM prestations;
SELECT COUNT(*) as "Total Alertes" FROM alertes;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
