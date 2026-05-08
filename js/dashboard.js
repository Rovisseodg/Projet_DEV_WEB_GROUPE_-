/* ============================================================
   DASHBOARD.JS – MaMutuelle
   Dépendances : api.js (apiCall, isAuthenticated, logout, getToken)
   Chart.js chargé via CDN dans dashboard.html
   ============================================================ */

/* ==============================
   GUARD — Redirection si non connecté
   ============================== */
if (!isAuthenticated()) {
    window.location.href = 'login.html';
}

// Bloquer les adhérents — ils ont leur propre dashboard
const user = getCurrentUser();
if (user?.role === 'adherent') {
    window.location.href = 'adherent-dashboard.html';
}

/* ==============================
   UTILISATEUR CONNECTÉ
   ============================== */
function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem('mamutuelle_user') ||
      sessionStorage.getItem('mamutuelle_user')
    );
  } catch { return null; }
}

function injectUserInfo() {
  const user = getCurrentUser();
  if (!user) return;

  const name     = user.name || 'Utilisateur';
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const role     = user.role || 'agent';
  const roleStr  = role.charAt(0).toUpperCase() + role.slice(1);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setQ = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };

  set('sb-user-name', name);
  setQ('.sb-avatar',       initials);
  setQ('.sb-user-role',    roleStr);
  set('hdr-sub', `Bonjour, ${name} · Bienvenue sur votre tableau de bord`);
  setQ('.profile-avatar',  initials);
  setQ('.profile-name',    name);
  setQ('.profile-role',    roleStr);

  // Pré-remplir modal profil
  const inputs = document.querySelectorAll('#modal-profil input');
  const parts  = name.split(' ');
  if (inputs[0]) inputs[0].value = parts[0] || '';
  if (inputs[1]) inputs[1].value = parts.slice(1).join(' ') || '';
  if (inputs[2]) inputs[2].value = user.email     || '';
  if (inputs[3]) inputs[3].value = user.telephone || '';
}

/* ==============================
   TITRES DES SECTIONS
   ============================== */
const TITLES = {
  overview:            "Vue d'ensemble",
  adherents:           'Adhérents',
  ayants:              'Ayants Droit',
  cotisations:         'Cotisations',
  'cotisations-stats': 'Statistiques Cotisations',
  prets:               'Prêts',
  'prets-calcul':      'Calculateur de Prêt',
  sinistres:           'Sinistres',
  alertes:             'Alertes',
  historique:          'Historique',
  export:              'Exportation',
  profil:              'Mon Profil',
};

const SUBS = {
  overview:            'Tableau de bord principal',
  adherents:           'Gestion des membres de la mutuelle',
  ayants:              'Personnes couvertes par les adhérents',
  cotisations:         'Suivi des paiements et cotisations',
  'cotisations-stats': 'Analyse statistique des cotisations',
  prets:               'Demandes et suivi des prêts',
  'prets-calcul':      'Simulateur de remboursement',
  sinistres:           'Déclarations et remboursements',
  alertes:             'Retards et échéances proches',
  historique:          'Journal de toutes les actions',
  export:              'Téléchargement des données',
  profil:              'Informations personnelles et paramètres',
};

/* ==============================
   NAVIGATION
   ============================== */
const SECTION_LOADERS = {
  overview:            loadOverview,
  adherents:           loadAdherents,
  ayants:              loadAyants,
  cotisations:         loadCotisations,
  'cotisations-stats': loadCotisationsStats,
  prets:               loadPrets,
  'prets-calcul':      calculateLoan,
  sinistres:           loadSinistres,
  alertes:             loadAlertes,
};

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('section-' + name);
  if (sec) sec.classList.add('active');

  const titleEl = document.getElementById('hdr-title');
  const subEl   = document.getElementById('hdr-sub');
  if (titleEl) titleEl.textContent = TITLES[name] || name;
  if (subEl)   subEl.textContent   = SUBS[name]   || '';

  // Highlight nav
  document.querySelectorAll('.nav-item, .nav-sub-item').forEach(el => el.classList.remove('active'));
  const ni = document.querySelector(`[data-section="${name}"]`);
  if (ni) {
    ni.classList.add('active');
    const parentSub = ni.closest('.nav-sub');
    if (parentSub) {
      parentSub.classList.add('open');
      const toggle = document.querySelector(`[data-toggle="${parentSub.id}"]`);
      if (toggle) toggle.classList.add('open');
    }
  }

  // Charger les données de la section
  if (SECTION_LOADERS[name]) SECTION_LOADERS[name]();
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
      document.querySelectorAll('.nav-sub').forEach(s => s.classList.remove('open'));
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) { sub.classList.add('open'); el.classList.add('open'); }
    });
  });

  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', () => showSection(el.dataset.section));
  });
}

/* ==============================
   SIDEBAR TOGGLE
   ============================== */
function initSidebarToggle() {
  const btn = document.getElementById('hdr-toggle');
  if (btn) btn.addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) sb.classList.toggle('open');
    else sb.classList.toggle('collapsed');
  });
}

/* ==============================
   DATE HEADER
   ============================== */
