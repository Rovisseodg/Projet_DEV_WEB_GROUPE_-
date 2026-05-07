/* ============================================================
   ADHERENT-DASHBOARD.JS – MaMutuelle
   Dépendances : api.js (apiCall, isAuthenticated, logout, getToken)
   Routes backend : /api/mes-* (CheckAdherent middleware)
   ============================================================ */

/* ==============================
   GUARD
   ============================== */
if (!isAuthenticated()) {
  window.location.href = 'login.html';
}


/* ==============================
   ÉTAT GLOBAL
   ============================== */
let _overview        = null;   // cache réponse /api/mon-tableau-de-bord
let _cotisations     = [];     // cache liste cotisations
let _prets           = [];     // cache liste prêts
let _sinistres       = [];     // cache liste sinistres
let _ayants          = [];     // cache ayants droit
let _editAyantId     = null;   // id ayant droit en édition
let _amortissementPretId = null; // prêt sélectionné pour l'amortissement

/* ==============================
   TITRES / SOUS-TITRES
   ============================== */
const TITLES = {
  overview:           'Mon tableau de bord',
  alertes:            'Mes alertes',
  cotisations:        'Mes cotisations',
  prets:              'Mes prêts',
  amortissement:      "Tableau d'amortissement",
  'demande-pret':     'Demande de prêt',
  sinistres:          'Mes sinistres',
  'declarer-sinistre':'Déclarer un sinistre',
  'ayants-droit':     'Mes ayants droit',
  profil:             'Mon profil',
};

const SUBS = {
  overview:           'Bienvenue sur votre espace personnel',
  alertes:            'Retards et échéances à surveiller',
  cotisations:        'Historique de vos paiements',
  prets:              'Suivi de vos prêts en cours',
  amortissement:      'Détail de vos remboursements mois par mois',
  'demande-pret':     'Soumettez une nouvelle demande de financement',
  sinistres:          'Vos déclarations et remboursements',
  'declarer-sinistre':'Déclarez un nouvel événement',
  'ayants-droit':     'Personnes couvertes par votre adhésion',
  profil:             'Vos informations personnelles',
};

/* ==============================
   NAVIGATION
   ============================== */
