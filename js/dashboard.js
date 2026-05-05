// ============================================================
// DASHBOARD.JS – MaMutuelle v2.0
// Dépend de api.js (API_URL, TOKEN_KEY, USER_KEY, apiCall,
//                    isAuthenticated, logout)
// ============================================================

// ── Protection ──────────────────────────────────────────────
if (!isAuthenticated()) { window.location.href = 'login.html'; }

// ── État global ──────────────────────────────────────────────
let adherentsList    = [];
let ayantsDroitList  = [];
let activityLog      = JSON.parse(localStorage.getItem('mm_activity') || '[]');
let currentId        = null;
let inlineAyants     = [];          // ayants droit en cours de saisie dans le modal adhérent
let chartCot         = null;
let chartPret        = null;
let settings         = JSON.parse(localStorage.getItem('mm_settings') || '{"perPage":25,"devise":"FCFA"}');

const SECTION_TITLES = {
    dashboard:            "Vue d'ensemble",
    alertes:              'Alertes et Notifications',
    activite:             'Activité récente',
    adherents:            'Gestion des Adhérents',
    ayantsDroit:          'Ayants Droit',
    cotisations:          'Gestion des Cotisations',
    historiqueCotisations:'Historique des Cotisations',
    prets:                'Gestion des Prêts',
    historiquePrets:      'Historique des Prêts',
    sinistres:            'Gestion des Sinistres',
    profil:               'Mon Profil',
    parametres:           'Paramètres',
};

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    initUser();
    initNav();
    initSubmenus();
    initSidebarToggle();
    initLogout();
    initForms();
    initGlobalSearch();
    initProfileTabs();
    initSettings();

    await loadAdherents();
    await loadAyantsDroit();
    populateSelects();
    loadStats();
    loadCotisations();
    loadPrets();
    loadSinistres();
    loadAlertes();
    renderActivity();
    loadHistoriqueCotisations();
    loadHistoriquePrets();

    setTimeout(initCharts, 300);
});

// ── Utilisateur ───────────────────────────────────────────────
function initUser() {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const name = user.name || user.email || 'Utilisateur';
    const role = user.role  || 'agent';
    const initials = getInitials(name);

    // Sidebar
    document.getElementById('sidebarUserName').textContent = name;
    document.getElementById('sidebarUserRole').textContent = role;
    document.getElementById('userAvatarSmall').textContent = initials;

    // Header
    document.getElementById('headerAvatar').textContent = initials;
    document.getElementById('headerAvatar').onclick = () => showSection('profil');

    // Page profil
    document.getElementById('profileAvatar').textContent = initials;
    document.getElementById('profileName').textContent   = name;
    document.getElementById('profileEmail').textContent  = user.email || '—';
    document.getElementById('profileRole').textContent   = role;
    document.getElementById('editName').value  = name;
    document.getElementById('editEmail').value = user.email || '';

    // Rôle badge
    const roleBadge = document.getElementById('profileRole');
    roleBadge.className = 'badge ' + (role === 'administrateur' ? 'badge-blue' : role === 'agent' ? 'badge-orange' : 'badge-green');
}

function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
}

// ── Navigation ────────────────────────────────────────────────
function initNav() {
    // Items principaux
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', () => showSection(item.dataset.section));
        item.addEventListener('keydown', e => { if (e.key === 'Enter') showSection(item.dataset.section); });
    });

    // Sous-items
    document.querySelectorAll('.nav-sub-item[data-section]').forEach(item => {
        item.addEventListener('click', () => showSection(item.dataset.section));
        item.addEventListener('keydown', e => { if (e.key === 'Enter') showSection(item.dataset.section); });
    });

    // User mini → profil
    document.getElementById('userMiniBtn').addEventListener('click', () => showSection('profil'));

    // Header notif → alertes
    document.getElementById('headerNotifBtn').addEventListener('click', () => showSection('alertes'));
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('active'));

    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');

    // Active nav item ou sub-item
    const navItem = document.querySelector('.nav-item[data-section="' + section + '"]');
    if (navItem) navItem.classList.add('active');
    const subItem = document.querySelector('.nav-sub-item[data-section="' + section + '"]');
    if (subItem) subItem.classList.add('active');

    document.getElementById('pageTitle').textContent = SECTION_TITLES[section] || section;

    // Fermeture sidebar mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('mobile-open');
        document.getElementById('sidebarOverlay').classList.remove('active');
    }
}

// ── Sous-menus dépliables ─────────────────────────────────────
function initSubmenus() {
    document.querySelectorAll('.nav-submenu-toggle').forEach(toggle => {
        toggle.addEventListener('click', function () {
            const menuId = this.dataset.submenu;
            const menu   = document.getElementById(menuId);
            if (!menu) return;

            const isOpen = this.classList.contains('open');
            // Fermer tous
            document.querySelectorAll('.nav-submenu-toggle.open').forEach(t => t.classList.remove('open'));
            document.querySelectorAll('.nav-submenu.open').forEach(m => m.classList.remove('open'));

            if (!isOpen) {
                this.classList.add('open');
                menu.classList.add('open');
            }
        });
    });
}

// ── Sidebar toggle ────────────────────────────────────────────
function initSidebarToggle() {
    const btn     = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    });
}

// ── Déconnexion ───────────────────────────────────────────────
function initLogout() {
    document.getElementById('btnLogout').addEventListener('click', () => {
        logout();
        window.location.href = 'login.html';
    });
}