function updateDate() {
  const el = document.getElementById('hdr-date');
  if (el) el.textContent = new Date().toLocaleDateString('fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
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

/* Confirm delete avec callback réel */
function confirmDelete(label, callback) {
  const msgEl = document.getElementById('confirm-msg');
  if (msgEl) msgEl.textContent = `Êtes-vous sûr de vouloir supprimer ${label} ? Cette action est irréversible.`;
  window._deleteCallback = callback || null;
  openModal('modal-confirm');
}

function initConfirmDelete() {
  const btn = document.querySelector('#modal-confirm .btn-danger');
  if (!btn) return;
  btn.onclick = async () => {
    closeModal('modal-confirm');
    if (typeof window._deleteCallback === 'function') {
      await window._deleteCallback();
      window._deleteCallback = null;
    }
  };
}

/* ==============================
   DÉCONNEXION
   ============================== */
async function handleLogout(e) {
  e.stopPropagation();
  if (!confirm('Voulez-vous vraiment vous déconnecter ?')) return;
  try { await apiCall('/logout', { method: 'POST' }); } catch (_) {}
  logout();
  toast('Déconnexion réussie', 'warning');
  setTimeout(() => { window.location.href = 'login.html'; }, 1200);
}

/* ==============================
   TOASTS
   ============================== */
function toast(msg, type = 'success') {
  const wrap  = document.getElementById('toast-wrap');
  if (!wrap) return;
  const icons = { success: 'check-circle', warning: 'exclamation-triangle', error: 'times-circle' };
  const el    = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${msg}
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/* ==============================
   UTILITAIRES
   ============================== */
function fmtFCFA(n) {
  if (n === null || n === undefined || n === '') return '—';
  const num = Number(n);
  if (isNaN(num)) return '—';
  return num.toLocaleString('fr-FR') + ' FCFA';
}

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('fr-FR');
}

function badgeStatut(statut) {
  if (!statut) return '<span class="badge b-gray">—</span>';
  const map = {
    'actif': 'b-green', 'payée': 'b-green', 'payé': 'b-green',
    'remboursé': 'b-green', 'approuvé': 'b-green',
    'en attente': 'b-gold', 'en cours': 'b-gold', 'déclaré': 'b-gold',
    'suspendu': 'b-red', 'en retard': 'b-red', 'rejeté': 'b-red',
    'retraité': 'b-gray',
  };
  const cls = map[statut.toLowerCase()] || 'b-gray';
  return `<span class="badge ${cls}">${statut}</span>`;
}

function showTableLoading(id, cols) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<tr><td colspan="${cols}" class="loading-row">
    <i class="fas fa-spinner fa-spin"></i> Chargement…</td></tr>`;
}

function showTableEmpty(id, cols, msg = 'Aucune donnée') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<tr><td colspan="${cols}" class="loading-row">${msg}</td></tr>`;
}

function showTableError(id, cols, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<tr><td colspan="${cols}" class="loading-row" style="color:var(--red)">
    <i class="fas fa-exclamation-circle"></i> ${msg}</td></tr>`;
}

/* ==============================
   FILTRAGE LOCAL
   ============================== */
function filterTable(tbodyId, q) {
  document.getElementById(tbodyId)?.querySelectorAll('tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function initFilterButtons() {
  // Configuration du nombre de colonnes et index du statut pour chaque section
  const config = {
    'adherentsBody': { statusIndex: 4 },      // 5ème colonne (0-based)
    'cotisationsBody': { statusIndex: 4 },    // 5ème colonne
    'pretsBody': { statusIndex: 5 },          // 6ème colonne
    'sinistresBody': { statusIndex: 5 }       // 6ème colonne
  };

  // Mapping des textes de boutons vers les statuts réels
  const statusMap = {
    'actifs': 'actif',
    'suspendus': 'suspendu',
    'retraités': 'retraité',
    'payées': 'payée',
    'payé': 'payée',
    'approuvés': 'approuvé',
    'remboursés': 'remboursé',
    'déclarés': 'déclaré',
    'en cours': 'en cours'
  };

  document.querySelectorAll('.sec-filters').forEach(group => {
    const tbodyId = group.closest('.section').id.replace('section-', '') + 'Body';
    const tbody = document.getElementById(tbodyId);
    const statusIndex = config[tbodyId]?.statusIndex || 4;

    group.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        // Changer l'apparence des boutons
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Appliquer le filtrage
        const filterText = this.textContent.trim().toLowerCase();
        const rows = tbody?.querySelectorAll('tr') || [];

        rows.forEach(row => {
          if (filterText === 'tous' || filterText === 'toutes') {
            row.style.display = '';
            return;
          }

          // Trouver la cellule du statut selon l'index configuré
          const cells = row.querySelectorAll('td');
          const statusCell = cells[statusIndex];

          if (statusCell) {
            const statusText = statusCell.textContent.trim().toLowerCase();
            // Utiliser le mapping ou le texte original
            const mappedStatus = statusMap[filterText] || filterText;
            row.style.display = statusText.includes(mappedStatus) ? '' : 'none';
          }
        });
      });
    });
  });
}

/* ==============================
   RECHERCHE TEXTE LOCAL
   ============================== */
function searchInTable(tbodyId, searchText) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  
  const rows = tbody.querySelectorAll('tr');
  const query = searchText.toLowerCase();
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function initSearchBoxes() {
  document.querySelectorAll('.search-box input').forEach(input => {
    const section = input.closest('.section');
    const tbodyId = section?.id.replace('section-', '') + 'Body';
    
    input.addEventListener('input', function() {
      searchInTable(tbodyId, this.value);
    });
  });
}

/* ==============================
   RECHERCHE GLOBALE
   ============================== */
let _searchCache = [];

async function buildSearchCache() {
  try {
    const results = await Promise.allSettled([
      apiCall('/adherents'),
      apiCall('/cotisations'),
      apiCall('/prets'),
      apiCall('/sinistres'),
    ]);

    const [adh, cot, pret, sin] = results;
    _searchCache = [];

    (adh.value?.data || adh.value || []).forEach(a =>
      _searchCache.push({ type: 'adh', name: `${a.nom} ${a.prenom || ''}`.trim(), detail: `${a.numero || ''} · ${a.statut || ''}`, section: 'adherents' })
    );
    (cot.value?.data || cot.value || []).forEach(c =>
      _searchCache.push({ type: 'cot', name: `Cotisation ${c.adherent?.nom || ''}`, detail: `${fmtFCFA(c.montant)} · ${c.statut || ''}`, section: 'cotisations' })
    );
    (pret.value?.data || pret.value || []).forEach(p =>
      _searchCache.push({ type: 'pret', name: `Prêt ${p.adherent?.nom || ''}`, detail: `${fmtFCFA(p.montant)} · ${p.statut || ''}`, section: 'prets' })
    );
    (sin.value?.data || sin.value || []).forEach(s =>
      _searchCache.push({ type: 'sin', name: `Sinistre ${s.adherent?.nom || ''}`, detail: `${s.type || ''} · ${s.statut || ''}`, section: 'sinistres' })
    );
  } catch (_) {}
}

const TYPE_LABEL = { adh: 'Adhérent', cot: 'Cotisation', pret: 'Prêt', sin: 'Sinistre' };

function initSearch() {
  const input   = document.getElementById('global-search');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    if (!q) { results.classList.remove('open'); return; }

    const found = _searchCache
      .filter(d => d.name.toLowerCase().includes(q) || d.detail.toLowerCase().includes(q))
      .slice(0, 8);

    results.innerHTML = found.length
      ? found.map(d => `
          <div class="sr-item" onclick="
            showSection('${d.section}');
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
   OVERVIEW — Stats + Graphiques
   ============================== */
async function loadOverview() {
  // ── Stats cards ──
  try {
    const stats = await apiCall('/stats');
    const v = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
    v('st-adherents',  stats.adherents_total);
    v('st-prets',      stats.prets_actifs);
    v('st-sinistres',  stats.sinistres_en_cours);
    // La route /stats ne retourne pas le montant total des cotisations,
    // on affiche le nombre de payées à la place
    v('st-cotisations', stats.cotisations_payees);
  } catch (err) {
    console.warn('Stats:', err.message);
  }

  // ── Alertes rapides ──
  try {
    const alertes = await apiCall('/alertes');
    const list    = alertes?.data
      || (Array.isArray(alertes) ? alertes : [...(alertes?.cotisations_retard || []), ...(alertes?.prets_echeance || [])])
      || [];
    const retards = list.filter(a => a.type?.includes('retard') || a.type?.includes('cotisation'));

    const badge = document.getElementById('badge-alertes');
    if (badge) badge.textContent = list.length;

    renderQuickRetard(retards.slice(0, 4));
  } catch (_) {}

  // ── Graphiques ──
  await loadCotisationsChart('6m');
  await loadSinistreChart();
}

/* ── Tableau retards mini (overview) ── */
function renderQuickRetard(list) {
  const tbody = document.getElementById('quick-retard');
  if (!tbody) return;
  tbody.innerHTML = list.length
    ? list.map(a => `
        <tr>
          <td>${a.adherent?.nom || a.nom || '—'}</td>
          <td>${fmtFCFA(a.montant)}</td>
          <td>${badgeStatut('en retard')}</td>
          <td><button class="btn btn-xs btn-primary" onclick="openModal('modal-cotisation')">Régulariser</button></td>
        </tr>`).join('')
    : `<tr><td colspan="4" class="loading-row">Aucun retard 🎉</td></tr>`;
}

/* ==============================
   GRAPHIQUES OVERVIEW
   ============================== */
let cotChart = null;

async function loadCotisationsChart(period) {
  const ctx = document.getElementById('chart-cotisations');
  if (!ctx) return;

  try {
    const data  = await apiCall('/cotisations');
    const list  = data?.data || data || [];
    const n     = period === '12m' ? 12 : 6;
    const now   = new Date();
    const labels = [], values = [];

    for (let i = n - 1; i >= 0; i--) {
      const d      = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm     = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy   = d.getFullYear();
      labels.push(d.toLocaleDateString('fr-FR', { month: 'short' }));
      const total = list
        .filter(c =>
          (c.statut === 'payée' || c.statut === 'payé') &&
          c.date_paiement?.startsWith(`${yyyy}-${mm}`)
        )
        .reduce((s, c) => s + Number(c.montant || 0), 0);
      values.push(total);
    }

    if (cotChart) cotChart.destroy();
    cotChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cotisations perçues (FCFA)', data: values,
          borderColor: '#C1440E', backgroundColor: 'rgba(193,68,14,.08)',
          borderWidth: 2.5, pointBackgroundColor: '#C1440E',
          pointRadius: 4, tension: .35, fill: true,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ' ' + Number(c.raw).toLocaleString('fr-FR') + ' FCFA' } },
        },
        scales: {
          y: { grid: { color: '#EDE5D8' }, ticks: { callback: v => v >= 1e6 ? v/1e6+'M' : v >= 1000 ? v/1000+'k' : v, font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
      },
    });
  } catch (err) { console.warn('Graphique cotisations:', err.message); }
}

