document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio cargado correctamente");
});

// ============================================
// THEME TOGGLE - MODO CLARO/OSCURO PERSISTENTE
// ============================================

// Función para obtener el tema guardado
function getSavedTheme() {
  return localStorage.getItem('theme') || 'light';
}

// Función para guardar el tema
function saveTheme(theme) {
  localStorage.setItem('theme', theme);
}

// Función para aplicar el tema
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
}

// Aplicar tema al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = getSavedTheme();
  applyTheme(savedTheme);
  
  // Event listener para el botón de cambio de tema
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      saveTheme(newTheme);
      
      // Animación del botón
      themeToggle.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg)';
      }, 300);
    });
  }
  
  // ============================================
  // NAVEGACIÓN ACTIVA
  // ============================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
  
  // ============================================
  // ANIMACIÓN AL HACER SCROLL
  // ============================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observar elementos que queremos animar
  document.querySelectorAll('.skill-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
  
  // ============================================
  // HEADER CON SCROLL
  // ============================================
  let lastScroll = 0;
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
      header.style.boxShadow = '0 2px 10px var(--header-shadow)';
    } else {
      header.style.boxShadow = '0 4px 20px var(--header-shadow)';
    }
    
    lastScroll = currentScroll;
  });
  
  // ============================================
  // SMOOTH SCROLL PARA ENLACES
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
