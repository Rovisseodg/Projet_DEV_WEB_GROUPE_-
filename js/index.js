// ====== Navbar scroll effect ======
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
});

// ====== Back to top ======
const btt = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 300);
});

// ====== Hero Chart (Chart.js) ======
(function () {
    const ctx = document.getElementById('heroChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr'],
            datasets: [
                {
                    label: 'Cotisations (FCFA)',
                    data: [280000, 310000, 295000, 340000, 370000, 410000],
                    borderColor: '#0066CC',
                    backgroundColor: 'rgba(0,102,204,0.08)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.45,
                    pointBackgroundColor: '#0066CC',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Remboursements (FCFA)',
                    data: [80000, 95000, 70000, 110000, 90000, 130000],
                    borderColor: '#00AA55',
                    backgroundColor: 'rgba(0,170,85,0.06)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.45,
                    pointBackgroundColor: '#00AA55',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { size: 10, family: 'DM Sans' }, boxWidth: 12, padding: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ' + Number(ctx.raw).toLocaleString('fr-FR') + ' FCFA'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                        font: { size: 9 },
                        callback: v => (v / 1000) + 'k'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
})();

// ====== Contact form (simulation) ======
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const alertBox = document.getElementById('contact-alert');
    alertBox.className = 'alert alert-success';
    alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i>Message envoyé avec succès ! Nous vous répondrons sous 24h.';
    alertBox.style.display = 'block';
    this.reset();
    setTimeout(() => { alertBox.style.display = 'none'; }, 5000);
});

// ====== Active nav link on scroll ======
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 80) current = s.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
});
