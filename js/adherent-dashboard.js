/**
 * adherent-dashboard.js
 * MaMutuelle — Tableau de bord Adhérent
 * Logique complète : auth, navigation, API, graphiques, modals, export
 */

// ============================================================
// CONFIG & ÉTAT GLOBAL
// ============================================================
const API_BASE = window.API_BASE || 'https://projetdevwebgroupe-production.up.railway.app/api';
let TOKEN = null;
let CURRENT_USER = null;
let CHART_ACCUEIL = null;
let CHART_COTIS_HISTO = null;
let currentPayCotisId = null;
let currentEditAyantId = null;
let currentPretActif = null;
let allCotisations = [];
let allNotifications = [];
let amortissementVisible = false;

// ============================================================
// INITIALISATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    bindNav();
    bindSidebarToggle();
    bindNotifBtn();
    bindLogout();
    bindPretCalc();
    bindDragDrop();
});

// ============================================================
// AUTH — vérification du token et du rôle
// ============================================================
function checkAuth() {
    TOKEN = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!TOKEN) {
        redirectLogin();
        return;
    }
    loadUserProfile();
}

function redirectLogin() {
    window.location.href = 'login.html';
}

async function loadUserProfile() {
    try {
        const data = await apiGet('/adherent/me');

        // Vérifier que c'est bien un adhérent (pas un admin)
        if (data.role == 'admin') {
            window.location.href = 'dashboard.html';
            return;
        }
        else if (data.role == 'adherent') {
            window.location.href = 'adherent-dashboard.html';
            return;
        }

        CURRENT_USER = data;
        renderUserInfo(data);
        loadDashboardData();
        loadNotificationsBadge();
    } catch (err) {
        if (err.status === 401) redirectLogin();
        else showToast('Impossible de charger votre profil.', 'error');
    }
}

// ============================================================
// RENDER INFORMATIONS UTILISATEUR
// ============================================================
function renderUserInfo(user) {
    const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
    const initiale = (user.prenom || user.nom || '?')[0].toUpperCase();
    const avatar = user.photo_url ? `<img src="${user.photo_url}" alt="">` : initiale;

    // Sidebar
    document.getElementById('adSidebarAvatar').innerHTML = avatar;
    document.getElementById('adSidebarName').textContent = fullName;
    document.getElementById('adSidebarNum').textContent = `N° ${user.numero_adherent || '—'}`;
    document.getElementById('adSidebarStatusText').textContent = capitalise(user.statut || 'actif');

    // Header
    document.getElementById('adHeaderAvatar').innerHTML = avatar;
    document.getElementById('adHeaderName').textContent = user.prenom || fullName;

    // Accueil
    const heure = new Date().getHours();
    const greet = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
    document.getElementById('adGreeting').textContent = `${greet} 👋`;
    document.getElementById('adWelcomeName').textContent = fullName;
    document.getElementById('adWelcomeNum').textContent = user.numero_adherent || '—';
    document.getElementById('adWelcomeSince').textContent = formatDate(user.created_at);

    // Profil
    document.getElementById('profilAvatarBig').innerHTML = avatar;
    document.getElementById('profilIdName').textContent = fullName;
    document.getElementById('profilIdNum').textContent = `N° ${user.numero_adherent || '—'}`;
    document.getElementById('profilIdSince').textContent = formatDate(user.created_at);
    document.getElementById('profilIdBadge').textContent = capitalise(user.statut || 'Actif');

    // Formulaire profil
    document.getElementById('profilPrenom').value = user.prenom || '';
    document.getElementById('profilNom').value = user.nom || '';
    document.getElementById('profilEmail').value = user.email || '';
    document.getElementById('profilTel').value = user.telephone || '';
    document.getElementById('profilDob').value = user.date_naissance || '';
    document.getElementById('profilAdresse').value = user.adresse || '';
}

// ============================================================
// NAVIGATION
// ============================================================
function bindNav() {
    document.querySelectorAll('.ad-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
        });
    });
}

const sectionTitles = {
    accueil:       'Mon tableau de bord',
    cotisations:   'Mes Cotisations',
    prets:         'Mes Prêts',
    sinistres:     'Mes Sinistres',
    ayants:        'Mes Ayants Droit',
    notifications: 'Mes Notifications',
    documents:     'Mes Documents',
    profil:        'Mon Profil',
};

