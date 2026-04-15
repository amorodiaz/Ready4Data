/* ═══════════════════════════════════════════════════════════
   Ready4Data — Shared Scroll & Navigation Experience
   Inspired by lens.google.com interactive design
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. INJECT SCROLL-TO-TOP BUTTON ── */
  const topBtn = document.createElement('button');
  topBtn.id = 'scroll-top';
  topBtn.setAttribute('aria-label', 'Volver arriba');
  topBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 14V4M4 9l5-5 5 5" stroke="white" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── 2. SCROLL PROGRESS BAR ── */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progressBar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ── 3. HEADER: scroll class + hide/show on direction ── */
  const header = document.getElementById('main-header');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function handleScroll() {
    const y = window.scrollY;
    const delta = y - lastScrollY;

    // Scroll progress
    updateProgress();

    // Scroll-to-top visibility
    topBtn.classList.toggle('visible', y > 400);

    // Header scrolled class
    if (header) {
      header.classList.toggle('scrolled', y > 20);

      // Hide on scroll DOWN (>120px from top), show on scroll UP
      if (y > 120) {
        if (delta > 4) {
          header.classList.add('header-hidden');
          header.classList.remove('header-peek');
        } else if (delta < -4) {
          header.classList.remove('header-hidden');
          header.classList.add('header-peek');
        }
      } else {
        header.classList.remove('header-hidden', 'header-peek');
      }
    }

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  // Run once on load
  updateProgress();
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);

  /* ── 4. ACTIVE NAV LINK based on current page ── */
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#main-nav a, #mob-nav a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── 5. HERO PARALLAX ── */
  const heroBg = document.querySelector('.hero-bg, .page-hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      // Only parallax while hero is visible
      if (y < window.innerHeight * 1.5) {
        heroBg.style.transform = `translateY(${y * 0.35}px)`;
      }
    }, { passive: true });
  }

  /* ── 6. INTERSECTION OBSERVER SETUP ── */
  const obsOptions = { threshold: 0.08, rootMargin: '0px 0px -40px 0px' };

  // Reveal: .rv, .rv-left, .rv-right, .rv-scale → .in
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, obsOptions);

  document.querySelectorAll('.rv, .rv-left, .rv-right, .rv-scale').forEach(el => {
    revealObs.observe(el);
  });

  // Section frame underline: .sec-frame → .in
  const frameObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        frameObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.sec-frame').forEach(el => frameObs.observe(el));

  // Image parallax zoom: .iz → .iz-in
  const zoomObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('iz-in');
        zoomObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.iz').forEach(el => zoomObs.observe(el));

  // Feature cards: staggered .vis
  const featObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        featObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.feat-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 0.08) + 's';
    featObs.observe(el);
  });

  // Progress bars: animate width on scroll
  const pbObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = e.target.dataset.target;
        if (target) e.target.style.width = target + '%';
        pbObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.pb-fill').forEach(el => pbObs.observe(el));

  // Stat counters
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    let start = null;
    const dur = 1800;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor(p * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  const statObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]:not(.pb-fill)').forEach(el => statObs.observe(el));

  /* ── 7. HAMBURGER / MOBILE NAV ── */
  const hamburger = document.getElementById('hamburger');
  const mobNav = document.getElementById('mob-nav');
  const mobClose = document.getElementById('mob-close');

  function openMobNav() {
    mobNav?.classList.add('open');
    hamburger?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobNav() {
    mobNav?.classList.remove('open');
    hamburger?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openMobNav);
  mobClose?.addEventListener('click', closeMobNav);

  // Close mobile nav on link click
  mobNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobNav));

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobNav();
  });

  /* ── 8. SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight + 16 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── 9. STAGGER .rv inside grids automatically ── */
  document.querySelectorAll('.feat-grid, .path-grid, .level-grid, .pgrid, .blog-grid').forEach(grid => {
    grid.querySelectorAll(':scope > *').forEach((child, i) => {
      if (child.classList.contains('rv') && !child.classList.contains('d1') && !child.classList.contains('d2')) {
        child.style.transitionDelay = (i * 0.07) + 's';
      }
    });
  });

})();
