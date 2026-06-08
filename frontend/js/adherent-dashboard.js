/* ============================================================
   ADHERENT-DASHBOARD.JS – MaMutuelle
   Gestion du dashboard adhérent
   ============================================================ */

if (!isAuthenticated()) {
    window.location.href = 'login.html';
}

const user = getCurrentUser();
if (user?.role !== 'adherent') {
    window.location.href = 'dashboard.html';
}

function getCurrentUser() {
    try {
        return JSON.parse(
            localStorage.getItem('mamutuelle_user') ||
            sessionStorage.getItem('mamutuelle_user')
        );
    } catch {
        return null;
    }
}

/* ==============================
   INITIALISATION AU CHARGEMENT
   ============================== */
document.addEventListener('DOMContentLoaded', () => {
    injectUserInfo();
    initSidebar();
    initModals();
    showSection('overview');
    loadUserData();
    updateHeaderDate();
});

/* ==============================
   INJECTION INFO UTILISATEUR
   ============================== */
function injectUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    const name = user.name || 'Utilisateur';
    const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
    const email = user.email || '';

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    const setQ = (sel, val) => {
        const el = document.querySelector(sel);
        if (el) el.textContent = val;
    };

    set('sb-name', name);
    set('sb-user-name', name);
    setQ('.sb-avatar', initials);
    setQ('.profile-avatar', initials);
    setQ('.profile-name', name);
    document.getElementById('profil-nom').textContent = name;
    document.getElementById('profil-avatar').textContent = initials;
}

/* ==============================
   SIDEBAR NAVIGATION
   ============================== */
function initSidebar() {
    // Clics sur les items de navigation
    document.querySelectorAll('[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Sous-menus
    document.querySelectorAll('[data-toggle]').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const subId = toggle.dataset.toggle;
            const sub = document.getElementById(subId);
            if (!sub) return;

            const isOpen = sub.classList.contains('open');

            document.querySelectorAll('.nav-sub').forEach(s => s.classList.remove('open'));
            document.querySelectorAll('[data-toggle]').forEach(t => t.classList.remove('open'));

            if (!isOpen) {
                sub.classList.add('open');
                toggle.classList.add('open');
            }
        });
    });

    // Déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            window.location.href = 'login.html';
        });
    }
}

/* ==============================
   MODALS
   ============================== */
function initModals() {
    // Fermeture au clic sur overlay
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    });

    // Touches Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.overlay[style*="display: block"]').forEach(o => {
                o.style.display = 'none';
            });
        }
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleLogout(e) {
    e.preventDefault();
    logout();
    window.location.href = 'login.html';
}

/* ==============================
   AFFICHAGE DES SECTIONS
   ============================== */
function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('section-' + name);
    if (sec) sec.classList.add('active');

    document.querySelectorAll('[data-section]').forEach(el => el.classList.remove('active'));
    const ni = document.querySelector(`[data-section="${name}"]`);
    if (ni) ni.classList.add('active');

    // Charger les données si nécessaire
    if (name === 'overview') loadOverview();
    if (name === 'cotisations') loadCotisations();
    if (name === 'prets') loadPrets();
    if (name === 'amortissement') loadAmortissement();
    if (name === 'sinistres') loadSinistres();
    if (name === 'alertes') loadAlertes();
    if (name === 'ayants-droit') loadAyantsDroit();
    if (name === 'profil') initProfile();
}

/* ==============================
   CHARGEMENT DONNÉES UTILISATEUR
   ============================== */
