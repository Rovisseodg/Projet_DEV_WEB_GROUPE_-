
/* ============================================================
   DASHBOARD.JS – MaMutuelle
   Dépendances : Chart.js (CDN), api.js (apiCall, isAuthenticated, logout)
   ============================================================ */

/* ==============================
   MOCK DATA — remplacer par apiCall()
   ============================== */
const MOCK = {
  cotisations6m:  [840000, 920000, 1050000, 980000, 1200000, 1840000],
  cotisations12m: [540000, 620000, 700000, 780000, 840000, 920000, 1050000, 980000, 1100000, 1200000, 1550000, 1840000],
  sinistres:      { Maladie: 45, Accident: 25, Hospitalisation: 20, Décès: 10 },
  cotMensuel:     [1200000, 980000, 1450000, 1100000, 1840000, 0, 0, 0, 0, 0, 0, 0],
  recouvrement:   { Payées: 78, EnAttente: 16, EnRetard: 6 },
};

/* ==============================
   NAVIGATION — titres et sous-titres
   ============================== */
const TITLES = {
  overview:          "Vue d'ensemble",
  adherents:         'Adhérents',
  ayants:            'Ayants Droit',
  cotisations:       'Cotisations',
  'cotisations-stats': 'Statistiques Cotisations',
  prets:             'Prêts',
  'prets-calcul':    'Calculateur de Prêt',
  sinistres:         'Sinistres',
  alertes:           'Alertes',
  historique:        'Historique',
  export:            'Exportation',
  profil:            'Mon Profil',
};

const SUBS = {
  overview:          'Tableau de bord principal',
  adherents:         'Gestion des membres de la mutuelle',
  ayants:            'Personnes couvertes par les adhérents',
  cotisations:       'Suivi des paiements et cotisations',
  'cotisations-stats': 'Analyse statistique des cotisations',
  prets:             'Demandes et suivi des prêts',
  'prets-calcul':    'Simulateur de remboursement',
  sinistres:         'Déclarations et remboursements',
  alertes:           'Retards et échéances proches',
  historique:        'Journal de toutes les actions',
  export:            'Téléchargement des données',
  profil:            'Informations personnelles et paramètres',
};

/* ==============================
   AFFICHER UNE SECTION
   ============================== */
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('section-' + name);
  if (sec) sec.classList.add('active');

  document.getElementById('hdr-title').textContent = TITLES[name] || name;
  document.getElementById('hdr-sub').textContent   = SUBS[name]   || '';

  // Highlight nav
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('active'));
  const ni = document.querySelector(`[data-section="${name}"]`);
  if (ni) {
    ni.classList.add('active');
    // Ouvrir le sous-menu parent si nécessaire
    const parentSub = ni.closest('.nav-sub');
    if (parentSub) {
      parentSub.classList.add('open');
      const toggle = document.querySelector(`[data-toggle="${parentSub.id}"]`);
      if (toggle) toggle.classList.add('open');
    }
  }

  // Chargement paresseux des graphiques
  if (name === 'cotisations-stats') initCotStatsCharts();
  if (name === 'prets-calcul')      calculateLoan();
}

/* ==============================
   SOUS-MENUS SIDEBAR
   ============================== */
function initSubmenus() {
  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const sub    = document.getElementById(el.dataset.toggle);
      if (!sub) return;
      const isOpen = sub.classList.contains('open');
      // Fermer tous
      document.querySelectorAll('.nav-sub').forEach(s  => s.classList.remove('open'));
      document.querySelectorAll('.nav-item').forEach(i  => i.classList.remove('open'));
      if (!isOpen) { sub.classList.add('open'); el.classList.add('open'); }
    });
  });

  // Items de navigation simples
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => showSection(el.dataset.section));
  });
}

/* ==============================
   SIDEBAR TOGGLE (réduire/ouvrir)
   ============================== */
function initSidebarToggle() {
  document.getElementById('hdr-toggle').addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) sb.classList.toggle('open');
    else sb.classList.toggle('collapsed');
  });
}

/* ==============================
   DATE DANS LE HEADER
   ============================== */