async function loadSinistreChart() {
  const ctx = document.getElementById('chart-sinistres');
  if (!ctx) return;
  try {
    const data   = await apiCall('/sinistres');
    const list   = data?.data || data || [];
    const counts = {};
    list.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#2D7A3A', '#C1440E', '#3B4F9C', '#D4920A', '#9A8570'],
          borderWidth: 2, borderColor: '#fff',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } } },
      },
    });
  } catch (err) { console.warn('Graphique sinistres:', err.message); }
}

function initPeriodButtons() {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      loadCotisationsChart(this.dataset.period);
    });
  });
}

/* ==============================
   ADHÉRENTS
   ============================== */
let _selectedAdherentId = null;
let _ayantsRelationFilter = 'Toutes';

async function loadAdherents() {
  showTableLoading('adherentsBody', 7);
  try {
    const data      = await apiCall('/adherents');
    const adherents = data?.data || data || [];
    const tbody     = document.getElementById('adherentsBody');

    if (!adherents.length) { showTableEmpty('adherentsBody', 7, 'Aucun adhérent inscrit'); return; }

    tbody.innerHTML = adherents.map(a => {
      const ayantsDroitCount = (a.ayantsDroit?.length || a.ayants_droit?.length || 0);
      return `
      <tr>
        <td><span style="font-family:var(--mono);font-size:.78rem">${a.numero_adherent || '—'}</span></td>
        <td><strong>${a.nom || ''} ${a.prenom || ''}</strong></td>
        <td>${a.email || '—'}</td>
        <td>${a.telephone || '—'}</td>
        <td>${badgeStatut(a.statut)}</td>
        <td>
          <button class="btn btn-xs btn-ghost" onclick="showAyantsDroitFor(${a.id}, '${(a.nom || '').replace(/'/g,"\\'")} ${(a.prenom || '').replace(/'/g,"\\'")}')" title="Voir les ayants droit">
            <i class="fas fa-child"></i> ${ayantsDroitCount}
          </button>
        </td>
        <td>
          <button class="icon-btn" title="Modifier" onclick="openEditAdherent(${a.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn" style="margin-left:4px" onclick="deleteAdherent(${a.id}, '${(a.nom || '').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`;
    }).join('');

    const title = document.querySelector('#section-adherents .tcard-title');
    if (title) title.textContent = `${adherents.length} adhérent(s) inscrit(s)`;

  } catch (err) {
    showTableError('adherentsBody', 7, err.message);
    toast('Erreur adhérents : ' + err.message, 'error');
  }
}

