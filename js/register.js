// ============================================
// REGISTER.JS – Logique spécifique à register.html
// Dépend de api.js (register, isAuthenticated, TOKEN_KEY, USER_KEY)
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
    txt.classList.toggle('d-none', loading);
    spin.classList.toggle('d-none', !loading);
}

// ============================================
// VALIDATION CÔTÉ CLIENT
// ============================================
function validateForm(name, email, password, confirmPassword) {
    let valid = true;

    const nameInput = document.getElementById('name');
    const nameErr   = document.getElementById('name-error');
    if (!name || name.trim().length < 2) {
        nameInput.classList.add('is-invalid');
        nameErr.textContent = 'Veuillez saisir un nom valide (au moins 2 caractères).';
        valid = false;
    } else {
        nameInput.classList.remove('is-invalid');
        nameErr.textContent = '';
    }

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

    const confirmPwdInput = document.getElementById('confirm-password');
    const confirmPwdErr   = document.getElementById('confirm-password-error');
    if (!confirmPassword || confirmPassword !== password) {
        confirmPwdInput.classList.add('is-invalid');
        confirmPwdErr.textContent = 'Les mots de passe ne correspondent pas.';
        valid = false;
    } else {
        confirmPwdInput.classList.remove('is-invalid');
        confirmPwdErr.textContent = '';
    }

    return valid;
}

// ============================================
// SOUMISSION DU FORMULAIRE
// ============================================
document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert();

    const name           = document.getElementById('name').value.trim();
    const email          = document.getElementById('email').value.trim();
    const password       = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role           = 'adherent';

    if (!validateForm(name, email, password, confirmPassword)) return;

    setLoading(true);

    try {
        // Utilise la fonction register() de script.js
        const data = await register(name, email, password, role);

        if (data && data.token) {
            showAlert('Inscription réussie ! Redirection…', 'success');
            setTimeout(() => {
                const userRole = data.user?.role;
                if (userRole === 'adherent') {
                    window.location.href = 'adherent-dashboard.html';
                } else if (userRole === 'admin' || userRole === 'agent') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 800);
        }
    } catch (error) {
        console.error('Register error:', error);

        // Distinguer les erreurs réseau des erreurs serveur
        if (!navigator.onLine) {
            showAlert('Pas de connexion Internet. Vérifiez votre réseau.');
        } else if (error.message && error.message.includes('422')) {
            showAlert('Adresse e-mail déjà utilisée ou données invalides.');
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
['name', 'email', 'password', 'confirm-password'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
        this.classList.remove('is-invalid');
    });
});