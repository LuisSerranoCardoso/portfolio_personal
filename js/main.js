document.addEventListener('DOMContentLoaded', () => {
  console.log("Portfolio cargado correctamente");

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

  // Animaciones de entrada para cualquier elemento con clase fade-in-*
  document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
    el.classList.remove('in-view');
    observer.observe(el);
  });

  // Modifica el callback del observer:
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  // Observar elementos que queremos animar
  document.querySelectorAll('.skill-card, .project-card').forEach(card => {
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

// ============================================
// FILTROS INTERACTIVOS EN PROYECTOS
// ============================================
if (document.querySelector('.projects-grid')) {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Quitar clase activa de todos los botones
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================
// MODAL DE DETALLES DE PROYECTO
// ============================================
if (document.querySelector('.projects-grid')) {
  const modal = document.getElementById('project-modal');
  const modalBody = modal?.querySelector('.modal-body');
  const closeBtn = modal?.querySelector('.modal-close');

  document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const card = link.closest('.project-card');
      if (modal && modalBody && card) {
        // Puedes personalizar el contenido aquí
        modalBody.innerHTML = card.innerHTML;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });

  modal?.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// ============================================
// VALIDACIÓN Y ENVÍO DEL FORMULARIO DE CONTACTO
// ============================================
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    let valid = true;
    contactForm.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
      if (!input.value.trim()) {
        input.style.borderColor = 'red';
        valid = false;
      } else {
        input.style.borderColor = '';
      }
    });

    if (!contactForm.privacy.checked) {
      formMessage.innerHTML = '❗ <b>Debes aceptar la política de privacidad.</b>';
      formMessage.style.color = 'red';
      formMessage.style.animation = 'shake 0.3s';
      setTimeout(() => formMessage.style.animation = '', 300);
      return;
    }

    if (!valid) {
      formMessage.innerHTML = '⚠️ <b>Por favor, completa todos los campos obligatorios.</b>';
      formMessage.style.color = 'red';
      formMessage.style.animation = 'shake 0.3s';
      setTimeout(() => formMessage.style.animation = '', 300);
      return;
    }

    formMessage.innerHTML = '⏳ <b>Enviando mensaje...</b>';
    formMessage.style.color = 'var(--accent-primary)';
    formMessage.style.animation = '';

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formMessage.innerHTML = '✅ <b>¡Mensaje enviado correctamente!</b> <br>Te responderé lo antes posible.';
        formMessage.style.color = 'green';
        formMessage.style.animation = 'fadeSuccess 1s';
        contactForm.reset();
      } else {
        formMessage.innerHTML = '❌ <b>Error al enviar.</b> Inténtalo de nuevo más tarde.';
        formMessage.style.color = 'red';
        formMessage.style.animation = 'shake 0.3s';
        setTimeout(() => formMessage.style.animation = '', 300);
      }
    } catch (err) {
      formMessage.innerHTML = '🚫 <b>Error de red.</b> Inténtalo de nuevo.';
      formMessage.style.color = 'red';
      formMessage.style.animation = 'shake 0.3s';
      setTimeout(() => formMessage.style.animation = '', 300);
    }
  });

  // Validación en tiempo real
  contactForm.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('input', () => {
      if (input.value.trim()) {
        input.style.borderColor = '';
      }
    });
  });
}

// ============================================
// CARGA CON ANIMACIÓN DEL CONTENIDO
// ============================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) loader.style.opacity = '0';
  setTimeout(() => { if (loader) loader.style.display = 'none'; }, 600);
});

