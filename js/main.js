/* ═══════════════════════════════════════════════════
   REGARDS CROISÉS — Interactions
═══════════════════════════════════════════════════ */

/* ── Navigation ── */
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  if (nav.classList.contains('scrolled')) return; // pages internes : fixé
  /* Sur la homepage le seuil est basé sur la hauteur du hero immersif */
  const isHome = !!document.querySelector('.home-hero');
  const threshold = isHome ? window.innerHeight * 0.88 : 20;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > threshold);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Menu mobile ── */
(function () {
  const toggle  = document.querySelector('.site-nav__toggle');
  const overlay = document.querySelector('.nav-overlay');
  const close   = document.querySelector('.nav-overlay__close');
  if (!toggle || !overlay) return;
  const open = () => { overlay.classList.add('open');  document.body.style.overflow = 'hidden'; };
  const shut = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };
  toggle.addEventListener('click', open);
  close?.addEventListener('click', shut);
  overlay.querySelectorAll('.nav-overlay__link').forEach(l => l.addEventListener('click', shut));
})();

/* ── Fade-up animation ── */
(function () {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  items.forEach(el => io.observe(el));
})();

/* ── Galerie immersive : une seule section active à la fois ── */
(function () {
  const blocks = document.querySelectorAll('.gallery-block');
  if (!blocks.length) return;

  let current = null;
  let rafId   = null;

  function activate(block) {
    if (block === current) return;
    if (current) current.classList.remove('active');
    current = block;
    if (current) current.classList.add('active');
  }

  function update() {
    const vTop = window.scrollY;
    const vBot = window.scrollY + window.innerHeight;
    const vMid = window.scrollY + window.innerHeight * 0.5;

    let best = null, bestDist = Infinity;
    blocks.forEach(b => {
      const center = b.offsetTop + b.offsetHeight * 0.5;
      if (center < vTop || center > vBot) return;
      const dist = Math.abs(center - vMid);
      if (dist < bestDist) { bestDist = dist; best = b; }
    });
    activate(best);
  }

  window.addEventListener('scroll', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(update);
  }, { passive: true });

  update();
  setTimeout(update, 200);
})();

/* ── Galerie : active nav link au scroll ── */
(function () {
  const navLinks = document.querySelectorAll('.gallery-nav__link');
  const sections = document.querySelectorAll('.gallery-block[id]');
  if (!navLinks.length || !sections.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });
  sections.forEach(s => io.observe(s));
})();

/* ── Galerie : scroll vers section via hash URL ── */
(function () {
  if (!document.querySelector('.gallery-block')) return;
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  const navH = 72 + 56;
  const scrollTo = () => {
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };
  requestAnimationFrame(() => setTimeout(scrollTo, 120));
})();

