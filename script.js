(function () {
  'use strict';

  /* ── Nav: add .scrolled class when page is scrolled ── */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── Mobile menu ── */
  var mob     = document.getElementById('mobMenu');
  var mobOpen = document.getElementById('mobOpen');
  var mobClose = document.getElementById('mobClose');

  if (mob && mobOpen && mobClose) {
    mobOpen.onclick = function () {
      mob.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    mobClose.onclick = function () {
      mob.classList.remove('open');
      document.body.style.overflow = '';
    };
    mob.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mob.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll-reveal ── */
  var revealEls = document.querySelectorAll('.r');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Sticky mobile CTA: show after hero CTA leaves viewport ── */
  var stickyCta   = document.getElementById('stickyCta');
  var heroActions = document.querySelector('.hero-actions');
  if (stickyCta && heroActions && window.innerWidth <= 600) {
    var stickyObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        stickyCta.style.transform = e.isIntersecting ? 'translateY(100%)' : 'translateY(0)';
      });
    }, { threshold: 0 });
    stickyObs.observe(heroActions);
    stickyCta.style.transition = 'transform .3s cubic-bezier(.22,.68,0,1.2)';
    stickyCta.style.transform  = 'translateY(100%)';
  }

  /* ── Dashboard lightbox ── */
  var dashTrigger = document.getElementById('dashClickable');
  var dashLb      = document.getElementById('dashLightbox');
  var dashLbClose = document.getElementById('dashLbClose');
  var dashLbWrap  = document.getElementById('dashLbImgWrap');

  function openLightbox() {
    dashLb.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
    dashLb.focus();
  }
  function closeLightbox() {
    dashLb.classList.remove('lb-open');
    document.body.style.overflow = '';
  }

  if (dashTrigger && dashLb) {
    dashTrigger.addEventListener('click', openLightbox);
    dashTrigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
    });
    dashLbClose.addEventListener('click', closeLightbox);
    // Click outside image to close
    dashLb.addEventListener('click', function (e) {
      if (e.target === dashLb || e.target === dashLbWrap) closeLightbox();
    });
    // ESC to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dashLb.classList.contains('lb-open')) closeLightbox();
    });
  }

  /* ── Chat: looping live animation with typing indicator ── */
  var chatMocks = document.querySelectorAll('.chat-mock');
  chatMocks.forEach(function(mock) {
    var bubbles = Array.from(mock.querySelectorAll('.chat-bubble'));
    var typing  = mock.querySelector('.chat-typing');
    var trans   = 'opacity .42s cubic-bezier(.25,.46,.45,.94), transform .42s cubic-bezier(.16,1,.3,1)';

    function hide(el) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(10px)';
    }
    function show(el) {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }

    // Apply transition + hide all
    var all = typing ? bubbles.concat([typing]) : bubbles;
    all.forEach(function(el) {
      el.style.transition = trans;
      hide(el);
    });

    var timers = [];
    function clearAll() { timers.forEach(clearTimeout); timers = []; }

    function runCycle() {
      // Reset
      all.forEach(function(el) { hide(el); });

      // Timeline: [delay_ms, fn]
      // Bubbles: 0=user, 1=ai, 2=user, 3=ai, 4=user(phone) + then typing shows
      var tl = [
        [350,  function() { show(bubbles[0]); }],                            // user msg 1
        [1250, function() { if (typing) show(typing); }],                    // ... typing
        [2400, function() { if (typing) hide(typing); show(bubbles[1]); }],  // ai reply 1
        [3200, function() { show(bubbles[2]); }],                            // user msg 2
        [4050, function() { if (typing) show(typing); }],                    // ... typing
        [5100, function() { if (typing) hide(typing); show(bubbles[3]); }],  // ai reply 2
        [5900, function() { show(bubbles[4]); }],                            // user: phone
        [7000, function() { if (typing) show(typing); }],                    // ... typing (loop edge)
      ];

      var totalCycle = 10200; // pause at end before restart

      tl.forEach(function(step) {
        timers.push(setTimeout(step[1], step[0]));
      });
      timers.push(setTimeout(runCycle, totalCycle));
    }

    var active = false;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting && !active) {
          active = true;
          runCycle();
        } else if (!e.isIntersecting && active) {
          active = false;
          clearAll();
          all.forEach(function(el) { hide(el); });
        }
      });
    }, { threshold: 0.3 });
    observer.observe(mock);
  });

  /* ── Auth-aware CTAs: swap /signup links to /dashboard for logged-in users ── */
  fetch('https://app.getnordassist.com/api/auth/me', { credentials: 'include' })
    .then(function (res) {
      if (!res.ok) return; // Not logged in — keep everything as-is

      var DASHBOARD = 'https://app.getnordassist.com/dashboard';
      var ARROW_SVG =
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
        '<path d="M3 8h10M8.5 3.5L13 8l-4.5 4.5"' +
        ' stroke="currentColor" stroke-width="1.6"' +
        ' stroke-linecap="round" stroke-linejoin="round"/></svg>';

      // Rewrite every /signup link
      document.querySelectorAll('a[href*="/signup"]').forEach(function (a) {
        a.href = DASHBOARD;
        if (a.classList.contains('btn-primary')) {
          a.innerHTML = 'Gå till dashboard ' + ARROW_SVG;
        } else if (a.closest('.footer-col')) {
          a.textContent = 'Dashboard';
        } else {
          a.textContent = 'Gå till dashboard';
        }
      });

      // Hide the "Se live demo" hero button — not needed for logged-in users
      var demoBtn = document.querySelector('.hero-actions .btn-demo');
      if (demoBtn) demoBtn.style.display = 'none';

      // Nav CTA → dashboard
      var navCta = document.querySelector('.nav-cta');
      if (navCta) {
        navCta.href      = DASHBOARD;
        navCta.innerHTML = 'Dashboard ' + ARROW_SVG;
      }

      // Mobile menu login link → dashboard
      var mobLogin = document.querySelector('.mob-menu .btn-primary');
      if (mobLogin) {
        mobLogin.href      = DASHBOARD;
        mobLogin.textContent = 'Gå till dashboard →';
      }
    })
    .catch(function () { /* Network error — degrade gracefully, keep default buttons */ });

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(function (i) {
        i.classList.remove('open');
      });
      // Open clicked (unless it was already open)
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

})();