async function showAyantsDroitFor(adherentId, adherentName) {
  _selectedAdherentId = adherentId;
  await loadAyantsDroitForAdherent(adherentId);
  document.querySelector('#section-ayants .sec-title').textContent = `Ayants droit de ${adherentName}`;
  showSection('ayants');
}

async function loadAyants() {
  const tbody = document.getElementById('ayantsDroitBody');
  if (!tbody) return;

  if (_selectedAdherentId) {
    await loadAyantsDroitForAdherent(_selectedAdherentId);
    filterAyantsDroit();
    return;
  }

  showTableLoading('ayantsDroitBody', 4);
  try {
    const data = await apiCall('/adherents');
    const adherents = data?.data || data || [];
    const allAyants = adherents.flatMap(a => (a.ayantsDroit || a.ayants_droit || []).map(ayant => ({
      ...ayant,
      adherentName: `${a.nom || ''} ${a.prenom || ''}`.trim(),
    })));

    if (!allAyants.length) {
      showTableEmpty('ayantsDroitBody', 4, 'Aucun ayant droit enregistré');
      return;
    }

    tbody.innerHTML = allAyants.map(a => `
      <tr>
        <td><strong>${a.nom || ''} ${a.prenom || ''}</strong>${a.adherentName ? `<div class="small text-muted">Adhérent : ${a.adherentName}</div>` : ''}</td>
        <td>${a.relation || '—'}</td>
        <td>${a.date_naissance ? new Date(a.date_naissance).toLocaleDateString('fr-FR') : '—'}</td>
        <td>
          <button class="icon-btn" title="Modifier" onclick="openEditAyantDroit(${a.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn" style="margin-left:4px" onclick="deleteAyantDroit(${a.id}, '${(a.nom || '').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');

    filterAyantsDroit();
  } catch (err) {
    showTableError('ayantsDroitBody', 4, err.message);
    toast('Erreur : ' + err.message, 'error');
  }
}

async function loadAyantsDroitForAdherent(adherentId) {
  const tbody = document.getElementById('ayantsDroitBody');
  if (!tbody) return;

  showTableLoading('ayantsDroitBody', 4);
  try {
    const adherent = await apiCall(`/adherents/${adherentId}`);
    const ayantsDroit = adherent?.ayantsDroit || adherent?.ayants_droit || [];

    if (!ayantsDroit.length) {
      showTableEmpty('ayantsDroitBody', 4, 'Aucun ayant droit enregistré');
      return;
    }

    tbody.innerHTML = ayantsDroit.map(a => `
      <tr>
        <td><strong>${a.nom || ''} ${a.prenom || ''}</strong></td>
        <td>${a.relation || '—'}</td>
        <td>${a.date_naissance ? new Date(a.date_naissance).toLocaleDateString('fr-FR') : '—'}</td>
        <td>
          <button class="icon-btn" title="Modifier" onclick="openEditAyantDroit(${a.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn" style="margin-left:4px" onclick="deleteAyantDroit(${a.id}, '${(a.nom || '').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');

    filterAyantsDroit();
  } catch (err) {
    showTableError('ayantsDroitBody', 4, err.message);
    toast('Erreur : ' + err.message, 'error');
  }
}

function setAyantsRelationFilter(relation) {
  _ayantsRelationFilter = relation;
  document.querySelectorAll('#section-ayants .filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().toLowerCase() === relation.toLowerCase());
  });
  filterAyantsDroit();
}

