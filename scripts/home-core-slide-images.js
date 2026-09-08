(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html') return;

  var slides = [
    {
      image: 'images/rebuild/03-doctor-video-consultation.jpg',
      label: 'Virtual Consultations',
      alt: 'Doctor providing a TeleDoctorSA video consultation'
    },
    {
      image: 'images/rebuild/04-wearable-ecg-monitor.jpg',
      label: 'ECG247 Monitoring',
      alt: 'Wearable ECG monitoring technology used for remote cardiac monitoring'
    },
    {
      image: 'images/rebuild/07-mobile-health-app.jpg',
      label: 'TeleDoctorSA App',
      alt: 'TeleDoctorSA mobile digital health app experience'
    },
    {
      image: 'images/rebuild/06-healthcare-dashboard.jpg',
      label: 'Electronic Health Records',
      alt: 'Digital healthcare dashboard and electronic health record interface'
    }
  ];

  function addStyles() {
    if (document.getElementById('tds-core-slide-image-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-core-slide-image-styles';
    style.textContent = `
      .core-slide .core-slide-visual.tds-core-image-visual {
        position: relative !important;
        min-height: 430px !important;
        padding: 0 !important;
        overflow: hidden !important;
        background: #0f172a !important;
        border: 0 !important;
      }

      .tds-core-slide-image {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 430px !important;
        object-fit: cover !important;
        object-position: center !important;
        display: block !important;
        z-index: 0 !important;
        transform: scale(1.015);
        transition: transform .7s cubic-bezier(.22,.8,.2,1) !important;
      }

      .core-slide.active .tds-core-slide-image,
      .core-slide:hover .tds-core-slide-image {
        transform: scale(1.055);
      }

      .tds-core-image-shade {
        position: absolute !important;
        inset: 0 !important;
        z-index: 1 !important;
        pointer-events: none !important;
        background:
          linear-gradient(180deg, rgba(15,23,42,.08) 10%, rgba(15,23,42,.18) 48%, rgba(15,23,42,.72) 100%),
          linear-gradient(90deg, rgba(15,23,42,.16), rgba(15,23,42,0) 58%) !important;
      }

      .tds-core-image-label {
        position: absolute !important;
        left: 22px !important;
        bottom: 22px !important;
        z-index: 2 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 9px !important;
        padding: 11px 14px !important;
        background: rgba(15,23,42,.82) !important;
        border: 1px solid rgba(255,255,255,.22) !important;
        color: #fff !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        font: 700 .78rem/1.2 'Plus Jakarta Sans', sans-serif !important;
        letter-spacing: .01em !important;
      }

      .tds-core-image-label::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #ffa366;
        box-shadow: 0 0 0 5px rgba(255,163,102,.16);
      }

      .core-slide .core-slide-visual.tds-core-image-visual > *:not(.tds-core-slide-image):not(.tds-core-image-shade):not(.tds-core-image-label) {
        display: none !important;
      }

      @media (max-width: 900px) {
        .core-slide .core-slide-visual.tds-core-image-visual,
        .tds-core-slide-image {
          min-height: 330px !important;
        }
      }

      @media (max-width: 560px) {
        .core-slide .core-slide-visual.tds-core-image-visual,
        .tds-core-slide-image {
          min-height: 260px !important;
        }

        .tds-core-image-label {
          left: 14px !important;
          bottom: 14px !important;
          padding: 9px 11px !important;
          font-size: .72rem !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyImages() {
    var coreSlides = Array.prototype.slice.call(document.querySelectorAll('.core-slide'));
    if (!coreSlides.length) return;

    coreSlides.forEach(function (slide, index) {
      var visual = slide.querySelector('.core-slide-visual');
      if (!visual || visual.dataset.tdsImageApplied === 'true') return;

      var data = slides[index % slides.length];
      visual.dataset.tdsImageApplied = 'true';
      visual.classList.add('tds-core-image-visual');

      var image = document.createElement('img');
      image.className = 'tds-core-slide-image';
      image.src = data.image;
      image.alt = data.alt;
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';

      var shade = document.createElement('span');
      shade.className = 'tds-core-image-shade';
      shade.setAttribute('aria-hidden', 'true');

      var label = document.createElement('span');
      label.className = 'tds-core-image-label';
      label.textContent = data.label;

      visual.insertBefore(image, visual.firstChild);
      visual.appendChild(shade);
      visual.appendChild(label);
    });
  }

  function init() {
    addStyles();
    applyImages();

    // Some of the legacy homepage scripts initialise the carousel after DOMContentLoaded.
    // Re-check once so the image treatment survives that setup without fighting it.
    window.setTimeout(applyImages, 450);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
