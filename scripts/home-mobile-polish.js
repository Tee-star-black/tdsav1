(function () {
  'use strict';

  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html' && page !== '') return;
  if (window.__TDS_HOME_MOBILE_POLISH__) return;
  window.__TDS_HOME_MOBILE_POLISH__ = true;

  function injectStyles() {
    if (document.getElementById('tds-home-mobile-polish')) return;

    var style = document.createElement('style');
    style.id = 'tds-home-mobile-polish';
    style.textContent = `
      @media (max-width: 720px) {
        .core-highlights-slider {
          min-height: 0 !important;
          padding: 0 !important;
          background-position: 60% center !important;
        }

        .core-slider-shell {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
        }

        .core-slider-intro {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 38px 18px 26px !important;
          text-align: left !important;
        }

        .core-slider-intro > h1 {
          max-width: 13ch !important;
          margin: 0 0 12px !important;
          font-size: clamp(2.05rem, 8.8vw, 2.7rem) !important;
          line-height: 1.01 !important;
          letter-spacing: -.045em !important;
          text-wrap: balance !important;
        }

        .core-slider-intro > p {
          max-width: 38ch !important;
          margin: 0 0 18px !important;
          font-size: .93rem !important;
          line-height: 1.55 !important;
          color: rgba(255,255,255,.82) !important;
        }

        .core-slider-intro .core-slider-actions {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 8px !important;
          width: 100% !important;
          margin: 0 0 14px !important;
        }

        .core-slider-intro .core-slider-actions > a {
          width: 100% !important;
          min-width: 0 !important;
          min-height: 46px !important;
          margin: 0 !important;
          padding: 9px 7px !important;
          justify-content: center !important;
          gap: 5px !important;
          border-radius: 4px !important;
          font-size: .71rem !important;
          line-height: 1.2 !important;
          text-align: center !important;
          white-space: normal !important;
        }

        .core-slider-intro .core-slider-actions > .core-slide-cta {
          grid-column: 1 / -1 !important;
          min-height: 48px !important;
          font-size: .82rem !important;
        }

        .core-slider-intro .core-slider-actions svg {
          width: 13px !important;
          height: 13px !important;
          flex: 0 0 13px !important;
        }

        .core-slider-intro .core-proof-strip {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 6px !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .core-slider-intro .core-proof-chip {
          width: 100% !important;
          min-width: 0 !important;
          min-height: 46px !important;
          margin: 0 !important;
          padding: 7px 5px !important;
          justify-content: center !important;
          gap: 5px !important;
          border-radius: 4px !important;
          font-size: .65rem !important;
          line-height: 1.2 !important;
          text-align: center !important;
          white-space: normal !important;
        }

        .core-slider-intro .core-proof-chip svg,
        .core-google-mark {
          width: 13px !important;
          height: 13px !important;
          flex: 0 0 13px !important;
        }

        .core-slide.active:not([hidden]),
        .core-slide[aria-hidden='false'] {
          margin: 0 12px !important;
          width: calc(100% - 24px) !important;
          max-width: calc(100% - 24px) !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 10px 26px rgba(15,23,42,.09) !important;
        }

        .core-slider-controls {
          width: calc(100% - 24px) !important;
          margin: 12px auto 0 !important;
        }

        .services#services {
          overflow: visible !important;
        }

        .services#services .services-grid {
          display: flex !important;
          width: 100% !important;
          max-width: none !important;
          gap: 12px !important;
          padding: 0 18px 14px !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          scroll-behavior: smooth !important;
          scroll-snap-type: x proximity !important;
          scroll-padding-inline: 18px !important;
          overscroll-behavior-inline: contain !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-x pan-y !important;
          scrollbar-width: none !important;
        }

        .services#services .services-grid::-webkit-scrollbar {
          display: none !important;
        }

        .services#services .services-grid.is-dragging {
          scroll-snap-type: none !important;
        }

        .services#services .services-grid > .card {
          flex: 0 0 min(82vw, 340px) !important;
          width: min(82vw, 340px) !important;
          min-width: min(82vw, 340px) !important;
          max-width: min(82vw, 340px) !important;
          scroll-snap-align: start !important;
          scroll-snap-stop: normal !important;
          transition: transform .24s ease, box-shadow .24s ease !important;
        }
      }

      @media (max-width: 390px) {
        .core-slider-intro {
          padding-left: 15px !important;
          padding-right: 15px !important;
        }

        .core-slider-intro > h1 {
          font-size: 2rem !important;
        }

        .core-slider-intro .core-slider-actions > a {
          font-size: .67rem !important;
          padding-left: 5px !important;
          padding-right: 5px !important;
        }

        .core-slider-intro .core-proof-chip {
          font-size: .61rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setupAutoAdvance() {
    var slider = document.querySelector('.core-highlights-slider');
    var next = document.querySelector('[data-core-slider-next]');
    var slides = document.querySelectorAll('.core-slide');
    if (!slider || !next || slides.length < 2 || slider.dataset.tdsAutoReady === 'true') return;

    slider.dataset.tdsAutoReady = 'true';
    var timer = null;
    var syntheticClick = false;
    var delay = 5200;

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (document.hidden) return;
      timer = window.setInterval(function () {
        syntheticClick = true;
        next.click();
        syntheticClick = false;
      }, delay);
    }

    function restartFromUser() {
      if (syntheticClick) return;
      start();
    }

    document.querySelectorAll('[data-core-slider-prev], [data-core-slider-next], [data-core-slide-to]').forEach(function (control) {
      control.addEventListener('click', restartFromUser);
    });

    slider.addEventListener('touchstart', stop, { passive: true });
    slider.addEventListener('touchend', function () {
      window.setTimeout(start, 900);
    }, { passive: true });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', function (event) {
      if (!slider.contains(event.relatedTarget)) start();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  function setupCarePathMomentum() {
    var grid = document.querySelector('.services#services .services-grid');
    if (!grid || grid.dataset.tdsMomentumReady === 'true') return;
    grid.dataset.tdsMomentumReady = 'true';

    var startX = 0;
    var lastX = 0;
    var startScroll = 0;
    var startedAt = 0;

    grid.addEventListener('touchstart', function (event) {
      if (!event.touches || !event.touches.length) return;
      startX = event.touches[0].clientX;
      lastX = startX;
      startScroll = grid.scrollLeft;
      startedAt = performance.now();
    }, { passive: true });

    grid.addEventListener('touchmove', function (event) {
      if (!event.touches || !event.touches.length) return;
      lastX = event.touches[0].clientX;
    }, { passive: true });

    grid.addEventListener('touchend', function () {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .card'));
      if (!cards.length) return;

      var dx = lastX - startX;
      var elapsed = Math.max(1, performance.now() - startedAt);
      var velocity = dx / elapsed;
      var firstLeft = cards[0].offsetLeft;
      var current = grid.scrollLeft;

      var nearestIndex = 0;
      var nearestDistance = Infinity;
      cards.forEach(function (card, index) {
        var target = card.offsetLeft - firstLeft;
        var distance = Math.abs(target - current);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (Math.abs(dx) > 34 || Math.abs(velocity) > .22) {
        if (dx < 0) nearestIndex = Math.min(cards.length - 1, nearestIndex + 1);
        else nearestIndex = Math.max(0, nearestIndex - 1);
      }

      var targetLeft = cards[nearestIndex].offsetLeft - firstLeft;
      window.requestAnimationFrame(function () {
        grid.scrollTo({ left: targetLeft, behavior: 'smooth' });
      });
    }, { passive: true });

    grid.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var cards = Array.prototype.slice.call(grid.querySelectorAll(':scope > .card'));
      if (!cards.length) return;
      var firstLeft = cards[0].offsetLeft;
      var current = grid.scrollLeft;
      var nearestIndex = 0;
      var nearestDistance = Infinity;
      cards.forEach(function (card, index) {
        var distance = Math.abs((card.offsetLeft - firstLeft) - current);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      nearestIndex += event.key === 'ArrowRight' ? 1 : -1;
      nearestIndex = Math.max(0, Math.min(cards.length - 1, nearestIndex));
      grid.scrollTo({ left: cards[nearestIndex].offsetLeft - firstLeft, behavior: 'smooth' });
    });
  }

  function init() {
    injectStyles();
    window.setTimeout(function () {
      injectStyles();
      setupAutoAdvance();
      setupCarePathMomentum();
    }, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
