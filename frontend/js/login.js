// ============================================
// LOGIN.JS – Logique spécifique à login.html
// Dépend de api.js (login, isAuthenticated, getUser)
// ============================================

// ============================================
// TOGGLE AFFICHER / MASQUER LE MOT DE PASSE
// ============================================
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
    const box       = document.getElementById('alert-box');
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    box.className   = `alert alert-${type}`;
    box.innerHTML   = `<i class="fas ${iconClass} me-2"></i>${message}`;
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

    // Quand `loading` est vrai on cache le texte et on affiche le spinner.
    txt.classList.toggle('d-none', loading);
    txt.setAttribute('aria-hidden', String(loading));

    spin.classList.toggle('d-none', !loading);
    spin.setAttribute('aria-hidden', String(!loading));
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
    console.debug('Login: submitting', { email, remember });

    try {
        const data = await login(email, password, remember);

        if (data && data.token) {
            showAlert('Connexion réussie ! Redirection…', 'success');

            setTimeout(() => {
                const role = data.user?.role;
                if (role === 'adherent') {
                    window.location.href = 'adherent-dashboard.html';
                } else if (role === 'admin' || role === 'agent') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 800);
        } else {
            // Si l'API a répondu mais sans token, considérer comme identifiants invalides
            console.debug('Login: no token in response', data);
            setLoading(false);
            showAlert('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
            return;
        }

    } catch (error) {
        console.error('Login error:', error);
        // Masquer immédiatement l'état de chargement pour éviter que le spinner reste visible
        setLoading(false);

        if (!navigator.onLine) {
            showAlert('Pas de connexion Internet. Vérifiez votre réseau.');
        } else if (error.status === 401 || error.message?.toLowerCase().includes('invalide')) {
            showAlert('Identifiants incorrects. Vérifiez votre e-mail et mot de passe.');
        } else if (error.status === 422) {
            showAlert('Données invalides. Vérifiez les champs.');
        } else if (error.status === 500) {
            showAlert('Erreur serveur. Réessayez dans quelques instants.');
        } else {
            showAlert(`Erreur : ${error.message || 'inconnue'}`);
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
