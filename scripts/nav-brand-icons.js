(function () {
  'use strict';

  if (window.__TDS_NAV_BRAND_ICONS__) return;
  window.__TDS_NAV_BRAND_ICONS__ = true;

  function brandSvg(name) {
    var paths = {
      whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.371-.272.298-1.04 1.017-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 7.021 2.91 9.825 9.825 0 0 1 2.9 7.026c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.69 1.448h.005c6.56 0 11.895-5.335 11.898-11.893a11.821 11.821 0 0 0-3.49-8.413Z',
      facebook: 'M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073C0 18.063 4.388 23.027 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.685 4.533-4.685 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.928-1.956 1.881v2.276h3.328l-.532 3.49h-2.796V24C19.612 23.027 24 18.063 24 12.073z',
      instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948C23.73 2.694 21.308.272 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'
    };

    var path = paths[name];
    if (!path) return '';
    return '<svg class="tds-brand-logo tds-brand-logo-' + name + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + path + '"/></svg>';
  }

  function lineSvg(type) {
    var path = type === 'phone'
      ? 'M6.6 3h3l1.5 4-2 1.7a15.7 15.7 0 0 0 6.2 6.2l1.7-2 4 1.5v3c0 1.1-.9 2-2 2C10.2 19.4 4.6 13.8 4.6 5c0-1.1.9-2 2-2Z'
      : 'M3 6h18v12H3zM3 7l9 6 9-6';
    return '<svg class="tds-brand-logo tds-brand-logo-' + type + '" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="' + path + '" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function addStyles() {
    if (document.getElementById('tds-nav-brand-icon-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-nav-brand-icon-styles';
    style.textContent = `
      #tdsSiteNav .tds-brand-logo {
        width: 19px !important;
        height: 19px !important;
        display: block !important;
        flex: 0 0 19px !important;
      }

      #tdsContactMenu .tds-contact-icon .tds-brand-logo {
        width: 18px !important;
        height: 18px !important;
      }

      #tdsMobileConnect a {
        width: 44px !important;
        min-width: 44px !important;
        padding: 0 !important;
      }

      #tdsMobileConnect a .tds-brand-logo {
        width: 20px !important;
        height: 20px !important;
      }

      #tdsMobileConnect a[data-platform='whatsapp'],
      #tdsContactMenu .tds-contact-icon[data-platform='whatsapp'] {
        color: #25D366 !important;
      }

      #tdsMobileConnect a[data-platform='facebook'] {
        color: #1877F2 !important;
      }

      #tdsMobileConnect a[data-platform='instagram'] {
        color: #C13584 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function install() {
    var nav = document.getElementById('tdsSiteNav');
    if (!nav) return false;
    if (nav.dataset.tdsBrandIconsReady === 'true') return true;

    addStyles();

    var contactIcons = nav.querySelectorAll('#tdsContactMenu .tds-contact-icon');
    if (contactIcons[0]) {
      contactIcons[0].dataset.platform = 'whatsapp';
      contactIcons[0].innerHTML = brandSvg('whatsapp');
    }
    if (contactIcons[1]) {
      contactIcons[1].dataset.platform = 'phone';
      contactIcons[1].innerHTML = lineSvg('phone');
    }
    if (contactIcons[2]) {
      contactIcons[2].dataset.platform = 'email';
      contactIcons[2].innerHTML = lineSvg('email');
    }

    var mobileLinks = nav.querySelectorAll('#tdsMobileConnect .tds-mobile-connect-row a');
    var platforms = [
      { name: 'whatsapp', label: 'WhatsApp', icon: brandSvg('whatsapp') },
      { name: 'facebook', label: 'Facebook', icon: brandSvg('facebook') },
      { name: 'instagram', label: 'Instagram', icon: brandSvg('instagram') },
      { name: 'phone', label: 'Call TeleDoctorSA', icon: lineSvg('phone') }
    ];

    mobileLinks.forEach(function (link, index) {
      var platform = platforms[index];
      if (!platform) return;
      link.dataset.platform = platform.name;
      link.setAttribute('aria-label', platform.label);
      link.setAttribute('title', platform.label);
      link.innerHTML = platform.icon;
    });

    nav.dataset.tdsBrandIconsReady = 'true';
    document.body.setAttribute('data-tds-nav-brand-icons-ready', 'true');
    return true;
  }

  function boot() {
    if (install()) return;
    var observer = new MutationObserver(function () {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(function () { observer.disconnect(); }, 6000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
