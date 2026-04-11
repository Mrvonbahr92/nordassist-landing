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