async function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const adherentRes = await apiCall('/mon-profil', { method: 'GET' });
        if (adherentRes) {
            document.getElementById('sb-numero').textContent = adherentRes.numero_adherent || 'N/A';
            document.getElementById('sb-statut').textContent = adherentRes.statut || 'Actif';
            
            document.getElementById('cm-numero').textContent = adherentRes.numero_adherent || 'ADH-000';
            document.getElementById('cm-nom').textContent = adherentRes.nom || '—';
            document.getElementById('cm-depuis').textContent = adherentRes.date_inscription || '—';
            document.getElementById('cm-ville').textContent = adherentRes.ville || '—';
            
            document.getElementById('pm-numero').textContent = adherentRes.numero_adherent || '—';
            document.getElementById('pm-email').textContent = user.email || '—';
            document.getElementById('pm-tel').textContent = adherentRes.telephone || '—';
            document.getElementById('pm-ville').textContent = adherentRes.ville || '—';
            document.getElementById('pm-adresse').textContent = adherentRes.adresse || '—';
            document.getElementById('pm-depuis').textContent = adherentRes.date_inscription || '—';
        }
    } catch (err) {
        console.error('Erreur chargement données:', err);
    }
}

/* ==============================
   SECTIONS — OVERVIEW
   ============================== */
async function loadOverview() {
    try {
        const res = await apiCall('/mon-tableau-de-bord', { method: 'GET' });
        if (!res) return;

        const data = res.stats || {};
        
        document.getElementById('st-cot-payees').textContent = data.cotisations_payees || '—';
        document.getElementById('st-pret').textContent = data.pret_actif ? 'En cours' : '—';
        document.getElementById('st-sinistres').textContent = data.sinistres_ouverts || '—';
        document.getElementById('st-ayants').textContent = data.nb_ayants_droit || '—';
    } catch (err) {
        console.error('Erreur overview:', err);
    }
}

/* ==============================
   SECTIONS — COTISATIONS
   ============================== */