/* ════════════════════════════════════════════════════
   ROUE CIRCULAIRE SVG — génération + rotation ultra-fluide
════════════════════════════════════════════════════ */
(function () {
  const svg = document.getElementById('sinsWheel');
  if (!svg || typeof SINS === 'undefined') return;

  const NS    = 'http://www.w3.org/2000/svg';
  const CX    = 300, CY = 300;
  const R     = 255;
  const HUB   = 45;   /* moyeu réduit pour plus d'impact visuel */
  const N     = SINS.length;
  const GAP   = 0.022;
  const SLICE = (2 * Math.PI) / N;

  const defs = document.getElementById('wheelDefs');
  const segs = document.getElementById('wheelSegs');

  function pt(radius, angle) {
    return [
      +(CX + radius * Math.cos(angle)).toFixed(3),
      +(CY + radius * Math.sin(angle)).toFixed(3)
    ];
  }

  function makePath(i) {
    const a0 = -Math.PI / 2 + i * SLICE + GAP;
    const a1 = -Math.PI / 2 + (i + 1) * SLICE - GAP;
    const large = ((SLICE - 2 * GAP) > Math.PI) ? 1 : 0;
    const [x1, y1] = pt(HUB, a0);
    const [x2, y2] = pt(R,   a0);
    const [x3, y3] = pt(R,   a1);
    const [x4, y4] = pt(HUB, a1);
    return `M${x1},${y1} L${x2},${y2} A${R},${R} 0 ${large},1 ${x3},${y3} L${x4},${y4} A${HUB},${HUB} 0 ${large},0 ${x1},${y1}Z`;
  }

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
    return e;
  }

  /* ── Fond plein écran au hover ── */
  const sinBgEl      = document.getElementById('sinBg');
  const sinBgImg     = document.getElementById('sinBgImg');
  const sinBgOverlay = document.querySelector('.sin-bg__overlay');

  function showSinBg(sin) {
    if (!sinBgEl || !sinBgImg) return;
    /* Coupe l'ancienne image instantanément pour éviter qu'elle reste visible */
    sinBgImg.style.transition = 'none';
    sinBgOverlay.style.transition = 'none';
    sinBgImg.classList.remove('visible');
    sinBgOverlay.classList.remove('visible');
    void sinBgImg.offsetWidth; /* force le reflow pour appliquer le snap */
    sinBgImg.style.transition = '';
    sinBgOverlay.style.transition = '';
    /* Affiche la nouvelle image */
    document.body.style.background = 'transparent';
    sinBgEl.classList.add('active');
    sinBgImg.src = sin.imageFinale;
    sinBgImg.classList.add('visible');
    sinBgOverlay.classList.add('visible');
  }

  function hideSinBg() {
    if (!sinBgEl || !sinBgImg) return;
    sinBgImg.classList.remove('visible');
    sinBgOverlay.classList.remove('visible');
    sinBgEl.classList.remove('active');
    document.body.style.background = ''; /* rétablit le violet */
  }

  SINS.forEach((sin, i) => {
    const d      = makePath(i);
    const midAng = -Math.PI / 2 + (i + 0.5) * SLICE;
    const angDeg = midAng * 180 / Math.PI;
    const flip   = angDeg > 90 && angDeg <= 270;
    const rot    = angDeg + (flip ? 180 : 0);

    const a = el('a', {
      href: `galerie.html#${sin.id}`,
      'aria-label': `${sin.name} — ${sin.title}`,
      class: 'wheel-seg'
    });

    a.style.setProperty('--dx', Math.cos(midAng).toFixed(4));
    a.style.setProperty('--dy', Math.sin(midAng).toFixed(4));

    /* 1. Fond coloré */
    a.appendChild(el('path', { d, fill: sin.color }));

    /* 2. Contour noir */
    a.appendChild(el('path', {
      d,
      fill: 'none',
      stroke: '#000',
      'stroke-width': '6',
      'stroke-linejoin': 'round'
    }));

    /* 3. Nom — centre radial */
    const labelR   = HUB + (R - HUB) * 0.48;
    const [lx, ly] = pt(labelR, midAng);
    const lbl = el('text', {
      x: lx, y: ly,
      class: 'wheel-seg-label',
      transform: `rotate(${rot.toFixed(1)},${lx.toFixed(1)},${ly.toFixed(1)})`
    });
    lbl.textContent = sin.name;
    a.appendChild(lbl);

    /* 4. Numéro */
    const numR     = HUB + (R - HUB) * 0.82;
    const [nx, ny] = pt(numR, midAng);
    const num = el('text', {
      x: nx, y: ny,
      class: 'wheel-seg-num',
      transform: `rotate(${rot.toFixed(1)},${nx.toFixed(1)},${ny.toFixed(1)})`
    });
    num.textContent = sin.number;
    a.appendChild(num);

    /* Hover 1,5 s → fond plein écran */
    let hoverTimer = null;
    a.addEventListener('mouseenter', () => {
      hoverTimer = setTimeout(() => showSinBg(sin), 800);
    });
    a.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      hoverTimer = null;
      hideSinBg();
    });

    segs.appendChild(a);
  });

  /* ══════════════════════════════════════════════════
     ROTATION ULTRA-FLUIDE — angle cible + lerp affiché
  ══════════════════════════════════════════════════ */
  let angle    = 0;   /* angle cible (contrôlé par l'utilisateur) */
  let rendered = 0;   /* angle réellement affiché (lerp vers angle) */
  let velocity = 0;   /* inertie résiduelle en °/frame */
  let dragging = false;
  let lastX    = 0;
  let startX   = 0;
  let rafId    = null;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyRender() {
    svg.style.transform = `rotate(${rendered}deg)`;
  }

  /* Boucle momentum + lerp de décélération */
  function tick() {
    angle    += velocity;
    velocity *= 0.95;          /* friction douce */
    rendered  = lerp(rendered, angle, 0.14); /* settle en douceur */
    applyRender();

    if (Math.abs(velocity) > 0.01 || Math.abs(angle - rendered) > 0.01) {
      rafId = requestAnimationFrame(tick);
    } else {
      rendered = angle;
      applyRender();
      rafId = null;
    }
  }

  function startTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  /* ── Drag souris ── */
  svg.addEventListener('mousedown', e => {
    e.preventDefault();
    dragging = true;
    startX = lastX = e.clientX;
    velocity = 0;
    cancelAnimationFrame(rafId);
    rafId = null;
    document.body.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    velocity  = dx * 0.18;    /* seed du momentum pour le relâché */
    angle    += dx * 0.38;    /* mise à jour directe de l'angle cible */
    rendered  = angle;        /* réponse immédiate sans lerp pendant le drag */
    applyRender();
    lastX = e.clientX;
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.cursor = '';
    startTick(); /* déclenche le momentum + lerp de settle */
  });

  /* Bloquer le clic si drag > 6px */
  svg.addEventListener('click', e => {
    if (Math.abs(e.clientX - startX) > 6) e.preventDefault();
  }, true);

  /* ── Molette / trackpad → rotation ── */
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    cancelAnimationFrame(rafId);
    rafId = null;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    angle   += delta * 0.42;
    velocity = delta * 0.08;
    startTick();
  }, { passive: false });

  /* ── Touch ── */
  let tLastX = 0;
  svg.addEventListener('touchstart', e => {
    tLastX = e.touches[0].clientX;
    startX = tLastX;
    velocity = 0;
    cancelAnimationFrame(rafId);
    rafId = null;
  }, { passive: true });

  svg.addEventListener('touchmove', e => {
    e.preventDefault();
    const dx = e.touches[0].clientX - tLastX;
    velocity  = dx * 0.12;
    angle    += dx * 0.38;
    rendered  = angle;
    applyRender();
    tLastX = e.touches[0].clientX;
  }, { passive: false });

  svg.addEventListener('touchend', () => {
    startTick();
  });
})();

/* ════════════════════════════════════════════════════
   EXPAND "EN SAVOIR DAVANTAGE" — pages concept
════════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.concept-expand__btn').forEach(btn => {
    const content = btn.nextElementSibling;
    if (!content) return;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !isOpen);
      content.classList.toggle('open', !isOpen);
      if (!isOpen) {
        setTimeout(() => content.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    });
  });
})();

/* ════════════════════════════════════════════════════
   SLIDER AFFICHES — pages concept
════════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.concept-slider').forEach(slider => {
    const list   = slider.querySelector('.concept-slider__list');
    const slides = slider.querySelectorAll('.concept-slider__slide');
    const prev   = slider.querySelector('.concept-slider__arrow--prev');
    const next   = slider.querySelector('.concept-slider__arrow--next');
    if (!list) return;

    /* Une seule affiche → flèches masquées */
    if (slides.length < 2) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
      return;
    }

    let cur = 0;
    function go(n) {
      cur = Math.max(0, Math.min(n, slides.length - 1));
      list.style.transform = `translateX(-${cur * 100}%)`;
      prev.disabled = cur === 0;
      next.disabled = cur === slides.length - 1;
    }
    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    go(0);
  });
})();
