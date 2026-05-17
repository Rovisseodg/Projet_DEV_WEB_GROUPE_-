-- PostgreSQL Schema - MaMutuelle
-- Version PostgreSQL avec suppression des tables existantes

-- Suppression des tables existantes (dans l'ordre inverse des dépendances)
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

-- 1. USERS
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

-- 2. ADHERENTS
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
    genre VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. AYANTS_DROIT
CREATE TABLE ayants_droit (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    relation VARCHAR(50) CHECK (relation IN ('epoux', 'enfant', 'parent', 'autre')),
    date_naissance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. COTISATIONS
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

-- 5. PRETS
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

-- 6. REMBOURSEMENTS_PRETS
CREATE TABLE remboursements_prets (
    id SERIAL PRIMARY KEY,
    pret_id INTEGER NOT NULL REFERENCES prets(id) ON DELETE CASCADE,
    numero_echeance INTEGER,
    montant NUMERIC(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut VARCHAR(50) DEFAULT 'en attente' CHECK (statut IN ('en attente', 'payée', 'en retard')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SINISTRES
CREATE TABLE sinistres (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    date_sinistre DATE NOT NULL,
    type_sinistre VARCHAR(100) CHECK (type_sinistre IN ('maladie', 'accident', 'décès', 'hospitalisation', 'autre')),
    statut VARCHAR(50) DEFAULT 'déclaré',
    montant_reclamation NUMERIC(10, 2),
    montant_remboursement NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. PRESTATIONS
CREATE TABLE prestations (
    id SERIAL PRIMARY KEY,
    sinistre_id INTEGER REFERENCES sinistres(id) ON DELETE CASCADE,
    type_prestation VARCHAR(100) NOT NULL,
    description TEXT,
    montant NUMERIC(10, 2) NOT NULL,
    date_demande DATE NOT NULL,
    date_approbation DATE,
    statut VARCHAR(50) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. ALERTES
CREATE TABLE alertes (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL REFERENCES adherents(id) ON DELETE CASCADE,
    type_alerte VARCHAR(100),
    message TEXT,
    date_alerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. AUDIT_LOGS
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_adherents_user_id ON adherents(user_id);
CREATE INDEX idx_adherents_numero_adherent ON adherents(numero_adherent);
CREATE INDEX idx_ayants_droit_adherent_id ON ayants_droit(adherent_id);
CREATE INDEX idx_cotisations_adherent_id ON cotisations(adherent_id);
CREATE INDEX idx_cotisations_statut ON cotisations(statut);
CREATE INDEX idx_prets_adherent_id ON prets(adherent_id);
CREATE INDEX idx_remboursements_prets_pret_id ON remboursements_prets(pret_id);
CREATE INDEX idx_sinistres_adherent_id ON sinistres(adherent_id);
CREATE INDEX idx_sinistres_statut ON sinistres(statut);
CREATE INDEX idx_prestations_sinistre_id ON prestations(sinistre_id);
CREATE INDEX idx_alertes_adherent_id ON alertes(adherent_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- DATA SEEDING
INSERT INTO users (name, email, password, role) VALUES
('Admin MaMutuelle', 'admin@mamutuelle.fr', '$2y$12$K1kJm8F7t.RZV.LH2.dS0uEZr5xKHsxJqVlVz5QcH7K0y8qQu2EwK', 'admin');

INSERT INTO adherents (user_id, nom, prenom, email, telephone, numero_adherent, date_inscription, statut) VALUES
(1, 'Dupont', 'Jean', 'jean@example.com', '0612345678', 'ADH001', '2024-01-01', 'actif');

INSERT INTO cotisations (adherent_id, montant, date_echeance, statut) VALUES
(1, 50.00, '2024-02-01', 'en attente');

INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, statut) VALUES
(1, 1000.00, 2.5, 12, '2024-01-15', 'approuvé');

INSERT INTO sinistres (adherent_id, description, date_sinistre, type_sinistre, statut) VALUES
(1, 'Consultation médicale', '2024-01-20', 'maladie', 'déclaré');
