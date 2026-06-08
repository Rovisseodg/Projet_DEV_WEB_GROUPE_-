/* ============================================================
   ADHERENT-DASHBOARD.JS – MaMutuelle
   Gestion du dashboard adhérent
   ============================================================ */

// Protections au chargement
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
    console.log('Dashboard chargé');
    injectUserInfo();
    initSidebar();
    initModals();
    initFilterButtons();
    showSection('overview');
    loadUserData();
    updateHeaderDate();
});

/* ==============================
   INJECTION INFO UTILISATEUR
   ============================== */
function injectUserInfo() {
    const user = getCurrentUser();
    if (!user) {
        console.error('Pas d\'utilisateur trouvé');
        return;
    }

    const name = user.name || 'Utilisateur';
    const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('sb-name', name);
    set('sb-user-name', name);
    
    const avatars = document.querySelectorAll('.sb-avatar, .profile-avatar');
    avatars.forEach(a => a.textContent = initials);
    
    set('profil-nom', name);
    set('profil-avatar', initials);
}

/* ==============================
   SIDEBAR NAVIGATION
   ============================== */
function initSidebar() {
    // Clics sur les items de navigation principaux
    document.querySelectorAll('[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Sous-menus (toggle)
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
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
            window.location.href = 'login.html';
        });
    }
}

/* ==============================
   FILTRES COTISATIONS
   ============================== */