function updateDate() {
  const opts = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  const el = document.getElementById('hdr-date');
  if (el) el.textContent = new Date().toLocaleDateString('fr-FR', opts);
}

/* ==============================
   MODALS
   ============================== */
function openModal(id)  { document.getElementById(id)?.classList.add('open');    }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function initModals() {
  document.querySelectorAll('.overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
  });
}

function confirmDelete(label) {
  document.getElementById('confirm-msg').textContent =
    `Êtes-vous sûr de vouloir supprimer ${label} ? Cette action est irréversible.`;
  openModal('modal-confirm');
}

/* ==============================
   DÉCONNEXION
   ============================== */
function handleLogout(e) {
  e.stopPropagation();
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
    toast('Déconnexion…', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
  }
}

/* ==============================
   TOASTS
   ============================== */
function toast(msg, type = 'success') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const icons = { success: 'check-circle', warning: 'exclamation-triangle', error: 'times-circle' };
  const el    = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${msg}
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

/* ==============================
   FILTRAGE DE TABLEAU
   ============================== */
function filterTable(tbodyId, q) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

/* ==============================
   RECHERCHE GLOBALE
   ============================== */
const SEARCH_DATA = [
  { type: 'adh',  name: 'Koné Oumar',            detail: 'ADH-001 · Actif' },
  { type: 'adh',  name: 'Ouédraogo Fatimata',     detail: 'ADH-002 · Actif' },
  { type: 'adh',  name: 'Traoré Issa',            detail: 'ADH-003 · Suspendu' },
  { type: 'adh',  name: 'Bambara Brice',          detail: 'ADH-004 · Retraité' },
  { type: 'cot',  name: 'Cotisation Koné Oumar',  detail: '15 000 FCFA · Payée' },
  { type: 'cot',  name: 'Cotisation Traoré Issa', detail: '15 000 FCFA · En retard' },
  { type: 'pret', name: 'Prêt Compaoré Ablassé',  detail: '350 000 FCFA · Approuvé' },
  { type: 'pret', name: 'Prêt Zongo Aminata',     detail: '500 000 FCFA · En attente' },
  { type: 'sin',  name: 'Sinistre Bambara Brice', detail: 'Hospitalisation · En cours' },
  { type: 'sin',  name: 'Sinistre Sawadogo Mariam', detail: 'Accident · Déclaré' },
];


const SECTION_MAP = { adh: 'adherents', cot: 'cotisations', pret: 'prets', sin: 'sinistres' };
const TYPE_LABEL  = { adh: 'Adhérent', cot: 'Cotisation', pret: 'Prêt', sin: 'Sinistre' };

function initSearch() {
  const input   = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    if (!q) { results.classList.remove('open'); return; }

    const found = SEARCH_DATA.filter(d =>
      d.name.toLowerCase().includes(q) || d.detail.toLowerCase().includes(q)
    );

    results.innerHTML = found.length
      ? found.map(d => `
          <div class="sr-item" onclick="showSection('${SECTION_MAP[d.type]}');
            document.getElementById('search-results').classList.remove('open');
            document.getElementById('global-search').value=''">
            <span class="sr-tag ${d.type}">${TYPE_LABEL[d.type]}</span>
            <span class="sr-name">${d.name}</span>
            <span class="sr-detail">${d.detail}</span>
          </div>`).join('')
      : '<div class="sr-empty">Aucun résultat trouvé</div>';

    results.classList.add('open');
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#search-box') && !e.target.closest('#search-results'))
      results.classList.remove('open');
  });
}

/* ==============================
   FILTRES PAR STATUT (boutons)
   ============================== */
function initFilterButtons() {
  document.querySelectorAll('.sec-filters').forEach(group => {
    group.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
  });
}

/* ==============================
   GRAPHIQUE COTISATIONS (overview)
   ============================== */
let cotChart = null;

