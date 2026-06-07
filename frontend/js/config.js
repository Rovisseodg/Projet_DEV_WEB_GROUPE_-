// ============================================
// CONFIGURATION GLOBALE
// ============================================
// Configuration automatique de l'URL de l'API
(function() {
    // Détection de l'environnement
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Environnement de développement
        window.API_URL = window.location.origin + "/api";
    } else {
        // Environnement de production (Railway)
        window.API_URL = window.location.origin + '/api';
    }

    console.log('API URL configurée:', window.API_URL);
})();