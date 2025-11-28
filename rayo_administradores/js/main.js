/* =========================================
   Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    /* 0. Loader Removal */
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader-wrapper');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 500); // Minimum visibility time
        }
    });

    /* 0.8 Cookie Consent */
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        // Show banner after a short delay
        setTimeout(() => {
            cookieBanner.classList.remove('hidden');
        }, 2000);
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            cookieBanner.classList.add('hidden');
            localStorage.setItem('cookiesAccepted', 'true');
        });
    }

    /* 1. Mobile Menu Toggle */
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            nav.classList.add('show');
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            nav.classList.remove('show');
        });
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('show');
        });
    });

    /* 2. Header Scroll Effect */
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY >= 50) {
            header.classList.add('scroll-header');
            // Optional: Add more shadow or reduce height here via CSS class
        } else {
            header.classList.remove('scroll-header');
        }
    });

    /* 3. Scroll Reveal Animation */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    /* 4. Active Link Highlighting */
    const sections = document.querySelectorAll('section[id]');

    function scrollActive() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector('.nav-link[href*=' + sectionId + ']');

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', scrollActive);
});
