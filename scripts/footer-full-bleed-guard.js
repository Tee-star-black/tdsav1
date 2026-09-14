(function () {
  'use strict';

  if (window.__TDS_FOOTER_FULL_BLEED_GUARD__) return;
  window.__TDS_FOOTER_FULL_BLEED_GUARD__ = true;

  function injectStyles() {
    if (document.getElementById('tds-footer-full-bleed-guard')) return;

    var style = document.createElement('style');
    style.id = 'tds-footer-full-bleed-guard';
    style.textContent = `
      html,
      body {
        width: 100% !important;
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        overflow-x: clip !important;
      }

      footer,
      .site-footer,
      .tds-canonical-footer {
        position: relative !important;
        left: 50% !important;
        right: auto !important;
        width: 100vw !important;
        min-width: 100vw !important;
        max-width: 100vw !important;
        margin-left: -50vw !important;
        margin-right: 0 !important;
        border-left: 0 !important;
        border-right: 0 !important;
        border-radius: 0 !important;
        box-sizing: border-box !important;
      }
    `;

    document.head.appendChild(style);
  }

  function repairFooter(footer) {
    if (!footer || footer.nodeType !== 1) return;
    if (!footer.matches('footer, .site-footer, .tds-canonical-footer')) return;

    footer.style.setProperty('position', 'relative', 'important');
    footer.style.setProperty('left', '50%', 'important');
    footer.style.setProperty('right', 'auto', 'important');
    footer.style.setProperty('width', '100vw', 'important');
    footer.style.setProperty('min-width', '100vw', 'important');
    footer.style.setProperty('max-width', '100vw', 'important');
    footer.style.setProperty('margin-left', '-50vw', 'important');
    footer.style.setProperty('margin-right', '0', 'important');
    footer.style.setProperty('border-left', '0', 'important');
    footer.style.setProperty('border-right', '0', 'important');
    footer.style.setProperty('border-radius', '0', 'important');
  }

  function repairAllFooters(root) {
    var scope = root && root.querySelectorAll ? root : document;

    if (scope.matches && scope.matches('footer, .site-footer, .tds-canonical-footer')) {
      repairFooter(scope);
    }

    scope.querySelectorAll('footer, .site-footer, .tds-canonical-footer').forEach(repairFooter);
  }

  function init() {
    injectStyles();
    repairAllFooters(document);

    if (!document.body || !window.MutationObserver) return;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) repairAllFooters(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.addEventListener('pageshow', function () {
    repairAllFooters(document);
  });

  window.addEventListener('resize', function () {
    repairAllFooters(document);
  }, { passive: true });
})();