function showSection(name) {
    // Sections
    document.querySelectorAll('.ad-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${name}`);
    if (target) target.classList.add('active');

    // Nav actif
    document.querySelectorAll('.ad-nav-item').forEach(i => {
        i.classList.toggle('active', i.dataset.section === name);
    });

    // Titre + breadcrumb
    const title = sectionTitles[name] || name;
    document.getElementById('adPageTitle').textContent = title;
    document.getElementById('adBreadcrumb').textContent = title;

    // Fermer sidebar mobile
    document.getElementById('adSidebar').classList.remove('open');

    // Charger les données de la section
    loadSectionData(name);
}

function loadSectionData(section) {
    switch (section) {
        case 'accueil':      loadDashboardData(); break;
        case 'cotisations':  loadCotisations(); break;
        case 'prets':        loadPrets(); break;
        case 'sinistres':    loadSinistres(); break;
        case 'ayants':       loadAyants(); break;
        case 'notifications':loadNotifications(); break;
        case 'documents':    loadDocuments(); break;
        case 'profil':       /* déjà chargé */ break;
    }
}

// ============================================================
// SIDEBAR MOBILE
// ============================================================
function bindSidebarToggle() {
    document.getElementById('adMenuToggle').addEventListener('click', () => {
        document.getElementById('adSidebar').classList.toggle('open');
    });
}

// ============================================================
// NOTIFICATIONS BADGE
// ============================================================
async function loadNotificationsBadge() {
    try {
        const data = await apiGet('/adherent/notifications');
        allNotifications = data.data || data || [];
        const unread = allNotifications.filter(n => !n.lue).length;
        const badgeNotif = document.getElementById('badgeNotif');
        const adNotifDot = document.getElementById('adNotifDot');
        if (unread > 0) {
            badgeNotif.textContent = unread;
            badgeNotif.style.display = '';
            adNotifDot.style.display = '';
            renderNotifPanelList(allNotifications.slice(0, 5));
        } else {
            badgeNotif.style.display = 'none';
            adNotifDot.style.display = 'none';
        }
    } catch (_) {}
}

function bindNotifBtn() {
    document.getElementById('adNotifBtn').addEventListener('click', toggleNotifPanel);
}
function toggleNotifPanel() {
    document.getElementById('adNotifPanel').classList.toggle('open');
}

function renderNotifPanelList(notifs) {
    const list = document.getElementById('adNotifPanelList');
    if (!notifs.length) {
        list.innerHTML = '<div class="ad-notif-empty">Aucune notification</div>';
        return;
    }
    list.innerHTML = notifs.map(n => `
        <div class="ad-notif-item ${n.lue ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
            <div class="ad-notif-icon-wrap ${n.type || 'alerte'}">
                <i class="fas ${notifIcon(n.type)}"></i>
            </div>
            <div class="ad-notif-body">
                <div class="ad-notif-title">${escHtml(n.titre || 'Notification')}</div>
                <div class="ad-notif-msg">${escHtml(n.message || '')}</div>
            </div>
            <div class="ad-notif-time">${timeAgo(n.created_at)}</div>
        </div>
    `).join('');
}

function notifIcon(type) {
    const icons = { cotis: 'fa-file-invoice-dollar', pret: 'fa-hand-holding-dollar', sinistre: 'fa-shield-halved', alerte: 'fa-bell' };
    return icons[type] || 'fa-bell';
}

// ============================================================
// DASHBOARD — chargement général
// ============================================================
async function loadDashboardData() {
    try {
        const [cotisData, pretsData, sinistresData, statsData] = await Promise.all([
            apiGet('/adherent/cotisations'),
            apiGet('/adherent/prets'),
            apiGet('/adherent/sinistres'),
            apiGet('/adherent/stats').catch(() => null),
        ]);

        const cotisations = cotisData.data || cotisData || [];
        const prets       = pretsData.data || pretsData || [];
        const sinistres   = sinistresData.data || sinistresData || [];

        renderKPIs(cotisations, prets, sinistres);
        renderEcheances(cotisations, prets);
        renderAccueilChart(cotisations);
        renderAccueilTimeline(cotisations, prets, sinistres);
        checkRetards(cotisations);

    } catch (err) {
        showToast('Erreur lors du chargement du tableau de bord.', 'error');
    }
}

// ============================================================
// KPIs
// ============================================================
function renderKPIs(cotisations, prets, sinistres) {
    // Total cotisé
    const totalPaye = cotisations.filter(c => c.statut === 'payée').reduce((s, c) => s + parseFloat(c.montant || 0), 0);
    document.getElementById('kpiCotisTotalVal').textContent = formatFCFA(totalPaye);

    // Prochaine cotisation
    const enAttente = cotisations.filter(c => c.statut === 'en attente').sort((a, b) => new Date(a.date_echeance) - new Date(b.date_echeance));
    if (enAttente.length) {
        const prochain = enAttente[0];
        document.getElementById('kpiProchaineCotisVal').textContent = formatFCFA(prochain.montant);
        document.getElementById('kpiProchaineCotisSub').textContent = `Échéance : ${formatDate(prochain.date_echeance)}`;
    } else {
        document.getElementById('kpiProchaineCotisVal').textContent = 'Aucune';
        document.getElementById('kpiProchaineCotisSub').textContent = 'Tout est à jour';
    }

    // Prêt en cours
    const pretActif = prets.find(p => p.statut === 'approuvé');
    if (pretActif) {
        const rembourse = parseFloat(pretActif.montant_rembourse || 0);
        const restant = parseFloat(pretActif.montant) - rembourse;
        document.getElementById('kpiPretVal').textContent = formatFCFA(restant);
        document.getElementById('kpiPretSub').textContent = 'Restant à rembourser';
    } else {
        document.getElementById('kpiPretVal').textContent = 'Aucun';
        document.getElementById('kpiPretSub').textContent = 'Pas de prêt en cours';
    }

    // Sinistres
    document.getElementById('kpiSinistresVal').textContent = sinistres.length;
    const enCours = sinistres.filter(s => ['déclaré','en cours'].includes(s.statut)).length;
    document.getElementById('kpiSinistresSub').textContent = enCours > 0 ? `${enCours} en cours` : 'Aucun en cours';
}

// ============================================================
// ALERTES RETARDS
// ============================================================
function checkRetards(cotisations) {
    const retards = cotisations.filter(c => c.statut === 'en retard');
    const banner = document.getElementById('adRetardBanner');
    const headerAlert = document.getElementById('adHeaderAlert');
    if (retards.length) {
        banner.style.display = 'flex';
        document.getElementById('adRetardText').textContent = ` Vous avez ${retards.length} cotisation(s) en retard.`;
        headerAlert.style.display = 'flex';
        document.getElementById('adHeaderAlertText').textContent = `${retards.length} cotisation(s) en retard`;
    }
}

// ============================================================
// PROCHAINES ÉCHÉANCES
// ============================================================
function renderEcheances(cotisations, prets) {
    const items = [];
    const today = new Date();

    cotisations.filter(c => c.statut !== 'payée').forEach(c => {
        items.push({
            date: new Date(c.date_echeance),
            label: 'Cotisation',
            sub: 'Mensualité',
            amount: c.montant,
            type: c.statut === 'en retard' ? 'danger' : 'warning'
        });
    });

    items.sort((a, b) => a.date - b.date);

    const container = document.getElementById('adEcheancesList');
    if (!items.length) {
        container.innerHTML = '<div class="ad-loading">Aucune échéance à venir 🎉</div>';
        return;
    }

    const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    container.innerHTML = items.slice(0, 4).map(item => `
        <div class="ad-echeance-item">
            <div class="ad-ech-date" style="${item.type === 'danger' ? 'background:var(--danger)' : ''}">
                <div class="ad-ech-day">${item.date.getDate()}</div>
                <div class="ad-ech-month">${months[item.date.getMonth()]}</div>
            </div>
            <div class="ad-ech-info">
                <div class="ad-ech-label">${item.label}</div>
                <div class="ad-ech-sub">${item.sub}</div>
            </div>
            <div class="ad-ech-amount">${formatFCFA(item.amount)}</div>
            <span class="ad-ech-badge ${item.type}">${item.type === 'danger' ? 'En retard' : 'À payer'}</span>
        </div>
    `).join('');
}

// ============================================================
// TIMELINE ACCUEIL
// ============================================================
function renderAccueilTimeline(cotisations, prets, sinistres) {
    const events = [];

    cotisations.filter(c => c.statut === 'payée').slice(0, 3).forEach(c => {
        events.push({ date: c.updated_at || c.created_at, text: `Cotisation payée — ${formatFCFA(c.montant)}`, color: 'green' });
    });

    prets.forEach(p => {
        events.push({ date: p.created_at, text: `Prêt ${p.statut} — ${formatFCFA(p.montant)}`, color: p.statut === 'approuvé' ? 'green' : 'orange' });
    });

    sinistres.slice(0, 2).forEach(s => {
        events.push({ date: s.created_at, text: `Sinistre déclaré — ${s.type || ''}`, color: 'blue' });
    });

    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('accueilTimeline');
    if (!events.length) {
        container.innerHTML = '<div style="color:var(--brown-light);font-size:12px;text-align:center;padding:20px">Aucune activité récente</div>';
        return;
    }
    container.innerHTML = events.slice(0, 5).map(e => `
        <div class="ad-tl-item">
            <div class="ad-tl-dot ${e.color}"></div>
            <div class="ad-tl-text">${escHtml(e.text)}</div>
            <div class="ad-tl-time">${timeAgo(e.date)}</div>
        </div>
    `).join('');
}

// ============================================================
// GRAPHIQUE ACCUEIL (cotisations 6 mois)
// ============================================================
function renderAccueilChart(cotisationsParam) {
    const period = parseInt(document.getElementById('accueilChartPeriod')?.value || 6);
    const cotis = cotisationsParam || allCotisations;
    const { labels, values } = buildCotisChartData(cotis, period);

    const ctx = document.getElementById('accueilChart');
    if (!ctx) return;

    if (CHART_ACCUEIL) CHART_ACCUEIL.destroy();
    CHART_ACCUEIL = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Cotisations payées (FCFA)',
                data: values,
                borderColor: '#C4601A',
                backgroundColor: 'rgba(196,96,26,.1)',
                borderWidth: 2.5,
                fill: true,
                tension: .4,
                pointBackgroundColor: '#C4601A',
                pointRadius: 4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `${formatFCFA(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: v => formatFCFAShort(v),
                        font: { family: 'DM Sans', size: 11 }
                    },
                    grid: { color: 'rgba(0,0,0,.04)' }
                },
                x: {
                    ticks: { font: { family: 'DM Sans', size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

function buildCotisChartData(cotisations, months) {
    const labels = [];
    const values = [];
    const now = new Date();
    const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(monthNames[d.getMonth()]);
        const total = cotisations
            .filter(c => {
                if (c.statut !== 'payée') return false;
                const cd = new Date(c.date_echeance);
                return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
            })
            .reduce((s, c) => s + parseFloat(c.montant || 0), 0);
        values.push(total);
    }
    return { labels, values };
}

// ============================================================
// SECTION : COTISATIONS
// ============================================================
async function loadCotisations() {
    try {
        const data = await apiGet('/adherent/cotisations');
        allCotisations = data.data || data || [];
        renderCotisationsTable(allCotisations);
        renderCotisSummary(allCotisations);
        renderCotisHistoChart(allCotisations);
        checkCotisBadge(allCotisations);
    } catch (err) {
        document.getElementById('cotisBody').innerHTML = '<tr><td colspan="6" class="ad-loading-row">Erreur de chargement.</td></tr>';
    }
}

function renderCotisationsTable(cotisations) {
    const tbody = document.getElementById('cotisBody');
    if (!cotisations.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="ad-loading-row">Aucune cotisation trouvée.</td></tr>';
        return;
    }
    tbody.innerHTML = cotisations.map(c => `
        <tr>
            <td>${c.periode || formatDate(c.date_echeance, 'MMMM YYYY')}</td>
            <td><strong>${formatFCFA(c.montant)}</strong></td>
            <td>${formatDate(c.date_echeance)}</td>
            <td>${c.date_paiement ? formatDate(c.date_paiement) : '<span style="color:var(--brown-light)">—</span>'}</td>
            <td>${badgeStatut(c.statut)}</td>
            <td>
                ${c.statut !== 'payée' ? `<button class="ad-btn ad-btn-primary ad-btn-sm" onclick="openPayerModal(${c.id}, '${escHtml(String(c.montant))}', '${escHtml(c.date_echeance || '')}')">
                    <i class="fas fa-credit-card"></i> Payer
                </button>` : `<span style="color:var(--success);font-size:12px"><i class="fas fa-check-circle"></i> Payée</span>`}
            </td>
        </tr>
    `).join('');
}

function renderCotisSummary(cotisations) {
    const paye    = cotisations.filter(c => c.statut === 'payée').reduce((s,c) => s+parseFloat(c.montant||0), 0);
    const attente = cotisations.filter(c => c.statut === 'en attente').reduce((s,c) => s+parseFloat(c.montant||0), 0);
    const retard  = cotisations.filter(c => c.statut === 'en retard').reduce((s,c) => s+parseFloat(c.montant||0), 0);
    document.getElementById('cotisTotalPaye').textContent   = formatFCFA(paye);
    document.getElementById('cotisTotalAttente').textContent= formatFCFA(attente);
    document.getElementById('cotisTotalRetard').textContent = formatFCFA(retard);
    document.getElementById('cotisTotal').textContent       = cotisations.length;
}

function renderCotisHistoChart(cotisations) {
    const { labels, values } = buildCotisChartData(cotisations, 12);
    const ctx = document.getElementById('cotisHistoChart');
    if (!ctx) return;
    if (CHART_COTIS_HISTO) CHART_COTIS_HISTO.destroy();
    CHART_COTIS_HISTO = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Cotisations payées (FCFA)',
                data: values,
                backgroundColor: 'rgba(196,96,26,.7)',
                borderColor: '#C4601A',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => formatFCFA(c.parsed.y) } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => formatFCFAShort(v) } },
                x: { grid: { display: false } }
            }
        }
    });
}

function checkCotisBadge(cotisations) {
    const retards = cotisations.filter(c => c.statut === 'en retard').length;
    const badge = document.getElementById('badgeCotis');
    if (retards > 0) { badge.textContent = retards; badge.style.display = ''; }
    else badge.style.display = 'none';
}

function filterCotisations() {
    const val = document.getElementById('cotisFilter').value.toLowerCase();
    const filtered = val ? allCotisations.filter(c => c.statut.toLowerCase() === val) : allCotisations;
    renderCotisationsTable(filtered);
}

function exportCotisPDF() {
    showToast('Génération du relevé PDF en cours…', 'info');
    apiGet('/adherent/documents/releve-pdf')
        .then(res => { if (res.url) window.open(res.url, '_blank'); })
        .catch(() => showToast('Export PDF non disponible pour le moment.', 'warning'));
}

// ============================================================
// MODAL : PAYER COTISATION
// ============================================================
function openPayerModal(id, montant, echeance) {
    currentPayCotisId = id;
    document.getElementById('payerMontant').textContent = formatFCFA(montant);
    document.getElementById('payerEcheance').textContent = formatDate(echeance);
    openModal('modalPayer');
}

async function confirmPaiement() {
    const mode = document.getElementById('payerMode').value;
    try {
        await apiPut(`/adherent/cotisations/${currentPayCotisId}/payer`, { mode_paiement: mode, date_paiement: new Date().toISOString().split('T')[0] });
        showToast('Paiement enregistré avec succès !', 'success');
        closeModal('modalPayer');
        loadCotisations();
        loadDashboardData();
    } catch (err) {
        showToast('Erreur lors de l\'enregistrement du paiement.', 'error');
    }
}

// ============================================================
// SECTION : PRÊTS
// ============================================================
async function loadPrets() {
    try {
        const data = await apiGet('/adherent/prets');
        const prets = data.data || data || [];
        renderPretsTable(prets);

        const pretActif = prets.find(p => p.statut === 'approuvé');
        if (pretActif) {
            currentPretActif = pretActif;
            document.getElementById('pretActifCard').style.display = '';
            document.getElementById('docAmortCard').style.display  = '';
            renderPretActif(pretActif);
            document.getElementById('btnDemanderPret').style.display = 'none';
        } else {
            document.getElementById('pretActifCard').style.display = 'none';
            document.getElementById('btnDemanderPret').style.display = '';
        }
    } catch (err) {
        document.getElementById('pretsBody').innerHTML = '<tr><td colspan="6" class="ad-loading-row">Erreur de chargement.</td></tr>';
    }
}

function renderPretActif(pret) {
    const montant   = parseFloat(pret.montant || 0);
    const rembourse = parseFloat(pret.montant_rembourse || 0);
    const restant   = montant - rembourse;
    const pct       = montant > 0 ? Math.round((rembourse / montant) * 100) : 0;

    document.getElementById('pretActifMontant').textContent   = formatFCFA(montant);
    document.getElementById('pretActifTaux').textContent      = `${pret.taux_interet || 0} %`;
    document.getElementById('pretActifMensualite').textContent= formatFCFA(pret.mensualite || 0);
    document.getElementById('pretActifDuree').textContent     = `${pret.duree_mois || 0} mois`;
    document.getElementById('pretProgressPaye').textContent   = formatFCFA(rembourse);
    document.getElementById('pretProgressRestant').textContent= formatFCFA(restant);
    document.getElementById('pretProgressPct').textContent    = `${pct}%`;

    setTimeout(() => {
        document.getElementById('pretProgressFill').style.width = `${pct}%`;
    }, 300);
}

function renderPretsTable(prets) {
    const tbody = document.getElementById('pretsBody');
    if (!prets.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="ad-loading-row">Aucun prêt trouvé.</td></tr>';
        return;
    }
    tbody.innerHTML = prets.map(p => `
        <tr>
            <td>${formatDate(p.date_debut || p.created_at)}</td>
            <td><strong>${formatFCFA(p.montant)}</strong></td>
            <td>${p.duree_mois || '—'} mois</td>
            <td>${formatFCFA(p.mensualite || 0)}</td>
            <td>${badgeStatut(p.statut)}</td>
            <td>
                <button class="ad-btn ad-btn-icon" title="Détail" onclick="viewPretDetail(${p.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function toggleAmortissement() {
    if (!currentPretActif) return;
    const wrap = document.getElementById('amortissementWrap');
    const btn  = document.getElementById('amortToggleText');
    amortissementVisible = !amortissementVisible;
    wrap.style.display = amortissementVisible ? '' : 'none';
    btn.textContent = amortissementVisible ? 'Masquer le tableau' : 'Voir le tableau d\'amortissement';
    if (amortissementVisible) loadAmortissement(currentPretActif.id);
}

async function loadAmortissement(pretId) {
    const tbody = document.getElementById('amortBody');
    tbody.innerHTML = '<tr><td colspan="7" class="ad-loading-row"><i class="fas fa-spinner fa-spin"></i></td></tr>';
    try {
        const data = await apiGet(`/adherent/prets/${pretId}/amortissement`);
        const lignes = data.data || data || [];
        if (!lignes.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="ad-loading-row">Aucune donnée d\'amortissement.</td></tr>';
            return;
        }
        tbody.innerHTML = lignes.map(l => `
            <tr style="${l.statut === 'payé' ? 'opacity:.6' : ''}">
                <td>${l.numero}</td>
                <td>${formatDate(l.date_echeance)}</td>
                <td>${formatFCFA(l.mensualite)}</td>
                <td>${formatFCFA(l.capital)}</td>
                <td>${formatFCFA(l.interets)}</td>
                <td>${formatFCFA(l.capital_restant)}</td>
                <td>${badgeStatut(l.statut || 'en attente')}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="ad-loading-row">Erreur de chargement.</td></tr>';
    }
}

function exportAmortPDF() {
    if (!currentPretActif) { showToast('Aucun prêt actif.', 'warning'); return; }
    showToast('Génération du tableau d\'amortissement…', 'info');
    apiGet(`/adherent/prets/${currentPretActif.id}/amortissement-pdf`)
        .then(res => { if (res.url) window.open(res.url, '_blank'); })
        .catch(() => showToast('Export non disponible pour le moment.', 'warning'));
}

// ─── Simulation prêt
function bindPretCalc() {
    ['pretModalMontant','pretModalDuree','pretModalTaux'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calcMensualite);
    });
}

function calcMensualite() {
    const montant = parseFloat(document.getElementById('pretModalMontant')?.value || 0);
    const duree   = parseInt(document.getElementById('pretModalDuree')?.value || 0);
    const taux    = parseFloat(document.getElementById('pretModalTaux')?.value || 0);
    const sim     = document.getElementById('pretSim');
    if (!montant || !duree) { if (sim) sim.style.display = 'none'; return; }
    const r = taux / 100 / 12;
    let mensualite;
    if (r === 0) { mensualite = montant / duree; }
    else { mensualite = montant * r * Math.pow(1+r, duree) / (Math.pow(1+r, duree) - 1); }
    const total    = mensualite * duree;
    const interets = total - montant;
    if (sim) {
        sim.style.display = '';
        document.getElementById('simMensualite').textContent = formatFCFA(mensualite);
        document.getElementById('simTotal').textContent      = formatFCFA(total);
        document.getElementById('simInterets').textContent   = formatFCFA(interets);
    }
}

function openDemanderPretModal() { openModal('modalDemanderPret'); }

async function submitPretDemande() {
    const montant = document.getElementById('pretModalMontant').value;
    const duree   = document.getElementById('pretModalDuree').value;
    const taux    = document.getElementById('pretModalTaux').value;
    const motif   = document.getElementById('pretModalMotif').value;
    if (!montant || !duree) { showModalError('pretModalError', 'Veuillez remplir le montant et la durée.'); return; }
    try {
        await apiPost('/adherent/prets', { montant, duree_mois: duree, taux_interet: taux, motif, date_debut: new Date().toISOString().split('T')[0] });
        showToast('Votre demande de prêt a été soumise !', 'success');
        closeModal('modalDemanderPret');
        loadPrets();
    } catch (err) {
        showModalError('pretModalError', 'Erreur lors de la soumission de la demande.');
    }
}

// ============================================================
// SECTION : SINISTRES
// ============================================================
async function loadSinistres() {
    try {
        const data = await apiGet('/adherent/sinistres');
        const sinistres = data.data || data || [];
        renderSinistreCards(sinistres);
    } catch (err) {
        document.getElementById('sinistresList').innerHTML = '<div class="ad-loading">Erreur de chargement.</div>';
    }
}

const statutsTimeline = ['déclaré','en cours','approuvé','remboursé'];

function renderSinistreCards(sinistres) {
    const container = document.getElementById('sinistresList');
    if (!sinistres.length) {
        container.innerHTML = '<div class="ad-loading">Aucun sinistre déclaré.</div>';
        return;
    }
    container.innerHTML = sinistres.map(s => {
        const currentStep = statutsTimeline.indexOf(s.statut?.toLowerCase());
        const timeline = statutsTimeline.map((st, i) => {
            const cls = i < currentStep ? 'done' : i === currentStep ? 'current' : '';
            const icon = i < currentStep ? 'fa-check' : i === currentStep ? 'fa-circle-dot' : 'fa-circle';
            return `<div class="ad-stl-step ${cls}">
                <div class="ad-stl-dot"><i class="fas ${icon}"></i></div>
                <div class="ad-stl-label">${capitalise(st)}</div>
            </div>`;
        }).join('');
        return `
            <div class="ad-sinistre-card">
                <div class="ad-sinistre-card-head">
                    <div>
                        <span class="ad-sinistre-type-badge"><i class="fas fa-shield-halved"></i> ${capitalise(s.type || '—')}</span>
                        <div class="ad-sinistre-desc" style="margin-top:8px">${escHtml(s.description || '')}</div>
                    </div>
                    <div class="ad-sinistre-date"><i class="fas fa-calendar-alt"></i> ${formatDate(s.date_sinistre || s.created_at)}</div>
                </div>
                <div class="ad-sinistre-timeline">${timeline}</div>
                <div class="ad-sinistre-card-foot">
                    ${s.document_url ? `<a href="${s.document_url}" target="_blank" class="ad-btn ad-btn-outline ad-btn-sm"><i class="fas fa-paperclip"></i> Justificatif</a>` : '<span></span>'}
                    <button class="ad-btn ad-btn-outline ad-btn-sm" onclick="viewSinistreDetail(${s.id})">
                        <i class="fas fa-eye"></i> Détails
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openSinistreModal() { openModal('modalSinistre'); }

async function submitSinistre() {
    const type  = document.getElementById('sinistreType').value;
    const date  = document.getElementById('sinistreDate').value;
    const desc  = document.getElementById('sinistreDesc').value;
    const file  = document.getElementById('sinistreFile').files[0];
    if (!date || !desc) { showModalError('sinistreModalError', 'Veuillez remplir tous les champs obligatoires.'); return; }

    try {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('date_sinistre', date);
        formData.append('description', desc);
        if (file) formData.append('document', file);
        await apiPostForm('/adherent/sinistres', formData);
        showToast('Sinistre déclaré avec succès !', 'success');
        closeModal('modalSinistre');
        loadSinistres();
    } catch (err) {
        showModalError('sinistreModalError', 'Erreur lors de la déclaration.');
    }
}

async function viewSinistreDetail(id) {
    openModal('modalSinistreDetail');
    const body = document.getElementById('sinistreDetailBody');
    body.innerHTML = '<div class="ad-loading"><i class="fas fa-spinner fa-spin"></i></div>';
    try {
        const s = await apiGet(`/adherent/sinistres/${id}`);
        body.innerHTML = `
            <div class="ad-form-group"><label>Type</label><p>${capitalise(s.type || '—')}</p></div>
            <div class="ad-form-group"><label>Date</label><p>${formatDate(s.date_sinistre)}</p></div>
            <div class="ad-form-group"><label>Description</label><p>${escHtml(s.description || '—')}</p></div>
            <div class="ad-form-group"><label>Statut</label><p>${badgeStatut(s.statut)}</p></div>
            ${s.commentaire_admin ? `<div class="ad-form-group"><label>Commentaire de la mutuelle</label><p>${escHtml(s.commentaire_admin)}</p></div>` : ''}
        `;
    } catch (err) {
        body.innerHTML = '<div class="ad-loading">Erreur de chargement.</div>';
    }
}

// ─── Drag & drop fichier
function bindDragDrop() {
    const zone = document.getElementById('sinistreFileZone');
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--terra)'; });
    zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.style.borderColor = '';
        const files = e.dataTransfer.files;
        if (files.length) {
            document.getElementById('sinistreFile').files = files;
            updateFileLabel({ files });
        }
    });
}
function updateFileLabel(input) {
    const file = input.files?.[0];
    const zone = document.getElementById('sinistreFileZone');
    if (file) {
        document.getElementById('sinistreFileLabel').textContent = file.name;
        zone.classList.add('has-file');
    }
}

// ============================================================
// SECTION : AYANTS DROIT
// ============================================================
async function loadAyants() {
    try {
        const data = await apiGet('/adherent/ayants-droit');
        const ayants = data.data || data || [];
        renderAyantsGrid(ayants);
    } catch (err) {
        document.getElementById('ayantsGrid').innerHTML = '<div class="ad-loading">Erreur de chargement.</div>';
    }
}

function renderAyantsGrid(ayants) {
    const grid = document.getElementById('ayantsGrid');
    if (!ayants.length) {
        grid.innerHTML = '<div class="ad-loading">Aucun ayant droit enregistré.</div>';
        return;
    }
    grid.innerHTML = ayants.map(a => {
        const initiale = (a.prenom || a.nom || '?')[0].toUpperCase();
        return `
            <div class="ad-ayant-card">
                <div class="ad-ayant-avatar">${initiale}</div>
                <div class="ad-ayant-name">${escHtml(`${a.prenom} ${a.nom}`)}</div>
                <span class="ad-ayant-lien">${capitalise(a.lien_parente || '—')}</span>
                <div class="ad-ayant-dob"><i class="fas fa-birthday-cake" style="color:var(--gold);margin-right:4px"></i>${formatDate(a.date_naissance) || '—'}</div>
                <div class="ad-ayant-actions">
                    <button class="ad-btn ad-btn-icon" title="Modifier" onclick="openEditAyantModal(${JSON.stringify(a).replace(/"/g, '&quot;')})">
                        <i class="fas fa-pencil"></i>
                    </button>
                    <button class="ad-btn ad-btn-icon ad-btn-danger" title="Supprimer" onclick="deleteAyant(${a.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openAyantModal() {
    currentEditAyantId = null;
    document.getElementById('ayantModalTitle').textContent = 'Nouvel Ayant Droit';
    document.getElementById('ayantPrenom').value = '';
    document.getElementById('ayantNom').value = '';
    document.getElementById('ayantLien').value = 'conjoint';
    document.getElementById('ayantDob').value = '';
    document.getElementById('ayantEditId').value = '';
    openModal('modalAyant');
}

function openEditAyantModal(ayant) {
    currentEditAyantId = ayant.id;
    document.getElementById('ayantModalTitle').textContent = 'Modifier l\'Ayant Droit';
    document.getElementById('ayantPrenom').value = ayant.prenom || '';
    document.getElementById('ayantNom').value    = ayant.nom || '';
    document.getElementById('ayantLien').value   = ayant.lien_parente || 'autre';
    document.getElementById('ayantDob').value    = ayant.date_naissance || '';
    document.getElementById('ayantEditId').value = ayant.id;
    openModal('modalAyant');
}

async function submitAyant() {
    const payload = {
        prenom:         document.getElementById('ayantPrenom').value,
        nom:            document.getElementById('ayantNom').value,
        lien_parente:   document.getElementById('ayantLien').value,
        date_naissance: document.getElementById('ayantDob').value,
    };
    if (!payload.prenom || !payload.nom) {
        showModalError('ayantModalError', 'Veuillez renseigner le prénom et le nom.');
        return;
    }
    try {
        if (currentEditAyantId) {
            await apiPut(`/adherent/ayants-droit/${currentEditAyantId}`, payload);
            showToast('Ayant droit modifié !', 'success');
        } else {
            await apiPost('/adherent/ayants-droit', payload);
            showToast('Ayant droit ajouté !', 'success');
        }
        closeModal('modalAyant');
        loadAyants();
    } catch (err) {
        showModalError('ayantModalError', 'Erreur lors de l\'enregistrement.');
    }
}

async function deleteAyant(id) {
    if (!confirm('Supprimer cet ayant droit ?')) return;
    try {
        await apiDelete(`/adherent/ayants-droit/${id}`);
        showToast('Ayant droit supprimé.', 'success');
        loadAyants();
    } catch (err) {
        showToast('Erreur lors de la suppression.', 'error');
    }
}

// ============================================================
// SECTION : NOTIFICATIONS
// ============================================================
async function loadNotifications() {
    try {
        const data = await apiGet('/adherent/notifications');
        allNotifications = data.data || data || [];
        renderNotifFullList(allNotifications);
    } catch (err) {
        document.getElementById('notifFullList').innerHTML = '<div class="ad-loading">Erreur de chargement.</div>';
    }
}

function renderNotifFullList(notifs) {
    const container = document.getElementById('notifFullList');
    if (!notifs.length) {
        container.innerHTML = '<div class="ad-loading">Aucune notification.</div>';
        return;
    }
    container.innerHTML = notifs.map(n => `
        <div class="ad-notif-item ${n.lue ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
            <div class="ad-notif-icon-wrap ${n.type || 'alerte'}">
                <i class="fas ${notifIcon(n.type)}"></i>
            </div>
            <div class="ad-notif-body">
                <div class="ad-notif-title">${escHtml(n.titre || 'Notification')}</div>
                <div class="ad-notif-msg">${escHtml(n.message || '')}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                <div class="ad-notif-time">${timeAgo(n.created_at)}</div>
                ${!n.lue ? '<div class="ad-notif-unread-dot"></div>' : ''}
            </div>
        </div>
    `).join('');
}

async function markNotifRead(id) {
    try {
        await apiPatch(`/adherent/notifications/${id}/lue`);
        loadNotifications();
        loadNotificationsBadge();
    } catch (_) {}
}

async function markAllRead() {
    try {
        await apiPost('/adherent/notifications/mark-all-read', {});
        showToast('Toutes les notifications sont marquées comme lues.', 'success');
        loadNotifications();
        loadNotificationsBadge();
    } catch (_) {}
}

// ============================================================
// SECTION : DOCUMENTS
// ============================================================
function loadDocuments() {
    if (currentPretActif) {
        document.getElementById('docAmortCard').style.display = '';
    }
    loadDocsTable();
}

async function loadDocsTable() {
    try {
        const data = await apiGet('/adherent/documents');
        const docs = data.data || data || [];
        const tbody = document.getElementById('docsBody');
        if (!docs.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="ad-loading-row">Aucun document déposé.</td></tr>';
            return;
        }
        tbody.innerHTML = docs.map(d => `
            <tr>
                <td>${escHtml(d.sinistre_type || '—')}</td>
                <td><i class="fas fa-file-alt" style="color:var(--terra);margin-right:5px"></i>${escHtml(d.nom_fichier || 'Document')}</td>
                <td>${formatDate(d.created_at)}</td>
                <td>
                    <a href="${d.url}" target="_blank" class="ad-btn ad-btn-outline ad-btn-sm">
                        <i class="fas fa-download"></i> Télécharger
                    </a>
                </td>
            </tr>
        `).join('');
    } catch (_) {}
}

function downloadAttestation() {
    showToast('Génération de l\'attestation en cours…', 'info');
    apiGet('/adherent/documents/attestation')
        .then(res => { if (res.url) window.open(res.url, '_blank'); })
        .catch(() => showToast('Génération non disponible pour le moment.', 'warning'));
}

function downloadReleve() {
    showToast('Génération du relevé en cours…', 'info');
    apiGet('/adherent/documents/releve-pdf')
        .then(res => { if (res.url) window.open(res.url, '_blank'); })
        .catch(() => showToast('Génération non disponible pour le moment.', 'warning'));
}

// ============================================================
// SECTION : PROFIL
// ============================================================
async function saveProfile() {
    const payload = {
        prenom:         document.getElementById('profilPrenom').value,
        nom:            document.getElementById('profilNom').value,
        email:          document.getElementById('profilEmail').value,
        telephone:      document.getElementById('profilTel').value,
        date_naissance: document.getElementById('profilDob').value,
        adresse:        document.getElementById('profilAdresse').value,
    };
    try {
        const data = await apiPut('/adherent/profil', payload);
        CURRENT_USER = { ...CURRENT_USER, ...payload };
        renderUserInfo(CURRENT_USER);
        showSuccessMsg('profilSuccessMsg', 'Profil mis à jour avec succès !');
    } catch (err) {
        showErrorMsg('profilErrorMsg', 'Erreur lors de la mise à jour du profil.');
    }
}

async function changePassword() {
    const oldPw  = document.getElementById('oldPw').value;
    const newPw  = document.getElementById('newPw').value;
    const confPw = document.getElementById('confirmPw').value;
    if (!oldPw || !newPw || !confPw) { showErrorMsg('pwErrorMsg', 'Tous les champs sont requis.'); return; }
    if (newPw !== confPw) { showErrorMsg('pwErrorMsg', 'Les mots de passe ne correspondent pas.'); return; }
    if (newPw.length < 8) { showErrorMsg('pwErrorMsg', 'Le mot de passe doit contenir au moins 8 caractères.'); return; }
    try {
        await apiPost('/adherent/change-password', { current_password: oldPw, new_password: newPw, new_password_confirmation: confPw });
        showSuccessMsg('pwSuccessMsg', 'Mot de passe modifié avec succès !');
        document.getElementById('oldPw').value = '';
        document.getElementById('newPw').value  = '';
        document.getElementById('confirmPw').value = '';
    } catch (err) {
        showErrorMsg('pwErrorMsg', 'Erreur : mot de passe actuel incorrect.');
    }
}

function updateAvatar(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const src = e.target.result;
        document.getElementById('adSidebarAvatar').innerHTML  = `<img src="${src}" alt="">`;
        document.getElementById('adHeaderAvatar').innerHTML   = `<img src="${src}" alt="">`;
        document.getElementById('profilAvatarBig').innerHTML  = `<img src="${src}" alt="">`;
    };
    reader.readAsDataURL(file);
    showToast('Photo mise à jour localement. Synchronisation en cours…', 'info');
    const formData = new FormData();
    formData.append('photo', file);
    apiPostForm('/adherent/profil/photo', formData).catch(() => {});
}

function togglePw(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// ============================================================
// LOGOUT
// ============================================================
function bindLogout() {
    document.getElementById('adLogoutBtn').addEventListener('click', () => {
        if (confirm('Voulez-vous vous déconnecter ?')) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = 'login.html';
        }
    });
}

// ============================================================
// MODALS
// ============================================================
function openModal(id) {
    document.getElementById(id).classList.add('open');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    // Réinitialiser erreurs
    const err = document.querySelector(`#${id} .ad-modal-error`);
    if (err) err.style.display = 'none';
}
// Fermer au clic extérieur
document.addEventListener('click', e => {
    if (e.target.classList.contains('ad-modal-overlay')) {
        e.target.classList.remove('open');
    }
});

function showModalError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = '';
}

// ============================================================
// MESSAGES INLINE
// ============================================================
function showSuccessMsg(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg; el.style.display = '';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}
function showErrorMsg(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg; el.style.display = '';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// ============================================================
// TOASTS
// ============================================================
function showToast(msg, type = 'info') {
    const container = document.getElementById('adToastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `ad-toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${escHtml(msg)}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(30px)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ============================================================
// API HELPERS
// ============================================================
function getHeaders(contentType = 'application/json') {
    const h = { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' };
    if (contentType) h['Content-Type'] = contentType;
    return h;
}

async function apiGet(path) {
    const res = await fetch(API_BASE + path, { headers: getHeaders(null) });
    if (!res.ok) { const err = new Error(); err.status = res.status; throw err; }
    return res.json();
}
async function apiPost(path, body) {
    const res = await fetch(API_BASE + path, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    return res.json();
}
async function apiPostForm(path, formData) {
    const res = await fetch(API_BASE + path, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/json' }, body: formData });
    if (!res.ok) throw new Error();
    return res.json();
}
async function apiPut(path, body) {
    const res = await fetch(API_BASE + path, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    return res.json();
}
async function apiPatch(path, body = {}) {
    const res = await fetch(API_BASE + path, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    return res.json();
}
async function apiDelete(path) {
    const res = await fetch(API_BASE + path, { method: 'DELETE', headers: getHeaders(null) });
    if (!res.ok) throw new Error();
    return res.json();
}

// ============================================================
// UTILITAIRES
// ============================================================
function formatFCFA(val) {
    const n = parseFloat(val || 0);
    return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA';
}
function formatFCFAShort(val) {
    if (val >= 1_000_000) return (val/1_000_000).toFixed(1) + 'M';
    if (val >= 1_000)     return (val/1_000).toFixed(0) + 'k';
    return val;
}

function formatDate(dateStr, fmt) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1)   return 'à l\'instant';
    if (min < 60)  return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24)    return `il y a ${h}h`;
    const days = Math.floor(h / 24);
    if (days < 30) return `il y a ${days}j`;
    return formatDate(dateStr);
}

function capitalise(str) {
    if (!str) return '—';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function badgeStatut(statut) {
    const map = {
        'payée':        'success',
        'approuvé':     'success',
        'remboursé':    'success',
        'en attente':   'info',
        'déclaré':      'info',
        'en cours':     'warning',
        'en retard':    'danger',
        'rejeté':       'danger',
        'suspendu':     'danger',
        'actif':        'success',
        'partiel':      'warning',
    };
    const type = map[statut?.toLowerCase()] || 'neutral';
    return `<span class="ad-badge ad-badge-${type}">${capitalise(statut)}</span>`;
}
