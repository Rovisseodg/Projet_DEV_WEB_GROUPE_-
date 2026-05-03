// ============================================
// MAMUTUELLE - FRONTEND JAVASCRIPT
// ============================================

console.log('%cMaMutuelle App Loaded', 'color: #0066CC; font-size: 16px; font-weight: bold;');

// ============================================
// CONFIGURATION
// ============================================

const API_URL = 'https://projetdevwebgroupe-production.up.railway.app/api';
const TOKEN_KEY = 'mamutuelle_token';
const USER_KEY = 'mamutuelle_user';

// ============================================
// API HELPERS
// ============================================

/**
 * Effectuer une requête API
 */
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Ajouter le token si disponible
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expiré, rediriger vers login
                logout();
                window.location.href = 'login.html';
            }
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Call Error (${endpoint}):`, error);
        throw error;
    }
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Se connecter
 */
async function login(email, password) {
    try {
        const data = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            console.log('✓ Login successful');
            return data;
        }
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * S'inscrire
 */
async function register(name, email, password, role) {
    try {
        const data = await apiCall('/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });

        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            console.log('✓ Register successful');
            return data;
        }
    } catch (error) {
        console.error('Register failed:', error);
        throw error;
    }
}

/**
 * Se déconnecter
 */
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('✓ Logout successful');
}

/**
 * Vérifier si l'utilisateur est connecté
 */
function isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

/**
 * Obtenir l'utilisateur courant
 */
function getCurrentUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
}

// ============================================
// ADHÉRENTS
// ============================================

/**
 * Obtenir tous les adhérents
 */
async function getAdherents(page = 1, limit = 50) {
    try {
        const data = await apiCall(`/adherents?page=${page}&limit=${limit}`);
        console.log('✓ Adhérents fetched:', data);
        return data;
    } catch (error) {
        console.error('Error fetching adherents:', error);
        throw error;
    }
}

/**
 * Obtenir un adhérent par ID
 */
async function getAdherent(id) {
    try {
        const data = await apiCall(`/adherents/${id}`);
        return data;
    } catch (error) {
        console.error('Error fetching adherent:', error);
        throw error;
    }
}

/**
 * Créer un nouvel adhérent
 */
async function createAdherent(adherentData) {
    try {
        const data = await apiCall('/adherents', {
            method: 'POST',
            body: JSON.stringify(adherentData)
        });
        console.log('✓ Adhérent created:', data);
        return data;
    } catch (error) {
        console.error('Error creating adherent:', error);
        throw error;
    }
}

/**
 * Mettre à jour un adhérent
 */
async function updateAdherent(id, adherentData) {
    try {
        const data = await apiCall(`/adherents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(adherentData)
        });
        console.log('✓ Adhérent updated:', data);
        return data;
    } catch (error) {
        console.error('Error updating adherent:', error);
        throw error;
    }
}

/**
 * Supprimer un adhérent
 */
async function deleteAdherent(id) {
    try {
        await apiCall(`/adherents/${id}`, { method: 'DELETE' });
        console.log('✓ Adhérent deleted');
    } catch (error) {
        console.error('Error deleting adherent:', error);
        throw error;
    }
}

// ============================================
// COTISATIONS
// ============================================

/**
 * Obtenir les cotisations d'un adhérent
 */
async function getCotisations(adherentId) {
    try {
        const data = await apiCall(`/adherents/${adherentId}/cotisations`);
        return data;
    } catch (error) {
        console.error('Error fetching cotisations:', error);
        throw error;
    }
}

/**
 * Enregistrer un paiement
 */
async function recordPayment(cotisationId, montant) {
    try {
        const data = await apiCall(`/cotisations/${cotisationId}/paiement`, {
            method: 'POST',
            body: JSON.stringify({ montant })
        });
        console.log('✓ Payment recorded:', data);
        return data;
    } catch (error) {
        console.error('Error recording payment:', error);
        throw error;
    }
}

// ============================================
// PRÊTS
// ============================================

/**
 * Obtenir les prêts d'un adhérent
 */
async function getPrets(adherentId) {
    try {
        const data = await apiCall(`/adherents/${adherentId}/prets`);
        return data;
    } catch (error) {
        console.error('Error fetching prets:', error);
        throw error;
    }
}

/**
 * Créer une demande de prêt
 */
async function createPretDemande(adherentId, pretData) {
    try {
        const data = await apiCall(`/adherents/${adherentId}/prets`, {
            method: 'POST',
            body: JSON.stringify(pretData)
        });
        console.log('✓ Prêt request created:', data);
        return data;
    } catch (error) {
        console.error('Error creating prêt:', error);
        throw error;
    }
}

// ============================================
// SINISTRES
// ============================================

/**
 * Obtenir les sinistres d'un adhérent
 */
async function getSinistres(adherentId) {
    try {
        const data = await apiCall(`/adherents/${adherentId}/sinistres`);
        return data;
    } catch (error) {
        console.error('Error fetching sinistres:', error);
        throw error;
    }
}

/**
 * Déclarer un sinistre
 */
async function createSinistre(adherentId, sinistreData) {
    try {
        const data = await apiCall(`/adherents/${adherentId}/sinistres`, {
            method: 'POST',
            body: JSON.stringify(sinistreData)
        });
        console.log('✓ Sinistre declared:', data);
        return data;
    } catch (error) {
        console.error('Error creating sinistre:', error);
        throw error;
    }
}

// ============================================
// DASHBOARD
// ============================================

/**
 * Obtenir les statistiques du dashboard
 */
async function getDashboardStats() {
    try {
        const data = await apiCall('/dashboard/stats');
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

/**
 * Générer un graphique de cotisations
 */
function generateCotisationsChart(containerId, data) {
    const ctx = document.getElementById(containerId)?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Cotisations',
                data: data.values || [],
                borderColor: '#0066CC',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Afficher un toast notification
 */
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    const container = document.getElementById('toast-container') || 
                     (() => {
                         const c = document.createElement('div');
                         c.id = 'toast-container';
                         c.style.position = 'fixed';
                         c.style.top = '20px';
                         c.style.right = '20px';
                         c.style.zIndex = '9999';
                         document.body.appendChild(c);
                         return c;
                     })();

    const toast = document.createElement('div');
    toast.innerHTML = toastHtml;
    container.appendChild(toast);

    // Auto-dismiss après 5 secondes
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Formater une devise
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

/**
 * Formater une date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// ============================================
// EXPORT
// ============================================

window.MaMutuelle = {
    // Auth
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
    
    // Adhérents
    getAdherents,
    getAdherent,
    createAdherent,
    updateAdherent,
    deleteAdherent,
    
    // Cotisations
    getCotisations,
    recordPayment,
    
    // Prêts
    getPrets,
    createPretDemande,
    
    // Sinistres
    getSinistres,
    createSinistre,
    
    // Dashboard
    getDashboardStats,
    generateCotisationsChart,
    
    // UI
    showToast,
    formatCurrency,
    formatDate,
};

console.log('%cMaMutuelle API ready', 'color: #00AA55; font-weight: bold;');
