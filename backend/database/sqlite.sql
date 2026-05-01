-- SQLite Schema for MaMutuelle

-- 1. USERS
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'agent', 'adherent')),
    email_verified_at TIMESTAMP,
    remember_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADHERENTS
CREATE TABLE adherents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telephone TEXT,
    numero_adherent TEXT UNIQUE NOT NULL,
    date_inscription DATE NOT NULL,
    statut TEXT CHECK (statut IN ('actif', 'suspendu', 'retraite')) DEFAULT 'actif',
    adresse TEXT,
    ville TEXT,
    code_postal TEXT,
    date_naissance DATE,
    genre TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. AYANTS_DROIT
CREATE TABLE ayants_droit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adherent_id INTEGER NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    relation TEXT CHECK (relation IN ('epoux', 'enfant', 'parent', 'autre')),
    date_naissance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 4. COTISATIONS
CREATE TABLE cotisations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adherent_id INTEGER NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut TEXT CHECK (statut IN ('en attente', 'payée', 'en retard', 'annulée')) DEFAULT 'en attente',
    reference_paiement TEXT,
    mode_paiement TEXT CHECK (mode_paiement IN ('virement', 'cheque', 'especes', 'carte')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 5. PRETS
CREATE TABLE prets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adherent_id INTEGER NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    taux_interet DECIMAL(5, 2),
    duree_mois INTEGER NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut TEXT CHECK (statut IN ('en attente', 'approuvé', 'remboursé', 'rejeté')) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 6. REMBOURSEMENTS_PRETS
CREATE TABLE remboursements_prets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pret_id INTEGER NOT NULL,
    numero_echeance INTEGER,
    montant DECIMAL(10, 2) NOT NULL,
    date_echeance DATE NOT NULL,
    date_paiement DATE,
    statut TEXT CHECK (statut IN ('en attente', 'payée', 'en retard')) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pret_id) REFERENCES prets(id) ON DELETE CASCADE
);

-- 7. SINISTRES
CREATE TABLE sinistres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adherent_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    date_sinistre DATE NOT NULL,
    type_sinistre TEXT CHECK (type_sinistre IN ('maladie', 'accident', 'décès', 'hospitalisation', 'autre')),
    statut TEXT CHECK (statut IN ('déclaré', 'en cours', 'approuvé', 'rejeté', 'remboursé')) DEFAULT 'déclaré',
    montant_reclamation DECIMAL(10, 2),
    montant_remboursement DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 8. PRESTATIONS
CREATE TABLE prestations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sinistre_id INTEGER,
    type_prestation TEXT NOT NULL,
    description TEXT,
    montant DECIMAL(10, 2) NOT NULL,
    date_demande DATE NOT NULL,
    date_approbation DATE,
    statut TEXT CHECK (statut IN ('en attente', 'approuvée', 'rejetée')) DEFAULT 'en attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sinistre_id) REFERENCES sinistres(id) ON DELETE CASCADE
);

-- 9. ALERTES
CREATE TABLE alertes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adherent_id INTEGER NOT NULL,
    type_alerte TEXT CHECK (type_alerte IN ('retard_cotisation', 'pret_en_retard', 'document_manquant')),
    message TEXT,
    date_alerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut TEXT CHECK (statut IN ('active', 'resolue')) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adherent_id) REFERENCES adherents(id) ON DELETE CASCADE
);

-- 10. AUDIT_LOGS
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- INDEXES
CREATE INDEX idx_adherents_user_id ON adherents(user_id);
CREATE INDEX idx_adherents_numero_adherent ON adherents(numero_adherent);
CREATE INDEX idx_cotisations_adherent_id ON cotisations(adherent_id);
CREATE INDEX idx_cotisations_statut ON cotisations(statut);
CREATE INDEX idx_prets_adherent_id ON prets(adherent_id);
CREATE INDEX idx_remboursements_prets_pret_id ON remboursements_prets(pret_id);
CREATE INDEX idx_sinistres_adherent_id ON sinistres(adherent_id);
CREATE INDEX idx_sinistres_statut ON sinistres(statut);
CREATE INDEX idx_alertes_adherent_id ON alertes(adherent_id);

-- SAMPLE DATA
INSERT INTO users (name, email, password, role) VALUES
('Admin MaMutuelle', 'admin@mamutuelle.bf', 'password123', 'admin'),
('Alphonse Kaboré', 'alphonse@mamutuelle.bf', 'password123', 'agent'),
('Jacqueline Ouédraogo', 'jacqueline@mamutuelle.bf', 'password123', 'agent');

INSERT INTO adherents (user_id, nom, prenom, email, telephone, numero_adherent, date_inscription, statut) VALUES
(1, 'Kaboré', 'Issiaka', 'issiaka.kabore@mamutuelle.bf', '+226 25 30 12 45', 'ADH001', '2024-01-01', 'actif'),
(2, 'Ouédraogo', 'Aminata', 'aminata.ouedraogo@mamutuelle.bf', '+226 70 45 67 89', 'ADH002', '2024-01-15', 'actif'),
(3, 'Traoré', 'Moussa', 'moussa.traore@mamutuelle.bf', '+226 76 23 45 78', 'ADH003', '2024-02-01', 'actif');

INSERT INTO cotisations (adherent_id, montant, date_echeance, statut) VALUES
(1, 50000.00, '2024-02-01', 'payée'),
(2, 50000.00, '2024-02-15', 'en attente'),
(3, 50000.00, '2024-03-01', 'payée');

INSERT INTO prets (adherent_id, montant, taux_interet, duree_mois, date_debut, statut) VALUES
(1, 500000.00, 2.5, 12, '2024-01-15', 'approuvé'),
(2, 1000000.00, 3.0, 24, '2024-02-01', 'en attente');

INSERT INTO sinistres (adherent_id, description, date_sinistre, type_sinistre, statut) VALUES
(1, 'Consultation médicale générale', '2024-01-20', 'maladie', 'remboursé'),
(2, 'Hospitalisation - appendicite', '2024-02-10', 'hospitalisation', 'en cours'),
(3, 'Accident de circulation', '2024-02-28', 'accident', 'déclaré');