function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Mettre à jour l'état actif
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Recharger les cotisations avec le filtre
            loadCotisations();
        });
    });
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
            document.querySelectorAll('.overlay').forEach(o => {
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

/* ==============================
   AFFICHAGE DES SECTIONS
   ============================== */
function showSection(name) {
    // Masquer toutes les sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // Afficher la section demandée
    const sec = document.getElementById('section-' + name);
    if (sec) sec.classList.add('active');

    // Mettre à jour la navigation
    document.querySelectorAll('[data-section]').forEach(el => el.classList.remove('active'));
    const ni = document.querySelector(`[data-section="${name}"]`);
    if (ni) ni.classList.add('active');

    // Charger les données si nécessaire
    switch(name) {
        case 'overview':
            loadOverview();
            break;
        case 'cotisations':
            loadCotisations();
            break;
        case 'prets':
            loadPrets();
            break;
        case 'amortissement':
            loadAmortissement();
            break;
        case 'sinistres':
            loadSinistres();
            break;
        case 'alertes':
            loadAlertes();
            break;
        case 'ayants-droit':
            loadAyantsDroit();
            break;
        case 'profil':
            initProfile();
            break;
    }
}

/* ==============================
   CHARGEMENT DONNÉES UTILISATEUR
   ============================== */
async function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;

    try {
        const res = await apiCall('/mon-profil', { method: 'GET' });
        if (res && res.adherent) {
            const a = res.adherent;
            
            document.getElementById('sb-numero').textContent = a.numero_adherent || 'N/A';
            document.getElementById('sb-statut').textContent = a.statut || 'Actif';
            
            document.getElementById('cm-numero').textContent = a.numero_adherent || 'ADH-000';
            document.getElementById('cm-nom').textContent = (a.prenom + ' ' + a.nom).trim() || '—';
            document.getElementById('cm-depuis').textContent = a.date_inscription || '—';
            document.getElementById('cm-ville').textContent = a.ville || '—';
            
            document.getElementById('pm-numero').textContent = a.numero_adherent || '—';
            document.getElementById('pm-email').textContent = user.email || '—';
            document.getElementById('pm-tel').textContent = a.telephone || '—';
            document.getElementById('pm-ville').textContent = a.ville || '—';
            document.getElementById('pm-adresse').textContent = a.adresse || '—';
            document.getElementById('pm-depuis').textContent = a.date_inscription || '—';
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
        if (!res || !res.stats) {
            console.error('Réponse invalide pour overview');
            return;
        }

        const stats = res.stats;
        const adherent = res.adherent;
        
        // Mettre à jour stats cards
        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        
        setText('st-cot-payees', stats.cotisations_payees || 0);
        setText('st-pret', stats.pret_actif ? 'En cours' : 'Aucun');
        setText('st-sinistres', stats.sinistres_ouverts || 0);
        setText('st-ayants', stats.nb_ayants_droit || 0);

        // Mettre à jour carte adhérent
        setText('cm-numero', adherent.numero_adherent || 'ADH-000');
        setText('cm-nom', (adherent.prenom + ' ' + adherent.nom).trim() || '—');
        setText('cm-ville', adherent.ville || '—');

        // Prochaines échéances
        const econtainer = document.getElementById('prochaines-echeances');
        if (res.prochaine_cotisation) {
            const c = res.prochaine_cotisation;
            econtainer.innerHTML = `
                <div style="padding:8px 0">
                    <div style="font-weight:600">Cotisation</div>
                    <div style="font-size:.9rem;color:#666">Montant: ${c.montant || 0} FCFA</div>
                    <div style="font-size:.85rem;color:#999">Échéance: ${c.date_echeance || '—'}</div>
                </div>
            `;
        } else {
            econtainer.innerHTML = '<div class="text-muted">Aucune échéance</div>';
        }

        // Prêt actif
        const pcontainer = document.getElementById('pret-actif-overview');
        if (res.pret_actif && stats.pret_actif) {
            const p = res.pret_actif;
            const pct = p.progression_pct || 0;
            pcontainer.innerHTML = `
                <div style="margin-bottom:12px">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                        <span style="font-size:.9rem">Remboursement</span>
                        <span style="font-weight:600">${pct.toFixed(1)}%</span>
                    </div>
                    <div style="background:#eee;height:6px;border-radius:3px;overflow:hidden">
                        <div style="background:var(--gold);height:100%;width:${pct}%;transition:width 0.3s"></div>
                    </div>
                </div>
                <div style="font-size:.85rem;color:#666">
                    <div>Montant restant: ${p.montant_restant || 0} FCFA</div>
                    <div>Mensualités restantes: ${p.duree_mois - p.mensualites_payees || 0}</div>
                </div>
            `;
        } else {
            pcontainer.innerHTML = '<div class="text-muted">Aucun prêt actif</div>';
        }

    } catch (err) {
        console.error('Erreur overview:', err);
        showToast('Erreur chargement dashboard: ' + err.message, 'error');
    }
}

/* ==============================
   SECTIONS — COTISATIONS
   ============================== */
async function loadCotisations() {
    try {
        // Récupérer le filtre actif
        const activeFilter = document.querySelector('.filter-btn.active');
        const filtre = activeFilter ? activeFilter.dataset.filtre : '';
        
        const res = await apiCall(`/mes-cotisations${filtre ? '?statut=' + encodeURIComponent(filtre) : ''}`, { method: 'GET' });
        if (!res || !res.cotisations) {
            console.error('Réponse invalide pour cotisations');
            return;
        }

        const tbody = document.getElementById('cotisations-body');
        const cotisations = res.cotisations;

        // Mettre à jour résumé
        if (res.resume) {
            const setText = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };
            setText('cot-total-paye', (res.resume.total_paye || 0) + ' FCFA');
            setText('cot-en-attente', res.resume.en_attente || 0);
            setText('cot-en-retard', res.resume.en_retard || 0);
        }

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
                <td>${c.jours_retard ? '⚠️ ' + c.jours_retard + 'j' : '-'}</td>
                <td><span class="badge bg-${c.statut === 'payée' ? 'success' : c.statut === 'en retard' ? 'danger' : 'warning'}">${c.statut}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erreur cotisations:', err);
        const tbody = document.getElementById('cotisations-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Erreur chargement: ${err.message}</td></tr>`;
        showToast('Erreur cotisations: ' + err.message, 'error');
    }
}

/* ==============================
   SECTIONS — PRÊTS
   ============================== */
async function loadPrets() {
    try {
        const res = await apiCall('/mes-prets', { method: 'GET' });
        if (!res || !res.prets) {
            console.error('Réponse invalide pour prets');
            return;
        }

        const container = document.getElementById('prets-list');
        const prets = res.prets;

        if (prets.length === 0) {
            container.innerHTML = '<div class="tcard" style="padding:40px;text-align:center;color:#999">Aucun prêt</div>';
            return;
        }

        container.innerHTML = prets.map(p => `
            <div class="tcard" style="margin-bottom:15px;padding:15px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div style="flex:1">
                        <div style="font-weight:600">Montant: ${p.montant} FCFA</div>
                        <div style="font-size:.9rem;color:#666">Durée: ${p.duree_mois} mois | Taux: ${p.taux_interet || 0}%</div>
                        <div style="font-size:.85rem;color:#999">Début: ${p.date_debut} | Fin: ${p.date_fin || '—'}</div>
                        <div style="margin-top:8px">
                            <div style="font-size:.85rem;color:#666">Remboursement: ${p.progression_pct || 0}%</div>
                            <div style="background:#eee;height:4px;border-radius:2px;overflow:hidden;margin-top:4px">
                                <div style="background:var(--gold);height:100%;width:${p.progression_pct || 0}%;transition:width 0.3s"></div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right;margin-left:20px">
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
        if (container) container.innerHTML = `<div class="text-danger">Erreur chargement: ${err.message}</div>`;
        showToast('Erreur prêts: ' + err.message, 'error');
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
        if (!res || !res.amortissement) {
            console.error('Réponse invalide pour amortissement');
            return;
        }

        const tbody = document.getElementById('amort-body');
        const echances = res.amortissement;

        if (echances.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Aucune échéance</td></tr>';
            return;
        }

        tbody.innerHTML = echances.map((e, i) => `
            <tr>
                <td>${e.numero_echeance || i + 1}</td>
                <td>${e.date_echeance}</td>
                <td>${e.montant}</td>
                <td>${e.interet}</td>
                <td>${e.amortissement}</td>
                <td>${e.capital_restant}</td>
                <td>${e.date_paiement || '-'}</td>
                <td><span class="badge bg-${e.statut === 'payé' || e.statut === 'payée' ? 'success' : 'warning'}">${e.statut}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erreur amortissement:', err);
        showToast('Erreur amortissement: ' + err.message, 'error');
    }
}

/* ==============================
   SECTIONS — SINISTRES
   ============================== */
async function loadSinistres() {
    try {
        const res = await apiCall('/mes-sinistres', { method: 'GET' });
        if (!res || !res.sinistres) {
            console.error('Réponse invalide pour sinistres');
            return;
        }

        const container = document.getElementById('sinistres-list');
        const sinistres = res.sinistres;

        if (!container) {
            console.warn('Container sinistres-list non trouvé');
            return;
        }

        if (sinistres.length === 0) {
            container.innerHTML = '<div class="tcard" style="padding:40px;text-align:center;color:#999">Aucun sinistre déclaré</div>';
            return;
        }

        container.innerHTML = sinistres.map(s => `
            <div class="tcard" style="margin-bottom:15px;padding:15px">
                <div style="display:flex;justify-content:space-between">
                    <div style="flex:1">
                        <div style="font-weight:600">${s.type_sinistre || 'Sinistre'}</div>
                        <div style="font-size:.9rem;color:#666">${s.description || '—'}</div>
                        <div style="font-size:.85rem;color:#999">Date: ${s.date_sinistre}</div>
                        <div style="margin-top:8px">
                            <div style="font-size:.85rem">Montant réclamé: ${s.montant_reclamation || 0} FCFA</div>
                            <div style="font-size:.85rem">Montant remboursé: ${s.montant_remboursement || 0} FCFA</div>
                        </div>
                    </div>
                    <div style="text-align:right">
                        <span class="badge bg-${s.statut === 'approuvé' || s.statut === 'remboursé' ? 'success' : s.statut === 'déclaré' ? 'info' : 'warning'}">${s.statut}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Erreur sinistres:', err);
        const container = document.getElementById('sinistres-list');
        if (container) container.innerHTML = `<div class="text-danger">Erreur chargement: ${err.message}</div>`;
        showToast('Erreur sinistres: ' + err.message, 'error');
    }
}

/* ==============================
   SECTIONS — ALERTES
   ============================== */
async function loadAlertes() {
    try {
        const res = await apiCall('/mon-tableau-de-bord', { method: 'GET' });
        if (res && res.alertes) {
            const container = document.getElementById('alertes-full-list') || document.querySelector('[id*="alerte"]');
            if (!container) return;

            const alertes = res.alertes;
            if (alertes.length === 0) {
                container.innerHTML = '<div class="tcard" style="padding:20px;text-align:center;color:#999">Aucune alerte</div>';
                return;
            }

            container.innerHTML = alertes.map(a => `
                <div class="tcard" style="padding:15px;margin-bottom:10px;border-left:4px solid ${a.type === 'danger' ? 'var(--red)' : a.type === 'warning' ? 'var(--gold)' : 'var(--blue)'}">
                    <div style="display:flex;gap:12px">
                        <div style="font-size:1.2rem">${a.type === 'danger' ? '⚠️' : a.type === 'warning' ? '⚡' : 'ℹ️'}</div>
                        <div>
                            <div style="font-weight:600;cursor:pointer" onclick="showSection('${a.section || 'overview'}')">${a.message}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Erreur alertes:', err);
    }
}

/* ==============================
   SECTIONS — AYANTS DROIT
   ============================== */
async function loadAyantsDroit() {
    try {
        const res = await apiCall('/mes-ayants-droit', { method: 'GET' });
        if (!res || !res.ayants_droit) {
            console.error('Réponse invalide pour ayants-droit');
            return;
        }

        const container = document.getElementById('ayants-grid');
        const ayants = res.ayants_droit;

        if (!container) {
            console.warn('Container ayants-grid non trouvé');
            return;
        }

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
        const container = document.getElementById('ayants-grid');
        if (container) container.innerHTML = `<div class="text-danger">Erreur chargement: ${err.message}</div>`;
        showToast('Erreur ayants droit: ' + err.message, 'error');
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
    document.getElementById('edit-adresse').value = user.adresse || '';
    document.getElementById('edit-ville').value = user.ville || '';
}

async function saveProfil() {
    const nom = document.getElementById('edit-nom').value.trim();
    const prenom = document.getElementById('edit-prenom').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const tel = document.getElementById('edit-tel').value.trim();
    const adresse = document.getElementById('edit-adresse').value.trim();
    const ville = document.getElementById('edit-ville').value.trim();

    if (!nom || !prenom || !email) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
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
            const newUser = { ...user, name: `${prenom} ${nom}`, email, telephone: tel, adresse, ville };
            localStorage.setItem('mamutuelle_user', JSON.stringify(newUser));
            injectUserInfo();
            loadUserData();
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
            document.getElementById('ayant-nom').value = '';
            document.getElementById('ayant-prenom').value = '';
            document.getElementById('ayant-relation').value = '';
            document.getElementById('ayant-dob').value = '';
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
    const wrap = document.getElementById('toast-wrap') || document.querySelector('.toast-wrap');
    if (!wrap) {
        console.warn('toast-wrap non trouvé');
        return;
    }

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
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
