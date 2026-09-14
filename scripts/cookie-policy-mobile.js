(function () {
  'use strict';

  var page = (window.location.pathname.split('/').pop() || '').toLowerCase();
  var isCookiePolicy = page === 'cookies-policy' || page === 'cookies-policy.html' || window.location.pathname.toLowerCase().indexOf('/cookies-policy') !== -1;
  if (!isCookiePolicy) return;
  if (document.getElementById('tds-cookie-policy-mobile-center')) return;

  var style = document.createElement('style');
  style.id = 'tds-cookie-policy-mobile-center';
  style.textContent = `
    @media (max-width: 767px) {
      .policy-hero .shell {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
      }

      .policy-kicker {
        justify-content: center !important;
        text-align: center !important;
      }

      .policy-hero h1,
      .policy-hero p {
        margin-left: auto !important;
        margin-right: auto !important;
        text-align: center !important;
      }

      .policy-meta {
        width: 100% !important;
        justify-content: center !important;
        text-align: center !important;
      }
    }

    @media (max-width: 480px) {
      .policy-meta {
        flex-direction: column !important;
        align-items: center !important;
        gap: 4px !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