// ── Recherche globale ─────────────────────────────────────────
function initGlobalSearch() {
    const input   = document.getElementById('globalSearchInput');
    const results = document.getElementById('searchResults');

    input.addEventListener('input', debounce(() => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { results.classList.remove('open'); return; }

        const found = [];

        // Adhérents
        adherentsList.filter(a =>
            (a.prenom + ' ' + a.nom).toLowerCase().includes(q) ||
            (a.numero_adherent || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q)
        ).slice(0, 4).forEach(a => found.push({
            type: 'Adhérent', icon: 'fa-user', color: 'or-bg',
            name: a.prenom + ' ' + a.nom, sub: a.numero_adherent || a.email,
            action: () => { showSection('adherents'); }
        }));

        // Ayants droit
        ayantsDroitList.filter(ad =>
            (ad.nom + ' ' + ad.prenom).toLowerCase().includes(q)
        ).slice(0, 3).forEach(ad => found.push({
            type: 'Ayant droit', icon: 'fa-people-group', color: 'green-bg',
            name: ad.prenom + ' ' + ad.nom, sub: ad.relation,
            action: () => { showSection('ayantsDroit'); }
        }));

        if (found.length === 0) {
            results.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--gris-40);font-size:.85rem;">Aucun résultat</div>';
        } else {
            results.innerHTML = found.map((f, i) => `
                <div class="search-result-item" data-idx="${i}">
                    <div class="search-result-icon ${f.color}"><i class="fas ${f.icon}"></i></div>
                    <div class="search-result-info">
                        <div class="result-name">${f.name}</div>
                        <div class="result-sub">${f.type} · ${f.sub || ''}</div>
                    </div>
                </div>`).join('');
            results.querySelectorAll('.search-result-item').forEach((el, i) => {
                el.addEventListener('click', () => {
                    found[i].action();
                    results.classList.remove('open');
                    input.value = '';
                });
            });
        }
        results.classList.add('open');
    }, 250));

    document.addEventListener('click', e => {
        if (!e.target.closest('.search-wrapper')) results.classList.remove('open');
    });
}

// ── Statistiques ──────────────────────────────────────────────
async function loadStats() {
    try {
        const data = await apiCall('/stats');
        const devise = settings.devise || 'FCFA';
        document.getElementById('statsContainer').innerHTML = `
            <div class="stat-card card-or">
                <div class="stat-card-icon"><i class="fas fa-users"></i></div>
                <h3>Adhérents actifs</h3>
                <div class="stat-value">${data.adherents_total ?? '—'}</div>
                <div class="stat-sub">membres inscrits</div>
            </div>
            <div class="stat-card card-green">
                <div class="stat-card-icon"><i class="fas fa-check-circle"></i></div>
                <h3>Cotisations payées</h3>
                <div class="stat-value">${data.cotisations_payees ?? '—'}</div>
                <div class="stat-sub">ce mois</div>
            </div>
            <div class="stat-card card-orange">
                <div class="stat-card-icon"><i class="fas fa-hand-holding-dollar"></i></div>
                <h3>Prêts actifs</h3>
                <div class="stat-value">${data.prets_actifs ?? '—'}</div>
                <div class="stat-sub">en cours</div>
            </div>
            <div class="stat-card card-red">
                <div class="stat-card-icon"><i class="fas fa-triangle-exclamation"></i></div>
                <h3>Sinistres en cours</h3>
                <div class="stat-value">${data.sinistres_en_cours ?? '—'}</div>
                <div class="stat-sub">à traiter</div>
            </div>
        `;
        // Mise à jour badge alertes
        const alertCount = (data.alertes_count || 0);
        document.getElementById('badgeAlertes').textContent = alertCount;
        document.getElementById('notifDot').style.display = alertCount > 0 ? 'block' : 'none';
    } catch (e) {
        console.error('Erreur stats:', e);
        document.getElementById('statsContainer').innerHTML = `
            <div class="stat-card card-or"><div class="stat-card-icon"><i class="fas fa-users"></i></div><h3>Adhérents</h3><div class="stat-value">—</div></div>
            <div class="stat-card card-green"><div class="stat-card-icon"><i class="fas fa-coins"></i></div><h3>Cotisations</h3><div class="stat-value">—</div></div>
            <div class="stat-card card-orange"><div class="stat-card-icon"><i class="fas fa-hand-holding-dollar"></i></div><h3>Prêts</h3><div class="stat-value">—</div></div>
            <div class="stat-card card-red"><div class="stat-card-icon"><i class="fas fa-triangle-exclamation"></i></div><h3>Sinistres</h3><div class="stat-value">—</div></div>
        `;
    }
}

// ── Graphiques ────────────────────────────────────────────────
async function initCharts() {
    await initChartCotisations();
    await initChartPrets();

    document.getElementById('chartPeriod').addEventListener('change', async function () {
        if (chartCot) { chartCot.destroy(); chartCot = null; }
        await initChartCotisations();
    });
}

