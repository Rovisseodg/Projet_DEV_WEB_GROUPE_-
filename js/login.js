// ============================================
// LOGIN.JS – Logique spécifique à login.html
// Dépend de api.js (login, isAuthenticated, TOKEN_KEY, USER_KEY)
// ============================================

// ============================================
// REDIRECTION SI DÉJÀ CONNECTÉ
// ============================================
if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
}

// ============================================
// TOGGLE AFFICHER / MASQUER LE MOT DE PASSE
// ============================================
document.getElementById('toggle-pwd').addEventListener('click', function () {
    const pwdInput = document.getElementById('password');
    const icon     = document.getElementById('toggle-icon');

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

// ============================================
// AFFICHAGE DES ALERTES
// ============================================
function showAlert(message, type = 'danger') {
    const box = document.getElementById('alert-box');
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    box.className = `alert alert-${type}`;
    box.innerHTML = `<i class="fas ${iconClass} me-2"></i>${message}`;
    box.style.display = 'block';
}

function hideAlert() {
    document.getElementById('alert-box').style.display = 'none';
}

// ============================================
// ÉTAT CHARGEMENT DU BOUTON
// ============================================
function setLoading(loading) {
    const btn  = document.getElementById('btn-submit');
    const txt  = document.getElementById('btn-text');
    const spin = document.getElementById('btn-loading');

    btn.disabled = loading;
    btn.setAttribute('aria-busy', String(loading));

    const showingText = !loading;
    txt.classList.toggle('d-none', !showingText);
    txt.setAttribute('aria-hidden', String(!showingText));

    const showingSpinner = loading;
    spin.classList.toggle('d-none', !showingSpinner);
    spin.setAttribute('aria-hidden', String(!showingSpinner));
}

// ============================================
// VALIDATION CÔTÉ CLIENT
// ============================================
function validateForm(email, password) {
    let valid = true;

    const emailInput = document.getElementById('email');
    const emailErr   = document.getElementById('email-error');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.classList.add('is-invalid');
        emailErr.textContent = 'Veuillez saisir une adresse e-mail valide.';
        valid = false;
    } else {
        emailInput.classList.remove('is-invalid');
        emailErr.textContent = '';
    }

    const pwdInput = document.getElementById('password');
    const pwdErr   = document.getElementById('password-error');
    if (!password || password.length < 6) {
        pwdInput.classList.add('is-invalid');
        pwdErr.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
        valid = false;
    } else {
        pwdInput.classList.remove('is-invalid');
        pwdErr.textContent = '';
    }

    return valid;
}

// ============================================
// SOUMISSION DU FORMULAIRE
// ============================================
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember-me').checked;

    if (!validateForm(email, password)) return;

    setLoading(true);

    try {
        // Utilise la fonction login() de api.js
        const data = await login(email, password, remember);

        if (data && data.token) {
            // Option "Se souvenir de moi" : copie aussi en sessionStorage si non coché
            if (!remember) {
                sessionStorage.setItem(TOKEN_KEY, data.token);
                sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }

            showAlert('Connexion réussie ! Redirection…', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        }
    } catch (error) {
        console.error('Login error:', error);

        // Distinguer les erreurs réseau des erreurs serveur
        if (!navigator.onLine) {
            showAlert('Pas de connexion Internet. Vérifiez votre réseau.');
        } else if (error.message && error.message.includes('401')) {
            showAlert('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
        } else {
            showAlert('Impossible de contacter le serveur. Veuillez réessayer.');
        }
    } finally {
        setLoading(false);
    }
});

// ============================================
// EFFACER LA VALIDATION AU CHANGEMENT
// ============================================
['email', 'password'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
        this.classList.remove('is-invalid');
    });
});