async function loadCotisations() {
    try {
        const res = await apiCall('/mes-cotisations', { method: 'GET' });
        if (!res) return;

        const tbody = document.getElementById('cotisations-body');
        const cotisations = res || [];

        if (cotisations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Aucune cotisation</td></tr>';
            return;
        }

        tbody.innerHTML = cotisations.map(c => `
            <tr>
                <td>${c.date_echeance || '-'}</td>
                <td>${c.montant || '-'} FCFA</td>
                <td>${c.mode_paiement || '-'}</td>
                <td>${c.reference_paiement || '-'}</td>
                <td>${c.date_paiement || '-'}</td>
                <td>${c.retard ? '⚠️ Oui' : '-'}</td>
                <td><span class="badge bg-${c.statut === 'payée' ? 'success' : c.statut === 'en retard' ? 'danger' : 'warning'}">${c.statut}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erreur cotisations:', err);
        const tbody = document.getElementById('cotisations-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-danger">Erreur chargement</td></tr>';
    }
}

/* ==============================
   SECTIONS — PRÊTS
   ============================== */
async function loadPrets() {
    try {
        const res = await apiCall('/mes-prets', { method: 'GET' });
        if (!res) return;

        const container = document.getElementById('prets-list');
        const prets = res || [];

        if (prets.length === 0) {
            container.innerHTML = '<div class="tcard" style="padding:40px;text-align:center;color:#999">Aucun prêt</div>';
            return;
        }

        container.innerHTML = prets.map(p => `
            <div class="tcard" style="margin-bottom:15px;padding:15px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:600">Montant: ${p.montant} FCFA</div>
                        <div style="font-size:.9rem;color:#666">Durée: ${p.duree_mois} mois | Taux: ${p.taux_interet}%</div>
                        <div style="font-size:.85rem;color:#999">Début: ${p.date_debut} | Fin: ${p.date_fin}</div>
                    </div>
                    <div style="text-align:right">
                        <span class="badge bg-${p.statut === 'approuvé' ? 'success' : p.statut === 'remboursé' ? 'secondary' : 'warning'}">${p.statut}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewPretAmortissement(${p.id})" style="margin-top:8px">
                            Détails
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Erreur prêts:', err);
        const container = document.getElementById('prets-list');
        if (container) container.innerHTML = '<div class="text-danger">Erreur chargement</div>';
    }
}

function viewPretAmortissement(pretId) {
    document.getElementById('selected-pret-id').value = pretId;
    loadAmortissement();
    showSection('amortissement');
}

/* ==============================
   SECTIONS — AMORTISSEMENT
   ============================== */
async function loadAmortissement() {
    const pretId = document.getElementById('selected-pret-id')?.value;
    if (!pretId) {
        const tbody = document.getElementById('amort-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Sélectionnez un prêt</td></tr>';
        return;
    }

    try {
        const res = await apiCall(`/mes-prets/${pretId}/amortissement`, { method: 'GET' });
        if (!res) return;

        const tbody = document.getElementById('amort-body');
        const echances = res.echances || [];

        if (echances.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Aucune échéance</td></tr>';
            return;
        }

        tbody.innerHTML = echances.map((e, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${e.date_echeance}</td>
                <td>${e.montant}</td>
                <td>${e.interets}</td>
                <td>${e.capital}</td>
                <td>${e.restant_du}</td>
                <td>${e.date_paiement || '-'}</td>
                <td><span class="badge bg-${e.statut === 'payée' ? 'success' : 'warning'}">${e.statut}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erreur amortissement:', err);
    }
}

/* ==============================
   SECTIONS — SINISTRES
   ============================== */
async function loadSinistres() {
    try {
        const res = await apiCall('/mes-sinistres', { method: 'GET' });
        if (!res) return;

        const container = document.getElementById('sinistres-list') || document.querySelector('[id*="sinistre"]');
        const sinistres = res || [];

        if (!container) return;

        if (sinistres.length === 0) {
            container.innerHTML = '<div class="tcard" style="padding:40px;text-align:center;color:#999">Aucun sinistre déclaré</div>';
            return;
        }

        container.innerHTML = sinistres.map(s => `
            <div class="tcard" style="margin-bottom:15px;padding:15px">
                <div style="display:flex;justify-content:space-between">
                    <div>
                        <div style="font-weight:600">${s.type_sinistre}</div>
                        <div style="font-size:.9rem;color:#666">${s.description}</div>
                        <div style="font-size:.85rem;color:#999">Date: ${s.date_sinistre}</div>
                    </div>
                    <div style="text-align:right">
                        <span class="badge bg-${s.statut === 'approuvé' ? 'success' : 'warning'}">${s.statut}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Erreur sinistres:', err);
    }
}

function declarerSinistre() {
    openModal('modal-sinistre');
}

/* ==============================
   SECTIONS — ALERTES
   ============================== */
async function loadAlertes() {
    console.log('Alertes non implémentées');
    const container = document.getElementById('alertes-full-list') || document.querySelector('[id*="alerte"]');
    if (container) {
        container.innerHTML = '<div class="tcard" style="padding:20px;text-align:center;color:#999">Aucune alerte</div>';
    }
}

/* ==============================
   SECTIONS — AYANTS DROIT
   ============================== */
async function loadAyantsDroit() {
    try {
        const res = await apiCall('/mes-ayants-droit', { method: 'GET' });
        if (!res) return;

        const container = document.getElementById('ayants-grid') || document.querySelector('[id*="ayant"]');
        const ayants = res || [];

        if (!container) return;

        if (ayants.length === 0) {
            container.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;color:#999">Aucun ayant droit</div>';
            return;
        }

        container.innerHTML = ayants.map(a => `
            <div class="tcard" style="padding:15px">
                <div style="display:flex;justify-content:space-between;align-items:start">
                    <div>
                        <div style="font-weight:600">${a.nom} ${a.prenom}</div>
                        <div style="font-size:.9rem;color:#666">Relation: ${a.relation}</div>
                        <div style="font-size:.85rem;color:#999">Né(e): ${a.date_naissance || '-'}</div>
                    </div>
                    <span class="badge bg-success">Couvert</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Erreur ayants droit:', err);
    }
}

/* ==============================
   PROFIL
   ============================== */
function initProfile() {
    const user = getCurrentUser();
    if (!user) return;

    const name = user.name || '';
    const parts = name.split(' ');
    const prenom = parts[0] || '';
    const nom = parts.slice(1).join(' ') || '';

    document.getElementById('edit-prenom').value = prenom;
    document.getElementById('edit-nom').value = nom;
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-tel').value = user.telephone || '';
}

async function saveProfil() {
    const nom = document.getElementById('edit-nom').value.trim();
    const prenom = document.getElementById('edit-prenom').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const tel = document.getElementById('edit-tel').value.trim();
    const adresse = document.getElementById('edit-adresse')?.value.trim() || '';
    const ville = document.getElementById('edit-ville')?.value.trim() || '';

    if (!nom || !prenom || !email) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        const res = await apiCall('/mon-profil', {
            method: 'PUT',
            body: JSON.stringify({ nom, prenom, email, telephone: tel, adresse, ville })
        });

        if (res) {
            showToast('Profil mis à jour', 'success');
            closeModal('modal-profil');
            const user = getCurrentUser();
            const newUser = { ...user, name: `${prenom} ${nom}`, email, telephone: tel };
            localStorage.setItem('mamutuelle_user', JSON.stringify(newUser));
            injectUserInfo();
        } else {
            showToast('Erreur', 'error');
        }
    } catch (err) {
        showToast('Erreur: ' + err.message, 'error');
    }
}

async function savePassword() {
    const ancien = document.getElementById('pwd-ancien').value;
    const nouveau = document.getElementById('pwd-nouveau').value;
    const confirm = document.getElementById('pwd-confirm').value;

    if (!ancien || !nouveau || !confirm) {
        showToast('Tous les champs sont obligatoires', 'error');
        return;
    }

    if (nouveau !== confirm) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    if (nouveau.length < 6) {
        showToast('Le mot de passe doit faire au moins 6 caractères', 'error');
        return;
    }

    try {
        const res = await apiCall('/mon-mot-de-passe', {
            method: 'PUT',
            body: JSON.stringify({ current_password: ancien, new_password: nouveau })
        });

        if (res) {
            showToast('Mot de passe changé', 'success');
            closeModal('modal-password');
            document.getElementById('pwd-ancien').value = '';
            document.getElementById('pwd-nouveau').value = '';
            document.getElementById('pwd-confirm').value = '';
        } else {
            showToast('Erreur', 'error');
        }
    } catch (err) {
        showToast('Erreur: ' + err.message, 'error');
    }
}

async function saveAyant() {
    const nom = document.getElementById('ayant-nom').value.trim();
    const prenom = document.getElementById('ayant-prenom').value.trim();
    const relation = document.getElementById('ayant-relation').value;
    const dob = document.getElementById('ayant-dob').value;

    if (!nom || !prenom || !dob) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

    try {
        const res = await apiCall('/mes-ayants-droit', {
            method: 'POST',
            body: JSON.stringify({ nom, prenom, relation, date_naissance: dob })
        });

        if (res) {
            showToast('Ayant droit ajouté', 'success');
            closeModal('modal-ayant');
            loadAyantsDroit();
        } else {
            showToast('Erreur', 'error');
        }
    } catch (err) {
        showToast('Erreur: ' + err.message, 'error');
    }
}

/* ==============================
   NOTIFICATIONS TOAST
   ============================== */
function showToast(msg, type = 'info') {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 12px 16px;
        margin: 8px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideIn 0.3s;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    
    wrap.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ==============================
   UTILITAIRES
   ============================== */
function updateHeaderDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('fr-FR', options);
    const headerDate = document.getElementById('hdr-date');
    if (headerDate) headerDate.textContent = dateStr;
}

function logout() {
    localStorage.removeItem('mamutuelle_token');
    localStorage.removeItem('mamutuelle_user');
    sessionStorage.removeItem('mamutuelle_token');
    sessionStorage.removeItem('mamutuelle_user');
}
