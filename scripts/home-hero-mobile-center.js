(function () {
  'use strict';

  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html' && page !== '') return;
  if (document.getElementById('tds-home-hero-mobile-center')) return;

  var style = document.createElement('style');
  style.id = 'tds-home-hero-mobile-center';
  style.textContent = `
    @media (max-width: 720px) {
      .core-slider-intro {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
      }

      .core-slider-intro > h1,
      .core-slider-intro > p {
        margin-left: auto !important;
        margin-right: auto !important;
        text-align: center !important;
      }

      .core-slider-intro .core-slider-actions,
      .core-slider-intro .core-proof-strip {
        width: 100% !important;
        margin-left: auto !important;
        margin-right: auto !important;
        justify-content: center !important;
        text-align: center !important;
      }

      .core-slider-intro .core-slider-actions > a,
      .core-slider-intro .core-proof-chip {
        justify-content: center !important;
        text-align: center !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
