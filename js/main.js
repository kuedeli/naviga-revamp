/* =============================================
   NAVIGA — main.js
   All animations & interactions
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initFadeElements();
  initScrollTextReveal();
  initCarousels();
  initCounters();
  initHeroParallax();
  setActiveNavLink();
});

/* =============================================
   1. STICKY NAV
   ============================================= */
function initStickyNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const handler = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', handler, { passive: true });
  handler(); // run on load
}

/* =============================================
   2. MOBILE MENU
   ============================================= */
function initMobileMenu() {
  const burger = document.querySelector('.nav-burger');
  const overlay = document.querySelector('.nav-mobile-overlay');
  const closeBtn = document.querySelector('.nav-mobile-close');

  if (!burger || !overlay) return;

  burger.addEventListener('click', () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    animateBurger(burger, true);
  });

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    animateBurger(burger, false);
  };

  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

function animateBurger(burger, open) {
  const spans = burger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
}

/* =============================================
   3. FADE-IN ELEMENTS (IntersectionObserver)
   ============================================= */
function initFadeElements() {
  const targets = document.querySelectorAll('.fade-up, .fade-in, .stagger-children');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
}

/* =============================================
   4. SCROLL TEXT REVEAL (word-by-word)
   ============================================= */
function initScrollTextReveal() {
  const textEl = document.querySelector('.reveal-text');
  if (!textEl) return;

  // Split into word spans if not already done
  if (!textEl.querySelector('.reveal-word')) {
    const html = textEl.innerHTML;
    const words = html.split(/(\s+)/);
    textEl.innerHTML = words.map(w => {
      if (w.trim() === '') return w;
      return `<span class="reveal-word">${w}</span>`;
    }).join('');
  }

  const words = textEl.querySelectorAll('.reveal-word');
  const section = textEl.closest('.scroll-text-section');
  if (!section) return;

  // Accent certain key words
  const accentWords = ['Naviga', 'Transformation', 'Mindset', 'zukunftstauglichen', 'zeitgemässen'];

  const updateReveal = () => {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;
    // Progress: 0 when top of section hits bottom of window, 1 when section bottom hits top
    const progress = Math.max(0, Math.min(1, (windowH - rect.top) / (windowH + rect.height)));
    const revealThreshold = 0.25;
    const adjustedProgress = Math.max(0, (progress - revealThreshold) / (1 - revealThreshold));

    words.forEach((word, i) => {
      const wordProgress = adjustedProgress - (i / words.length) * 0.7;
      const opacity = Math.min(1, Math.max(0.12, wordProgress * 4));
      const isLit = wordProgress > 0.4;
      const isAccent = accentWords.some(aw => word.textContent.includes(aw));

      word.style.opacity = opacity;
      word.classList.toggle('lit', isLit && !isAccent);
      word.classList.toggle('accent-lit', isLit && isAccent);
    });
  };

  window.addEventListener('scroll', updateReveal, { passive: true });
  updateReveal();
}

/* =============================================
   5. CAROUSELS (Testimonials + others)
   ============================================= */
function initCarousels() {
  document.querySelectorAll('.carousel-wrap').forEach(wrap => {
    const track = wrap.querySelector('.carousel-track');
    const slides = wrap.querySelectorAll('.carousel-track > *');
    const dots = wrap.querySelectorAll('.carousel-dot');
    const prevBtn = wrap.querySelector('.carousel-prev');
    const nextBtn = wrap.querySelector('.carousel-next');

    if (!track || !slides.length) return;

    let current = 0;
    let autoTimer;
    const total = slides.length;

    const goTo = (idx) => {
      current = ((idx % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const next = () => goTo(current + 1);
    const prev = () => goTo(current - 1);

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Touch/swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    });

    // Auto-advance
    const startAuto = () => { autoTimer = setInterval(next, 6000); };
    const stopAuto = () => clearInterval(autoTimer);

    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);
    startAuto();

    goTo(0);
  });
}

/* =============================================
   6. COUNTER ANIMATIONS
   ============================================= */
function initCounters() {
  const counters = document.querySelectorAll('.count-up');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

/* =============================================
   7. HERO PARALLAX (blob + scroll)
   ============================================= */
function initHeroParallax() {
  const blob = document.querySelector('.hero-blob');
  if (!blob) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    blob.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
}

/* =============================================
   8. SET ACTIVE NAV LINK
   ============================================= */
function setActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-mobile-overlay a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isHome = (path === '/' || path.endsWith('index.html')) && (href === 'index.html' || href === '/');
    const isMatch = href && path.endsWith(href);
    a.classList.toggle('active', isHome || isMatch);
  });
}
