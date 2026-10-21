(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html') return;

  var bookingUrl = 'https://wa.me/27780336394?text=Hello%20TeleDoctorSA%2C%20I%20would%20like%20to%20book%20a%20consultation.';

  var slides = [
    {
      image: '/images/rebuild/apparatus.jpg',
      label: 'Virtual Consultations',
      alt: 'Doctor providing a TeleDoctorSA video consultation'
    },
    {
      image: '/images/rebuild/ecg%20monitor.jpg',
      label: 'ECG247 Monitoring',
      alt: 'Wearable ECG monitoring technology used for remote cardiac monitoring'
    },
    {
      image: '/images/rebuild/platform.jpg',
      label: 'TeleDoctorSA App',
      alt: 'TeleDoctorSA mobile digital health app experience'
    },
    {
      image: '/images/rebuild/platform.jpg',
      label: 'Electronic Health Records',
      alt: 'Digital healthcare dashboard and electronic health record interface'
    }
  ];

  function addStyles() {
    var existing = document.getElementById('tds-core-slide-image-styles');
    if (existing) existing.remove();

    var style = document.createElement('style');
    style.id = 'tds-core-slide-image-styles';
    style.textContent = `
      html, body {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
      }

      .core-highlights-slider {
        width: 100% !important;
        max-width: none !important;
        min-height: auto !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }

      .core-slider-shell {
        width: 100% !important;
        max-width: 1480px !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
      }

      /* The inline homepage slider toggles the hidden attribute. Never let mobile CSS override it. */
      .core-slide[hidden],
      .core-slide[aria-hidden="true"] {
        display: none !important;
      }

      .core-slide.active:not([hidden]),
      .core-slide[aria-hidden="false"] {
        display: grid !important;
      }

      .core-slide .core-slide-visual.tds-core-image-visual {
        position: relative !important;
        overflow: hidden !important;
        background: #0f172a center/cover no-repeat !important;
      }

      .tds-core-slide-image {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center !important;
        display: block !important;
        z-index: 0 !important;
      }

      .tds-core-image-shade {
        position: absolute !important;
        inset: 0 !important;
        z-index: 1 !important;
        pointer-events: none !important;
        background: linear-gradient(180deg, rgba(15,23,42,.03) 28%, rgba(15,23,42,.6) 100%) !important;
      }

      .tds-core-image-label {
        position: absolute !important;
        left: 18px !important;
        bottom: 18px !important;
        z-index: 2 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 10px 13px !important;
        background: rgba(15,23,42,.86) !important;
        border: 1px solid rgba(255,255,255,.2) !important;
        color: #fff !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
        font: 700 .76rem/1.2 'Plus Jakarta Sans', sans-serif !important;
      }

      .tds-core-image-label::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ffa366;
      }

      .core-slide .core-slide-visual.tds-core-image-visual > *:not(.tds-core-slide-image):not(.tds-core-image-shade):not(.tds-core-image-label) {
        display: none !important;
      }

      @media (max-width: 820px) {
        /* HERO: one compact card at a time. The existing buttons + swipe change slides. */
        .core-highlights-slider {
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        .core-slide[hidden],
        .core-slide[aria-hidden="true"] {
          display: none !important;
        }

        .core-slide.active:not([hidden]),
        .core-slide[aria-hidden="false"] {
          display: grid !important;
          grid-template-columns: 1fr !important;
          width: 100% !important;
          max-width: 100% !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .core-slide-copy {
          padding: 20px 18px 22px !important;
        }

        .core-slide-heading {
          font-size: clamp(1.35rem, 6vw, 1.75rem) !important;
          line-height: 1.08 !important;
          margin-bottom: 10px !important;
        }

        .core-slide-copy > p {
          font-size: .92rem !important;
          line-height: 1.55 !important;
          margin-bottom: 14px !important;
        }

        .core-slide-meta {
          display: flex !important;
          flex-wrap: nowrap !important;
          gap: 8px !important;
          overflow-x: auto !important;
          padding-bottom: 3px !important;
          scrollbar-width: none !important;
        }

        .core-slide-meta::-webkit-scrollbar {
          display: none !important;
        }

        .core-slide-meta > * {
          flex: 0 0 auto !important;
          white-space: nowrap !important;
        }

        .core-slide .core-slide-visual.tds-core-image-visual {
          width: 100% !important;
          min-height: 220px !important;
          height: 220px !important;
          order: -1 !important;
        }

        .core-slide-cta {
          width: fit-content !important;
          min-height: 44px !important;
          padding: 11px 15px !important;
          font-size: .88rem !important;
        }

        .core-slider-controls {
          margin-top: 12px !important;
        }

        /* CHOOSE YOUR CARE PATH: horizontal swipe carousel on phones/tablets. */
        .services#services {
          overflow: hidden !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .services#services .services-header {
          width: 100% !important;
          max-width: none !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-left: 16px !important;
          padding-right: 16px !important;
          box-sizing: border-box !important;
        }

        .services#services .services-grid {
          display: flex !important;
          grid-template-columns: none !important;
          grid-auto-flow: unset !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 16px 14px !important;
          gap: 14px !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          scroll-snap-type: x mandatory !important;
          scroll-padding-inline: 16px !important;
          overscroll-behavior-inline: contain !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          touch-action: pan-x pan-y !important;
          box-sizing: border-box !important;
        }

        .services#services .services-grid::-webkit-scrollbar {
          display: none !important;
        }

        .services#services .services-grid > .card {
          flex: 0 0 min(84vw, 360px) !important;
          width: min(84vw, 360px) !important;
          min-width: min(84vw, 360px) !important;
          max-width: min(84vw, 360px) !important;
          margin: 0 !important;
          scroll-snap-align: start !important;
          scroll-snap-stop: always !important;
        }
      }

      @media (max-width: 480px) {
        .core-slide .core-slide-visual.tds-core-image-visual {
          height: 190px !important;
          min-height: 190px !important;
        }

        .core-slide-copy {
          padding: 18px 16px 20px !important;
        }

        .tds-core-image-label {
          left: 12px !important;
          bottom: 12px !important;
          padding: 8px 10px !important;
          font-size: .7rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyImages() {
    var coreSlides = Array.prototype.slice.call(document.querySelectorAll('.core-slide'));
    if (!coreSlides.length) return false;

    coreSlides.forEach(function (slide, index) {
      var visual = slide.querySelector('.core-slide-visual');
      if (!visual) return;

      var data = slides[index % slides.length];
      visual.classList.add('tds-core-image-visual');
      visual.style.setProperty('background-image', 'url("' + data.image + '")', 'important');

      var image = visual.querySelector('.tds-core-slide-image');
      if (!image) {
        image = document.createElement('img');
        image.className = 'tds-core-slide-image';
        visual.insertBefore(image, visual.firstChild);
      }
      image.src = data.image;
      image.alt = data.alt;
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';

      if (!visual.querySelector('.tds-core-image-shade')) {
        var shade = document.createElement('span');
        shade.className = 'tds-core-image-shade';
        shade.setAttribute('aria-hidden', 'true');
        visual.appendChild(shade);
      }

      var label = visual.querySelector('.tds-core-image-label');
      if (!label) {
        label = document.createElement('span');
        label.className = 'tds-core-image-label';
        visual.appendChild(label);
      }
      label.textContent = data.label;
    });

    return true;
  }

  function normalizeBookingLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var label = (link.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      var href = (link.getAttribute('href') || '').toLowerCase();
      var isBooking = label.indexOf('book online consultation') !== -1 ||
        label.indexOf('book a consultation') !== -1 ||
        label.indexOf('book consultation') !== -1;
      var isUpvioConsultation = href.indexOf('upvio') !== -1 && label.indexOf('consult') !== -1;

      if (isBooking || isUpvioConsultation) {
        link.setAttribute('href', bookingUrl);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // The carousel has one owner: it controls visibility, dots, swipe and autoplay.
  // Previous scripts only switched the first slide's visibility and never advanced it.
  function initCarousel() {
    var slider = document.querySelector('.core-highlights-slider');
    if (!slider || slider.dataset.tdsCarouselReady === 'true') return;

    var panels = Array.prototype.slice.call(slider.querySelectorAll('.core-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-core-slide-to]'));
    var previous = slider.querySelector('[data-core-slider-prev]');
    var next = slider.querySelector('[data-core-slider-next]');
    var toggle = slider.querySelector('[data-core-slider-toggle]');
    var counter = slider.querySelector('[data-core-slider-counter]');
    var live = slider.querySelector('[data-core-slider-live]');
    if (!panels.length) return;

    slider.dataset.tdsCarouselReady = 'true';
    slider.setAttribute('aria-roledescription', 'carousel');

    var DELAY = 6500;
    var current = Math.max(0, panels.findIndex(function (panel) {
      return panel.classList.contains('active');
    }));
    var timer = null;
    var hovered = false;
    var focused = false;
    var inView = true;
    var manuallyPaused = false;
    var motionPreference = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    slider.style.setProperty('--core-slide-duration', DELAY + 'ms');

    function mayPlay() {
      return panels.length > 1 && !manuallyPaused && !hovered && !focused &&
        inView && !document.hidden && !(motionPreference && motionPreference.matches);
    }

    function syncAutoplay() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      var playing = mayPlay();
      slider.classList.toggle('is-paused', !playing);
      if (toggle) {
        toggle.textContent = manuallyPaused ? 'Play' : 'Pause';
        toggle.setAttribute('aria-pressed', manuallyPaused ? 'true' : 'false');
        toggle.setAttribute('aria-label', manuallyPaused ? 'Resume automatic highlights' : 'Pause automatic highlights');
      }
      if (playing) {
        timer = window.setTimeout(function () {
          show(current + 1, false);
        }, DELAY);
      }
    }

    function show(index, announce) {
      current = (index + panels.length) % panels.length;
      panels.forEach(function (panel, i) {
        var selected = i === current;
        panel.hidden = !selected;
        panel.classList.toggle('active', selected);
        panel.setAttribute('aria-hidden', selected ? 'false' : 'true');
        if ('inert' in panel) panel.inert = !selected;
      });
      dots.forEach(function (button, i) {
        var selected = i === current;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-current', selected ? 'true' : 'false');
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      if (counter) {
        counter.textContent =
          String(current + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
      }
      if (live) {
        // Announce only deliberate navigation, not every automatic rotation.
        live.textContent = announce ?
          'Highlight ' + (current + 1) + ' of ' + panels.length + ': ' +
          (panels[current].querySelector('.core-slide-heading') || {}).textContent : '';
      }
      syncAutoplay();
    }

    if (previous) previous.addEventListener('click', function () { show(current - 1, true); });
    if (next) next.addEventListener('click', function () { show(current + 1, true); });

    dots.forEach(function (button, i) {
      button.addEventListener('click', function () { show(i, true); });
    });

    if (toggle) toggle.addEventListener('click', function () {
      manuallyPaused = !manuallyPaused;
      syncAutoplay();
    });

    slider.addEventListener('mouseenter', function () {
      hovered = true;
      syncAutoplay();
    });
    slider.addEventListener('mouseleave', function () {
      hovered = false;
      syncAutoplay();
    });
    slider.addEventListener('focusin', function () {
      focused = true;
      syncAutoplay();
    });
    slider.addEventListener('focusout', function (event) {
      if (!slider.contains(event.relatedTarget)) {
        focused = false;
        syncAutoplay();
      }
    });
    document.addEventListener('visibilitychange', syncAutoplay);

    if (motionPreference) {
      if (motionPreference.addEventListener) motionPreference.addEventListener('change', syncAutoplay);
      else if (motionPreference.addListener) motionPreference.addListener(syncAutoplay);
    }
    if ('IntersectionObserver' in window) {
      var visibilityObserver = new IntersectionObserver(function (entries) {
        inView = !!(entries[0] && entries[0].isIntersecting);
        syncAutoplay();
      }, { threshold: 0.15 });
      visibilityObserver.observe(slider);
    }

    var touchStartX = 0;
    var touchStartY = 0;
    var touching = false;
    // Listen on cards, not the hero links; a swipe must never steal a CTA click.
    panels.forEach(function (panel) {
      panel.addEventListener('touchstart', function (event) {
        if (!event.touches || event.touches.length !== 1) return;
        touching = true;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }, { passive: true });

      panel.addEventListener('touchend', function (event) {
        if (!touching || !event.changedTouches || !event.changedTouches.length) return;
        touching = false;
        var dx = event.changedTouches[0].clientX - touchStartX;
        var dy = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          show(current + (dx < 0 ? 1 : -1), true);
        }
      }, { passive: true });

      panel.addEventListener('touchcancel', function () { touching = false; }, { passive: true });
    });

    show(current, false);
  }

  // The care paths are real horizontally scrollable cards, not an animation.
  // Explicit controls also make the rail usable with a mouse or keyboard.
  function initCarePathRail() {
    var rail = document.getElementById('carePathRail');
    var previous = document.querySelector('[data-care-rail-prev]');
    var next = document.querySelector('[data-care-rail-next]');
    var count = document.querySelector('[data-care-rail-count]');
    if (!rail || !previous || !next || rail.dataset.tdsCareRailReady === 'true') return;

    var cards = Array.prototype.slice.call(rail.querySelectorAll('.card'));
    if (cards.length < 2) return;
    rail.dataset.tdsCareRailReady = 'true';

    var current = 0;
    var pending = false;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function getInset() {
      return parseFloat(window.getComputedStyle(rail).paddingLeft) || 0;
    }

    function update() {
      pending = false;
      var start = rail.getBoundingClientRect().left + getInset();
      var closest = Infinity;
      cards.forEach(function (card, i) {
        var distance = Math.abs(card.getBoundingClientRect().left - start);
        if (distance < closest) {
          closest = distance;
          current = i;
        }
      });
      var maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      var scrollable = maxScroll > 4;
      if (scrollable && rail.scrollLeft >= maxScroll - 4) current = cards.length - 1;
      if (count) {
        count.textContent =
          String(current + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      }
      previous.disabled = !scrollable || rail.scrollLeft <= 4;
      next.disabled = !scrollable || rail.scrollLeft >= maxScroll - 4;
    }

    function requestUpdate() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }

    function go(step) {
      var target = Math.max(0, Math.min(cards.length - 1, current + step));
      var left = cards[target].getBoundingClientRect().left -
        rail.getBoundingClientRect().left + rail.scrollLeft - getInset();
      var maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      rail.scrollTo({
        left: Math.max(0, Math.min(left, maxScroll)),
        behavior: reduced ? 'instant' : 'smooth'
      });
      current = target;
      if (count) {
        count.textContent =
          String(current + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      }
    }

    previous.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    rail.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    rail.addEventListener('keydown', function (event) {
      if (event.target !== rail) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        go(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    update();
    window.addEventListener('load', requestUpdate, { once: true });
  }

  function init() {
    addStyles();
    applyImages();
    normalizeBookingLinks();
    initCarousel();
    initCarePathRail();

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      applyImages();
      normalizeBookingLinks();
      if (attempts >= 12) window.clearInterval(timer);
    }, 250);

    var observer = new MutationObserver(function () {
      normalizeBookingLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();