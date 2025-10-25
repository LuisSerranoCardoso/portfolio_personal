document.addEventListener('DOMContentLoaded', async () => {
  const $ = (s, d=document) => d.querySelector(s);
  const $$ = (s, d=document) => [...d.querySelectorAll(s)];
  $('#year') && ($('#year').textContent = new Date().getFullYear());

  // THEME persistente + icono
  const themeBtn = $('#theme-toggle');
  const setIcon = (t) => {
    const icon = themeBtn?.querySelector('i');
    if (!icon) return;
    icon.className = t === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    icon.setAttribute('aria-hidden','true');
  };
  const savedTheme = localStorage.getItem('theme3') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  setIcon(savedTheme);
  themeBtn?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme3', next);
    setIcon(next);
  });

  // Accent picker
  const accentBtn = $('#accent-toggle');
  const panel = $('#accent-panel');
  const applyAccent = ({ brand, brand2, accent } = {}) => {
    const root = document.documentElement;
    if (brand) root.style.setProperty('--brand', brand);
    if (brand2) root.style.setProperty('--brand-2', brand2);
    if (accent) root.style.setProperty('--accent', accent);
  };
  try {
    const saved = JSON.parse(localStorage.getItem('accent3') || '{}');
    if (saved && (saved.brand || saved.accent)) applyAccent(saved);
  } catch {}
  accentBtn?.addEventListener('click', (e) => {
    if (!panel) return;
    const open = panel.hidden === false;
    panel.hidden = open;
    accentBtn.setAttribute('aria-expanded', String(!open));
    e.stopPropagation();
  });
  document.addEventListener('click', (e) => {
    if (!panel || panel.hidden) return;
    const path = e.composedPath();
    if (!path.includes(panel) && !path.includes(accentBtn)) {
      panel.hidden = true; accentBtn?.setAttribute('aria-expanded','false');
    }
  });
  panel?.querySelectorAll('.swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      const payload = { brand: sw.dataset.brand, brand2: sw.dataset.brand2, accent: sw.dataset.accent };
      applyAccent(payload);
      localStorage.setItem('accent3', JSON.stringify(payload));
      panel.hidden = true; accentBtn?.setAttribute('aria-expanded','false');
    });
  });

  // Scroll progress + header shadow
  const bar = $('#scroll-progress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const sc = h.scrollTop / (h.scrollHeight - h.clientHeight);
    if (bar) bar.style.transform = `scaleX(${sc})`;
    $('.header')?.classList.toggle('scrolled', h.scrollTop > 8);
  }, { passive: true });

  // Typed (terminal)
  const lines = [
    'whoami: lserrano // cyber defense',
    'ops> deploy detections --sigma --siem splunk',
    'ops> hunt --ttps T1059,T1027,T1055',
    'ops> harden --cis --stig --kiosks',
    'ops> rca --graph --ioc --stix',
  ];
  let typed = new Typed('#typed', { strings: lines, typeSpeed: 32, backSpeed: 14, backDelay: 900, loop: true, smartBackspace: true, showCursor: false });

  // Reveal imágenes
  const imgs = $$('.reveal-img');
  const ioReveal = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); ioReveal.unobserve(e.target); } });
  }, { threshold: 0.4 });
  imgs.forEach(i => ioReveal.observe(i));

  // Tilt
  if (window.VanillaTilt) $$('.tilt').forEach(el => VanillaTilt.init(el, { max: 8, speed: 600, glare: true, 'max-glare': .12 }));

  // Filtros de proyectos
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.project').forEach(card => {
      const ok = f === 'all' || (card.dataset.category || '').includes(f);
      card.style.display = ok ? '' : 'none';
    });
  }));

  // Copy buttons
  $$('.btn-copy').forEach(b => b.addEventListener('click', async () => {
    const txt = b.getAttribute('data-copy') || '';
    try { await navigator.clipboard.writeText(txt); b.textContent = 'Copiado ✓'; setTimeout(()=>b.textContent='Copiar', 900); } catch {}
  }));

  // Playground mock
  const latRange = $('#latency'), latVal = $('#latency-val');
  const errRange = $('#errorp'), errVal = $('#errorp-val');
  let latency = Number(latRange?.value || 420); let errorp = Number(errRange?.value || 12);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const shouldFail = () => Math.random()*100 < errorp;
  const mock = {
    '/api/ping': async () => { await wait(latency); return { ok:true, t:Date.now() }; },
    '/api/threats': async () => { await wait(latency); if (shouldFail()) throw { error:'intel-source-failed' }; return [{ttp:'T1059'},{ttp:'T1027'}]; },
    '/api/error': async () => { await wait(latency); throw { error:'forced' }; }
  };
  const log = (msg) => { const c = $('#console'); if (!c) return; c.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`; c.scrollTop = c.scrollHeight; };
  $('#btn-ping')?.addEventListener('click', async()=>{ log('GET /api/ping'); try{ const res=await mock['/api/ping'](); log(JSON.stringify(res)); }catch(e){ log(JSON.stringify(e)); }});
  $('#btn-threats')?.addEventListener('click', async()=>{ log('GET /api/threats'); try{ const res=await mock['/api/threats'](); log(JSON.stringify(res)); }catch(e){ log(JSON.stringify(e)); }});
  $('#btn-error')?.addEventListener('click', async()=>{ log('GET /api/error'); try{ const res=await mock['/api/error'](); log(JSON.stringify(res)); }catch(e){ log(JSON.stringify(e)); }});
  latRange?.addEventListener('input', e => { latency = Number(e.target.value); if (latVal) latVal.textContent = `${latency}ms`; });
  errRange?.addEventListener('input', e => { errorp = Number(e.target.value); if (errVal) errVal.textContent = `${errorp}%`; });

  // Code rain toggle
  const rainBtn = $('#code-rain-toggle'); const rain = $('#code-rain');
  const spawnRain = () => {
    if (!rain) return;
    rain.innerHTML = '';
    for (let i=0;i<28;i++){
      const s = document.createElement('span');
      s.textContent = '10110 ▒▓░ TTP T1059 SIGMA IOC ███ ';
      s.style.left = Math.random()*100+'vw';
      s.style.animationDuration = (8 + Math.random()*10)+'s';
      s.style.animationDelay = (-Math.random()*8)+'s';
      rain.appendChild(s);
    }
  };
  rainBtn?.addEventListener('click', () => {
    const hidden = rain?.hasAttribute('hidden');
    if (hidden) { rain?.removeAttribute('hidden'); spawnRain(); } else { rain?.setAttribute('hidden',''); if (rain) rain.innerHTML=''; }
  });

  // Radar canvas
  const cv = $('#hero-radar'); const ctx = cv?.getContext?.('2d');
  const onResize = () => { if (!cv) return; cv.width = cv.clientWidth; cv.height = cv.clientHeight; };
  window.addEventListener('resize', onResize); onResize();
  let ang = 0;
  function draw(){
    if (!ctx || !cv) return;
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.fillStyle = 'rgba(34,197,94,0.05)'; ctx.fillRect(0,0,cv.width,cv.height);
    const cx = cv.width/2, cy = cv.height/2, r = Math.min(cx, cy)*0.9;
    ctx.strokeStyle = 'rgba(34,197,94,0.18)'; ctx.lineWidth = 1;
    for (let i=1;i<=5;i++){ ctx.beginPath(); ctx.arc(cx,cy,(r*i)/5,0,Math.PI*2); ctx.stroke(); }
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    grad.addColorStop(0,'rgba(34,197,94,0)'); grad.addColorStop(1,'rgba(34,197,94,0.35)');
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang); ctx.translate(-cx,-cy);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,0,Math.PI/10); ctx.closePath(); ctx.fill(); ctx.restore();
    ang += 0.01; requestAnimationFrame(draw);
  }
  draw();

  // Cursor efecto
  const cursor = $('#cursor');
  document.addEventListener('mousemove', e => { if (!cursor) return; cursor.style.left = e.clientX+'px'; cursor.style.top = e.clientY+'px'; });
  $$('.btn, .card, .chip, .btn-icon').forEach(el=>{
    el.addEventListener('mouseenter', ()=>cursor?.classList.add('active'));
    el.addEventListener('mouseleave', ()=>cursor?.classList.remove('active'));
  });

  // Envío de contacto
  const form = $('#contact-form'); const msg = $('#form-message');
  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (!(form.privacy?.checked)) { if (msg){ msg.textContent='❗ Debes aceptar la privacidad.'; msg.style.color='var(--err)'; } return; }
    if (msg){ msg.textContent='Enviando...'; msg.style.color='var(--brand)'; }
    try{
      const fd = new FormData(form);
      const res = await fetch(form.action, { method:'POST', body:fd, headers:{'Accept':'application/json'} });
      if (res.ok){ if (msg){ msg.textContent='✅ Mensaje enviado.'; msg.style.color='var(--ok)'; } form.reset(); }
      else { if (msg){ msg.textContent='❌ Error al enviar.'; msg.style.color='var(--err)'; } }
    }catch{ if (msg){ msg.textContent='🚫 Error de red.'; msg.style.color='var(--err)'; } }
  });

  // ===== DATA DE PROYECTOS MILITARES PROFESIONALES =====
  const PROJECTS = [
    { 
      category:'blue',  
      img:'img/projects/siem-orchestrator.jpg',  
      tags:['SOAR','Kill-Chain','Orchestration'],          
      title:'Orquestador Defensivo Kill-Chain', 
      desc:'Sala de control SOAR con automatización de respuesta, integración SIEM y flujos de kill-chain para neutralización táctica.' 
    },
    { 
      category:'blue',   
      img:'img/projects/sigma-compiler.jpg',   
      tags:['Sigma','SIEM','Detección'],          
      title:'Sigma → SIEM Compiler',          
      desc:'Compilador multi-backend (Splunk/Elastic/QRadar) de reglas Sigma para detección unificada en entornos heterogéneos.' 
    },
    { 
      category:'intel', 
      img:'img/projects/airgap-forensics.jpg',    
      tags:['Forensics','Air-Gap','Análisis'],          
      title:'Forensics Air-Gapped',     
      desc:'Toolkit forense para entornos aislados: write-blockers, análisis de memoria/disco, cadena de custodia y reporting.' 
    },
    { 
      category:'blue',  
      img:'img/projects/stig-cis-baselines.jpg',  
      tags:['STIG','CIS','Hardening'],           
      title:'Baselines STIG/CIS Automáticos',     
      desc:'Framework de hardening automático con playbooks Ansible/Puppet para cumplimiento STIG/CIS en sistemas tácticos.' 
    },
    { 
      category:'red', 
      img:'img/projects/adversary-emulation.jpg',
      tags:['ATT&CK','Emulation','Red Team'],
      title:'Adversary Emulation Profiles',     
      desc:'Planes de emulación adversaria mapeados a MITRE ATT&CK con cobertura TTP completa para validación defensiva.' 
    },
    { 
      category:'intel',   
      img:'img/projects/ti-fusion.jpg', 
      tags:['CTI','STIX','TAXII'],    
      title:'Threat Intel Fusion Center',    
      desc:'Centro de fusión CTI: agregación multi-feed, normalización STIX/TAXII, correlación de IOCs y distribución automatizada.' 
    },
  ];

  function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = PROJECTS.map(p => `
      <article class="card project tilt fade-in" data-category="${p.category}">
        <div class="card-media reveal-img">
          <img src="${p.img}" alt="${p.title}" loading="lazy">
        </div>
        <div class="card-body">
          <div class="tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="card-actions">
            <a href="#" class="btn-icon project-link" aria-label="Ver detalles"><i class="fa-regular fa-eye"></i></a>
            <a href="https://github.com/LuisSerranoCardoso" target="_blank" class="btn-icon" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
          </div>
        </div>
      </article>
    `).join('');

    // Fallback si alguna imagen falla
    grid.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => {
        img.src = 'img/projects/placeholder.jpg';
        img.alt = 'Imagen no disponible';
      });
    });

    // Re-init reveal y tilt tras render
    const items = grid.querySelectorAll('.reveal-img');
    items.forEach(i => ioReveal.observe(i));
    if (window.VanillaTilt) grid.querySelectorAll('.tilt').forEach(el => VanillaTilt.init(el, { max: 8, speed: 600, glare: true, 'max-glare': .12 }));
  }

  renderProjects();

  // ===== SISTEMA DE IDIOMAS (i18n) =====
  const translations = {
    es: {
      nav: {
        projects: 'Operaciones',
        lab: 'Laboratorio',
        intel: 'Intelligence',
        contact: 'Contacto'
      },
      hero: {
        title: 'Ciberseguridad Militar & Operaciones',
        desc: 'Threat hunting, hardening, respuesta a incidentes y tooling para operaciones defensivas y ofensivas.',
        cta1: 'Ver Operaciones',
        cta2: 'Contactar',
        stats: ['Findings', 'Herramientas', 'Misiones']
      },
      sections: {
        projects: 'Operaciones destacadas',
        lab: 'Laboratorio táctico',
        intel: 'Intelligence Hub',
        contact: 'Contacto'
      },
      filters: {
        all: 'Todos',
        blue: 'Blue',
        red: 'Red',
        intel: 'Intel'
      },
      contact: {
        name: 'Nombre',
        email: 'Email',
        subject: 'Asunto',
        message: 'Mensaje',
        privacy: 'Acepto la política de privacidad',
        send: 'Enviar',
        sending: 'Enviando...',
        success: '✅ Mensaje enviado correctamente',
        error: '❌ Error al enviar el mensaje'
      },
      footer: {
        rights: 'Todos los derechos reservados'
      }
    },
    en: {
      nav: {
        projects: 'Operations',
        lab: 'Lab',
        intel: 'Intelligence',
        contact: 'Contact'
      },
      hero: {
        title: 'Military Cybersecurity & Operations',
        desc: 'Threat hunting, hardening, incident response and tooling for defensive and offensive operations.',
        cta1: 'View Operations',
        cta2: 'Contact',
        stats: ['Findings', 'Tools', 'Missions']
      },
      sections: {
        projects: 'Featured Operations',
        lab: 'Tactical Lab',
        intel: 'Intelligence Hub',
        contact: 'Contact'
      },
      filters: {
        all: 'All',
        blue: 'Blue',
        red: 'Red',
        intel: 'Intel'
      },
      contact: {
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        privacy: 'I accept the privacy policy',
        send: 'Send',
        sending: 'Sending...',
        success: '✅ Message sent successfully',
        error: '❌ Error sending message'
      },
      footer: {
        rights: 'All rights reserved'
      }
    }
  };

  let currentLang = localStorage.getItem('lang3') || 'es';

  function applyTranslations() {
    const t = translations[currentLang];
    
    // Nav
    document.querySelectorAll('.nav-link').forEach((link, i) => {
      const keys = ['projects', 'lab', 'intel', 'contact'];
      if (t.nav[keys[i]]) link.textContent = t.nav[keys[i]];
    });

    // Hero
    const heroTitle = $('.hero-text h1');
    const heroDesc = $('.hero-text p');
    if (heroTitle) heroTitle.textContent = t.hero.title;
    if (heroDesc) heroDesc.textContent = t.hero.desc;
    
    const ctaBtns = $$('.hero-cta .btn');
    if (ctaBtns[0]) ctaBtns[0].textContent = t.hero.cta1;
    if (ctaBtns[1]) ctaBtns[1].textContent = t.hero.cta2;

    // Stats labels
    $$('.stat label').forEach((label, i) => {
      if (t.hero.stats[i]) label.textContent = t.hero.stats[i];
    });

    // Section titles
    const sections = ['projects', 'lab', 'intel', 'contact'];
    sections.forEach(sec => {
      const title = $(`#${sec} .section-title`);
      if (title && t.sections[sec]) title.textContent = t.sections[sec];
    });

    // Filters
    $$('.filter-btn').forEach(btn => {
      const filter = btn.dataset.filter;
      if (t.filters[filter]) btn.textContent = t.filters[filter];
    });

    // Contact form
    const contactLabels = {
      name: 'label[for="name"]',
      email: 'label[for="email"]',
      subject: 'label[for="subject"]',
      message: 'label[for="message"]'
    };
    Object.entries(contactLabels).forEach(([key, sel]) => {
      const label = $(sel);
      if (label && t.contact[key]) label.textContent = t.contact[key];
    });

    const privacyLabel = $('.checkbox span');
    if (privacyLabel) privacyLabel.textContent = t.contact.privacy;

    const submitBtn = $('#contact-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = t.contact.send;
  }

  // Toggle idioma
  const langBtn = document.createElement('button');
  langBtn.className = 'chip';
  langBtn.id = 'lang-toggle';
  langBtn.textContent = currentLang.toUpperCase();
  langBtn.setAttribute('aria-label', 'Cambiar idioma');
  $('.header .actions')?.insertBefore(langBtn, $('#theme-toggle'));

  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('lang3', currentLang);
    langBtn.textContent = currentLang.toUpperCase();
    applyTranslations();
  });

  applyTranslations();

  // ===== ANIMACIÓN DE CONTADORES =====
  function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(start);
      }
    }, 16);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stats = [
          { el: $('#stat-cves'), value: 247 },
          { el: $('#stat-tools'), value: 18 },
          { el: $('#stat-missions'), value: 32 }
        ];
        stats.forEach(({ el, value }) => {
          if (el) animateCounter(el, value);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = $('.stats');
  if (statsSection) statsObserver.observe(statsSection);

  // ===== SISTEMA DE TOASTS =====
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Usar en formulario de contacto
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!(form.privacy?.checked)) {
      showToast('❗ Debes aceptar la privacidad', 'error');
      return;
    }
    showToast('Enviando mensaje...', 'info');
    try {
      const fd = new FormData(form);
      const res = await fetch(form.action, { method:'POST', body:fd, headers:{'Accept':'application/json'} });
      if (res.ok) {
        showToast('✅ Mensaje enviado correctamente', 'success');
        form.reset();
      } else {
        showToast('❌ Error al enviar', 'error');
      }
    } catch {
      showToast('🚫 Error de red', 'error');
    }
  });

  // Ocultar loader cuando todo esté listo
  window.addEventListener('load', () => {
    const loader = $('#page-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  });
});