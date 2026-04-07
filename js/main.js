/* =============================================
   NAVIGA — main.js
   All animations & interactions
   UI/UX Pro Max: 150–300ms transitions, cursor-pointer,
   contrast WCAG AA, prefers-reduced-motion support
   ============================================= */

/* Respect prefers-reduced-motion globally */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileMenu();
  initFadeElements();
  initScrollTextReveal();
  initCarousels();
  initCounters();
  if (!prefersReducedMotion) initHeroParallax();
  setActiveNavLink();
  addCursorPointers();
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
  handler();
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

  if (prefersReducedMotion) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  targets.forEach(el => io.observe(el));
}

/* =============================================
   4. SCROLL TEXT REVEAL (word-by-word)
   FIX: text now reveals while the section is
   comfortably within the viewport, not after.
   ============================================= */
function initScrollTextReveal() {
  const textEl = document.querySelector('.reveal-text');
  if (!textEl) return;

  // If prefers-reduced-motion: just show all words immediately
  if (prefersReducedMotion) {
    textEl.querySelectorAll('.reveal-word').forEach(w => {
      w.style.opacity = 1;
      w.classList.add('lit');
    });
    const html = textEl.innerHTML;
    const words = html.split(/(\s+)/);
    textEl.innerHTML = words.map(w => {
      if (w.trim() === '') return w;
      return `<span class="reveal-word lit">${w}</span>`;
    }).join('');
    return;
  }

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

    /*
     * FIXED TIMING: The reveal now starts as soon as the section
     * enters the viewport and completes well before the user
     * has scrolled past it. The reveal range is tightened to
     * the comfortable reading zone (top 70% of the viewport).
     *
     * progress = 0: section top just enters the screen (bottom of viewport)
     * progress = 1: section top has scrolled up to 30% of viewport height
     */
    const enterPoint  = windowH;          // section top == bottom of screen
    const exitPoint   = windowH * 0.15;   // section top == 15% from top (well within view)
    const scrolledIn  = windowH - rect.top;
    const range       = enterPoint - exitPoint;
    const progress    = Math.max(0, Math.min(1, scrolledIn / range));

    words.forEach((word, i) => {
      // Each word lights up sequentially, staggered across the progress range
      const wordThreshold = (i / words.length) * 0.75;
      const wordProgress  = Math.max(0, (progress - wordThreshold) / 0.25);
      const opacity       = Math.min(1, Math.max(0.12, wordProgress * 3));
      const isLit         = wordProgress > 0.6;
      const isAccent      = accentWords.some(aw => word.textContent.includes(aw));

      word.style.opacity = opacity;
      word.classList.toggle('lit',        isLit && !isAccent);
      word.classList.toggle('accent-lit', isLit && isAccent);
    });
  };

  window.addEventListener('scroll', updateReveal, { passive: true });
  updateReveal(); // run once on load
}

/* =============================================
   5. CAROUSELS (Testimonials + others)
   ============================================= */
function initCarousels() {
  document.querySelectorAll('.carousel-wrap').forEach(wrap => {
    const track   = wrap.querySelector('.carousel-track');
    const slides  = wrap.querySelectorAll('.carousel-track > *');
    const dots    = wrap.querySelectorAll('.carousel-dot');
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
    const stopAuto  = () => clearInterval(autoTimer);

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
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = prefersReducedMotion ? 0 : 1800;
      const start  = performance.now();

      if (duration === 0) { el.textContent = target + suffix; return; }

      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
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
    blob.style.transform = `translateY(${window.scrollY * 0.22}px)`;
  }, { passive: true });
}

/* =============================================
   8. SET ACTIVE NAV LINK
   ============================================= */
function setActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .nav-mobile-overlay a').forEach(a => {
    const href   = a.getAttribute('href') || '';
    const isHome = (path === '/' || path.endsWith('index.html')) && (href === 'index.html' || href === '/');
    const isMatch = href && path.endsWith(href);
    a.classList.toggle('active', isHome || isMatch);
  });
}

/* =============================================
   9. CURSOR POINTER — UI/UX Pro Max rule:
   All clickable elements must have cursor:pointer
   ============================================= */
function addCursorPointers() {
  const clickables = document.querySelectorAll(
    'a, button, [role="button"], .carousel-dot, .service-card, .feature-circle, .team-card'
  );
  clickables.forEach(el => {
    if (!el.style.cursor) el.style.cursor = 'pointer';
  });
}
