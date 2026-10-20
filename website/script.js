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
    <a href="index.html#agenda">Agenda</a>
    <a href="index.html#opties">Hoe het werkt</a>
    <a href="index.html#lidmaatschap">Lidmaatschap</a>
    <a href="verhalen.html">Verhalen</a>
    <a href="vakanties.html">Fietsvakanties</a>
    <a href="index.html#join" class="btn btn--lg">Join the ride</a>`;
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

  /* --- forms --- */
  const encodeForm = (form) => {
    const data = new URLSearchParams(new FormData(form));
    data.set('form-name', form.name);
    return data.toString();
  };
  const handleForm = (form, success, requiredFields, redirect) => {
    if (!form) return;
    const error = document.createElement('p');
    error.setAttribute('role', 'alert');
    error.hidden = true;
    form.appendChild(error);
    let sending = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      error.hidden = true;
      const valid = requiredFields.every((field) => {
        const input = form.elements[field];
        if (!input) return true;
        const value = input.value.trim();
        return input.type === 'email' ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) : Boolean(value);
      });
      if (!valid) {
        requiredFields.forEach((field) => {
          const f = form.elements[field];
          if (!f) return;
          const value = f.value.trim();
          const fieldValid = f.type === 'email' ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) : Boolean(value);
          if (!fieldValid) {
            f.style.borderColor = '#fff';
            f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
          }
        });
        return;
      }
      const showSuccess = () => {
        if (redirect) { redirect(form); return; }
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        }
      };
      const isLocalPreview = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
      if (window.location.protocol === 'file:' || isLocalPreview) {
        error.textContent = 'Dit is een voorbeeldweergave. Je inschrijving is niet verstuurd. Meld je aan op velovital.nl.';
        error.hidden = false;
        return;
      }
      const button = form.querySelector('[type="submit"]');
      sending = true;
      if (button) button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeForm(form)
        });
        if (!response.ok) throw new Error('Submission failed');
        showSuccess();
      } catch (err) {
        error.textContent = 'Versturen is niet gelukt. Probeer het opnieuw of mail naar info@velovital.nl. Je gegevens staan nog in het formulier.';
        error.hidden = false;
      } finally {
        sending = false;
        if (button) button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  };

  /* Na aanmelden via Join the ride: door naar de welkomstpagina (velovital.nl/welkom) */
  const toWelkom = (form) => {
    try {
      const checked = form.querySelector('input[name="situatie"]:checked');
      sessionStorage.setItem('vv-aanmelding', JSON.stringify({
        naam: form.elements.naam ? form.elements.naam.value : '',
        situatie: checked ? checked.value : ''
      }));
    } catch (err) { /* opslag niet beschikbaar: welkomstpagina werkt ook zonder naam */ }
    window.location.href = '/welkom';
  };
  handleForm(document.getElementById('joinForm'), document.getElementById('joinSuccess'), ['naam', 'email'], toWelkom);
})();

/* ===== AGENDA & INSCHRIJVINGEN — automatisch op datum =====
   Agenda-kaart (index.html, .agenda__list):
     data-datum="2026-10-18T09:00"   start van het event (Nederlandse tijd)
     data-eind="2026-10-18T13:00"    optioneel; zonder eind telt de hele dag
     data-verlopen-tekst="..."       optioneel; vervangt de tekst als het event voorbij is
     data-reserve                    reservekaart: alleen zichtbaar als er geen komende events zijn
   Een kaart zonder data-datum (en zonder data-reserve) blijft altijd staan.
   Er staan maximaal 3 kaarten: eerst de laatst verlopen events (doorgestreept), dan wat er nog komt.
   Komt er iets nieuws bij, dan valt het oudste verlopen event bovenaan weg.

   Inschrijfformulier:
     data-sluit-op="2026-10-18T09:00"  vanaf dit moment is aanmelden gesloten
     data-gesloten-tekst="..."          optionele eigen tekst in de gesloten-melding
   Zet hetzelfde moment ook in netlify/edge-functions/event-capacity.js, dan weigert de server het ook. */
(() => {
  'use strict';
  const MAX = 3;
  const now = Date.now();
  const parse = (value, endOfDay) => {
    if (!value) return null;
    const iso = value.length <= 10 ? value + (endOfDay ? 'T23:59:59' : 'T00:00') : value;
    const t = new Date(iso).getTime();
    return Number.isNaN(t) ? null : t;
  };

  /* --- agenda --- */
  const list = document.querySelector('.agenda__list');
  if (list) {
    const cards = [...list.querySelectorAll('.agenda-card')].map((el, i) => {
      const start = parse(el.dataset.datum, false);
      const end = el.dataset.eind ? parse(el.dataset.eind, true)
        : (el.dataset.datum ? parse(el.dataset.datum.slice(0, 10), true) : null);
      return { el, i, start, end, reserve: el.hasAttribute('data-reserve') };
    });
    const dated = cards.filter((c) => c.start !== null && !c.reserve);
    const past = dated.filter((c) => c.end < now).sort((a, b) => a.start - b.start);
    const upcoming = dated.filter((c) => c.end >= now).sort((a, b) => a.start - b.start);
    const always = cards.filter((c) => c.start === null && !c.reserve);
    const reserve = cards.filter((c) => c.reserve);

    let ahead = [...upcoming, ...always];
    if (!upcoming.length) ahead = [...ahead, ...reserve];
    ahead = ahead.slice(0, MAX);
    const room = MAX - ahead.length;
    const behind = room > 0 ? past.slice(-room) : [];
    const shown = [...behind, ...ahead];

    past.forEach(({ el }) => {
      el.classList.add('agenda-card--past');
      const label = el.querySelector('.agenda-card__label');
      if (label) label.textContent = 'Geweest';
      const text = el.querySelector('.agenda-card__body p');
      if (text && el.dataset.verlopenTekst) text.textContent = el.dataset.verlopenTekst;
      const title = el.querySelector('h3');
      if (title) el.setAttribute('aria-label', `${title.textContent} (geweest)`);
    });
    cards.forEach(({ el }) => { el.hidden = !shown.some((c) => c.el === el); });
    shown.forEach(({ el }, n) => {
      el.style.setProperty('--d', `${0.06 * (n + 1)}s`);
      list.appendChild(el);
    });
    list.classList.add('is-ready');
  }

  /* --- inschrijfformulieren sluiten na hun datum --- */
  document.querySelectorAll('form[data-sluit-op]').forEach((form) => {
    const closesAt = parse(form.dataset.sluitOp, false);
    if (closesAt === null || now < closesAt) return;
    form.hidden = true;
    const box = document.createElement('div');
    box.className = 'event__success event__closed';
    box.setAttribute('role', 'status');
    const h = document.createElement('h3');
    h.textContent = 'Aanmelden is gesloten';
    const p = document.createElement('p');
    p.textContent = form.dataset.geslotenTekst ||
      'Deze datum is voorbij, dus aanmelden kan niet meer. Wil je horen wanneer de volgende rit is? Word gratis community member.';
    const a = document.createElement('a');
    a.href = '/index.html#join';
    a.className = 'btn btn--lg';
    a.textContent = 'Word gratis community member';
    box.append(h, p, a);
    form.after(box);
  });
})();
