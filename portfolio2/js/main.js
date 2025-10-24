document.addEventListener('DOMContentLoaded', async () => {
  const $ = (s, d=document) => d.querySelector(s);
  const $$ = (s, d=document) => [...d.querySelectorAll(s)];
  $('#year') && ($('#year').textContent = new Date().getFullYear());

  // THEME toggle persistente + icono
  const themeToggle = $('#theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');
  const setIcon = (t) => {
    if (!themeIcon) return;
    themeIcon.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    themeIcon.setAttribute('aria-hidden','true');
  };
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  setIcon(savedTheme);
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setIcon(next);
  });

  // i18n
  const resources = {
    es: await fetch('locales/es.json').then(r => r.json()).catch(()=>({})),
    en: await fetch('locales/en.json').then(r => r.json()).catch(()=>({}))
  };
  const langBtn = $('#lang-toggle');
  const savedLang = localStorage.getItem('lang') || 'es';
  i18next.init({ lng: savedLang, resources }, () => applyI18n());
  if (langBtn) langBtn.textContent = savedLang.toUpperCase();
  langBtn?.addEventListener('click', () => {
    const next = i18next.language === 'es' ? 'en' : 'es';
    i18next.changeLanguage(next, applyI18n);
    localStorage.setItem('lang', next);
    if (langBtn) langBtn.textContent = next.toUpperCase();
    setupTyped();
  });
  function applyI18n() {
    $$.call(null,'[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = i18next.t(key);
      if (t) el.textContent = t;
    });
    document.title = i18next.t('meta.title') || document.title;
  }

  // Typed hero
  let typed;
  function setupTyped() {
    typed?.destroy();
    const lines = i18next.t('hero.lines', { returnObjects: true }) || [
      'whoami',
      'building APIs, CLIs and internal platforms...',
      'stack: Go | Node | Python | K8s | Postgres',
    ];
    typed = new Typed('#typed', { strings: lines, typeSpeed: 35, backSpeed: 16, backDelay: 900, loop: true, smartBackspace: true, showCursor: false });
  }
  setupTyped();

  // GSAP + ScrollTrigger base
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Accent picker: persistir y aplicar
  const applyAccent = ({brand, brand2, accent} = {}) => {
    const root = document.documentElement;
    if (brand) root.style.setProperty('--brand', brand);
    if (brand2) root.style.setProperty('--brand-2', brand2);
    if (accent) root.style.setProperty('--accent', accent);
  };
  // cargar guardado
  try {
    const saved = JSON.parse(localStorage.getItem('accent') || '{}');
    if (saved && (saved.brand || saved.accent)) applyAccent(saved);
  } catch {}
  const accentBtn = document.getElementById('accent-toggle');
  const panel = document.getElementById('accent-panel');
  accentBtn?.addEventListener('click', (e) => {
    const open = panel?.hasAttribute('hidden') === false;
    if (!panel) return;
    panel.hidden = open; // toggle
    accentBtn.setAttribute('aria-expanded', String(!open));
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    if (!panel || panel.hidden) return;
    const path = e.composedPath();
    if (!path.includes(panel) && !path.includes(accentBtn)) {
      panel.hidden = true;
      accentBtn?.setAttribute('aria-expanded', 'false');
    }
  });
  panel?.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      const payload = { brand: sw.dataset.brand, brand2: sw.dataset.brand2, accent: sw.dataset.accent };
      applyAccent(payload);
      localStorage.setItem('accent', JSON.stringify(payload));
      panel.hidden = true; accentBtn?.setAttribute('aria-expanded','false');
    });
  });

  // Split-letters de títulos y animación al entrar
  function splitTitle(el) {
    if (!el || el.dataset.split === '1') return;
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    const frag = document.createDocumentFragment();
    [...text].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      frag.appendChild(span);
    });
    el.appendChild(frag);
    el.dataset.split = '1';
  }
  document.querySelectorAll('.section-title').forEach(splitTitle);
  if (!reduce && window.gsap && window.ScrollTrigger) {
    document.querySelectorAll('.section-title').forEach(title => {
      gsap.from(title.querySelectorAll('.char'), {
        yPercent: 110, opacity: 0, duration: .8, ease: 'power3.out', stagger: { each: .02, from: 'start' },
        scrollTrigger: { trigger: title, start: 'top 85%' }
      });
    });
  }

  // Reveal con máscara en imágenes
  const imgs = document.querySelectorAll('.reveal-img');
  const ioReveal = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        ioReveal.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  imgs.forEach(i => ioReveal.observe(i));

  // Playground: controles de latencia y error
  const latRange = document.getElementById('latency');
  const latVal = document.getElementById('latency-val');
  const errRange = document.getElementById('errorp');
  const errVal = document.getElementById('errorp-val');
  let latency = Number(latRange?.value || 400);
  let errorP = Number(errRange?.value || 0);
  const fmt = (n) => `${Math.round(n)}ms`;
  const upd = () => {
    latency = Number(latRange.value);
    errorP = Number(errRange.value);
    latVal.textContent = fmt(latency);
    errVal.textContent = `${errorP}%`;
  };
  latRange?.addEventListener('input', upd);
  errRange?.addEventListener('input', upd);
  upd();

  // Actualiza mock para usar latencia/error dinámicos
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const shouldFail = () => Math.random()*100 < errorP;
  const mock = {
    '/api/ping': async () => { await wait(latency); if (shouldFail()) throw {error:'Internal Error'}; return { ok:true, pong:true, latency }; },
    '/api/users': async () => { await wait(latency); if (shouldFail()) throw {error:'Internal Error'}; return [{id:1,name:'Ada'},{id:2,name:'Linus'}]; },
    '/api/error': async () => { await wait(latency); throw { error:'Forced error' }; }
  };
  const log = (msg) => {
    const c = document.getElementById('console');
    if (!c) return;
    const line = `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    c.textContent += line; c.scrollTop = c.scrollHeight;
  };
  document.getElementById('btn-ping')?.addEventListener('click', async()=>{ log('GET /api/ping'); try{ const res=await mock['/api/ping'](); log(JSON.stringify(res)); }catch(e){ log(JSON.stringify(e)); }});
  document.getElementById('btn-users')?.addEventListener('click', async()=>{ log('GET /api/users'); try{ const res=await mock['/api/users'](); log(JSON.stringify(res)); }catch(e){ log(JSON.stringify(e)); }});
  document.getElementById('btn-error')?.addEventListener('click', async()=>{ log('GET /api/error'); try{ await mock['/api/error'](); }catch(e){ log(JSON.stringify(e)); }});

  // Atajos de teclado: t (tema), l (idioma), g (GitHub)
  window.addEventListener('keydown', (e) => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key.toLowerCase() === 't') document.getElementById('theme-toggle')?.click();
    if (e.key.toLowerCase() === 'l') document.getElementById('lang-toggle')?.click();
    if (e.key.toLowerCase() === 'g') window.open('https://github.com/LuisSerranoCardoso','_blank');
  }, { passive: true });

  // Efecto de code rain
  const codeRainToggle = document.getElementById('code-rain-toggle');
  const codeRainContainer = document.createElement('div');
  codeRainContainer.className = 'code-rain';
  document.body.appendChild(codeRainContainer);

  const createRain = () => {
    const span = document.createElement('span');
    span.textContent = 'const example = "Hello World";';
    span.style.left = Math.random() * 100 + 'vw';
    span.style.animationDuration = Math.random() * 2 + 3 + 's';
    codeRainContainer.appendChild(span);
    setTimeout(() => span.remove(), 5000);
  };

  let rainInterval;
  codeRainToggle.addEventListener('click', () => {
    if (rainInterval) {
      clearInterval(rainInterval);
      rainInterval = null;
      codeRainContainer.innerHTML = ''; // Clear rain
    } else {
      rainInterval = setInterval(createRain, 300);
    }
  });

  // Funcionalidad del modal
  const modal = document.getElementById('project-modal');
  const closeModal = modal.querySelector('.close');
  const tabs = modal.querySelectorAll('.tab');
  const tabContents = modal.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.hidden = true);
      tab.classList.add('active');
      const contentId = tab.dataset.tab;
      modal.querySelector(`#${contentId}`).hidden = false;
    });
  });

  closeModal.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  });

  // Función para abrir el modal (puedes llamarla desde un botón o evento)
  const openModal = (title, summary, code, tech) => {
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('#summary').textContent = summary;
    modal.querySelector('#code').textContent = code;
    modal.querySelector('#tech').textContent = tech;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  };

  // ...existing code...
});