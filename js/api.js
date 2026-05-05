// ============================================
// API.JS – Fonctions partagées entre toutes les pages
// À charger AVANT login.js, register.js, dashboard.js
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const API_URL = window.location.origin + "/api";
const TOKEN_KEY = 'mamutuelle_token';
const USER_KEY  = 'mamutuelle_user';

// ============================================
// GESTION DU TOKEN
// ============================================

/**
 * Récupère le token stocké (localStorage ou sessionStorage)
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Supprime le token et les données utilisateur des deux storages
 */
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

// ============================================
// APPEL API GÉNÉRIQUE
// ============================================

/**
 * Effectue un appel à l'API backend avec le token d'auth.
 * @param {string} endpoint  - ex: '/adherents' ou '/cotisations/3'
 * @param {object} options   - options fetch (method, body, etc.)
 * @returns {Promise<any>}   - données JSON de la réponse
 */
async function apiCall(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(API_URL + endpoint, {
        ...options,
        headers,
    });

    // Réponse vide (ex: DELETE 204)
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        // Construire un message d'erreur lisible
        const message = data?.message || data?.error || response.statusText || 'Erreur inconnue';
        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    return data;
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Connexion — stocke le token selon "Se souvenir de moi"
 * @param {string}  email
 * @param {string}  password
 * @param {boolean} remember  - true → localStorage, false → sessionStorage
 * @returns {Promise<{token, user}>}
 */
async function login(email, password, remember = true) {
    const data = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data?.token) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, data.token);
        storage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
}

/**
 * Inscription — stocke le token automatiquement
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {string} role
 * @returns {Promise<{token, user}>}
 */
async function register(name, email, password, role) {
    const data = await apiCall('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
    });

    if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
}
