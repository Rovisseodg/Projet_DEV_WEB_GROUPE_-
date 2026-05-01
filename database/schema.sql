-- PostgreSQL Schema - MaMutuelle

-- ============================================
-- CRÉATION DES TABLES - MAMUTUELLE
-- ============================================

-- 1. USERS (Utilisateurs du système)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'agent', 'adherent')),
    email_verified_at TIMESTAMP,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADHERENTS (Adhérents principaux)
CREATE TABLE adherents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    numero_adherent VARCHAR(50) UNIQUE NOT NULL,
    date_inscription DATE NOT NULL,
    statut VARCHAR(50) CHECK (statut IN ('actif', 'suspendu', 'retraite')) DEFAULT 'actif',
    adresse VARCHAR(255),
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    date_naissance DATE,
    genre VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. AYANTS_DROIT (Dépendants)
CREATE TABLE ayants_droit (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    relation VARCHAR(50) CHECK (relation IN ('epoux', 'enfant', 'parent', 'autre')),
    date_naissance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 4. COTISATIONS (Cotisations des adhérents)
CREATE TABLE cotisations (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut VARCHAR(50) CHECK (statut IN ('en attente', 'payée', 'en retard', 'annulée')) DEFAULT 'en attente',
    reference_paiement VARCHAR(100),
    mode_paiement VARCHAR(50) CHECK (mode_paiement IN ('virement', 'cheque', 'especes', 'carte')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 5. PRETS (Prêts accordés)
CREATE TABLE prets (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    taux_interet DECIMAL(5, 2),
    duree_mois INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(50) CHECK (statut IN ('en attente', 'approuvé', 'remboursé', 'rejeté')) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 6. REMBOURSEMENTS_PRETS (Échéancier de remboursement)
CREATE TABLE remboursements_prets (
    id SERIAL PRIMARY KEY,
    pret_id INTEGER NOT NULL,
    numero_echeance INTEGER,
    montant DECIMAL(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut VARCHAR(50) CHECK (statut IN ('en attente', 'payée', 'en retard')) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pret_id) REFERENCES prets(id) ON DELETE CASCADE
);

-- 7. SINISTRES (Déclarations de sinistres)
CREATE TABLE sinistres (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    date_sinistre DATE NOT NULL,
    type_sinistre VARCHAR(100) CHECK (type_sinistre IN ('maladie', 'accident', 'décès', 'hospitalisation', 'autre')),
    statut VARCHAR(50) CHECK (statut IN ('déclaré', 'en cours', 'approuvé', 'rejeté', 'remboursé')) DEFAULT 'déclaré',
    montant_reclamation DECIMAL(10, 2),
    montant_remboursement DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 8. PRESTATIONS (Prestations de santé/sociales)
CREATE TABLE prestations (
    id SERIAL PRIMARY KEY,
    sinistre_id INTEGER,
    type_prestation VARCHAR(100) NOT NULL,
    description TEXT,
    montant DECIMAL(10, 2) NOT NULL,
    date_demande DATE NOT NULL,
    date_approbation DATE,
    statut VARCHAR(50) CHECK (statut IN ('en attente', 'approuvée', 'rejetée')) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sinistre_id) REFERENCES sinistres(id) ON DELETE CASCADE
);

-- 9. ALERTES (Alertes pour retards de cotisations)
CREATE TABLE alertes (
    id SERIAL PRIMARY KEY,
    adherent_id INTEGER NOT NULL,
    type_alerte VARCHAR(100) CHECK (type_alerte IN ('retard_cotisation', 'pret_en_retard', 'document_manquant')),
    message TEXT,
    date_alerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) CHECK (statut IN ('active', 'resolue')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 10. AUDIT_LOGS (Journal des opérations)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES
-- ============================================

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

-- ============================================
-- DATA SEEDING
-- ============================================

INSERT INTO users (name, email, password, role) VALUES
('Admin MaMutuelle', 'admin@mamutuelle.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO adherents (user_id, nom, prenom, email, telephone, numero_adherent, date_inscription, statut) VALUES
(1, 'Dupont', 'Jean', 'jean@example.com', '0612345678', 'ADH001', '2024-01-01', 'actif');

INSERT INTO cotisations (adherent_id, montant, date_echeance, statut) VALUES
(1, 50.00, '2024-02-01', 'en attente');

INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, statut) VALUES
(1, 1000.00, 2.5, 12, '2024-01-15', 'approuvé');

INSERT INTO sinistres (adherent_id, description, date_sinistre, type_sinistre, statut) VALUES
(1, 'Consultation médicale', '2024-01-20', 'maladie', 'déclaré');

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW v_adherent_dashboard AS
SELECT 
    a.id,
    a.nom,
    a.prenom,
    a.numero_adherent,
    (SELECT COUNT(*) FROM cotisations WHERE adherent_id = a.id AND statut IN ('en attente', 'en retard')) as cotisations_en_attente,
    (SELECT COUNT(*) FROM prets WHERE adherent_id = a.id AND statut = 'approuvé') as prets_actifs,
    (SELECT COUNT(*) FROM sinistres WHERE adherent_id = a.id AND statut IN ('déclaré', 'en cours')) as sinistres_en_cours,
    (SELECT SUM(montant) FROM cotisations WHERE adherent_id = a.id AND statut = 'payée') as total_cotisations_payees
FROM adherents a;

CREATE OR REPLACE VIEW v_statistiques_globales AS
SELECT 
    (SELECT COUNT(*) FROM adherents WHERE statut = 'actif') as nombre_adherents_actifs,
    (SELECT COUNT(*) FROM cotisations WHERE statut = 'payée') as total_cotisations_payees,
    (SELECT COUNT(*) FROM prets WHERE statut = 'approuvé') as total_prets_actifs,
    (SELECT COUNT(*) FROM sinistres WHERE statut IN ('déclaré', 'en cours')) as sinistres_en_attente;
