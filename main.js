/* ============================================================
   RD MOTOR — Main JavaScript
   ============================================================ */

'use strict';

// ============================================================
// UTILITY
// ============================================================

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const debounce = (fn, delay = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
};

// ============================================================
// NAVBAR
// ============================================================

function initNavbar() {
  const navbar = $('.navbar');
  if (!navbar) return;

  const isTransparent = navbar.classList.contains('navbar--transparent');
  const toggle = $('.navbar__toggle');
  const mobileMenu = $('.navbar__mobile');

  // Set active link
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  $$('.navbar__link, .navbar__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll effect
  const handleScroll = () => {
    if (!isTransparent) return;
    if (window.scrollY > 60) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.add('navbar--transparent');
      navbar.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close on link click
    $$('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      }
    });
  }
}

// ============================================================
// SCROLL REVEAL
// ============================================================

function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ============================================================
// TESTIMONIAL SLIDER
// ============================================================

function initTestimonialSlider() {
  const cards = $$('.testimonial-card');
  const dots = $$('.testimonials__dot');
  const prevBtn = $('#testi-prev');
  const nextBtn = $('#testi-next');
  if (!cards.length) return;

  let current = 0;
  let autoplayTimer;

  const show = (idx) => {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    current = idx;
  };

  const next = () => show((current + 1) % cards.length);
  const prev = () => show((current - 1 + cards.length) % cards.length);

  const startAutoplay = () => {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 5000);
  };

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { show(i); startAutoplay(); });
  });

  show(0);
  startAutoplay();
}

// ============================================================
// INVENTORY FILTER
// ============================================================

function initInventoryFilter() {
  const searchInput = $('#inv-search');
  const filterBrand = $('#filter-brand');
  const filterYear = $('#filter-year');
  const filterPrice = $('#filter-price');
  const cards = $$('.inventory-unit-card');
  const countEl = $('#inv-count');
  const emptyState = $('#inv-empty');

  if (!searchInput || !cards.length) return;

  const filterCards = () => {
    const search = searchInput.value.toLowerCase().trim();
    const brand = filterBrand ? filterBrand.value : '';
    const year = filterYear ? filterYear.value : '';
    const price = filterPrice ? filterPrice.value : '';

    let visible = 0;

    cards.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const cardBrand = (card.dataset.brand || '').toLowerCase();
      const cardYear = card.dataset.year || '';
      const cardPrice = parseInt(card.dataset.price || '0');

      let show = true;

      if (search && !name.includes(search) && !cardBrand.includes(search)) show = false;
      if (brand && cardBrand !== brand.toLowerCase()) show = false;
      if (year && cardYear !== year) show = false;

      if (price && show) {
        if (price === '0-15') show = cardPrice <= 15000000;
        else if (price === '15-25') show = cardPrice > 15000000 && cardPrice <= 25000000;
        else if (price === '25-35') show = cardPrice > 25000000 && cardPrice <= 35000000;
        else if (price === '35+') show = cardPrice > 35000000;
      }

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countEl) countEl.innerHTML = `<span>${visible}</span> unit tersedia`;
    if (emptyState) emptyState.classList.toggle('visible', visible === 0);
  };

  searchInput.addEventListener('input', debounce(filterCards));
  if (filterBrand) filterBrand.addEventListener('change', filterCards);
  if (filterYear) filterYear.addEventListener('change', filterCards);
  if (filterPrice) filterPrice.addEventListener('change', filterCards);
}

// ============================================================
// CREDIT CALCULATOR
// ============================================================

function initCreditCalculator() {
  const form = $('#credit-form');
  if (!form) return;

  const priceEl = $('#credit-price');
  const dpEl = $('#credit-dp');
  const tenorEl = $('#credit-tenor');
  const monthlyEl = $('#credit-monthly');
  const totalEl = $('#credit-total');
  const dpAmtEl = $('#credit-dp-amount');

  const format = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n));

  const calculate = () => {
    const price = parseFloat(priceEl?.value?.replace(/\D/g, '') || 0);
    const dpPercent = parseFloat(dpEl?.value || 20);
    const tenor = parseInt(tenorEl?.value || 24);
    const rate = 0.015; // 1.5% per month flat

    const dp = price * (dpPercent / 100);
    const loan = price - dp;
    const interest = loan * rate * tenor;
    const total = loan + interest;
    const monthly = total / tenor;

    if (monthlyEl) monthlyEl.textContent = 'Rp ' + format(monthly);
    if (totalEl) totalEl.textContent = 'Rp ' + format(total + dp);
    if (dpAmtEl) dpAmtEl.textContent = 'Rp ' + format(dp);
  };

  [dpEl, tenorEl].forEach(el => {
    if (el) el.addEventListener('change', calculate);
  });

  calculate();
}

// ============================================================
// UNIT GALLERY
// ============================================================

function initUnitGallery() {
  const thumbs = $$('.unit-gallery__thumb');
  const mainImg = $('#gallery-main-img');
  if (!thumbs.length || !mainImg) return;

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = thumb.dataset.src;
        mainImg.style.opacity = '1';
      }, 200);
    });
  });
}

// ============================================================
// CONTACT FORM
// ============================================================

function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Mengirim...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Pesan Terkirim';
      btn.style.background = '#2A6E4A';
      form.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1200);
  });
}

// ============================================================
// SMOOTH ANCHOR SCROLL
// ============================================================

function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = $(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height') || '80');
        window.scrollTo({
          top: target.offsetTop - navH - 16,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================================
// COUNTER ANIMATION
// ============================================================

function initCounters() {
  const counters = $$('.count-up');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target || '0');
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          current = increment * step;
          if (step >= steps) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = (Number.isInteger(target) 
            ? Math.round(current) 
            : current.toFixed(1)) + suffix;
        }, duration / steps);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ============================================================
// INIT ALL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initTestimonialSlider();
  initInventoryFilter();
  initCreditCalculator();
  initUnitGallery();
  initContactForm();
  initSmoothScroll();
  initCounters();
});
