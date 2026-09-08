(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html') return;

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
        padding: clamp(76px, 7vw, 108px) clamp(20px, 4vw, 64px) clamp(34px, 5vw, 64px) !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        background:
          radial-gradient(circle at 12% 10%, rgba(47,171,255,.10), transparent 30%),
          radial-gradient(circle at 88% 10%, rgba(255,163,102,.13), transparent 28%),
          linear-gradient(180deg, #f8fafc 0%, #fffaf6 100%) !important;
      }

      .core-slider-shell {
        width: 100% !important;
        max-width: 1480px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }

      .core-slider-intro {
        width: 100% !important;
        max-width: 1060px !important;
        margin: 0 auto 30px !important;
        padding: 0 clamp(0px, 2vw, 24px) !important;
        box-sizing: border-box !important;
      }

      .core-slider-intro h1 {
        font-size: clamp(2.7rem, 5.1vw, 5.2rem) !important;
        line-height: .98 !important;
        letter-spacing: -.055em !important;
      }

      .core-slider-actions {
        width: 100% !important;
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 12px !important;
        margin-top: 26px !important;
      }

      .core-slider-actions > a {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 54px !important;
        justify-content: center !important;
        box-sizing: border-box !important;
        white-space: normal !important;
        text-align: center !important;
      }

      .core-proof-strip {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        gap: 10px !important;
      }

      .core-slide {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        grid-template-columns: minmax(0, .95fr) minmax(420px, 1.05fr) !important;
        gap: 0 !important;
        align-items: stretch !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }

      .core-slide-copy {
        min-width: 0 !important;
        padding: clamp(30px, 4vw, 58px) !important;
        box-sizing: border-box !important;
      }

      .core-slide .core-slide-visual.tds-core-image-visual {
        position: relative !important;
        width: 100% !important;
        min-width: 0 !important;
        min-height: 500px !important;
        padding: 0 !important;
        overflow: hidden !important;
        border: 0 !important;
        background-color: #0f172a !important;
        background-position: center center !important;
        background-size: cover !important;
        background-repeat: no-repeat !important;
      }

      .tds-core-slide-image {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        min-width: 100% !important;
        min-height: 100% !important;
        object-fit: cover !important;
        object-position: center center !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        z-index: 0 !important;
      }

      .tds-core-image-shade {
        position: absolute !important;
        inset: 0 !important;
        z-index: 1 !important;
        pointer-events: none !important;
        background: linear-gradient(180deg, rgba(15,23,42,.02) 25%, rgba(15,23,42,.56) 100%) !important;
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
        background: rgba(15,23,42,.84) !important;
        border: 1px solid rgba(255,255,255,.2) !important;
        color: #fff !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        font: 700 .78rem/1.2 'Plus Jakarta Sans', sans-serif !important;
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

      .core-slider-controls {
        width: 100% !important;
        max-width: 1480px !important;
        margin: 18px auto 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }

      @media (max-width: 1100px) {
        .core-slider-actions {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .core-slide {
          grid-template-columns: minmax(0, 1fr) minmax(360px, .9fr) !important;
        }

        .core-slide .core-slide-visual.tds-core-image-visual {
          min-height: 430px !important;
        }
      }

      @media (max-width: 820px) {
        .core-highlights-slider {
          padding: 82px 16px 28px !important;
        }

        .core-slider-intro {
          margin-bottom: 22px !important;
          padding: 0 !important;
        }

        .core-slider-intro h1 {
          font-size: clamp(2.35rem, 10vw, 3.6rem) !important;
          line-height: 1.02 !important;
        }

        .core-slider-actions {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }

        .core-slide {
          display: grid !important;
          grid-template-columns: 1fr !important;
          width: 100% !important;
        }

        .core-slide-copy {
          padding: 30px 22px 32px !important;
        }

        .core-slide .core-slide-visual.tds-core-image-visual {
          width: 100% !important;
          min-height: 340px !important;
          order: -1 !important;
        }

        .core-slider-controls {
          gap: 10px !important;
          margin-top: 14px !important;
        }
      }

      @media (max-width: 560px) {
        .core-highlights-slider {
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        .core-slide-copy {
          padding: 24px 18px 28px !important;
        }

        .core-slide .core-slide-visual.tds-core-image-visual {
          min-height: 260px !important;
        }

        .tds-core-image-label {
          left: 12px !important;
          bottom: 12px !important;
          padding: 9px 11px !important;
          font-size: .72rem !important;
        }

        .core-slider-arrow {
          width: 42px !important;
          height: 42px !important;
          flex: 0 0 42px !important;
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

      var existingImage = visual.querySelector('.tds-core-slide-image');
      if (!existingImage) {
        existingImage = document.createElement('img');
        existingImage.className = 'tds-core-slide-image';
        visual.insertBefore(existingImage, visual.firstChild);
      }
      existingImage.src = data.image;
      existingImage.alt = data.alt;
      existingImage.loading = index === 0 ? 'eager' : 'lazy';
      existingImage.decoding = 'async';

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

  function init() {
    addStyles();
    applyImages();

    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (applyImages() || attempts >= 12) window.clearInterval(timer);
    }, 250);

    window.addEventListener('resize', function () {
      applyImages();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
