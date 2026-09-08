(function () {
  'use strict';

  if (document.getElementById('tds-final-global-fixes')) return;

  var style = document.createElement('style');
  style.id = 'tds-final-global-fixes';
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box !important; }

    html {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: clip !important;
    }

    body {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      overflow-x: clip !important;
    }

    nav:not(.tds-mobile-nav),
    footer,
    .site-footer {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      box-sizing: border-box !important;
    }

    footer,
    .site-footer {
      margin-bottom: 0 !important;
      border-bottom: 0 !important;
    }

    footer:last-of-type,
    .site-footer:last-of-type {
      margin-bottom: 0 !important;
      padding-bottom: clamp(28px, 3vw, 46px) !important;
    }

    .site-footer-shell,
    .site-footer-grid,
    .site-footer-bottom,
    .footer-inner,
    .footer-container {
      max-width: 100% !important;
      box-sizing: border-box !important;
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

    @media (min-width: 901px) {
      body {
        padding-bottom: 0 !important;
      }

      .tds-mobile-nav,
      .tds-offer-sheet-backdrop,
      .tds-offer-sheet {
        margin-bottom: 0 !important;
      }
    }

    @media (max-width: 900px) {
      .tds-normalized-logo img,
      .site-footer-brandline img.tds-normalized-logo-img {
        max-width: 42px !important;
        max-height: 38px !important;
      }

      footer:last-of-type,
      .site-footer:last-of-type {
        padding-bottom: calc(30px + env(safe-area-inset-bottom)) !important;
      }
    }
  `;
  document.head.appendChild(style);

  var logoSrc = '/images/rebuild/logo.png';

  function normalizeNavbarLogo() {
    var navs = document.querySelectorAll('nav:not(.tds-mobile-nav)');
    navs.forEach(function (nav) {
      var logo = nav.querySelector('a.logo, .logo[href], a[class*="logo"]');

      if (!logo) {
        logo = document.createElement('a');
        logo.href = 'index.html';
        logo.className = 'logo tds-normalized-logo';
        logo.innerHTML = '<img src="' + logoSrc + '" alt="TeleDoctorSA logo"><span class="logo-text">TeleDoctor<span>SA</span></span>';
        nav.insertBefore(logo, nav.firstChild);
      } else {
        logo.classList.add('tds-normalized-logo');
        if (!logo.getAttribute('href') || logo.getAttribute('href') === '#') {
          logo.setAttribute('href', 'index.html');
        }

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

  function removeDesktopBottomGap() {
    if (window.innerWidth <= 900) return;

    document.body.style.paddingBottom = '0px';
    document.documentElement.style.paddingBottom = '0px';

    var footer = document.querySelector('footer:last-of-type, .site-footer:last-of-type');
    if (!footer) return;

    var sibling = footer.nextElementSibling;
    while (sibling) {
      var next = sibling.nextElementSibling;
      var tag = sibling.tagName ? sibling.tagName.toLowerCase() : '';
      var isNonVisual = tag === 'script' || tag === 'style' || tag === 'template';
      var isEmpty = !sibling.textContent.trim() && sibling.children.length === 0;
      if (!isNonVisual && isEmpty) sibling.remove();
      sibling = next;
    }
  }

  function init() {
    normalizeNavbarLogo();
    normalizeFooterLogo();
    removeDesktopBottomGap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('pageshow', init);
})();
