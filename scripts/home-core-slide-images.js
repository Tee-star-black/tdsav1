(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html') return;

  var bookingUrl = 'https://wa.me/27780336394?text=Hello%20TeleDoctorSA%2C%20I%20would%20like%20to%20book%20a%20consultation.';

  var slides = [
    {
      image: '/images/rebuild/03-doctor-video-consultation.jpg',
      label: 'Virtual Consultations',
      alt: 'Doctor providing a TeleDoctorSA video consultation'
    },
    {
      image: '/images/rebuild/04-wearable-ecg-monitor.jpg',
      label: 'ECG247 Monitoring',
      alt: 'Wearable ECG monitoring technology used for remote cardiac monitoring'
    },
    {
      image: '/images/rebuild/07-mobile-health-app.jpg',
      label: 'TeleDoctorSA App',
      alt: 'TeleDoctorSA mobile digital health app experience'
    },
    {
      image: '/images/rebuild/06-healthcare-dashboard.jpg',
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

  function enableCoreSwipe() {
    var slider = document.querySelector('.core-highlights-slider');
    if (!slider || slider.dataset.tdsSwipeReady === 'true') return;
    slider.dataset.tdsSwipeReady = 'true';

    var startX = 0;
    var startY = 0;

    slider.addEventListener('touchstart', function (event) {
      if (!event.touches || !event.touches.length) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });

    slider.addEventListener('touchend', function (event) {
      if (!event.changedTouches || !event.changedTouches.length) return;

      var dx = event.changedTouches[0].clientX - startX;
      var dy = event.changedTouches[0].clientY - startY;

      if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;

      var control = document.querySelector(dx < 0 ? '[data-core-slider-next]' : '[data-core-slider-prev]');
      if (control) control.click();
    }, { passive: true });
  }

  function ensureSingleVisibleSlide() {
    var coreSlides = Array.prototype.slice.call(document.querySelectorAll('.core-slide'));
    if (!coreSlides.length) return;

    var active = coreSlides.find(function (slide) {
      return slide.classList.contains('active') || slide.getAttribute('aria-hidden') === 'false';
    }) || coreSlides[0];

    coreSlides.forEach(function (slide) {
      var visible = slide === active;
      slide.hidden = !visible;
      slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
      slide.classList.toggle('active', visible);
    });
  }

  function installCarousel() {
    var slider = document.querySelector('.core-highlights-slider');
    if (!slider || slider.dataset.tdsCarouselReady === 'true') return;
    var items = Array.from(slider.querySelectorAll('.core-slide'));
    var dots = Array.from(slider.querySelectorAll('[data-core-slide-to]'));
    var controls = slider.querySelector('.core-slider-controls');
    if (items.length < 2 || !controls) return;
    slider.dataset.tdsCarouselReady = 'true';
    var index = Math.max(0, items.findIndex(function (item) { return item.classList.contains('active'); }));
    var timer = null;
    var hovered = false;
    var focused = false;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var paused = reducedMotion.matches;
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'core-slider-arrow';
    toggle.setAttribute('data-core-slider-pause', '');
    controls.appendChild(toggle);

    function updateToggle() {
      var label = paused ? 'Play automatic highlights' : 'Pause automatic highlights';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
      toggle.innerHTML = paused
        ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
    }
    function schedule() {
      window.clearTimeout(timer);
      timer = null;
      if (paused || hovered || focused || document.hidden) return;
      timer = window.setTimeout(function () { show(index + 1); }, 6000);
    }
    function show(next) {
      index = (next + items.length) % items.length;
      items.forEach(function (item, position) {
        var active = position === index;
        item.hidden = !active;
        item.inert = !active;
        item.classList.toggle('active', active);
        item.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
        dot.setAttribute('aria-current', String(position === index));
      });
      schedule();
    }
    slider.querySelector('[data-core-slider-next]').addEventListener('click', function () { show(index + 1); });
    slider.querySelector('[data-core-slider-prev]').addEventListener('click', function () { show(index - 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { show(Number(dot.getAttribute('data-core-slide-to'))); });
    });
    toggle.addEventListener('click', function () {
      paused = !paused;
      updateToggle();
      schedule();
    });
    slider.addEventListener('mouseenter', function () { hovered = true; schedule(); });
    slider.addEventListener('mouseleave', function () { hovered = false; schedule(); });
    slider.addEventListener('focusin', function (event) {
      focused = event.target !== toggle;
      schedule();
    });
    slider.addEventListener('focusout', function (event) {
      focused = slider.contains(event.relatedTarget) && event.relatedTarget !== toggle;
      schedule();
    });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', function (event) {
      paused = event.matches;
      updateToggle();
      schedule();
    });
    updateToggle();
    show(index);
  }

  function init() {
    addStyles();
    applyImages();
    normalizeBookingLinks();
    enableCoreSwipe();
    ensureSingleVisibleSlide();
    installCarousel();

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