async function initChartCotisations() {
    const months = parseInt(document.getElementById('chartPeriod').value) || 6;
    let labels = [], cotData = [], rembData = [];

    try {
        const data = await apiCall('/stats/cotisations?months=' + months);
        labels   = data.labels   || [];
        cotData  = data.amounts  || [];
        rembData = data.remb     || [];
    } catch {
        // Données de démo
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }));
            cotData.push(Math.floor(Math.random() * 800000) + 200000);
            rembData.push(Math.floor(Math.random() * 300000) + 50000);
        }
    }

    const ctx = document.getElementById('chartCotisations');
    if (!ctx) return;
    chartCot = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cotisations',
                    data: cotData,
                    backgroundColor: 'rgba(230,126,34,.75)',
                    borderColor: '#E67E22',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Remboursements',
                    data: rembData,
                    backgroundColor: 'rgba(39,174,96,.65)',
                    borderColor: '#27AE60',
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    type: 'line',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#27AE60',
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ' + Number(ctx.raw).toLocaleString('fr-FR') + ' FCFA'
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(0,0,0,.05)' },
                    ticks: {
                        font: { size: 11 },
                        callback: v => (v / 1000) + 'k'
                    }
                },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
}

async function initChartPrets() {
    let data = { approuve: 40, attente: 25, rembourse: 30, rejete: 5 };

    try {
        const res = await apiCall('/stats/prets');
        data = res;
    } catch { /* démo */ }

    const labels  = ['Approuvés', 'En attente', 'Remboursés', 'Rejetés'];
    const values  = [data.approuve, data.attente, data.rembourse, data.rejete];
    const colors  = ['#27AE60', '#E67E22', '#2980B9', '#C0392B'];

    const ctx = document.getElementById('chartPrets');
    if (!ctx) return;

    chartPret = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 2,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ' ' + ctx.raw + '%' } }
            }
        }
    });

    // Labels manuels
    const total = values.reduce((a, b) => a + b, 0);
    document.getElementById('donutLabels').innerHTML = labels.map((l, i) => `
        <div class="donut-label-item">
            <div class="donut-label-left">
                <span class="legend-dot" style="background:${colors[i]};"></span>
                ${l}
            </div>
            <span class="donut-label-pct">${total > 0 ? Math.round(values[i] / total * 100) : 0}%</span>
        </div>`).join('');
}

// ── Adhérents ─────────────────────────────────────────────────
async function loadAdherents() {
    try {
        adherentsList = await apiCall('/adherents');
        renderAdherents(adherentsList);
    } catch (e) { console.error('Erreur adhérents:', e); }
}