function filterAyantsDroit() {
  const tbody = document.getElementById('ayantsDroitBody');
  if (!tbody) return;

  const searchInput = document.querySelector('#section-ayants .hdr-search input');
  const searchText = searchInput?.value.trim().toLowerCase() || '';
  const rows = Array.from(tbody.querySelectorAll('tr'));

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (!cells.length || cells[0]?.colSpan > 1) {
      row.style.display = '';
      return;
    }

    const relation = cells[1]?.textContent.trim().toLowerCase() || '';
    const rowText = row.textContent.trim().toLowerCase();
    const normalizedRelation = relation.replace('conjoint', 'epoux');
    const filterValue = _ayantsRelationFilter.toLowerCase();

    const relationMap = {
      epoux: ['epoux', 'conjoint'],
      conjoint: ['epoux', 'conjoint'],
      enfant: ['enfant'],
      parent: ['parent'],
      autre: ['autre'],
    };

    const accepted = relationMap[filterValue] || [filterValue];
    const matchesRelation = _ayantsRelationFilter === 'Toutes' || accepted.some(r => relation.includes(r));
    const matchesSearch = !searchText || rowText.includes(searchText);

    row.style.display = matchesRelation && matchesSearch ? '' : 'none';
  });
}

async function openEditAyantDroit(ayantId) {
  if (!_selectedAdherentId) { toast('Adhérent non sélectionné', 'error'); return; }
  const adherent = await apiCall(`/adherents/${_selectedAdherentId}`);
  const ayant = (adherent?.ayantsDroit || adherent?.ayants_droit || []).find(a => a.id == ayantId);
  if (!ayant) { toast('Ayant droit non trouvé', 'error'); return; }
  
  const form = document.getElementById('modal-ayant-droit') || document.createElement('div');
  const inputs = form.querySelectorAll('input');
  const sels = form.querySelectorAll('select');
  
  if (inputs[0]) inputs[0].value = ayant.nom || '';
  if (inputs[1]) inputs[1].value = ayant.prenom || '';
  if (inputs[2]) inputs[2].value = ayant.date_naissance ? ayant.date_naissance.slice(0, 10) : '';
  if (sels[0]) sels[0].value = ayant.relation || 'epoux';
  
  form.dataset.editId = ayantId;
  openModal('modal-ayant-droit');
}

async function deleteAyantDroit(ayantId, ayantName) {
  if (!_selectedAdherentId) { toast('Adhérent non sélectionné', 'error'); return; }
  confirmDelete(`cet ayant droit (${ayantName})`, async () => {
    try {
      await apiCall(`/adherents/${_selectedAdherentId}/ayants-droit/${ayantId}`, { method: 'DELETE' });
      toast('Ayant droit supprimé', 'success');
      await loadAyantsDroitForAdherent(_selectedAdherentId);
    } catch (err) { toast('Erreur : ' + err.message, 'error'); }
  });
}

