// ============================================
// CONFIGURATION GLOBALE
// ============================================
// Configuration automatique de l'URL de l'API
(function() {
    // Détection de l'environnement
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Environnement de développement local
        window.API_URL = protocol + '//' + hostname + ':8000/api';
    } else if (hostname.includes('render.com')) {
        // Environnement de production sur Render
        // Frontend sur mutuelle-frontend.onrender.com → Backend sur mamutuelle-api.onrender.com
        window.API_URL = 'https://mamutuelle-api.onrender.com/api';
    } else {
        // Fallback: supposer que l'API est au même domaine
        window.API_URL = window.location.origin + '/api';
    }

    console.log('API URL configurée:', window.API_URL);
})();