const SECTION_LOADERS = {
  overview:           loadOverview,
  alertes:            loadAlertes,
  cotisations:        loadCotisations,
  prets:              loadPrets,
  amortissement:      loadAmortissementDefault,
  sinistres:          loadSinistres,
  'ayants-droit':     loadAyantsDroit,
  profil:             loadProfil,
  'demande-pret':     simulerPret,
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
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
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

function confirmDelete(label, callback) {
  const msgEl = document.getElementById('confirm-msg');
  if (msgEl) msgEl.textContent = `Supprimer ${label} ? Cette action est irréversible.`;
  window._deleteCallback = callback || null;
  openModal('modal-confirm');
}

function initConfirmBtn() {
  const btn = document.getElementById('confirm-btn');
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
  setTimeout(() => el.remove(), 4200);
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

function joursRetard(dateEcheance) {
  if (!dateEcheance) return 0;
  const diff = Math.floor((new Date() - new Date(dateEcheance)) / 86400000);
  return diff > 0 ? diff : 0;
}

function badgeStatut(statut) {
  if (!statut) return '<span class="badge b-gray">—</span>';
  const map = {
    'payée': 'b-green', 'payé': 'b-green', 'remboursé': 'b-green', 'approuvé': 'b-green', 'actif': 'b-green',
    'en attente': 'b-gold', 'en cours': 'b-gold', 'déclaré': 'b-gold',
    'en retard': 'b-red', 'suspendu': 'b-red', 'rejeté': 'b-red',
    'retraite': 'b-gray', 'annulé': 'b-gray',
  };
  const cls = map[statut.toLowerCase()] || 'b-gray';
  return `<span class="badge ${cls}">${statut}</span>`;
}

function initiales(nom, prenom) {
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase() || '?';
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

function showLoading(id, cols, msg = 'Chargement…') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = cols
    ? `<tr><td colspan="${cols}" class="loading-row"><i class="fas fa-spinner fa-spin"></i> ${msg}</td></tr>`
    : `<div class="loading-row"><i class="fas fa-spinner fa-spin"></i> ${msg}</div>`;
}

function showError(id, cols, msg) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = cols
    ? `<tr><td colspan="${cols}" class="loading-row" style="color:var(--red)"><i class="fas fa-exclamation-circle"></i> ${msg}</td></tr>`
    : `<div class="loading-row" style="color:var(--red)"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
}

/* ==============================
   FILTRES COTISATIONS
   ============================== */
function initFilterButtons() {
  document.querySelectorAll('.sec-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sec-filters .filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filtre = this.dataset.filtre;
      renderCotisations(filtre ? _cotisations.filter(c => c.statut === filtre) : _cotisations);
    });
  });
}

/* ==============================
   OVERVIEW — GET /api/mon-tableau-de-bord
   ============================== */
async function loadOverview() {
  try {
    const data = await apiCall('/mon-tableau-de-bord');
    _overview  = data;
    const a    = data.adherent;

    // ── Carte membre ──
    setEl('cm-numero', a.numero_adherent);
    setEl('cm-nom',    `${a.prenom} ${a.nom}`);
    setEl('cm-depuis', a.date_inscription ? fmtDate(a.date_inscription) : '—');
    setEl('cm-ville',  a.ville || '—');

    const statutBadge = document.getElementById('cm-statut');
    if (statutBadge) {
      statutBadge.textContent = a.statut || 'Actif';
      statutBadge.className   = 'cm-statut-badge ' + (a.statut || 'actif').toLowerCase().replace('é','e');
    }

    // ── Sidebar ──
    setEl('sb-numero', 'N° ' + (a.numero_adherent || '—'));
    setEl('sb-name',   `${a.prenom} ${a.nom}`);
    setEl('sb-user-name', `${a.prenom} ${a.nom}`);

    const sbStatut = document.getElementById('sb-statut');
    if (sbStatut) {
      sbStatut.textContent = a.statut || 'Actif';
      sbStatut.className   = 'sb-card-statut ' + (a.statut || 'actif').toLowerCase().replace('é','e');
    }

    const avatarEl = document.getElementById('sb-avatar');
    if (avatarEl) avatarEl.textContent = initiales(a.nom, a.prenom);

    // ── Stats cards ──
    const s = data.stats;
    setEl('st-cot-payees',  s.cotisations_payees);
    setEl('st-cot-sub',     `${fmtFCFA(s.total_cotise_annee)} cette année`);
    setEl('st-sinistres',   s.sinistres_ouverts);
    setEl('st-ayants',      s.nb_ayants_droit);

    if (s.pret_actif && data.pret_actif) {
      setEl('st-pret',     fmtFCFA(data.pret_actif.montant_restant));
      setEl('st-pret-sub', `${data.pret_actif.progression_pct}% remboursé`);
    } else {
      setEl('st-pret', 'Aucun');
      setEl('st-pret-sub', 'pas de prêt actif');
    }

    // ── Alertes bannières ──
    renderAlerteBannieres(data.alertes || []);

    // ── Badge sidebar ──
    const badge = document.getElementById('badge-alertes');
    if (badge) {
      const nb = (data.alertes || []).length;
      badge.textContent    = nb;
      badge.style.display  = nb > 0 ? 'inline-block' : 'none';
    }

    // ── Dot header ──
    const hdrBtn = document.getElementById('hdr-alerte-btn');
    if (hdrBtn) {
      const hasDot = (data.alertes || []).some(a => a.type === 'danger');
      hdrBtn.innerHTML = `<i class="fas fa-bell"></i>${hasDot ? '<span class="dot"></span>' : ''}`;
    }

    // ── Prochaines échéances ──
    renderProchainesEcheances(data);

    // ── Prêt actif overview ──
    renderPretOverview(data.pret_actif);

  } catch (err) {
    toast('Erreur chargement tableau de bord : ' + err.message, 'error');
  }
}

function renderAlerteBannieres(alertes) {
  const container = document.getElementById('alertes-container');
  if (!container) return;
  if (!alertes.length) { container.innerHTML = ''; return; }

  container.innerHTML = alertes.map(a => `
    <div class="alerte-banner ${a.type}">
      <i class="fas fa-${a.type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
      <span>${a.message}</span>
      <span class="ab-action" onclick="showSection('${a.section}')">Voir →</span>
    </div>`).join('');
}

function renderProchainesEcheances(data) {
  const el = document.getElementById('prochaines-echeances');
  if (!el) return;

  const items = [];

  if (data.prochaine_cotisation) {
    const c = data.prochaine_cotisation;
    items.push(`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--gray-2)">
        <div>
          <div style="font-size:.82rem;font-weight:600;color:var(--dark)"><i class="fas fa-coins" style="color:var(--gold);margin-right:6px"></i>Cotisation</div>
          <div style="font-size:.75rem;color:var(--gray-4);margin-top:2px">Échéance le ${fmtDate(c.date_echeance)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;color:var(--dark)">${fmtFCFA(c.montant)}</div>
          ${badgeStatut(c.statut)}
        </div>
      </div>`);
  }

  if (data.pret_actif?.prochaine_mensualite) {
    const m = data.pret_actif.prochaine_mensualite;
    items.push(`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
        <div>
          <div style="font-size:.82rem;font-weight:600;color:var(--dark)"><i class="fas fa-hand-holding-usd" style="color:var(--sienna);margin-right:6px"></i>Mensualité prêt</div>
          <div style="font-size:.75rem;color:var(--gray-4);margin-top:2px">Échéance le ${fmtDate(m.date_echeance)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700;color:var(--dark)">${fmtFCFA(m.montant)}</div>
          ${badgeStatut(m.statut)}
        </div>
      </div>`);
  }

  el.innerHTML = items.length
    ? items.join('')
    : '<div style="text-align:center;color:var(--gray-4);font-size:.85rem;padding:16px 0"><i class="fas fa-check-circle" style="color:var(--kente-green);margin-right:6px"></i>Aucune échéance imminente</div>';
}

function renderPretOverview(pret) {
  const el = document.getElementById('pret-actif-overview');
  if (!el) return;

  if (!pret) {
    el.innerHTML = `
      <div style="text-align:center;padding:16px 0">
        <div style="font-size:1.5rem;margin-bottom:8px">💳</div>
        <div style="font-size:.85rem;color:var(--gray-4)">Aucun prêt actif</div>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="showSection('demande-pret')">
          <i class="fas fa-plus"></i> Faire une demande
        </button>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:.82rem;color:var(--dark-2)">Montant initial : <strong>${fmtFCFA(pret.montant_initial)}</strong></span>
        <span style="font-size:.82rem;color:var(--gray-4)">${pret.mensualites_payees} / ${pret.duree_mois} mois</span>
      </div>
      <div class="progress-bar" style="margin-bottom:6px">
        <div class="progress-fill pf-sienna" style="width:${pret.progression_pct}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:.75rem;color:var(--kente-green);font-weight:600">${fmtFCFA(pret.montant_rembourse)} remboursé</span>
        <span style="font-size:.75rem;color:var(--sienna);font-weight:600">${fmtFCFA(pret.montant_restant)} restant</span>
      </div>
    </div>
    <button class="btn btn-ghost btn-sm" style="width:100%" onclick="showSection('amortissement')">
      <i class="fas fa-table"></i> Voir le tableau d'amortissement
    </button>`;
}

/* ==============================
   ALERTES — GET /api/mon-tableau-de-bord
   ============================== */
async function loadAlertes() {
  const el = document.getElementById('alertes-full-list');
  if (!el) return;

  try {
    const data   = _overview || await apiCall('/mon-tableau-de-bord');
    const alertes = data.alertes || [];

    if (!alertes.length) {
      el.innerHTML = `
        <div class="tcard" style="padding:32px;text-align:center">
          <div style="font-size:2rem;margin-bottom:10px">🎉</div>
          <div style="font-size:.95rem;font-weight:600;color:var(--dark)">Tout est en ordre !</div>
          <div style="font-size:.82rem;color:var(--gray-4);margin-top:6px">Aucune alerte pour le moment.</div>
        </div>`;
      return;
    }

    el.innerHTML = alertes.map(a => `
      <div class="alerte-banner ${a.type}" style="margin-bottom:10px;border-radius:var(--rad-lg)">
        <i class="fas fa-${a.type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}" style="font-size:1.2rem"></i>
        <div>
          <div style="font-weight:600">${a.message}</div>
          <div style="font-size:.75rem;opacity:.75;margin-top:2px">Cliquez pour régulariser</div>
        </div>
        <button class="btn btn-sm btn-ghost" style="margin-left:auto" onclick="showSection('${a.section}')">
          Voir <i class="fas fa-arrow-right"></i>
        </button>
      </div>`).join('');

  } catch (err) {
    el.innerHTML = `<div class="loading-row" style="color:var(--red)">Erreur : ${err.message}</div>`;
  }
}

/* ==============================
   COTISATIONS — GET /api/mes-cotisations
   ============================== */
async function loadCotisations() {
  showLoading('cotisations-body', 7);
  try {
    const data    = await apiCall('/mes-cotisations');
    _cotisations  = data.cotisations || [];
    const resume  = data.resume || {};

    setEl('cot-total-paye',  fmtFCFA(resume.total_paye));
    setEl('cot-en-attente',  resume.en_attente ?? 0);
    setEl('cot-en-retard',   resume.en_retard  ?? 0);

    renderCotisations(_cotisations);

  } catch (err) {
    showError('cotisations-body', 7, err.message);
    toast('Erreur cotisations : ' + err.message, 'error');
  }
}

function renderCotisations(list) {
  const tbody = document.getElementById('cotisations-body');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-row">Aucune cotisation trouvée</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const retard = c.jours_retard || joursRetard(c.date_echeance);
    return `
      <tr>
        <td>${fmtDate(c.date_echeance)}</td>
        <td><strong>${fmtFCFA(c.montant)}</strong></td>
        <td>${c.mode_paiement || '—'}</td>
        <td style="font-family:var(--mono);font-size:.78rem">${c.reference_paiement || '—'}</td>
        <td>${c.date_paiement ? fmtDate(c.date_paiement) : '—'}</td>
        <td>${retard > 0 && c.statut !== 'payée' ? `<span class="badge b-red">${retard} j</span>` : '—'}</td>
        <td>${badgeStatut(c.statut)}</td>
      </tr>`;
  }).join('');
}

/* ==============================
   PRÊTS — GET /api/mes-prets
   ============================== */
async function loadPrets() {
  const el = document.getElementById('prets-list');
  showLoading('prets-list', null);

  try {
    const data = await apiCall('/mes-prets');
    _prets     = data.prets || [];

    if (!_prets.length) {
      el.innerHTML = `
        <div class="tcard" style="padding:32px;text-align:center">
          <div style="font-size:2rem;margin-bottom:10px">💳</div>
          <div style="font-size:.95rem;font-weight:600">Aucun prêt enregistré</div>
          <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="showSection('demande-pret')">
            <i class="fas fa-plus"></i> Faire une demande
          </button>
        </div>`;
      return;
    }

    el.innerHTML = _prets.map(p => `
      <div class="tcard" style="margin-bottom:16px;padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--dark)">${fmtFCFA(p.montant)}</div>
            <div style="font-size:.78rem;color:var(--gray-4);margin-top:3px">
              ${p.taux_interet ? p.taux_interet + '% · ' : ''}${p.duree_mois} mois
              · Début ${fmtDate(p.date_debut)}
              ${p.date_fin ? '· Fin ' + fmtDate(p.date_fin) : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            ${badgeStatut(p.statut)}
            ${p.statut === 'approuvé' ? `
              <button class="btn btn-sm btn-ghost" onclick="loadAmortissement(${p.id})">
                <i class="fas fa-table"></i> Amortissement
              </button>` : ''}
          </div>
        </div>

        ${p.statut === 'approuvé' ? `
          <div style="margin-bottom:12px">
            <div class="progress-head">
              <span class="progress-label">Progression du remboursement</span>
              <span class="progress-pct">${p.progression_pct}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill pf-sienna" style="width:${p.progression_pct}%"></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            <div style="text-align:center;padding:10px;background:var(--kente-l);border-radius:var(--rad)">
              <div style="font-size:.68rem;font-weight:700;color:var(--gray-4);text-transform:uppercase;letter-spacing:.5px">Remboursé</div>
              <div style="font-size:.95rem;font-weight:800;color:var(--kente-green)">${fmtFCFA(p.montant_rembourse)}</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--sienna-l);border-radius:var(--rad)">
              <div style="font-size:.68rem;font-weight:700;color:var(--gray-4);text-transform:uppercase;letter-spacing:.5px">Restant dû</div>
              <div style="font-size:.95rem;font-weight:800;color:var(--sienna)">${fmtFCFA(p.montant_restant)}</div>
            </div>
            <div style="text-align:center;padding:10px;background:var(--gold-l);border-radius:var(--rad)">
              <div style="font-size:.68rem;font-weight:700;color:var(--gray-4);text-transform:uppercase;letter-spacing:.5px">Mensualité</div>
              <div style="font-size:.95rem;font-weight:800;color:var(--gold-d)">${fmtFCFA(p.mensualite_theorique)}</div>
            </div>
          </div>
          ${p.prochaine_echeance ? `
            <div style="margin-top:12px;padding:10px 14px;background:var(--gray-1);border-radius:var(--rad);font-size:.82rem;display:flex;justify-content:space-between;align-items:center">
              <span><i class="fas fa-calendar-check" style="color:var(--sienna);margin-right:6px"></i>
              Prochaine mensualité : <strong>${fmtDate(p.prochaine_echeance.date_echeance)}</strong></span>
              <strong>${fmtFCFA(p.prochaine_echeance.montant)}</strong>
            </div>` : ''}` : `
          <div style="font-size:.82rem;color:var(--gray-4);font-style:italic">
            ${p.statut === 'en attente' ? 'En attente d\'approbation par l\'administrateur.' : ''}
            ${p.statut === 'remboursé'  ? 'Ce prêt a été entièrement remboursé.' : ''}
            ${p.statut === 'rejeté'     ? 'Cette demande a été rejetée.' : ''}
          </div>`}
      </div>`).join('');

  } catch (err) {
    showError('prets-list', null, err.message);
    toast('Erreur prêts : ' + err.message, 'error');
  }
}

/* ==============================
   AMORTISSEMENT — GET /api/mes-prets/{id}/amortissement
   ============================== */
async function loadAmortissement(pretId) {
  _amortissementPretId = pretId;
  showSection('amortissement');
}

async function loadAmortissementDefault() {
  // Si aucun prêt sélectionné, prendre le premier prêt approuvé
  if (!_amortissementPretId) {
    if (!_prets.length) await loadPrets();
    const actif = _prets.find(p => p.statut === 'approuvé');
    if (!actif) {
      document.getElementById('amort-body').innerHTML =
        `<tr><td colspan="8" class="loading-row">Aucun prêt approuvé. <a href="#" onclick="showSection('demande-pret')">Faire une demande</a></td></tr>`;
      return;
    }
    _amortissementPretId = actif.id;
  }

  showLoading('amort-body', 8);
  try {
    const data = await apiCall(`/mes-prets/${_amortissementPretId}/amortissement`);
    const pret = data.pret;
    const rows = data.amortissement || [];

    // Info en-tête
    const infoEl = document.getElementById('amort-pret-info');
    if (infoEl) infoEl.textContent =
      `${fmtFCFA(pret.montant)} · ${pret.taux_interet}% · ${pret.duree_mois} mois · Restant : ${fmtFCFA(pret.montant_restant)}`;

    const today = new Date().toISOString().slice(0, 10);

    document.getElementById('amort-body').innerHTML = rows.map((r, i) => {
      const isPaid  = r.statut === 'payé';
      const isNext  = !isPaid && r.date_echeance >= today && (i === 0 || rows[i-1].statut === 'payé');
      const cls     = isPaid ? 'paid' : isNext ? 'next' : 'future';

      return `
        <tr class="${cls}">
          <td style="font-family:var(--mono);font-size:.78rem">${r.numero_echeance}</td>
          <td>${fmtDate(r.date_echeance)}</td>
          <td><strong>${fmtFCFA(r.montant)}</strong></td>
          <td style="color:var(--red)">${fmtFCFA(r.interet)}</td>
          <td style="color:var(--kente-green)">${fmtFCFA(r.amortissement)}</td>
          <td>${fmtFCFA(r.capital_restant)}</td>
          <td>${r.date_paiement ? fmtDate(r.date_paiement) : '—'}</td>
          <td>${badgeStatut(r.statut || 'en attente')}</td>
        </tr>`;
    }).join('');

  } catch (err) {
    showError('amort-body', 8, err.message);
    toast('Erreur amortissement : ' + err.message, 'error');
  }
}

/* ==============================
   SIMULATEUR PRÊT (côté client)
   ============================== */
function simulerPret() {
  const M = parseFloat(document.getElementById('dem-montant')?.value) || 0;
  const n = parseInt(document.getElementById('dem-duree')?.value)     || 0;
  const r = 5 / 100 / 12; // taux estimé 5%

  if (!M || !n) {
    ['sim-mens', 'sim-int', 'sim-total'].forEach(id => setEl(id, '—'));
    return;
  }

  const mensualite = r > 0 ? M * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1) : M / n;
  const total      = mensualite * n;
  const interets   = total - M;

  setEl('sim-mens',  fmtFCFA(Math.round(mensualite)));
  setEl('sim-int',   fmtFCFA(Math.round(interets)));
  setEl('sim-total', fmtFCFA(Math.round(total)));
}

/* ==============================
   SOUMETTRE DEMANDE PRÊT — POST /api/mes-prets
   ============================== */
async function soumettreDemanderPret() {
  const errEl   = document.getElementById('dem-err');
  if (errEl) errEl.textContent = '';

  const montant  = document.getElementById('dem-montant')?.value;
  const duree    = document.getElementById('dem-duree')?.value;
  const motif    = document.getElementById('dem-motif')?.value;

  if (!montant || !duree) {
    if (errEl) errEl.textContent = 'Veuillez renseigner le montant et la durée.';
    return;
  }

  try {
    await apiCall('/mes-prets', {
      method: 'POST',
      body: JSON.stringify({ montant, duree_mois: duree, motif }),
    });
    toast('Demande de prêt soumise ! Elle sera examinée par notre équipe.', 'success');
    document.getElementById('dem-montant').value = '';
    document.getElementById('dem-duree').value   = '';
    document.getElementById('dem-motif').value   = '';
    ['sim-mens', 'sim-int', 'sim-total'].forEach(id => setEl(id, '—'));
    showSection('prets');
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

/* ==============================
   SINISTRES — GET /api/mes-sinistres
   ============================== */
async function loadSinistres() {
  showLoading('sinistres-list', null);
  try {
    const data  = await apiCall('/mes-sinistres');
    _sinistres  = data.sinistres || [];
    const r     = data.resume || {};

    setEl('sin-reclame',  fmtFCFA(r.total_reclame));
    setEl('sin-rembourse',fmtFCFA(r.total_rembourse));
    setEl('sin-ouverts',  (r.declares || 0) + (r.en_cours || 0));

    const el = document.getElementById('sinistres-list');
    if (!el) return;

    if (!_sinistres.length) {
      el.innerHTML = `
        <div class="tcard" style="padding:32px;text-align:center">
          <div style="font-size:2rem;margin-bottom:10px">🛡️</div>
          <div style="font-size:.95rem;font-weight:600">Aucun sinistre déclaré</div>
          <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="showSection('declarer-sinistre')">
            <i class="fas fa-plus"></i> Déclarer un sinistre
          </button>
        </div>`;
      return;
    }

    el.innerHTML = _sinistres.map(s => `
      <div class="tcard" style="margin-bottom:16px">
        <div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--gray-2);flex-wrap:wrap;gap:10px">
          <div>
            <span class="badge b-indigo" style="margin-right:8px">${s.type_sinistre || s.type || '—'}</span>
            <strong style="font-size:.92rem">${s.description?.slice(0, 60) || '—'}${(s.description?.length > 60) ? '…' : ''}</strong>
            <div style="font-size:.75rem;color:var(--gray-4);margin-top:3px">Déclaré le ${fmtDate(s.date_sinistre)}</div>
          </div>
          ${badgeStatut(s.statut)}
        </div>
        <div style="padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <span style="font-size:.72rem;color:var(--gray-4);font-weight:700;text-transform:uppercase">Réclamé</span>
            <div style="font-weight:700;color:var(--dark)">${fmtFCFA(s.montant_reclamation)}</div>
          </div>
          <div>
            <span style="font-size:.72rem;color:var(--gray-4);font-weight:700;text-transform:uppercase">Remboursé</span>
            <div style="font-weight:700;color:var(--kente-green)">${fmtFCFA(s.montant_remboursement)}</div>
          </div>
        </div>
        ${renderTimelineSinistre(s.statut)}
        ${s.prestations?.length ? `
          <div style="padding:12px 20px;background:var(--gray-1);border-top:1px solid var(--gray-2)">
            <div style="font-size:.75rem;font-weight:700;color:var(--gray-4);text-transform:uppercase;margin-bottom:8px">Prestations associées</div>
            ${s.prestations.map(p => `
              <div style="display:flex;justify-content:space-between;font-size:.82rem;padding:4px 0;border-bottom:1px solid var(--gray-2)">
                <span>${p.type_prestation || '—'} — ${p.description || ''}</span>
                <span style="display:flex;gap:8px;align-items:center">${fmtFCFA(p.montant)} ${badgeStatut(p.statut)}</span>
              </div>`).join('')}
          </div>` : ''}
      </div>`).join('');

  } catch (err) {
    showError('sinistres-list', null, err.message);
    toast('Erreur sinistres : ' + err.message, 'error');
  }
}

function renderTimelineSinistre(statut) {
  const steps = [
    { key: 'déclaré',   label: 'Déclaré',   icon: 'file-alt' },
    { key: 'en cours',  label: 'En cours',  icon: 'search' },
    { key: 'approuvé',  label: 'Approuvé',  icon: 'check-circle' },
    { key: 'remboursé', label: 'Remboursé', icon: 'hand-holding-usd' },
  ];

  const order  = steps.map(s => s.key);
  const current = order.indexOf((statut || '').toLowerCase());

  return `
    <div style="padding:14px 20px;display:flex;gap:0">
      ${steps.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const color  = done ? 'var(--kente-green)' : active ? 'var(--gold)' : 'var(--gray-3)';
        return `
          <div style="flex:1;text-align:center;position:relative">
            ${i < steps.length - 1 ? `<div style="position:absolute;top:12px;left:50%;right:-50%;height:2px;background:${done ? 'var(--kente-green)' : 'var(--gray-2)'}"></div>` : ''}
            <div style="width:26px;height:26px;border-radius:50%;background:${color};display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;position:relative;z-index:1">
              <i class="fas fa-${s.icon}"></i>
            </div>
            <div style="font-size:.65rem;font-weight:${active ? '700' : '500'};color:${active ? 'var(--dark)' : 'var(--gray-4)'};margin-top:4px">${s.label}</div>
          </div>`;
      }).join('')}
    </div>`;
}

/* ==============================
   DÉCLARER SINISTRE — POST /api/mes-sinistres
   ============================== */
async function declarerSinistre() {
  const errEl = document.getElementById('sin-err');
  if (errEl) errEl.textContent = '';

  const type        = document.getElementById('sin-type')?.value;
  const date        = document.getElementById('sin-date')?.value;
  const description = document.getElementById('sin-desc')?.value;
  const montant     = document.getElementById('sin-montant')?.value;

  if (!type) {
    if (errEl) errEl.textContent = 'Veuillez sélectionner un type de sinistre.';
    return;
  }
  if (!date) {
    if (errEl) errEl.textContent = 'Veuillez indiquer la date du sinistre.';
    return;
  }
  if (!description?.trim()) {
    if (errEl) errEl.textContent = 'Veuillez décrire le sinistre.';
    return;
  }

  try {
    await apiCall('/mes-sinistres', {
      method: 'POST',
      body: JSON.stringify({
        type_sinistre:      type,
        date_sinistre:      date,
        description,
        montant_reclamation: montant || null,
      }),
    });
    toast('Sinistre déclaré avec succès ! Notre équipe vous contactera.', 'success');
    document.getElementById('sin-type').value    = '';
    document.getElementById('sin-date').value    = '';
    document.getElementById('sin-desc').value    = '';
    document.getElementById('sin-montant').value = '';
    showSection('sinistres');
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

/* ==============================
   AYANTS DROIT — GET /api/mes-ayants-droit
   ============================== */
async function loadAyantsDroit() {
  const grid = document.getElementById('ayants-grid');
  if (grid) showLoading('ayants-grid', null);

  try {
    const data = await apiCall('/mes-ayants-droit');
    _ayants    = data.ayants_droit || [];

    if (!grid) return;

    if (!_ayants.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:32px;background:var(--white);border-radius:var(--rad-lg)">
          <div style="font-size:2rem;margin-bottom:10px">👨‍👩‍👧</div>
          <div style="font-size:.95rem;font-weight:600">Aucun ayant droit enregistré</div>
          <button class="btn btn-primary btn-sm" style="margin-top:14px" onclick="openModal('modal-ayant')">
            <i class="fas fa-plus"></i> Ajouter
          </button>
        </div>`;
      return;
    }

    grid.innerHTML = _ayants.map(a => {
      const init = initiales(a.nom, a.prenom);
      return `
        <div class="ayant-card">
          <div class="ayant-card-head">
            <div class="ayant-avatar">${init}</div>
            <div>
              <div class="ayant-name">${a.prenom || ''} ${a.nom || ''}</div>
              <div class="ayant-rel">${a.relation || '—'}</div>
            </div>
          </div>
          <div class="ayant-meta">
            <span>Né(e) :</span> ${a.date_naissance ? fmtDate(a.date_naissance) : '—'}
            ${a.age != null ? ` · <span>Âge :</span> ${a.age} ans` : ''}
          </div>
          <div style="margin-top:10px;display:flex;gap:6px">
            <button class="btn btn-xs btn-ghost" onclick="openEditAyant(${a.id})">
              <i class="fas fa-pen"></i> Modifier
            </button>
            <button class="btn btn-xs btn-danger" onclick="deleteAyant(${a.id}, '${(a.prenom || '')} ${(a.nom || '')}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    if (grid) showError('ayants-grid', null, err.message);
    toast('Erreur ayants droit : ' + err.message, 'error');
  }
}

function openEditAyant(id) {
  const a = _ayants.find(x => x.id === id);
  if (!a) return;
  _editAyantId = id;
  document.getElementById('ayant-nom').value      = a.nom      || '';
  document.getElementById('ayant-prenom').value   = a.prenom   || '';
  document.getElementById('ayant-relation').value = a.relation || 'conjoint';
  document.getElementById('ayant-dob').value      = a.date_naissance ? a.date_naissance.slice(0, 10) : '';
  document.getElementById('ayant-modal-title').textContent = 'Modifier l\'ayant droit';
  openModal('modal-ayant');
}

async function saveAyant() {
  const errEl = document.getElementById('ayant-err');
  if (errEl) errEl.textContent = '';

  const body = {
    nom:            document.getElementById('ayant-nom')?.value?.trim(),
    prenom:         document.getElementById('ayant-prenom')?.value?.trim(),
    relation:       document.getElementById('ayant-relation')?.value,
    date_naissance: document.getElementById('ayant-dob')?.value || null,
  };

  if (!body.nom || !body.prenom) {
    if (errEl) errEl.textContent = 'Nom et prénom requis.';
    return;
  }

  try {
    if (_editAyantId) {
      await apiCall(`/mes-ayants-droit/${_editAyantId}`, { method: 'PUT', body: JSON.stringify(body) });
      toast('Ayant droit modifié', 'success');
    } else {
      await apiCall('/mes-ayants-droit', { method: 'POST', body: JSON.stringify(body) });
      toast('Ayant droit ajouté', 'success');
    }
    closeModal('modal-ayant');
    _editAyantId = null;
    document.getElementById('ayant-modal-title').textContent = 'Ajouter un ayant droit';
    ['ayant-nom','ayant-prenom','ayant-dob'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    loadAyantsDroit();
    loadOverview(); // Mettre à jour le compteur
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

async function deleteAyant(id, nom) {
  confirmDelete(`l'ayant droit ${nom}`, async () => {
    try {
      await apiCall(`/mes-ayants-droit/${id}`, { method: 'DELETE' });
      toast('Ayant droit supprimé', 'warning');
      loadAyantsDroit();
      loadOverview();
    } catch (err) { toast('Erreur : ' + err.message, 'error'); }
  });
}

