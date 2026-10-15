(function () {
  'use strict';

  if (window.__TDS_NAV_BACK_CONTROLS__) return;
  window.__TDS_NAV_BACK_CONTROLS__ = true;

  var MOBILE_MAX = 1100;

  function backIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function isHomePage() {
    var path = (window.location.pathname || '/').replace(/\/index\.html$/i, '/').replace(/\/+$/, '') || '/';
    return path === '/';
  }

  function goBackOrHome() {
    var sameOriginReferrer = false;
    try {
      sameOriginReferrer = !!document.referrer && new URL(document.referrer, window.location.href).origin === window.location.origin;
    } catch (error) {
      sameOriginReferrer = false;
    }

    if (sameOriginReferrer && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign('/');
  }

  function addStyles() {
    if (document.getElementById('tds-nav-back-controls-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-nav-back-controls-styles';
    style.textContent = `
      #tdsSiteNav .tds-nav-left {
        min-width: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        flex: 0 0 auto !important;
      }

      #tdsNavBackButton,
      #tdsMobileMenuBack {
        appearance: none !important;
        -webkit-appearance: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        cursor: pointer !important;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsNavBackButton {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        padding: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: #0f172a !important;
        background: #fff !important;
        border: 1px solid #e2e8f0 !important;
      }

      #tdsNavBackButton:hover,
      #tdsNavBackButton:focus-visible {
        color: #ff8844 !important;
        border-color: #ff8844 !important;
        outline: none !important;
      }

      #tdsNavBackButton svg {
        width: 18px !important;
        height: 18px !important;
        flex: 0 0 18px !important;
      }

      #tdsMobileMenuBack {
        display: none !important;
      }

      @media (max-width: 1100px) {
        #tdsSiteNav {
          gap: 10px !important;
        }

        #tdsSiteNav .tds-nav-left {
          gap: 8px !important;
          min-width: 0 !important;
          max-width: calc(100% - 54px) !important;
        }

        #tdsNavBackButton {
          width: 44px !important;
          height: 44px !important;
          min-width: 44px !important;
          flex: 0 0 44px !important;
        }

        #tdsSiteNav .tds-nav-logo {
          min-width: 0 !important;
        }

        #tdsSiteNav .tds-nav-brand {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        #tdsMobileMenuBack {
          width: 100% !important;
          min-height: 48px !important;
          margin: 0 0 10px !important;
          padding: 0 4px 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 9px !important;
          color: #64748b !important;
          background: transparent !important;
          border: 0 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          text-align: left !important;
          font: 800 .82rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        #tdsMobileMenuBack:hover,
        #tdsMobileMenuBack:focus-visible {
          color: #ff8844 !important;
          outline: none !important;
        }

        #tdsMobileMenuBack svg {
          width: 18px !important;
          height: 18px !important;
          flex: 0 0 18px !important;
        }
      }

      @media (max-width: 390px) {
        #tdsSiteNav .tds-nav-brand {
          font-size: .9rem !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function install() {
    var nav = document.getElementById('tdsSiteNav');
    var links = document.getElementById('tdsNavLinks');
    var menuButton = document.getElementById('tdsNavMenuButton');
    var offerTrigger = document.getElementById('tdsOfferTrigger');
    var offerPanel = document.getElementById('tdsOfferPanel');
    var contact = document.getElementById('tdsContact');
    var contactButton = document.getElementById('tdsContactButton');

    if (!nav || !links || !menuButton) return false;
    if (nav.dataset.tdsBackControlsReady === 'true') return true;

    addStyles();

    var logo = nav.querySelector('.tds-nav-logo');
    if (logo && !nav.querySelector('.tds-nav-left')) {
      var left = document.createElement('div');
      left.className = 'tds-nav-left';
      nav.insertBefore(left, logo);

      if (!isHomePage()) {
        var pageBack = document.createElement('button');
        pageBack.id = 'tdsNavBackButton';
        pageBack.type = 'button';
        pageBack.setAttribute('aria-label', 'Go back to the previous page');
        pageBack.setAttribute('title', 'Back');
        pageBack.innerHTML = backIcon();
        pageBack.addEventListener('click', goBackOrHome);
        left.appendChild(pageBack);
      }

      left.appendChild(logo);
    }

    if (!document.getElementById('tdsMobileMenuBack')) {
      var menuBack = document.createElement('button');
      menuBack.id = 'tdsMobileMenuBack';
      menuBack.type = 'button';
      menuBack.innerHTML = backIcon() + '<span>Back</span>';
      menuBack.setAttribute('aria-label', 'Back');
      links.insertBefore(menuBack, links.firstChild);

      function refreshLabel() {
        var submenuOpen = !!(
          offerPanel && offerPanel.classList.contains('is-open') ||
          contact && contact.classList.contains('is-open')
        );
        var label = submenuOpen ? 'Back to menu' : 'Back';
        var text = menuBack.querySelector('span');
        if (text) text.textContent = label;
        menuBack.setAttribute('aria-label', label);
      }

      menuBack.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (offerPanel && offerPanel.classList.contains('is-open')) {
          offerPanel.classList.remove('is-open');
          if (offerTrigger) {
            offerTrigger.setAttribute('aria-expanded', 'false');
            offerTrigger.focus();
          }
          refreshLabel();
          return;
        }

        if (contact && contact.classList.contains('is-open')) {
          contact.classList.remove('is-open');
          if (contactButton) {
            contactButton.setAttribute('aria-expanded', 'false');
            contactButton.focus();
          }
          refreshLabel();
          return;
        }

        if (window.innerWidth <= MOBILE_MAX && links.classList.contains('is-open')) {
          menuButton.click();
          menuButton.focus();
          return;
        }

        goBackOrHome();
      });

      if (offerPanel) {
        new MutationObserver(refreshLabel).observe(offerPanel, { attributes: true, attributeFilter: ['class'] });
      }
      if (contact) {
        new MutationObserver(refreshLabel).observe(contact, { attributes: true, attributeFilter: ['class'] });
      }
      refreshLabel();
    }

    nav.dataset.tdsBackControlsReady = 'true';
    document.body.setAttribute('data-tds-nav-back-ready', 'true');
    return true;
  }

  function boot() {
    if (install()) return;

    var observer = new MutationObserver(function () {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    window.setTimeout(function () {
      observer.disconnect();
      install();
    }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
