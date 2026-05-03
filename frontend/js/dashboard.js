// ============================================
// DASHBOARD.JS – Logique spécifique au dashboard
// Dépend de script.js (API_URL, TOKEN_KEY, USER_KEY, apiCall, isAuthenticated, logout)
// ============================================

// ============================================
// PROTECTION : rediriger si non connecté
// ============================================
if (!isAuthenticated()) {
    window.location.href = 'login.html';
}

// ============================================
// ÉTAT GLOBAL
// ============================================
let adherentsList = [];
let currentId     = null;

const SECTION_TITLES = {
    dashboard:   "Vue d'ensemble",
    alertes:     'Alertes et Notifications',
    adherents:   'Gestion des Adhérents',
    cotisations: 'Gestion des Cotisations',
    prets:       'Gestion des Prêts',
    sinistres:   'Gestion des Sinistres',
};

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', async function () {
    initUser();
    initNav();
    initSidebarToggle();
    initLogout();
    initForms();

    await loadAdherents();
    populateSelects();
    loadStats();
    loadCotisations();
    loadPrets();
    loadSinistres();
    loadAlertes();
});

// ============================================
// NOM UTILISATEUR
// ============================================
function initUser() {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
        const user = JSON.parse(userJson);
        document.getElementById('user-name').textContent = user.name || user.email || 'Utilisateur';
    }
}

// ============================================
// NAVIGATION
// ============================================
function initNav() {
    document.querySelectorAll('.nav-item[data-section]').forEach(function (item) {
        item.addEventListener('click', function () {
            showSection(this.dataset.section);
        });
    });
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');

    const navItem = document.querySelector('.nav-item[data-section="' + section + '"]');
    if (navItem) navItem.classList.add('active');

    const title = document.getElementById('page-title');
    if (title) title.textContent = SECTION_TITLES[section] || section;
}

// ============================================
// SIDEBAR TOGGLE
// ============================================
function initSidebarToggle() {
    const btn     = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });
}

// ============================================
// DÉCONNEXION
// ============================================
function initLogout() {
    const btn = document.getElementById('btn-logout');
    if (!btn) return;
    btn.addEventListener('click', function () {
        logout();
        window.location.href = 'login.html';
    });
}

// ============================================
// STATISTIQUES
// ============================================
async function loadStats() {
    try {
        const data = await apiCall('/stats');
        document.getElementById('statsContainer').innerHTML = `
            <div class="stat-card">
                <h3>Adhérents Actifs</h3>
                <div class="value">${data.adherents_total}</div>
            </div>
            <div class="stat-card green">
                <h3>Cotisations Payées</h3>
                <div class="value">${data.cotisations_payees}</div>
            </div>
            <div class="stat-card orange">
                <h3>Prêts Actifs</h3>
                <div class="value">${data.prets_actifs}</div>
            </div>
            <div class="stat-card red">
                <h3>Sinistres en Cours</h3>
                <div class="value">${data.sinistres_en_cours}</div>
            </div>
        `;
    } catch (e) {
        console.error('Erreur stats:', e);
    }
}

// ============================================
// ALERTES
// ============================================
async function loadAlertes() {
    try {
        const data = await apiCall('/alertes');

        let htmlCot = '';
        if (data.cotisations_retard && data.cotisations_retard.length > 0) {
            data.cotisations_retard.forEach(function (c) {
                htmlCot += `<tr>
                    <td><strong>${c.prenom} ${c.nom}</strong></td>
                    <td>${c.email}</td>
                    <td>${Number(c.montant).toLocaleString('fr-FR')} FCFA</td>
                    <td>${c.date_echeance}</td>
                    <td><span class="badge-status badge-red">${c.jours_retard} jours</span></td>
                    <td><button class="btn-action btn-primary btn-sm" onclick="editCotisation(${c.id})">Payer</button></td>
                </tr>`;
            });
        } else {
            htmlCot = '<tr><td colspan="6" class="loading-row">Aucune cotisation en retard ✓</td></tr>';
        }
        document.getElementById('alertesCotisationsBody').innerHTML = htmlCot;

        let htmlPret = '';
        if (data.prets_echeance && data.prets_echeance.length > 0) {
            data.prets_echeance.forEach(function (p) {
                htmlPret += `<tr>
                    <td><strong>${p.prenom} ${p.nom}</strong></td>
                    <td>${p.email}</td>
                    <td>${Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                    <td>${p.date_echeance}</td>
                    <td><span class="badge-status badge-yellow">${p.statut}</span></td>
                    <td><button class="btn-action btn-primary btn-sm" onclick="editPret(${p.id})">Voir</button></td>
                </tr>`;
            });
        } else {
            htmlPret = '<tr><td colspan="6" class="loading-row">Aucun prêt arrivant à échéance ✓</td></tr>';
        }
        document.getElementById('alertesPretsBody').innerHTML = htmlPret;

        const total = (data.cotisations_retard?.length || 0) + (data.prets_echeance?.length || 0);
        const badge = document.getElementById('badge-alertes');
        if (badge) {
            badge.textContent    = total;
            badge.style.display  = total > 0 ? 'inline-block' : 'none';
        }
    } catch (e) {
        console.error('Erreur alertes:', e);
    }
}

