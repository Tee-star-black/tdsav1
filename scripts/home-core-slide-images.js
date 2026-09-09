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

      /* The carousel script is the source of truth for visible hero cards. */
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
        /* HERO: exactly one compact card at a time. */
        .core-highlights-slider {
          padding-left: 12px !important;
          padding-right: 12px !important;
          touch-action: pan-y !important;
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

        /* CHOOSE YOUR CARE PATH: true horizontal mobile carousel. */
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
          overflow-x: scroll !important;
          overflow-y: hidden !important;
          scroll-snap-type: x mandatory !important;
          scroll-padding-inline: 16px !important;
          overscroll-behavior-x: contain !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          touch-action: pan-y !important;
          box-sizing: border-box !important;
          cursor: grab !important;
        }

        .services#services .services-grid::-webkit-scrollbar {
          display: none !important;
        }

        .services#services .services-grid.is-dragging {
          cursor: grabbing !important;
          scroll-snap-type: none !important;
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

  function setupCoreCarousel() {
    var slider = document.querySelector('.core-highlights-slider');
    var coreSlides = Array.prototype.slice.call(document.querySelectorAll('.core-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-core-slide-to]'));
    var prev = document.querySelector('[data-core-slider-prev]');
    var next = document.querySelector('[data-core-slider-next]');

    if (!slider || !coreSlides.length || slider.dataset.tdsCarouselReady === 'true') return;
    slider.dataset.tdsCarouselReady = 'true';

    var currentIndex = Math.max(0, coreSlides.findIndex(function (slide) {
      return slide.classList.contains('active') || slide.getAttribute('aria-hidden') === 'false';
    }));

    function showSlide(index) {
      currentIndex = (index + coreSlides.length) % coreSlides.length;

      coreSlides.forEach(function (slide, slideIndex) {
        var visible = slideIndex === currentIndex;
        slide.hidden = !visible;
        slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
        slide.classList.toggle('active', visible);
      });

      dots.forEach(function (dot, dotIndex) {
        var active = dotIndex === currentIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    if (prev) {
      prev.addEventListener('click', function (event) {
        event.preventDefault();
        showSlide(currentIndex - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function (event) {
        event.preventDefault();
        showSlide(currentIndex + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function (event) {
        event.preventDefault();
        var index = parseInt(dot.getAttribute('data-core-slide-to'), 10);
        if (!Number.isNaN(index)) showSlide(index);
      });
    });

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

      if (Math.abs(dx) < 42 || Math.abs(dx) <= Math.abs(dy)) return;
      showSlide(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });

    showSlide(currentIndex);
  }

  function setupCarePathSwipe() {
    var grid = document.querySelector('.services#services .services-grid');
    if (!grid || grid.dataset.tdsTouchScrollReady === 'true') return;
    grid.dataset.tdsTouchScrollReady = 'true';
    grid.setAttribute('tabindex', '0');
    grid.setAttribute('aria-label', 'Choose your care path. Swipe horizontally to see more options.');

    var startX = 0;
    var startY = 0;
    var startScrollLeft = 0;
    var axis = null;

    grid.addEventListener('touchstart', function (event) {
      if (!event.touches || !event.touches.length) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      startScrollLeft = grid.scrollLeft;
      axis = null;
      grid.classList.add('is-dragging');
    }, { passive: true });

    grid.addEventListener('touchmove', function (event) {
      if (!event.touches || !event.touches.length) return;
      var dx = event.touches[0].clientX - startX;
      var dy = event.touches[0].clientY - startY;

      if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }

      if (axis !== 'x') return;
      event.preventDefault();
      grid.scrollLeft = startScrollLeft - dx;
    }, { passive: false });

    function finishDrag() {
      grid.classList.remove('is-dragging');
      axis = null;
    }

    grid.addEventListener('touchend', finishDrag, { passive: true });
    grid.addEventListener('touchcancel', finishDrag, { passive: true });
  }

  function init() {
    addStyles();
    applyImages();
    normalizeBookingLinks();
    setupCoreCarousel();
    setupCarePathSwipe();

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      applyImages();
      normalizeBookingLinks();
      setupCoreCarousel();
      setupCarePathSwipe();
      if (attempts >= 12) window.clearInterval(timer);
    }, 250);

    var observer = new MutationObserver(function () {
      normalizeBookingLinks();
      setupCoreCarousel();
      setupCarePathSwipe();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();