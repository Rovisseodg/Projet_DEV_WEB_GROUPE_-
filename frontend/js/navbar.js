// Navbar toggle functionality - vanilla JS alternative to Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    const navbarTogglers = document.querySelectorAll('.navbar-toggler');
    
    navbarTogglers.forEach(toggler => {
        toggler.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-bs-target') || this.getAttribute('aria-controls');
            const navbarCollapse = document.querySelector(target);
            
            if (navbarCollapse) {
                navbarCollapse.classList.toggle('show');
                this.setAttribute('aria-expanded', 
                    this.getAttribute('aria-expanded') === 'false' ? 'true' : 'false');
            }
        });
    });

    // Close navbar when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbarTogglers.forEach(toggler => {
                const target = toggler.getAttribute('data-bs-target') || toggler.getAttribute('aria-controls');
                const navbarCollapse = document.querySelector(target);
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                    toggler.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

    // Close navbar on window resize to large screens
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991.98) {
            document.querySelectorAll('.navbar-collapse').forEach(collapse => {
                collapse.classList.remove('show');
            });
            navbarTogglers.forEach(toggler => {
                toggler.setAttribute('aria-expanded', 'false');
            });
        }
    });

    console.log('Navbar initialized');
});