/* ==============================
   PROFIL — GET /api/mon-profil
   ============================== */
async function loadProfil() {
  try {
    const data = await apiCall('/mon-profil');
    const a    = data.adherent;
    const u    = data.user;

    const init = initiales(a.nom, a.prenom);

    setEl('profil-avatar', init);
    setEl('profil-nom',    `${a.prenom || ''} ${a.nom || ''}`);
    setEl('pm-numero',     a.numero_adherent || '—');
    setEl('pm-email',      a.email || u?.email || '—');
    setEl('pm-tel',        a.telephone || '—');
    setEl('pm-ville',      a.ville || '—');
    setEl('pm-adresse',    a.adresse || '—');
    setEl('pm-depuis',     a.date_inscription ? fmtDate(a.date_inscription) : '—');

    // Pré-remplir le formulaire de modification
    const setInput = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    setInput('edit-nom',     a.nom);
    setInput('edit-prenom',  a.prenom);
    setInput('edit-email',   a.email || u?.email);
    setInput('edit-tel',     a.telephone);
    setInput('edit-adresse', a.adresse);
    setInput('edit-ville',   a.ville);

  } catch (err) {
    toast('Erreur chargement profil : ' + err.message, 'error');
  }
}

/* ==============================
   SAUVEGARDER PROFIL — PUT /api/mon-profil
   ============================== */
