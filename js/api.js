// ============================================
// API.JS – Fonctions partagées entre toutes les pages
// À charger AVANT login.js, register.js, dashboard.js
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const API_URL   = window.API_URL || window.location.origin + "/api";
const TOKEN_KEY = 'mamutuelle_token';
const USER_KEY  = 'mamutuelle_user';

// ============================================
// GESTION DES COOKIES (fallback pour Edge)
// ============================================

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function removeCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// ============================================
// GESTION DU TOKEN
// Storage sécurisé : localStorage → sessionStorage → cookie
// ============================================

function parseJwtPayload(token) {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(decoded.split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join('')));
    } catch (e) {
        return null;
    }
}

function isTokenValid(token) {
    const payload = parseJwtPayload(token);
    if (!payload) return false;
    if (payload.exp && typeof payload.exp === 'number') {
        return payload.exp > Math.floor(Date.now() / 1000);
    }
    return true;
}

function clearAuth() {
    logout();
}

function getToken() {
    try {
        const token = localStorage.getItem(TOKEN_KEY)
            || sessionStorage.getItem(TOKEN_KEY)
            || getCookie(TOKEN_KEY);

        if (token && !isTokenValid(token)) {
            clearAuth();
            return null;
        }

        return token;
    } catch (e) {
        return getCookie(TOKEN_KEY);
    }
}

function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY)
                 || sessionStorage.getItem(USER_KEY)
                 || getCookie(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        try {
            const raw = getCookie(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }
}

function saveAuth(token, user, remember) {
    const userStr = JSON.stringify(user);
    const days    = remember ? 7 : 1;

    // 1. Toujours sauvegarder dans les cookies (fonctionne partout)
    setCookie(TOKEN_KEY, token,   days);
    setCookie(USER_KEY,  userStr, days);

    // 2. Essayer aussi localStorage/sessionStorage
    try {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(TOKEN_KEY, token);
        storage.setItem(USER_KEY,  userStr);
    } catch (e) {
        // Silencieux si bloqué par Edge
    }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Supprime le token partout
 */
function logout() {
    // localStorage
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch (e) {}

    // sessionStorage
    try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    } catch (e) {}

    // Cookies
    removeCookie(TOKEN_KEY);
    removeCookie(USER_KEY);
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
        'Accept':        'application/json',
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
        const message = data?.message || data?.error || response.statusText || 'Erreur inconnue';
        const err     = new Error(message);
        err.status    = response.status;
        throw err;
    }

    return data;
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Connexion — stocke le token selon "Se souvenir de moi"
 */
async function login(email, password, remember = true) {
    const data = await apiCall('/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
    });

    if (data?.token) {
        saveAuth(data.token, data.user, remember);
    }

    return data;
}

/**
 * Inscription — stocke le token automatiquement
 */
async function register(name, email, password, role) {
    const data = await apiCall('/register', {
        method: 'POST',
        body:   JSON.stringify({ name, email, password, role }),
    });

    if (data?.token) {
        saveAuth(data.token, data.user, true);
    }

    return data;
}
