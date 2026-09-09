(function () {
  'use strict';

  if (document.getElementById('tds-final-global-fixes')) return;

  var style = document.createElement('style');
  style.id = 'tds-final-global-fixes';
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box !important; }

    html,
    body {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: clip !important;
    }

    nav:not(.tds-mobile-nav) {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      left: 0 !important;
      right: 0 !important;
      box-sizing: border-box !important;
    }

    footer,
    .site-footer {
      display: block !important;
      position: relative !important;
      left: 50% !important;
      right: auto !important;
      width: 100vw !important;
      min-width: 100vw !important;
      max-width: 100vw !important;
      margin-left: -50vw !important;
      margin-right: 0 !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      padding: clamp(40px, 4vw, 58px) max(20px, calc((100vw - 1240px) / 2)) clamp(30px, 3vw, 44px) !important;
    }

    .site-footer-shell,
    .site-footer-grid,
    .site-footer-bottom,
    .footer-inner,
    .footer-container {
      width: 100% !important;
      max-width: 1240px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      box-sizing: border-box !important;
    }

    .site-footer-grid {
      gap: clamp(18px, 2vw, 30px) !important;
    }

    .site-footer-chip-row,
    .site-footer-actions {
      gap: 10px !important;
    }

    .site-footer-chip,
    .site-footer-link {
      min-height: 38px !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    .tds-normalized-logo {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      min-width: 0 !important;
      text-decoration: none !important;
    }

    .tds-normalized-logo img,
    .site-footer-brandline img.tds-normalized-logo-img {
      display: block !important;
      width: auto !important;
      height: auto !important;
      max-width: 52px !important;
      max-height: 44px !important;
      object-fit: contain !important;
      flex: 0 0 auto !important;
    }

    .tds-normalized-logo .logo-text {
      min-width: 0 !important;
      white-space: nowrap !important;
    }

    @media (max-width: 900px) {
      footer,
      .site-footer {
        padding: 34px 16px calc(28px + env(safe-area-inset-bottom)) !important;
      }

      .site-footer-shell,
      .site-footer-grid,
      .site-footer-bottom,
      .footer-inner,
      .footer-container {
        max-width: 100% !important;
      }

      .tds-normalized-logo img,
      .site-footer-brandline img.tds-normalized-logo-img {
        max-width: 42px !important;
        max-height: 38px !important;
      }
    }
  `;
  document.head.appendChild(style);

  var logoSrc = '/images/rebuild/logo.png';

  function normalizeNavbarLogo() {
    document.querySelectorAll('nav:not(.tds-mobile-nav)').forEach(function (nav) {
      var logo = nav.querySelector('a.logo, .logo[href], a[class*="logo"]');
      if (!logo) {
        logo = document.createElement('a');
        logo.href = 'index.html';
        logo.className = 'logo tds-normalized-logo';
        logo.innerHTML = '<img src="' + logoSrc + '" alt="TeleDoctorSA logo"><span class="logo-text">TeleDoctor<span>SA</span></span>';
        nav.insertBefore(logo, nav.firstChild);
      } else {
        logo.classList.add('tds-normalized-logo');
        if (!logo.getAttribute('href') || logo.getAttribute('href') === '#') logo.setAttribute('href', 'index.html');
        var img = logo.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          logo.insertBefore(img, logo.firstChild);
        }
        img.src = logoSrc;
        img.alt = 'TeleDoctorSA logo';
      }
    });
  }

  function normalizeFooterLogo() {
    document.querySelectorAll('footer, .site-footer').forEach(function (footer) {
      var brandline = footer.querySelector('.site-footer-brandline, .footer-brand, .footer-logo');
      if (!brandline) {
        var brand = footer.querySelector('.site-footer-brand, .footer-column, .footer-content') || footer.firstElementChild;
        if (!brand) return;
        brandline = document.createElement('div');
        brandline.className = 'site-footer-brandline';
        brand.insertBefore(brandline, brand.firstChild);
      }
      var img = brandline.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        brandline.insertBefore(img, brandline.firstChild);
      }
      img.src = logoSrc;
      img.alt = 'TeleDoctorSA logo';
      img.classList.add('tds-normalized-logo-img');
    });
  }

  function forceFullBleedFooter() {
    document.documentElement.style.setProperty('padding', '0', 'important');
    document.body.style.setProperty('padding', '0', 'important');
    document.body.style.setProperty('margin', '0', 'important');

    document.querySelectorAll('footer, .site-footer').forEach(function (footer) {
      footer.style.setProperty('left', '50%', 'important');
      footer.style.setProperty('width', '100vw', 'important');
      footer.style.setProperty('min-width', '100vw', 'important');
      footer.style.setProperty('max-width', '100vw', 'important');
      footer.style.setProperty('margin-left', '-50vw', 'important');
      footer.style.setProperty('margin-right', '0', 'important');
      footer.style.setProperty('border-radius', '0', 'important');
    });
  }

  function init() {
    normalizeNavbarLogo();
    normalizeFooterLogo();
    forceFullBleedFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pageshow', init);
  window.addEventListener('resize', forceFullBleedFooter);
})();