function initCotChart(period) {
  const ctx = document.getElementById('chart-cotisations');
  if (!ctx) return;

  const data     = period === '12m' ? MOCK.cotisations12m : MOCK.cotisations6m;
  const labels6  = ['Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'];
  const labels12 = ['Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'];

  if (cotChart) cotChart.destroy();
  cotChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: period === '12m' ? labels12 : labels6,
      datasets: [{
        label: 'Cotisations (FCFA)',
        data,
        borderColor:       '#C1440E',
        backgroundColor:   'rgba(193,68,14,.08)',
        borderWidth:       2.5,
        pointBackgroundColor: '#C1440E',
        pointRadius:       4,
        tension:           .35,
        fill:              true,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + Number(ctx.raw).toLocaleString('fr-FR') + ' FCFA' } },
      },
      scales: {
        y: { grid: { color: '#EDE5D8' }, ticks: { callback: v => v >= 1e6 ? v/1e6+'M' : v >= 1000 ? v/1000+'k' : v, font: { size: 10 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

function initSinistreChart() {
  const ctx = document.getElementById('chart-sinistres');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(MOCK.sinistres),
      datasets: [{
        data:            Object.values(MOCK.sinistres),
        backgroundColor: ['#2D7A3A', '#C1440E', '#3B4F9C', '#D4920A'],
        borderWidth:     2,
        borderColor:     '#fff',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } },
    },
  });
}

function initPeriodButtons() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      initCotChart(this.dataset.period);
    });
  });
}

/* ==============================
   GRAPHIQUES STATS COTISATIONS
   ============================== */
let cotStatsDone = false;

function initCotStatsCharts() {
  if (cotStatsDone) return;
  cotStatsDone = true;

  const mCtx = document.getElementById('chart-cot-mensuel');
  if (mCtx) new Chart(mCtx, {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      datasets: [{
        label: 'Cotisations (FCFA)',
        data:  MOCK.cotMensuel,
        backgroundColor: 'rgba(193,68,14,.75)',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => v >= 1e6 ? v/1e6+'M' : v >= 1000 ? v/1000+'k' : v } },
        x: { grid: { display: false } },
      },
    },
  });

  const rCtx = document.getElementById('chart-cot-recouvrement');
  if (rCtx) new Chart(rCtx, {
    type: 'pie',
    data: {
      labels: ['Payées', 'En attente', 'En retard'],
      datasets: [{
        data:            Object.values(MOCK.recouvrement),
        backgroundColor: ['#2D7A3A', '#D4920A', '#DC2626'],
        borderWidth:     3,
        borderColor:     '#fff',
      }],
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } } },
  });
}

/* ==============================
   CALCULATEUR DE PRÊT
   ============================== */
function calculateLoan() {
  const M = parseFloat(document.getElementById('calc-montant')?.value) || 0;
  const r = (parseFloat(document.getElementById('calc-taux')?.value)   || 0) / 100 / 12;
  const n = parseInt(document.getElementById('calc-duree')?.value)     || 0;
  if (!M || !n) return;

  const mensualite = r > 0
    ? M * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1)
    : M / n;
  const total    = mensualite * n;
  const interets = total - M;
  const fmt      = v => Math.round(v).toLocaleString('fr-FR') + ' FCFA';

  document.getElementById('res-mensualite').textContent = fmt(mensualite);
  document.getElementById('res-interets').textContent   = fmt(interets);
  document.getElementById('res-total').textContent      = fmt(total);
  document.getElementById('res-cout').textContent       = (interets / M * 100).toFixed(1) + '%';
}

/* ==============================
   EXPORT (mock — brancher sur le backend)
   ============================== */
function exportData(module, format) {
  toast(`Export ${module} en ${format.toUpperCase()} en cours…`, 'success');
  // Production : appel API => window.location = `/api/export/${module}?format=${format}&token=...`
}

/* ==============================
   INITIALISATION PRINCIPALE
   ============================== */
document.addEventListener('DOMContentLoaded', () => {
  // Décommenter en production :
 if (!isAuthenticated()) { window.location.href = 'login.html'; return; }

  initSubmenus();
  initSidebarToggle();
  initModals();
  initSearch();
  initFilterButtons();
  initPeriodButtons();
  updateDate();
  initCotChart('6m');
  initSinistreChart();
  calculateLoan();
  showSection('overview');
});