async function saveAyantDroit() {
  if (!_selectedAdherentId) { toast('Adhérent non sélectionné', 'error'); return; }
  
  const form   = document.getElementById('modal-ayant-droit');
  const inputs = form.querySelectorAll('input');
  const sels   = form.querySelectorAll('select');
  
  const body = {
    nom:      inputs[0]?.value?.trim(),
    prenom:   inputs[1]?.value?.trim(),
    relation: sels[0]?.value || 'autre',
    date_naissance: inputs[2]?.value,
  };
  
  if (!body.nom || !body.prenom) {
    toast('Nom et prénom requis', 'error');
    return;
  }
  
  try {
    const id = form.dataset.editId;
    if (id) {
      await apiCall(`/adherents/${_selectedAdherentId}/ayants-droit/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(body) 
      });
      toast('Ayant droit modifié', 'success');
    } else {
      await apiCall(`/adherents/${_selectedAdherentId}/ayants-droit`, { 
        method: 'POST', 
        body: JSON.stringify(body) 
      });
      toast('Ayant droit ajouté', 'success');
    }
    closeModal('modal-ayant-droit');
    delete form.dataset.editId;
    form.reset();
    await loadAyantsDroitForAdherent(_selectedAdherentId);
  } catch (err) {
    toast('Erreur : ' + err.message, 'error');
  }
}

async function saveAdherent() {
  const form   = document.getElementById('modal-adherent');
  const inputs = form.querySelectorAll('input');
  const sel    = form.querySelector('select');
  const errEl  = document.getElementById('adherent-err');
  if (errEl) errEl.textContent = '';

  const body = {
    nom:             inputs[0]?.value?.trim(),
    prenom:          inputs[1]?.value?.trim(),
    email:           inputs[2]?.value?.trim(),
    telephone:       inputs[3]?.value?.trim(),
    numero_adherent: inputs[4]?.value?.trim(),
    statut:          sel?.value,
  };

  try {
    const id = form.dataset.editId;
    if (id) {
      await apiCall(`/adherents/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Adhérent modifié', 'success');
    } else {
      await apiCall('/adherents', { method: 'POST', body: JSON.stringify(body) });
      toast('Adhérent enregistré', 'success');
    }
    closeModal('modal-adherent');
    delete form.dataset.editId;
    document.getElementById('adherent-modal-title').textContent = 'Nouvel Adhérent';
    loadAdherents();
    buildSearchCache();
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

async function openEditAdherent(id) {
  try {
    const a      = await apiCall(`/adherents/${id}`);
    const form   = document.getElementById('modal-adherent');
    const inputs = form.querySelectorAll('input');
    const sel    = form.querySelector('select');
    inputs[0].value = a.nom              || '';
    inputs[1].value = a.prenom           || '';
    inputs[2].value = a.email            || '';
    inputs[3].value = a.telephone        || '';
    inputs[4].value = a.numero_adherent  || '';
    if (sel) sel.value = a.statut || 'actif';
    document.getElementById('adherent-modal-title').textContent = 'Modifier l\'Adhérent';
    form.dataset.editId = id;
    openModal('modal-adherent');
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function deleteAdherent(id, nom) {
  confirmDelete(`l'adhérent ${nom}`, async () => {
    try {
      await apiCall(`/adherents/${id}`, { method: 'DELETE' });
      toast('Adhérent supprimé', 'warning');
      loadAdherents();
    } catch (err) { toast('Erreur : ' + err.message, 'error'); }
  });
}

/* ==============================
   COTISATIONS
   ============================== */
async function loadCotisations() {
  showTableLoading('cotisationsBody', 6);
  try {
    const data  = await apiCall('/cotisations');
    const list  = data?.data || data || [];
    const tbody = document.getElementById('cotisationsBody');

    if (!list.length) { showTableEmpty('cotisationsBody', 6, 'Aucune cotisation enregistrée'); return; }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td>${c.adherent?.nom || ''} ${c.adherent?.prenom || ''}</td>
        <td>${fmtFCFA(c.montant)}</td>
        <td>${fmtDate(c.date_echeance)}</td>
        <td>${c.date_paiement ? fmtDate(c.date_paiement) : '—'}</td>
        <td>${badgeStatut(c.statut)}</td>
        <td>
          <button class="icon-btn" onclick="openEditCotisation(${c.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn" style="margin-left:4px" onclick="deleteCotisation(${c.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');

  } catch (err) {
    showTableError('cotisationsBody', 6, err.message);
    toast('Erreur cotisations : ' + err.message, 'error');
  }
}

async function saveCotisation() {
  const form   = document.getElementById('modal-cotisation');
  const sels   = form.querySelectorAll('select');
  const inputs = form.querySelectorAll('input');
  const body   = {
    adherent_id:   sels[0]?.value,
    montant:       inputs[0]?.value,
    date_echeance: inputs[1]?.value,
    statut:        sels[1]?.value,
  };
  try {
    const id = form.dataset.editId;
    if (id) {
      await apiCall(`/cotisations/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Cotisation modifiée', 'success');
    } else {
      await apiCall('/cotisations', { method: 'POST', body: JSON.stringify(body) });
      toast('Cotisation enregistrée', 'success');
    }
    closeModal('modal-cotisation');
    delete form.dataset.editId;
    loadCotisations();
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function openEditCotisation(id) {
  try {
    const c      = await apiCall(`/cotisations/${id}`);
    const form   = document.getElementById('modal-cotisation');
    const inputs = form.querySelectorAll('input');
    const sels   = form.querySelectorAll('select');
    inputs[0].value = c.montant       || '';
    inputs[1].value = c.date_echeance ? c.date_echeance.slice(0, 10) : '';
    sels[1].value   = c.statut        || 'en attente';
    form.dataset.editId = id;
    openModal('modal-cotisation');
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function deleteCotisation(id) {
  confirmDelete('cette cotisation', async () => {
    try {
      await apiCall(`/cotisations/${id}`, { method: 'DELETE' });
      toast('Cotisation supprimée', 'warning');
      loadCotisations();
    } catch (err) { toast('Erreur : ' + err.message, 'error'); }
  });
}

/* ==============================
   STATS COTISATIONS (graphiques détaillés)
   ============================== */
let cotStatsDone = false;

async function loadCotisationsStats() {
  if (cotStatsDone) return;
  cotStatsDone = true;

  try {
    const data = await apiCall('/cotisations');
    const list  = data?.data || data || [];

    // Mensuel sur l'année en cours
    const year   = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(year, i, 1);
      return { label: d.toLocaleDateString('fr-FR', { month: 'short' }), mm: String(i + 1).padStart(2, '0') };
    });

    const montants = months.map(m =>
      list
        .filter(c => (c.statut === 'payée' || c.statut === 'payé') && c.date_paiement?.startsWith(`${year}-${m.mm}`))
        .reduce((s, c) => s + Number(c.montant || 0), 0)
    );

    const mCtx = document.getElementById('chart-cot-mensuel');
    if (mCtx) new Chart(mCtx, {
      type: 'bar',
      data: {
        labels: months.map(m => m.label),
        datasets: [{ label: 'FCFA', data: montants, backgroundColor: 'rgba(193,68,14,.75)', borderRadius: 6 }],
      },
      options: {
        responsive: true, plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: v => v >= 1e6 ? v/1e6+'M' : v >= 1000 ? v/1000+'k' : v } }, x: { grid: { display: false } } },
      },
    });

    // Taux de recouvrement
    const payees  = list.filter(c => c.statut === 'payée' || c.statut === 'payé').length;
    const attente = list.filter(c => c.statut === 'en attente').length;
    const retard  = list.filter(c => c.statut === 'en retard').length;

    const rCtx = document.getElementById('chart-cot-recouvrement');
    if (rCtx) new Chart(rCtx, {
      type: 'pie',
      data: {
        labels: ['Payées', 'En attente', 'En retard'],
        datasets: [{ data: [payees, attente, retard], backgroundColor: ['#2D7A3A', '#D4920A', '#DC2626'], borderWidth: 3, borderColor: '#fff' }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } } },
    });

  } catch (err) { console.warn('Stats cotisations:', err.message); }
}

/* ==============================
   PRÊTS
   ============================== */
function calcMensualite(montant, taux, duree) {
  if (!montant || !duree) return null;
  const M = Number(montant), r = (Number(taux) || 0) / 100 / 12, n = Number(duree);
  return r > 0 ? M * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1) : M / n;
}

async function loadPrets() {
  showTableLoading('pretsBody', 7);
  try {
    const data  = await apiCall('/prets');
    const list  = data?.data || data || [];
    const tbody = document.getElementById('pretsBody');

    if (!list.length) { showTableEmpty('pretsBody', 7, 'Aucun prêt enregistré'); return; }

    tbody.innerHTML = list.map(p => {
      const m = calcMensualite(p.montant, p.taux_interet, p.duree_mois);
      return `
        <tr>
          <td>${p.adherent?.nom || ''} ${p.adherent?.prenom || ''}</td>
          <td>${fmtFCFA(p.montant)}</td>
          <td>${p.taux_interet ? p.taux_interet + '%' : '—'}</td>
          <td>${p.duree_mois ? p.duree_mois + ' mois' : '—'}</td>
          <td>${m ? fmtFCFA(Math.round(m)) : '—'}</td>
          <td>${badgeStatut(p.statut)}</td>
          <td>
            <button class="icon-btn" onclick="openEditPret(${p.id})"><i class="fas fa-pen"></i></button>
            <button class="icon-btn" style="margin-left:4px" onclick="deletePret(${p.id})"><i class="fas fa-trash"></i></button>
          </td>
        </tr>`;
    }).join('');

  } catch (err) {
    showTableError('pretsBody', 7, err.message);
    toast('Erreur prêts : ' + err.message, 'error');
  }
}

async function savePret() {
  const form   = document.getElementById('modal-pret');
  const sels   = form.querySelectorAll('select');
  const inputs = form.querySelectorAll('input');
  const body   = {
    adherent_id:  sels[0]?.value,
    montant:      inputs[0]?.value,
    taux_interet: inputs[1]?.value,
    duree_mois:   inputs[2]?.value,
    date_debut:   inputs[3]?.value,
    statut:       sels[1]?.value,
  };
  try {
    const id = form.dataset.editId;
    if (id) {
      await apiCall(`/prets/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Prêt modifié', 'success');
    } else {
      await apiCall('/prets', { method: 'POST', body: JSON.stringify(body) });
      toast('Prêt enregistré', 'success');
    }
    closeModal('modal-pret');
    delete form.dataset.editId;
    loadPrets();
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function openEditPret(id) {
  try {
    const p      = await apiCall(`/prets/${id}`);
    const form   = document.getElementById('modal-pret');
    const inputs = form.querySelectorAll('input');
    const sels   = form.querySelectorAll('select');
    inputs[0].value = p.montant      || '';
    inputs[1].value = p.taux_interet || '';
    inputs[2].value = p.duree_mois   || '';
    inputs[3].value = p.date_debut   ? p.date_debut.slice(0, 10) : '';
    sels[1].value   = p.statut       || 'en attente';
    form.dataset.editId = id;
    openModal('modal-pret');
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function deletePret(id) {
  confirmDelete('ce prêt', async () => {
    try {
      await apiCall(`/prets/${id}`, { method: 'DELETE' });
      toast('Prêt supprimé', 'warning');
      loadPrets();
    } catch (err) { toast('Erreur : ' + err.message, 'error'); }
  });
}

/* ==============================
   SINISTRES
   ============================== */
async function loadSinistres() {
  showTableLoading('sinistresBody', 7);
  try {
    const data  = await apiCall('/sinistres');
    const list  = data?.data || data || [];
    const tbody = document.getElementById('sinistresBody');

    if (!list.length) { showTableEmpty('sinistresBody', 7, 'Aucun sinistre déclaré'); return; }

    tbody.innerHTML = list.map(s => `
      <tr>
        <td>${s.adherent?.nom || ''} ${s.adherent?.prenom || ''}</td>
        <td><span class="badge b-indigo">${s.type || '—'}</span></td>
        <td>${s.description || '—'}</td>
        <td>${fmtDate(s.date_sinistre)}</td>
        <td>${s.montant_reclame ? fmtFCFA(s.montant_reclame) : 'En évaluation'}</td>
        <td>${badgeStatut(s.statut)}</td>
        <td>
          <button class="icon-btn" onclick="openEditSinistre(${s.id})"><i class="fas fa-pen"></i></button>
          <button class="icon-btn" style="margin-left:4px" onclick="deleteSinistre(${s.id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');

  } catch (err) {
    showTableError('sinistresBody', 7, err.message);
    toast('Erreur sinistres : ' + err.message, 'error');
  }
}

async function saveSinistre() {
  const form   = document.getElementById('modal-sinistre');
  const sels   = form.querySelectorAll('select');
  const inputs = form.querySelectorAll('input');
  const ta     = form.querySelector('textarea');
  const body   = {
    adherent_id:   sels[0]?.value,
    description:   ta?.value,
    type:          sels[1]?.value,
    date_sinistre: inputs[0]?.value,
    statut:        sels[2]?.value,
  };
  try {
    const id = form.dataset.editId;
    if (id) {
      await apiCall(`/sinistres/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Sinistre modifié', 'success');
    } else {
      await apiCall('/sinistres', { method: 'POST', body: JSON.stringify(body) });
      toast('Sinistre enregistré', 'success');
    }
    closeModal('modal-sinistre');
    delete form.dataset.editId;
    loadSinistres();
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function openEditSinistre(id) {
  try {
    const s      = await apiCall(`/sinistres/${id}`);
    const form   = document.getElementById('modal-sinistre');
    const sels   = form.querySelectorAll('select');
    const inputs = form.querySelectorAll('input');
    const ta     = form.querySelector('textarea');
    if (ta) ta.value = s.description || '';
    inputs[0].value = s.date_sinistre ? s.date_sinistre.slice(0, 10) : '';
    sels[1].value   = s.type   || 'Maladie';
    sels[2].value   = s.statut || 'déclaré';
    form.dataset.editId = id;
    openModal('modal-sinistre');
  } catch (err) { toast('Erreur : ' + err.message, 'error'); }
}

async function deleteSinistre(id) {
  confirmDelete('ce sinistre', async () => {
    try {
      await apiCall(`/sinistres/${id}`, { method: 'DELETE' });
      toast('Sinistre supprimé', 'warning');
      loadSinistres();
    } catch (err) { toast('Erreur : ' + err.message, 'error'); }
  });
}

/* ==============================
   ALERTES
   ============================== */
async function loadAlertes() {
  try {
    const [alertes] = await Promise.all([ apiCall('/alertes') ]);
    const list = alertes?.data
      || (Array.isArray(alertes) ? alertes : [...(alertes?.cotisations_retard || []), ...(alertes?.prets_echeance || [])])
      || [];

    const retards   = list.filter(a => a.type?.includes('retard') || a.type?.includes('cotisation'));
    const echeances = list.filter(a => a.type?.includes('pret')   || a.type?.includes('prêt'));

    // Cartes résumé
    const dangerVal  = document.querySelector('.alert-card.danger  .alert-card-val');
    const warningVal = document.querySelector('.alert-card.warning .alert-card-val');
    if (dangerVal)  dangerVal.textContent  = retards.length;
    if (warningVal) warningVal.textContent  = echeances.length;

    // Badge sidebar
    const badge = document.getElementById('badge-alertes');
    if (badge) badge.textContent = list.length;

    // Tableau retards cotisations
    const tbody = document.getElementById('alertes-cot-body');
    if (tbody) {
      tbody.innerHTML = retards.length
        ? retards.slice(0, 10).map(a => `
            <tr>
              <td><strong>${a.adherent?.nom || a.nom || '—'}</strong></td>
              <td>${a.adherent?.email || a.email || '—'}</td>
              <td>${fmtFCFA(a.montant)}</td>
              <td>${fmtDate(a.date_echeance)}</td>
              <td>${badgeStatut('en retard')}</td>
              <td><button class="btn btn-xs btn-primary" onclick="openModal('modal-cotisation')">Régulariser</button></td>
            </tr>`).join('')
        : `<tr><td colspan="6" class="loading-row">Aucun retard de cotisation 🎉</td></tr>`;
    }

  } catch (err) {
    toast('Erreur alertes : ' + err.message, 'error');
  }
}

/* ==============================
   CALCULATEUR DE PRÊT
   ============================== */
function calculateLoan() {
  const M = parseFloat(document.getElementById('calc-montant')?.value) || 0;
  const r = (parseFloat(document.getElementById('calc-taux')?.value)   || 0) / 100 / 12;
  const n = parseInt(document.getElementById('calc-duree')?.value)     || 0;
  if (!M || !n) return;

  const mensualite = r > 0 ? M * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1) : M / n;
  const total      = mensualite * n;
  const interets   = total - M;
  const fmt        = v => Math.round(v).toLocaleString('fr-FR') + ' FCFA';

  document.getElementById('res-mensualite').textContent = fmt(mensualite);
  document.getElementById('res-interets').textContent   = fmt(interets);
  document.getElementById('res-total').textContent      = fmt(total);
  document.getElementById('res-cout').textContent       = (interets / M * 100).toFixed(1) + '%';
}

/* ==============================
   EXPORT — déclenche le téléchargement via le backend
   ============================== */
function exportData(module, format) {
  const token = getToken();
  if (!token) { toast('Non authentifié', 'error'); return; }
  toast(`Export ${module} en ${format.toUpperCase()} en cours…`, 'success');
  const a    = document.createElement('a');
  a.href     = `${API_URL}/${module}/export?format=${format}&token=${encodeURIComponent(token)}`;
  a.download = `${module}_${new Date().toISOString().slice(0,10)}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ==============================
   PROFIL
   ============================== */
async function saveProfile() {
  const form   = document.getElementById('modal-profil');
  const inputs = form.querySelectorAll('input');
  const user   = getCurrentUser();
  const body   = {
    name:      `${inputs[0]?.value || ''} ${inputs[1]?.value || ''}`.trim(),
    email:     inputs[2]?.value || '',
    telephone: inputs[3]?.value || '',
  };
  try {
    await apiCall('/me', { method: 'PUT', body: JSON.stringify(body) });
    const updated = { ...user, ...body };
    localStorage.setItem('mamutuelle_user',  JSON.stringify(updated));
    sessionStorage.setItem('mamutuelle_user', JSON.stringify(updated));
    toast('Profil mis à jour', 'success');
    closeModal('modal-profil');
    injectUserInfo();
  } catch (err) {
    // Fallback : /me n'existe pas encore, on met à jour localement
    const updated = { ...user, ...body };
    localStorage.setItem('mamutuelle_user',  JSON.stringify(updated));
    sessionStorage.setItem('mamutuelle_user', JSON.stringify(updated));
    toast('Profil mis à jour (local)', 'success');
    closeModal('modal-profil');
    injectUserInfo();
  }
}

/* ==============================
   INITIALISATION
   ============================== */
document.addEventListener('DOMContentLoaded', async () => {

  injectUserInfo();
  initSubmenus();
  initSidebarToggle();
  initModals();
  initConfirmDelete();
  initSearch();
  initFilterButtons();
  initSearchBoxes();
  initPeriodButtons();
  updateDate();

  // Vue d'ensemble par défaut
  showSection('overview');

  // Cache recherche en arrière-plan
  buildSearchCache();
});