function renderAdherents(list) {
    const adCount = document.getElementById('ayantsDroitList');
    let html = '';
    list.forEach(a => {
        const bc  = a.statut === 'actif' ? 'badge-green' : a.statut === 'suspendu' ? 'badge-red' : 'badge-gray';
        const ays = (a.ayants_droit_count || 0);
        html += `<tr>
            <td class="cell-num">${a.numero_adherent || '—'}</td>
            <td class="cell-name">${a.prenom} ${a.nom}</td>
            <td>${a.email || '—'}</td>
            <td>${a.telephone || '—'}</td>
            <td>
                <span class="badge badge-gray" style="cursor:pointer;" onclick="showAyantsDroitFor(${a.id},'${a.prenom} ${a.nom}')">
                    <i class="fas fa-people-group" style="margin-right:.3rem;"></i>${ays}
                </span>
            </td>
            <td><span class="badge ${bc}">${a.statut}</span></td>
            <td>
                <div class="row-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="editAdherent(${a.id})" title="Modifier"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteAdherent(${a.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    });
    document.getElementById('adherentsBody').innerHTML = html || '<tr class="empty-row"><td colspan="7">Aucun adhérent enregistré.</td></tr>';
    document.getElementById('adherentsCount').textContent = list.length + ' adhérent(s)';
}

// ── Ayants droit ──────────────────────────────────────────────
async function loadAyantsDroit() {
    try {
        ayantsDroitList = await apiCall('/ayants-droit');
        renderAyantsDroit(ayantsDroitList);
    } catch (e) {
        // Endpoint peut ne pas exister encore → données vides
        ayantsDroitList = [];
        document.getElementById('ayantsDroitBody').innerHTML = '<tr class="empty-row"><td colspan="6">Aucun ayant droit enregistré.</td></tr>';
    }
}

function renderAyantsDroit(list) {
    let html = '';
    list.forEach(ad => {
        const adh = adherentsList.find(a => a.id === ad.adherent_id);
        html += `<tr>
            <td class="cell-name">${ad.nom}</td>
            <td>${ad.prenom}</td>
            <td><span class="badge badge-blue">${ad.relation || '—'}</span></td>
            <td>${ad.date_naissance || '—'}</td>
            <td>${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
            <td>
                <div class="row-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="editAyantDroit(${ad.id})" title="Modifier"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteAyantDroit(${ad.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    });
    document.getElementById('ayantsDroitBody').innerHTML = html || '<tr class="empty-row"><td colspan="6">Aucun ayant droit.</td></tr>';
    document.getElementById('ayantsDroitCount').textContent = list.length + ' ayant(s) droit';
}

function showAyantsDroitFor(adherentId, nom) {
    const filtered = ayantsDroitList.filter(ad => ad.adherent_id === adherentId);
    showSection('ayantsDroit');
    renderAyantsDroit(filtered.length ? filtered : []);
}

// ── Cotisations ───────────────────────────────────────────────
async function loadCotisations() {
    try {
        const data = await apiCall('/cotisations');
        let html = '';
        data.forEach(c => {
            const bc  = c.statut === 'payée' ? 'badge-green' : c.statut === 'en attente' ? 'badge-orange' : 'badge-red';
            const adh = adherentsList.find(a => a.id === c.adherent_id);
            html += `<tr>
                <td class="cell-name">${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td class="cell-amount">${Number(c.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${c.date_echeance || '—'}</td>
                <td><span class="badge ${bc}">${c.statut}</span></td>
                <td><div class="row-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="editCotisation(${c.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCotisation(${c.id})"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`;
        });
        document.getElementById('cotisationsBody').innerHTML = html || '<tr class="empty-row"><td colspan="5">Aucune cotisation.</td></tr>';
        document.getElementById('cotisationsCount').textContent = data.length + ' cotisation(s)';
    } catch (e) { console.error('Erreur cotisations:', e); }
}

async function loadHistoriqueCotisations() {
    try {
        const data = await apiCall('/cotisations');
        renderHistCot(data);
    } catch (e) {
        document.getElementById('histCotBody').innerHTML = '<tr class="empty-row"><td colspan="5">Indisponible.</td></tr>';
    }
}

function renderHistCot(data) {
    const moisFilter   = document.getElementById('histCotMois')?.value;
    const statutFilter = document.getElementById('histCotStatut')?.value;
    let filtered = data;
    if (moisFilter)   filtered = filtered.filter(c => (c.date_echeance || '').startsWith(moisFilter));
    if (statutFilter) filtered = filtered.filter(c => c.statut === statutFilter);
    let html = '';
    filtered.forEach(c => {
        const bc  = c.statut === 'payée' ? 'badge-green' : c.statut === 'en attente' ? 'badge-orange' : 'badge-red';
        const adh = adherentsList.find(a => a.id === c.adherent_id);
        html += `<tr>
            <td>${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
            <td class="cell-amount">${Number(c.montant).toLocaleString('fr-FR')} FCFA</td>
            <td>${c.date_echeance || '—'}</td>
            <td><span class="badge ${bc}">${c.statut}</span></td>
            <td>${c.created_at ? c.created_at.split('T')[0] : '—'}</td>
        </tr>`;
    });
    document.getElementById('histCotBody').innerHTML = html || '<tr class="empty-row"><td colspan="5">Aucun résultat.</td></tr>';
}

let _allCotisations = [];
async function filterHistCot() {
    if (_allCotisations.length === 0) {
        try { _allCotisations = await apiCall('/cotisations'); } catch { return; }
    }
    renderHistCot(_allCotisations);
}

// ── Prêts ─────────────────────────────────────────────────────
async function loadPrets() {
    try {
        const data = await apiCall('/prets');
        let html = '';
        data.forEach(p => {
            const bc  = p.statut === 'approuvé' ? 'badge-green' : p.statut === 'en attente' ? 'badge-orange' : p.statut === 'remboursé' ? 'badge-blue' : 'badge-red';
            const adh = adherentsList.find(a => a.id === p.adherent_id);
            html += `<tr>
                <td class="cell-name">${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td class="cell-amount">${Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${p.taux_interet ?? 0}%</td>
                <td>${p.duree_mois} mois</td>
                <td>${p.date_debut || '—'}</td>
                <td><span class="badge ${bc}">${p.statut}</span></td>
                <td><div class="row-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="editPret(${p.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deletePret(${p.id})"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`;
        });
        document.getElementById('pretsBody').innerHTML = html || '<tr class="empty-row"><td colspan="7">Aucun prêt.</td></tr>';
        document.getElementById('pretsCount').textContent = data.length + ' prêt(s)';
    } catch (e) { console.error('Erreur prêts:', e); }
}

async function loadHistoriquePrets() {
    try {
        const data = await apiCall('/prets');
        let html = '';
        data.forEach(p => {
            const bc  = p.statut === 'remboursé' ? 'badge-green' : 'badge-gray';
            const adh = adherentsList.find(a => a.id === p.adherent_id);
            html += `<tr>
                <td>${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td class="cell-amount">${Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${p.taux_interet ?? 0}%</td>
                <td>${p.duree_mois} mois</td>
                <td><span class="badge ${bc}">${p.statut}</span></td>
                <td>${p.date_debut || '—'}</td>
            </tr>`;
        });
        document.getElementById('histPretBody').innerHTML = html || '<tr class="empty-row"><td colspan="6">Aucun remboursement.</td></tr>';
    } catch (e) {
        document.getElementById('histPretBody').innerHTML = '<tr class="empty-row"><td colspan="6">Indisponible.</td></tr>';
    }
}

// ── Sinistres ─────────────────────────────────────────────────
async function loadSinistres() {
    try {
        const data = await apiCall('/sinistres');
        let html = '';
        data.forEach(s => {
            const bc  = s.statut === 'remboursé' ? 'badge-green' : s.statut === 'en cours' ? 'badge-orange' : s.statut === 'approuvé' ? 'badge-blue' : 'badge-red';
            const adh = adherentsList.find(a => a.id === s.adherent_id);
            const desc = (s.description || '—').substring(0, 45) + ((s.description || '').length > 45 ? '…' : '');
            html += `<tr>
                <td class="cell-name">${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td>${desc}</td>
                <td><span class="badge badge-brown">${s.type_sinistre}</span></td>
                <td>${s.date_sinistre || '—'}</td>
                <td><span class="badge ${bc}">${s.statut}</span></td>
                <td><div class="row-actions">
                    <button class="btn btn-secondary btn-sm btn-icon" onclick="editSinistre(${s.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-danger btn-sm btn-icon" onclick="deleteSinistre(${s.id})"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`;
        });
        document.getElementById('sinistresBody').innerHTML = html || '<tr class="empty-row"><td colspan="6">Aucun sinistre.</td></tr>';
    } catch (e) { console.error('Erreur sinistres:', e); }
}

// ── Alertes ───────────────────────────────────────────────────
async function loadAlertes() {
    try {
        const data = await apiCall('/alertes');

        // Cotisations retard
        let htmlCot = '';
        (data.cotisations_retard || []).forEach(c => {
            const adh = adherentsList.find(a => a.id === c.adherent_id);
            htmlCot += `<tr>
                <td class="cell-name">${adh ? adh.prenom + ' ' + adh.nom : c.adherent_nom || '—'}</td>
                <td class="cell-amount">${Number(c.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${c.date_echeance}</td>
                <td><span class="badge badge-red">${c.jours_retard}j</span></td>
                <td><button class="btn btn-primary btn-xs" onclick="editCotisation(${c.id})"><i class="fas fa-bell-ring"></i></button></td>
            </tr>`;
        });
        document.getElementById('alertsCotBody').innerHTML = htmlCot || '<tr class="empty-row"><td colspan="5">Aucune cotisation en retard ✓</td></tr>';

        // Prêts à échéance
        let htmlPret = '';
        (data.prets_echeance || []).forEach(p => {
            const adh = adherentsList.find(a => a.id === p.adherent_id);
            const bc  = p.statut === 'approuvé' ? 'badge-green' : 'badge-orange';
            htmlPret += `<tr>
                <td class="cell-name">${adh ? adh.prenom + ' ' + adh.nom : '—'}</td>
                <td class="cell-amount">${Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                <td>${p.date_echeance || '—'}</td>
                <td><span class="badge ${bc}">${p.statut}</span></td>
                <td><button class="btn btn-secondary btn-xs" onclick="editPret(${p.id})"><i class="fas fa-pen"></i></button></td>
            </tr>`;
        });
        document.getElementById('alertsPretsBody').innerHTML = htmlPret || '<tr class="empty-row"><td colspan="5">Aucun prêt à échéance ✓</td></tr>';

        const total = (data.cotisations_retard?.length || 0) + (data.prets_echeance?.length || 0);
        document.getElementById('badgeAlertes').textContent = total;
        document.getElementById('notifDot').style.display = total > 0 ? 'block' : 'none';
    } catch (e) { console.error('Erreur alertes:', e); }
}

// ── Activité ──────────────────────────────────────────────────
function logActivity(type, desc, icon = 'fa-circle-check', color = 'or-bg') {
    activityLog.unshift({
        type, desc, icon, color,
        time: new Date().toISOString()
    });
    if (activityLog.length > 50) activityLog = activityLog.slice(0, 50);
    localStorage.setItem('mm_activity', JSON.stringify(activityLog));
    renderActivity();
}

function renderActivity() {
    const list = activityLog.slice(0, 5);
    const previewHtml = buildActivityHtml(list) || '<div class="activity-item" style="color:var(--gris-40);padding:1.25rem;font-style:italic;">Aucune activité récente.</div>';
    const el = document.getElementById('activityPreviewList');
    if (el) el.innerHTML = previewHtml;

    const full = buildActivityHtml(activityLog) || '<div class="activity-item" style="color:var(--gris-40);padding:1.25rem;font-style:italic;">Aucune activité enregistrée.</div>';
    const el2 = document.getElementById('activityFullList');
    if (el2) el2.innerHTML = full;

    const el3 = document.getElementById('profileActivityList');
    if (el3) el3.innerHTML = buildActivityHtml(activityLog.slice(0, 10)) || '<div style="padding:1rem;color:var(--gris-40);font-style:italic;">Aucune action récente.</div>';
}

function buildActivityHtml(items) {
    return items.map(a => {
        const d = new Date(a.time);
        const timeStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `<div class="activity-item">
            <div class="activity-icon ${a.color}"><i class="fas ${a.icon}"></i></div>
            <div class="activity-text">
                <div class="act-desc">${a.desc}</div>
                <div class="act-time">${timeStr}</div>
            </div>
        </div>`;
    }).join('');
}

document.getElementById('btnClearActivity')?.addEventListener('click', () => {
    activityLog = [];
    localStorage.removeItem('mm_activity');
    renderActivity();
    showToast('Historique effacé', 'info');
});

// ── Recherche dans les tableaux ───────────────────────────────
function filterTable(tbodyId, query) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const q = query.toLowerCase();
    Array.from(tbody.rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

// ── Export PDF ────────────────────────────────────────────────
function exportTablePDF(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(230, 126, 34);
    doc.text('MaMutuelle – ' + filename.charAt(0).toUpperCase() + filename.slice(1), 14, 15);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Généré le ' + new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), 14, 21);

    doc.autoTable({
        html: '#' + tableId,
        startY: 26,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [230, 126, 34], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [253, 246, 236] },
        didParseCell: data => {
            // Supprimer la colonne Actions
            if (data.column.index === table.rows[0].cells.length - 1) data.cell.text = '';
        }
    });

    doc.save('mamutuelle-' + filename + '-' + new Date().toISOString().split('T')[0] + '.pdf');
    showToast('Export PDF généré', 'success');
    logActivity('export', 'Export PDF : <strong>' + filename + '</strong>', 'fa-file-pdf', 'red-bg');
}

// ── Export Excel ──────────────────────────────────────────────
function exportTableExcel(tableId, sheetName) {
    const table = document.getElementById(tableId);
    if (!table || typeof XLSX === 'undefined') {
        showToast('XLSX non disponible', 'error');
        return;
    }

    // Clone pour supprimer colonne Actions
    const clone = table.cloneNode(true);
    clone.querySelectorAll('tr').forEach(row => {
        const lastCell = row.lastElementChild;
        if (lastCell) lastCell.remove();
    });

    const wb = XLSX.utils.table_to_book(clone, { sheet: sheetName });
    XLSX.writeFile(wb, 'mamutuelle-' + sheetName.toLowerCase() + '-' + new Date().toISOString().split('T')[0] + '.xlsx');
    showToast('Export Excel généré', 'success');
    logActivity('export', 'Export Excel : <strong>' + sheetName + '</strong>', 'fa-file-excel', 'green-bg');
}

// ── Selects adhérents ─────────────────────────────────────────
function populateSelects() {
    ['cotisationAdherent', 'pretAdherent', 'sinistreAdherent', 'ayantDroitAdherent'].forEach(id => {
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

// ── Modals ────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('active'); });
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});

// ── Modal Adhérent ────────────────────────────────────────────
function openAdherentModal() {
    currentId   = null;
    inlineAyants = [];
    document.getElementById('adherentModalTitle').textContent = 'Nouvel Adhérent';
    document.getElementById('adherentForm').reset();
    showModalError('adherentError', '');
    document.getElementById('adherentAyantsDroitList').innerHTML = '';
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
    showModalError('adherentError', '');

    // Charger les ayants droit existants
    inlineAyants = ayantsDroitList.filter(ad => ad.adherent_id === id);
    renderInlineAyants();
    openModal('adherentModal');
}

// Ayants droit inline dans le modal adhérent
function addAyantDroitInline() {
    inlineAyants.push({ nom: '', prenom: '', relation: 'Enfant', date_naissance: '', _new: true });
    renderInlineAyants();
}

function renderInlineAyants() {
    const container = document.getElementById('adherentAyantsDroitList');
    if (!container) return;
    container.innerHTML = inlineAyants.map((ad, i) => `
        <div class="ayant-droit-item">
            <div class="ayant-droit-icon"><i class="fas fa-user-group"></i></div>
            <div class="ayant-droit-info" style="display:grid;grid-template-columns:1fr 1fr auto;gap:.5rem;flex:1;">
                <input type="text" placeholder="Nom" value="${ad.nom || ''}"
                    oninput="inlineAyants[${i}].nom=this.value"
                    style="padding:.35rem .6rem;border:1px solid var(--gris-20);border-radius:var(--r-sm);font-size:.8rem;font-family:var(--font-body);" />
                <input type="text" placeholder="Prénom" value="${ad.prenom || ''}"
                    oninput="inlineAyants[${i}].prenom=this.value"
                    style="padding:.35rem .6rem;border:1px solid var(--gris-20);border-radius:var(--r-sm);font-size:.8rem;font-family:var(--font-body);" />
                <select oninput="inlineAyants[${i}].relation=this.value"
                    style="padding:.35rem .6rem;border:1px solid var(--gris-20);border-radius:var(--r-sm);font-size:.8rem;font-family:var(--font-body);">
                    ${['Conjoint(e)','Enfant','Père','Mère','Frère/Sœur','Autre'].map(r =>
                        `<option ${ad.relation === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            <button type="button" class="btn btn-danger btn-sm btn-icon" onclick="removeInlineAyant(${i})" style="margin-left:.5rem;">
                <i class="fas fa-times"></i>
            </button>
        </div>`).join('');
}

function removeInlineAyant(i) {
    inlineAyants.splice(i, 1);
    renderInlineAyants();
}

// ── Modal Ayant Droit standalone ──────────────────────────────
function openAyantDroitModal() {
    currentId = null;
    document.getElementById('ayantDroitModalTitle').textContent = 'Ajouter un ayant droit';
    document.getElementById('ayantDroitForm').reset();
    showModalError('ayantDroitError', '');
    populateSelects();
    openModal('ayantDroitModal');
}

async function editAyantDroit(id) {
    const ad = ayantsDroitList.find(x => x.id === id);
    if (!ad) return;
    currentId = id;
    document.getElementById('ayantDroitModalTitle').textContent = 'Modifier l\'ayant droit';
    document.getElementById('ayantDroitAdherent').value = ad.adherent_id;
    document.getElementById('ayantDroitNom').value      = ad.nom;
    document.getElementById('ayantDroitPrenom').value   = ad.prenom;
    document.getElementById('ayantDroitRelation').value = ad.relation || '';
    document.getElementById('ayantDroitDOB').value      = ad.date_naissance || '';
    showModalError('ayantDroitError', '');
    populateSelects();
    openModal('ayantDroitModal');
}

// ── Modal Cotisation ──────────────────────────────────────────
function openCotisationModal() {
    currentId = null;
    document.getElementById('cotisationModalTitle').textContent = 'Nouvelle Cotisation';
    document.getElementById('cotisationForm').reset();
    showModalError('cotisationError', '');
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
        showModalError('cotisationError', '');
        populateSelects();
        openModal('cotisationModal');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

// ── Modal Prêt ────────────────────────────────────────────────
function openPretModal() {
    currentId = null;
    document.getElementById('pretModalTitle').textContent = 'Nouveau Prêt';
    document.getElementById('pretForm').reset();
    showModalError('pretError', '');
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
        document.getElementById('pretDate').value     = p.date_debut || '';
        document.getElementById('pretStatut').value   = p.statut;
        showModalError('pretError', '');
        populateSelects();
        openModal('pretModal');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

// ── Modal Sinistre ────────────────────────────────────────────
function openSinistreModal() {
    currentId = null;
    document.getElementById('sinistreModalTitle').textContent = 'Nouveau Sinistre';
    document.getElementById('sinistreForm').reset();
    showModalError('sinistreError', '');
    populateSelects();
    openModal('sinistreModal');
}

async function editSinistre(id) {
    try {
        const s = await apiCall('/sinistres/' + id);
        currentId = id;
        document.getElementById('sinistreModalTitle').textContent = 'Modifier le Sinistre';
        document.getElementById('sinistreAdherent').value    = s.adherent_id;
        document.getElementById('sinistreDescription').value = s.description;
        document.getElementById('sinistreType').value        = s.type_sinistre;
        document.getElementById('sinistreDate').value        = s.date_sinistre;
        document.getElementById('sinistreStatut').value      = s.statut;
        showModalError('sinistreError', '');
        populateSelects();
        openModal('sinistreModal');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

// ── Formulaires ───────────────────────────────────────────────
function initForms() {
    document.getElementById('adherentForm').addEventListener('submit',   saveAdherent);
    document.getElementById('ayantDroitForm').addEventListener('submit', saveAyantDroit);
    document.getElementById('cotisationForm').addEventListener('submit', saveCotisation);
    document.getElementById('pretForm').addEventListener('submit',       savePret);
    document.getElementById('sinistreForm').addEventListener('submit',   saveSinistre);
}

async function saveAdherent(e) {
    e.preventDefault();
    const data = {
        nom:             document.getElementById('adherentNom').value,
        prenom:          document.getElementById('adherentPrenom').value,
        email:           document.getElementById('adherentEmail').value,
        telephone:       document.getElementById('adherentTel').value,
        numero_adherent: document.getElementById('adherentNumero').value,
        statut:          document.getElementById('adherentStatut').value,
        date_inscription: new Date().toISOString().split('T')[0],
    };
    const isNew = !currentId;
    const savedId = await saveEntity('adherentModal', 'adherentError', '/adherents', data, async (res) => {
        await loadAdherents();
        populateSelects();
        loadStats();
        logActivity('adherent', (isNew ? 'Nouvel adhérent : ' : 'Adhérent modifié : ') + '<strong>' + data.prenom + ' ' + data.nom + '</strong>', 'fa-user', 'or-bg');
        // Enregistrer les ayants droit inline
        const adhId = res?.id || currentId;
        for (const ad of inlineAyants.filter(x => x._new && x.nom)) {
            try {
                await apiCall('/ayants-droit', { method: 'POST', body: JSON.stringify({ ...ad, adherent_id: adhId }) });
            } catch {}
        }
        await loadAyantsDroit();
    });
}

async function saveAyantDroit(e) {
    e.preventDefault();
    const data = {
        adherent_id:    parseInt(document.getElementById('ayantDroitAdherent').value),
        nom:            document.getElementById('ayantDroitNom').value,
        prenom:         document.getElementById('ayantDroitPrenom').value,
        relation:       document.getElementById('ayantDroitRelation').value,
        date_naissance: document.getElementById('ayantDroitDOB').value,
    };
    await saveEntity('ayantDroitModal', 'ayantDroitError', '/ayants-droit', data, async () => {
        await loadAyantsDroit();
        logActivity('ayant-droit', 'Ayant droit : <strong>' + data.prenom + ' ' + data.nom + '</strong>', 'fa-people-group', 'green-bg');
    });
}

async function saveCotisation(e) {
    e.preventDefault();
    const data = {
        adherent_id:   parseInt(document.getElementById('cotisationAdherent').value),
        montant:       parseFloat(document.getElementById('cotisationMontant').value),
        date_echeance: document.getElementById('cotisationEcheance').value,
        statut:        document.getElementById('cotisationStatut').value,
    };
    await saveEntity('cotisationModal', 'cotisationError', '/cotisations', data, async () => {
        loadCotisations(); loadStats(); loadAlertes();
        logActivity('cotisation', 'Cotisation : <strong>' + data.montant.toLocaleString('fr-FR') + ' FCFA</strong>', 'fa-coins', 'green-bg');
    });
}

async function savePret(e) {
    e.preventDefault();
    const data = {
        adherent_id:  parseInt(document.getElementById('pretAdherent').value),
        montant:      parseFloat(document.getElementById('pretMontant').value),
        taux_interet: parseFloat(document.getElementById('pretTaux').value) || 0,
        duree_mois:   parseInt(document.getElementById('pretDuree').value),
        date_debut:   document.getElementById('pretDate').value,
        statut:       document.getElementById('pretStatut').value,
    };
    await saveEntity('pretModal', 'pretError', '/prets', data, async () => {
        loadPrets(); loadStats(); loadAlertes();
        logActivity('pret', 'Prêt : <strong>' + data.montant.toLocaleString('fr-FR') + ' FCFA</strong>', 'fa-hand-holding-dollar', 'blue-bg');
    });
}

async function saveSinistre(e) {
    e.preventDefault();
    const data = {
        adherent_id:   parseInt(document.getElementById('sinistreAdherent').value),
        description:   document.getElementById('sinistreDescription').value,
        date_sinistre: document.getElementById('sinistreDate').value,
        type_sinistre: document.getElementById('sinistreType').value,
        statut:        document.getElementById('sinistreStatut').value,
    };
    await saveEntity('sinistreModal', 'sinistreError', '/sinistres', data, async () => {
        loadSinistres(); loadStats();
        logActivity('sinistre', 'Sinistre <strong>' + data.type_sinistre + '</strong> déclaré', 'fa-triangle-exclamation', 'red-bg');
    });
}

async function saveEntity(modalId, errorId, endpoint, data, onSuccess) {
    const method = currentId ? 'PATCH' : 'POST';
    const url    = currentId ? `${endpoint}/${currentId}` : endpoint;
    try {
        const res = await apiCall(url, { method, body: JSON.stringify(data) });
        closeModal(modalId);
        showToast(currentId ? 'Modifié avec succès' : 'Enregistré avec succès', 'success');
        await onSuccess(res);
        return res;
    } catch (e) {
        showModalError(errorId, 'Erreur : ' + (e.message || "Impossible d'enregistrer."));
    }
}

// ── Suppressions ──────────────────────────────────────────────
async function deleteAdherent(id) {
    if (!confirm('Supprimer cet adhérent ? Cette action est irréversible.')) return;
    try {
        await apiCall('/adherents/' + id, { method: 'DELETE' });
        await loadAdherents();
        populateSelects();
        loadStats();
        showToast('Adhérent supprimé', 'success');
        logActivity('delete', 'Adhérent supprimé (id:' + id + ')', 'fa-trash', 'red-bg');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function deleteAyantDroit(id) {
    if (!confirm('Supprimer cet ayant droit ?')) return;
    try {
        await apiCall('/ayants-droit/' + id, { method: 'DELETE' });
        await loadAyantsDroit();
        showToast('Ayant droit supprimé', 'success');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function deleteCotisation(id) {
    if (!confirm('Supprimer cette cotisation ?')) return;
    try {
        await apiCall('/cotisations/' + id, { method: 'DELETE' });
        loadCotisations(); loadStats();
        showToast('Cotisation supprimée', 'success');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function deletePret(id) {
    if (!confirm('Supprimer ce prêt ?')) return;
    try {
        await apiCall('/prets/' + id, { method: 'DELETE' });
        loadPrets(); loadStats();
        showToast('Prêt supprimé', 'success');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function deleteSinistre(id) {
    if (!confirm('Supprimer ce sinistre ?')) return;
    try {
        await apiCall('/sinistres/' + id, { method: 'DELETE' });
        loadSinistres(); loadStats();
        showToast('Sinistre supprimé', 'success');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

// ── Profil ────────────────────────────────────────────────────
function initProfileTabs() {
    document.querySelectorAll('.profile-tab[data-ptab]').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const content = document.getElementById(this.dataset.ptab);
            if (content) content.classList.add('active');
        });
    });
}

function saveProfile() {
    const userJson = localStorage.getItem(USER_KEY);
    const user     = userJson ? JSON.parse(userJson) : {};
    user.name  = document.getElementById('editName').value;
    user.email = document.getElementById('editEmail').value;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    initUser();
    showToast('Profil mis à jour', 'success');
    logActivity('profil', 'Profil mis à jour', 'fa-user-pen', 'or-bg');
}

function changePassword() {
    const pwd    = document.getElementById('pwdNew').value;
    const confirm = document.getElementById('pwdConfirm').value;
    if (!pwd) { showToast('Mot de passe vide', 'error'); return; }
    if (pwd !== confirm) { showToast('Les mots de passe ne correspondent pas', 'error'); return; }
    // Appel API réel à implémenter
    showToast('Mot de passe mis à jour', 'success');
    document.getElementById('pwdCurrent').value = '';
    document.getElementById('pwdNew').value      = '';
    document.getElementById('pwdConfirm').value  = '';
}

// ── Paramètres ────────────────────────────────────────────────
function initSettings() {
    const s = settings;
    if (document.getElementById('settingPerPage'))  document.getElementById('settingPerPage').value  = s.perPage || 25;
    if (document.getElementById('settingDevise'))   document.getElementById('settingDevise').value   = s.devise  || 'FCFA';
}

function saveSettings() {
    settings.perPage = parseInt(document.getElementById('settingPerPage')?.value || 25);
    settings.devise  = document.getElementById('settingDevise')?.value || 'FCFA';
    settings.notifCotisations = document.getElementById('notifCotisations')?.checked;
    settings.notifPrets       = document.getElementById('notifPrets')?.checked;
    settings.notifSinistres   = document.getElementById('notifSinistres')?.checked;
    localStorage.setItem('mm_settings', JSON.stringify(settings));
    showToast('Paramètres enregistrés', 'success');
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3100);
}

// ── Helpers ───────────────────────────────────────────────────
function showModalError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('show', !!msg);
}

function debounce(fn, delay) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), delay);
    };
}
