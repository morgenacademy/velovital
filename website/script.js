/* ===== VELO VITAL — interactions ===== */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- scroll reveal --- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* --- nav scrolled state --- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- mobile menu (built dynamically) --- */
  const burger = document.getElementById('burger');
  const mobile = document.createElement('nav');
  mobile.className = 'nav__mobile';
  mobile.setAttribute('aria-label', 'Mobiel menu');
  mobile.innerHTML = `
    <a href="#opties">Hoe het werkt</a>
    <a href="#lidmaatschap">Lidmaatschap</a>
    <a href="#verhalen">Verhalen</a>
    <a href="vakanties.html">Fietsvakanties</a>
    <a href="#join" class="btn btn--lg">Join the ride</a>`;
  document.body.appendChild(mobile);
  const toggleMenu = (open) => {
    const state = open ?? !mobile.classList.contains('open');
    mobile.classList.toggle('open', state);
    burger.classList.toggle('open', state);
    document.body.classList.toggle('menu-open', state);
    burger.setAttribute('aria-expanded', String(state));
  };
  burger.addEventListener('click', () => toggleMenu());
  mobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  /* --- animated counters --- */
  const nums = document.querySelectorAll('.stat__num[data-count]');
  const runCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1500; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach((n) => co.observe(n));
  } else {
    nums.forEach((n) => { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
  }

  /* --- cursor glow --- */
  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(hover:hover)').matches && !reduce) {
    let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * 0.12; cy += (y - cy) * 0.12;
      glow.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* --- magnetic buttons --- */
  if (window.matchMedia('(hover:hover)').matches && !reduce) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.18}px, ${my * 0.28 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* --- verhalen swiper --- */
  const slider = document.getElementById('verhalenSlider');
  const dots = document.querySelectorAll('.verhalen__dot');
  const prevBtn = document.getElementById('verhalenPrev');
  const nextBtn = document.getElementById('verhalenNext');
  if (slider && dots.length) {
    let current = 0;
    const slides = slider.querySelectorAll('.verhalen__slide');
    const total = slides.length;
    const goTo = (i) => {
      current = ((i % total) + total) % total;
      slides[current].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    };
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, idx) => d.addEventListener('click', () => goTo(idx)));
    /* auto-advance */
    let auto = setInterval(() => goTo(current + 1), 6000);
    slider.addEventListener('pointerdown', () => clearInterval(auto));
  }

  /* --- FAQ: single-open accordion --- */
  const faqs = document.querySelectorAll('.faq__item');
  faqs.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqs.forEach((o) => { if (o !== item) o.open = false; });
    });
  });

  /* --- join form --- */
  const form = document.getElementById('joinForm');
  const success = document.getElementById('joinSuccess');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const naam = form.naam.value.trim();
      const email = form.email.value.trim();
      const valid = naam && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      if (!valid) {
        [form.naam, form.email].forEach((f) => {
          if (!f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value))) {
            f.style.borderColor = '#fff';
            f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          }
        });
        return;
      }
      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
  }
})();