async function saveProfil() {
  const errEl = document.getElementById('profil-err');
  if (errEl) errEl.textContent = '';

  const body = {
    nom:      document.getElementById('edit-nom')?.value?.trim(),
    prenom:   document.getElementById('edit-prenom')?.value?.trim(),
    email:    document.getElementById('edit-email')?.value?.trim(),
    telephone:document.getElementById('edit-tel')?.value?.trim(),
    adresse:  document.getElementById('edit-adresse')?.value?.trim(),
    ville:    document.getElementById('edit-ville')?.value?.trim(),
  };

  try {
    await apiCall('/mon-profil', { method: 'PUT', body: JSON.stringify(body) });
    toast('Profil mis à jour avec succès', 'success');
    closeModal('modal-profil');
    loadProfil();
    loadOverview();
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

/* ==============================
   MOT DE PASSE — PUT /api/mon-mot-de-passe
   ============================== */
async function savePassword() {
  const errEl = document.getElementById('pwd-err');
  if (errEl) errEl.textContent = '';

  const ancien  = document.getElementById('pwd-ancien')?.value;
  const nouveau = document.getElementById('pwd-nouveau')?.value;
  const confirm = document.getElementById('pwd-confirm')?.value;

  if (!ancien || !nouveau) {
    if (errEl) errEl.textContent = 'Veuillez remplir tous les champs.';
    return;
  }
  if (nouveau !== confirm) {
    if (errEl) errEl.textContent = 'Les nouveaux mots de passe ne correspondent pas.';
    return;
  }
  if (nouveau.length < 6) {
    if (errEl) errEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
    return;
  }

  try {
    await apiCall('/mon-mot-de-passe', {
      method: 'PUT',
      body: JSON.stringify({
        ancien_mot_de_passe:              ancien,
        nouveau_mot_de_passe:             nouveau,
        nouveau_mot_de_passe_confirmation: confirm,
      }),
    });
    toast('Mot de passe modifié avec succès', 'success');
    closeModal('modal-password');
    ['pwd-ancien', 'pwd-nouveau', 'pwd-confirm'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
  }
}

/* ==============================
   INITIALISATION
   ============================== */
document.addEventListener('DOMContentLoaded', async () => {
  initSubmenus();
  initSidebarToggle();
  initModals();
  initConfirmBtn();
  initFilterButtons();
  updateDate();

  // Charger la vue d'ensemble au démarrage
  showSection('overview');
});
