/* ==========================================================================
   Discount Tree Service & Landcare — interactions
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  // Show the clean URL (/) instead of /index.html
  if (/\/index\.html$/.test(location.pathname) && history.replaceState) {
    history.replaceState(null, '', location.pathname.replace(/index\.html$/, '') + location.search + location.hash);
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header: stuck / hide on scroll down ---------- */
  var header = $('.site-header');
  var hero = $('.hero, .page-hero');
  var floatCta = $('.float-cta');
  var mobileBar = $('.mobile-bar');
  var lastY = window.scrollY;

  function onScrollHeader() {
    var y = window.scrollY;
    var threshold = hero ? Math.max(hero.offsetHeight - 200, 200) : 60;
    if (header) {
      header.classList.toggle('is-stuck', y > 60);
    }
    var est = document.getElementById('estimate');
    var estR = est ? est.getBoundingClientRect() : null;
    var formVisible = estR && estR.top < window.innerHeight * 0.85 && estR.bottom > 0;
    if (floatCta) floatCta.classList.toggle('show', y > threshold && !formVisible);
    if (mobileBar) mobileBar.classList.toggle('show', y > 300);
    lastY = y;
  }

  /* ---------- Mobile nav ---------- */
  var toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Split headline into masked lines ---------- */
  $$('[data-split]').forEach(function (el) {
    var lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines.map(function (l) { return '<span class="line"><span>' + l.trim() + '</span></span>'; }).join('');
    el.classList.add('split-lines');
    requestAnimationFrame(function () { setTimeout(function () { el.classList.add('is-in'); }, 150); });
  });

  /* ---------- Reveal on scroll ---------- */
  $$('[data-stagger]').forEach(function (group) {
    var step = parseFloat(group.getAttribute('data-stagger')) || 0.1;
    $$('[data-reveal]', group).forEach(function (el, i) { el.style.setProperty('--d', (i * step).toFixed(2) + 's'); });
  });
  // Hero content animates in on load, not on scroll (it can sit below the observer's bottom margin).
  $$('.hero [data-reveal]').forEach(function (el) {
    requestAnimationFrame(function () { setTimeout(function () { el.classList.add('is-in'); }, 150); });
  });
  var revealEls = $$('[data-reveal]').filter(function (el) { return !el.closest('.hero'); });
  if ('IntersectionObserver' in window && !reduceMotion) {
    // Clip reveals start fully clipped (zero visible area), so observe their parent instead.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target.__revealTarget || en.target;
        el.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) {
      if (el.getAttribute('data-reveal') === 'clip' && el.parentElement) {
        el.parentElement.__revealTarget = el;
        io.observe(el.parentElement);
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dur = 1800, start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
  }

  /* ---------- Parallax, pinned horizontal gallery, step progress ---------- */
  var parallaxEls = $$('[data-parallax]');
  var hscroll = $('.hscroll');
  var hTrack = hscroll && $('.hscroll-track', hscroll);
  var hBar = hscroll && $('.hscroll-progress i', hscroll);
  var steps = $('.steps');
  var stepItems = steps ? $$('.step', steps) : [];
  var heroCopy = $('.hero .hero-inner');
  var hDistance = 0;
  var desktop = window.matchMedia('(min-width: 901px)');

  function sizeHScroll() {
    if (!hscroll || !hTrack) return;
    if (!desktop.matches || reduceMotion) { hscroll.style.height = ''; hTrack.style.transform = ''; return; }
    hDistance = Math.max(hTrack.scrollWidth - window.innerWidth, 0);
    hscroll.style.height = (window.innerHeight + hDistance) + 'px';
  }

  function frame() {
    var vh = window.innerHeight;

    if (!reduceMotion) {
      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.translate = '0 ' + offset.toFixed(1) + 'px';
      });

      if (heroCopy) {
        var y = window.scrollY;
        if (y < vh * 1.2) {
          heroCopy.style.opacity = Math.max(1 - y / (vh * 0.75), 0).toFixed(3);
          heroCopy.style.translate = '0 ' + (y * 0.25).toFixed(1) + 'px';
        }
      }
    }

    if (hscroll && hTrack && desktop.matches && !reduceMotion && hDistance > 0) {
      var hr = hscroll.getBoundingClientRect();
      var p = Math.min(Math.max(-hr.top / (hr.height - vh), 0), 1);
      hTrack.style.transform = 'translate3d(' + (-p * hDistance).toFixed(1) + 'px,0,0)';
      if (hBar) hBar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }

    if (steps) {
      var sr = steps.getBoundingClientRect();
      var sp = Math.min(Math.max((vh * 0.75 - sr.top) / (sr.height + vh * 0.2), 0), 1);
      steps.style.setProperty('--p', sp.toFixed(3));
      stepItems.forEach(function (s, i) { s.classList.toggle('is-active', sp >= (i + 0.35) / stepItems.length || sp > 0.98); });
    }
  }

  var ticking = false;
  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { frame(); onScrollHeader(); ticking = false; }); }
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', function () { sizeHScroll(); requestFrame(); });
  window.addEventListener('load', function () { sizeHScroll(); requestFrame(); });
  sizeHScroll(); frame(); onScrollHeader();

  /* ---------- Reviews slider ---------- */
  $$('[data-slider]').forEach(function (wrap) {
    var track = $('.rv-track', wrap);
    var prev = $('[data-prev]', wrap), next = $('[data-next]', wrap);
    function by(dir) {
      var card = track.firstElementChild;
      var w = card ? card.getBoundingClientRect().width + 22 : track.clientWidth;
      track.scrollBy({ left: dir * w, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { by(-1); });
    if (next) next.addEventListener('click', function () { by(1); });
  });

  /* ---------- FAQ: one open at a time ---------- */
  $$('.faq').forEach(function (faq) {
    var items = $$('details', faq);
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------- Estimate form (front-end prototype) ----------
     Validates and shows a success state. Wire `submitLead` to GHL / CRM later. */
  function submitLead(data) {
    // TODO: replace with GHL webhook / CRM endpoint once provided.
    return new Promise(function (resolve) { setTimeout(resolve, 700); });
  }

  $$('form[data-estimate]').forEach(function (form) {
    var card = form.closest('.form-card');
    var phone = form.querySelector('input[type="tel"]');
    if (phone) {
      phone.addEventListener('input', function () {
        var d = phone.value.replace(/\D/g, '').slice(0, 10);
        var out = d;
        if (d.length > 6) out = '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
        else if (d.length > 3) out = '(' + d.slice(0, 3) + ') ' + d.slice(3);
        phone.value = out;
      });
    }

    function validate() {
      var ok = true;
      $$('[required]', form).forEach(function (input) {
        var field = input.closest('.field');
        var valid = input.value.trim() !== '';
        if (input.type === 'email' && input.value) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        if (input.type === 'tel') valid = input.value.replace(/\D/g, '').length === 10;
        if (field) field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      return ok;
    }

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field && field.classList.contains('invalid')) validate();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var first = $('.field.invalid input, .field.invalid select', form);
        if (first) first.focus();
        return;
      }
      var btn = $('button[type="submit"]', form);
      var label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Sending…';
      submitLead(Object.fromEntries(new FormData(form))).then(function () {
        if (card) card.classList.add('sent');
        btn.disabled = false;
        btn.innerHTML = label;
        form.reset();
      });
    });
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