// ============================================
// ADHÉRENTS
// ============================================
async function loadAdherents() {
    try {
        adherentsList = await apiCall('/adherents');
        let html = '';
        adherentsList.forEach(function (a) {
            const bc = a.statut === 'actif' ? 'badge-green' : a.statut === 'suspendu' ? 'badge-red' : 'badge-gray';
            html += `<tr>
                <td>${a.numero_adherent}</td>
                <td>${a.nom} ${a.prenom}</td>
                <td>${a.email}</td>
                <td>${a.telephone || '—'}</td>
                <td><span class="badge-status ${bc}">${a.statut}</span></td>
                <td>
                    <button class="btn-action btn-primary btn-sm me-1" onclick="editAdherent(${a.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-danger btn-sm" onclick="deleteAdherent(${a.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        document.getElementById('adherentsBody').innerHTML = html || '<tr><td colspan="6" class="loading-row">Aucun adhérent.</td></tr>';
    } catch (e) { console.error('Erreur adhérents:', e); }
}

// ============================================
// COTISATIONS
// ============================================
async function loadCotisations() {
    try {
        const data = await apiCall('/cotisations');
        let html = '';
        data.forEach(function (c) {
            const bc  = c.statut === 'payée' ? 'badge-green' : c.statut === 'en attente' ? 'badge-yellow' : 'badge-red';
            const adh = adherentsList.find(a => a.id === c.adherent_id);
            html += `<tr>
                <td>${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td>${Number(c.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${c.date_echeance}</td>
                <td><span class="badge-status ${bc}">${c.statut}</span></td>
                <td>
                    <button class="btn-action btn-primary btn-sm me-1" onclick="editCotisation(${c.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-danger btn-sm" onclick="deleteCotisation(${c.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        document.getElementById('cotisationsBody').innerHTML = html || '<tr><td colspan="5" class="loading-row">Aucune cotisation.</td></tr>';
    } catch (e) { console.error('Erreur cotisations:', e); }
}

// ============================================
// PRÊTS
// ============================================
async function loadPrets() {
    try {
        const data = await apiCall('/prets');
        let html = '';
        data.forEach(function (p) {
            const bc  = p.statut === 'approuvé' ? 'badge-green' : p.statut === 'en attente' ? 'badge-yellow' : 'badge-red';
            const adh = adherentsList.find(a => a.id === p.adherent_id);
            html += `<tr>
                <td>${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td>${Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${p.taux_interet ?? 0}%</td>
                <td>${p.duree_mois}</td>
                <td><span class="badge-status ${bc}">${p.statut}</span></td>
                <td>
                    <button class="btn-action btn-primary btn-sm me-1" onclick="editPret(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-danger btn-sm" onclick="deletePret(${p.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        document.getElementById('pretsBody').innerHTML = html || '<tr><td colspan="6" class="loading-row">Aucun prêt.</td></tr>';
    } catch (e) { console.error('Erreur prêts:', e); }
}

// ============================================
// SINISTRES
// ============================================
async function loadSinistres() {
    try {
        const data = await apiCall('/sinistres');
        let html = '';
        data.forEach(function (s) {
            const bc   = s.statut === 'remboursé' ? 'badge-green' : s.statut === 'en cours' ? 'badge-yellow' : 'badge-red';
            const adh  = adherentsList.find(a => a.id === s.adherent_id);
            const desc = s.description ? s.description.substring(0, 40) + (s.description.length > 40 ? '…' : '') : '—';
            html += `<tr>
                <td>${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td>${desc}</td>
                <td>${s.type_sinistre}</td>
                <td>${s.date_sinistre}</td>
                <td><span class="badge-status ${bc}">${s.statut}</span></td>
                <td>
                    <button class="btn-action btn-primary btn-sm me-1" onclick="editSinistre(${s.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-danger btn-sm" onclick="deleteSinistre(${s.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });
        document.getElementById('sinistresBody').innerHTML = html || '<tr><td colspan="6" class="loading-row">Aucun sinistre.</td></tr>';
    } catch (e) { console.error('Erreur sinistres:', e); }
}

// ============================================
// SELECTS ADHÉRENTS
// ============================================
function populateSelects() {
    ['cotisationAdherent', 'pretAdherent', 'sinistreAdherent'].forEach(function (id) {
        const select = document.getElementById(id);
        if (!select) return;
        const current = select.value;
        select.innerHTML = '<option value="">-- Sélectionner --</option>';
        adherentsList.forEach(a => {
            select.innerHTML += `<option value="${a.id}">${a.prenom} ${a.nom}</option>`;
        });
        if (current) select.value = current;
    });
}

// ============================================
// MODALS
// ============================================
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
});

function openAdherentModal() {
    currentId = null;
    document.getElementById('adherentModalTitle').textContent = 'Nouvel Adhérent';
    document.getElementById('adherentForm').reset();
    document.getElementById('adherentError').textContent = '';
    openModal('adherentModal');
}

async function editAdherent(id) {
    const a = adherentsList.find(x => x.id === id);
    if (!a) return;
    currentId = id;
    document.getElementById('adherentModalTitle').textContent = "Modifier l'Adhérent";
    document.getElementById('adherentNom').value    = a.nom;
    document.getElementById('adherentPrenom').value = a.prenom;
    document.getElementById('adherentEmail').value  = a.email;
    document.getElementById('adherentTel').value    = a.telephone || '';
    document.getElementById('adherentNumero').value = a.numero_adherent;
    document.getElementById('adherentStatut').value = a.statut;
    document.getElementById('adherentError').textContent = '';
    openModal('adherentModal');
}

function openCotisationModal() {
    currentId = null;
    document.getElementById('cotisationModalTitle').textContent = 'Nouvelle Cotisation';
    document.getElementById('cotisationForm').reset();
    document.getElementById('cotisationError').textContent = '';
    populateSelects();
    openModal('cotisationModal');
}

async function editCotisation(id) {
    try {
        const c = await apiCall('/cotisations/' + id);
        currentId = id;
        document.getElementById('cotisationModalTitle').textContent = 'Modifier la Cotisation';
        document.getElementById('cotisationAdherent').value = c.adherent_id;
        document.getElementById('cotisationMontant').value  = c.montant;
        document.getElementById('cotisationEcheance').value = c.date_echeance;
        document.getElementById('cotisationStatut').value   = c.statut;
        document.getElementById('cotisationError').textContent = '';
        populateSelects();
        openModal('cotisationModal');
    } catch (e) { alert('Erreur: ' + e.message); }
}

function openPretModal() {
    currentId = null;
    document.getElementById('pretModalTitle').textContent = 'Nouveau Prêt';
    document.getElementById('pretForm').reset();
    document.getElementById('pretError').textContent = '';
    populateSelects();
    openModal('pretModal');
}

async function editPret(id) {
    try {
        const p = await apiCall('/prets/' + id);
        currentId = id;
        document.getElementById('pretModalTitle').textContent = 'Modifier le Prêt';
        document.getElementById('pretAdherent').value = p.adherent_id;
        document.getElementById('pretMontant').value  = p.montant;
        document.getElementById('pretTaux').value     = p.taux_interet || '';
        document.getElementById('pretDuree').value    = p.duree_mois;
        document.getElementById('pretDate').value     = p.date_debut;
        document.getElementById('pretStatut').value   = p.statut;
        document.getElementById('pretError').textContent = '';
        populateSelects();
        openModal('pretModal');
    } catch (e) { alert('Erreur: ' + e.message); }
}

function openSinistreModal() {
    currentId = null;
    document.getElementById('sinistreModalTitle').textContent = 'Nouveau Sinistre';
    document.getElementById('sinistreForm').reset();
    document.getElementById('sinistreError').textContent = '';
    populateSelects();
    openModal('sinistreModal');
}

async function editSinistre(id) {
    try {
        const s = await apiCall('/sinistres/' + id);
        currentId = id;
        document.getElementById('sinistreModalTitle').textContent  = 'Modifier le Sinistre';
        document.getElementById('sinistreAdherent').value    = s.adherent_id;
        document.getElementById('sinistreDescription').value = s.description;
        document.getElementById('sinistreType').value        = s.type_sinistre;
        document.getElementById('sinistreDate').value        = s.date_sinistre;
        document.getElementById('sinistreStatut').value      = s.statut;
        document.getElementById('sinistreError').textContent = '';
        populateSelects();
        openModal('sinistreModal');
    } catch (e) { alert('Erreur: ' + e.message); }
}

// ============================================
// SOUMISSION DES FORMULAIRES
// ============================================
function initForms() {
    document.getElementById('adherentForm').addEventListener('submit',   saveAdherent);
    document.getElementById('cotisationForm').addEventListener('submit', saveCotisation);
    document.getElementById('pretForm').addEventListener('submit',       savePret);
    document.getElementById('sinistreForm').addEventListener('submit',   saveSinistre);
}

async function saveAdherent(e) {
    e.preventDefault();
    await saveEntity('adherentModal', 'adherentError', '/adherents', {
        nom:             document.getElementById('adherentNom').value,
        prenom:          document.getElementById('adherentPrenom').value,
        email:           document.getElementById('adherentEmail').value,
        telephone:       document.getElementById('adherentTel').value,
        numero_adherent: document.getElementById('adherentNumero').value,
        statut:          document.getElementById('adherentStatut').value,
        date_inscription: new Date().toISOString().split('T')[0],
    }, async function () { await loadAdherents(); populateSelects(); loadStats(); });
}

async function saveCotisation(e) {
    e.preventDefault();
    await saveEntity('cotisationModal', 'cotisationError', '/cotisations', {
        adherent_id:   parseInt(document.getElementById('cotisationAdherent').value),
        montant:       parseFloat(document.getElementById('cotisationMontant').value),
        date_echeance: document.getElementById('cotisationEcheance').value,
        statut:        document.getElementById('cotisationStatut').value,
    }, function () { loadCotisations(); loadStats(); loadAlertes(); });
}

async function savePret(e) {
    e.preventDefault();
    await saveEntity('pretModal', 'pretError', '/prets', {
        adherent_id:  parseInt(document.getElementById('pretAdherent').value),
        montant:      parseFloat(document.getElementById('pretMontant').value),
        taux_interet: parseFloat(document.getElementById('pretTaux').value) || 0,
        duree_mois:   parseInt(document.getElementById('pretDuree').value),
        date_debut:   document.getElementById('pretDate').value,
        statut:       document.getElementById('pretStatut').value,
    }, function () { loadPrets(); loadStats(); loadAlertes(); });
}

async function saveSinistre(e) {
    e.preventDefault();
    await saveEntity('sinistreModal', 'sinistreError', '/sinistres', {
        adherent_id:   parseInt(document.getElementById('sinistreAdherent').value),
        description:   document.getElementById('sinistreDescription').value,
        date_sinistre: document.getElementById('sinistreDate').value,
        type_sinistre: document.getElementById('sinistreType').value,
        statut:        document.getElementById('sinistreStatut').value,
    }, function () { loadSinistres(); loadStats(); });
}

async function saveEntity(modalId, errorId, endpoint, data, onSuccess) {
    const method = currentId ? 'PATCH' : 'POST';
    const url    = currentId ? `${endpoint}/${currentId}` : endpoint;
    try {
        await apiCall(url, { method, body: JSON.stringify(data) });
        closeModal(modalId);
        await onSuccess();
    } catch (e) {
        document.getElementById(errorId).textContent = 'Erreur : ' + (e.message || "Impossible d'enregistrer.");
    }
}

// ============================================
// SUPPRESSIONS
// ============================================
async function deleteAdherent(id) {
    if (!confirm('Supprimer cet adhérent ? Cette action est irréversible.')) return;
    try { await apiCall('/adherents/' + id, { method: 'DELETE' }); await loadAdherents(); populateSelects(); loadStats(); }
    catch (e) { alert('Erreur: ' + e.message); }
}

async function deleteCotisation(id) {
    if (!confirm('Supprimer cette cotisation ?')) return;
    try { await apiCall('/cotisations/' + id, { method: 'DELETE' }); loadCotisations(); loadStats(); }
    catch (e) { alert('Erreur: ' + e.message); }
}

async function deletePret(id) {
    if (!confirm('Supprimer ce prêt ?')) return;
    try { await apiCall('/prets/' + id, { method: 'DELETE' }); loadPrets(); loadStats(); }
    catch (e) { alert('Erreur: ' + e.message); }
}

async function deleteSinistre(id) {
    if (!confirm('Supprimer ce sinistre ?')) return;
    try { await apiCall('/sinistres/' + id, { method: 'DELETE' }); loadSinistres(); loadStats(); }
    catch (e) { alert('Erreur: ' + e.message); }
}
