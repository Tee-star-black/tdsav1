(function () {
  'use strict';

  if (window.__TDS_UX_V4__) return;
  window.__TDS_UX_V4__ = true;

  function installAutoHideHeader() {
    var nav = document.querySelector('body > nav:not(.tds-mobile-nav), nav:not(.tds-mobile-nav)');
    if (!nav) return;
    // The canonical navbar must remain visible regardless of scroll position.
    if (nav.id === 'tdsSiteNav' || document.querySelector('script[src*="scripts/rebuild-images.js"]')) return;

    nav.classList.add('tds-autohide-nav');

    var lastY = Math.max(window.scrollY || 0, 0);
    var ticking = false;
    var threshold = 8;
    var hideAfter = 88;

    function update() {
      var currentY = Math.max(window.scrollY || 0, 0);
      var delta = currentY - lastY;

      nav.classList.toggle('tds-nav-scrolled', currentY > 12);

      if (currentY <= hideAfter) {
        nav.classList.remove('tds-nav-hidden');
      } else if (delta > threshold) {
        nav.classList.add('tds-nav-hidden');
      } else if (delta < -threshold) {
        nav.classList.remove('tds-nav-hidden');
      }

      lastY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('focus', function () {
      nav.classList.remove('tds-nav-hidden');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') nav.classList.remove('tds-nav-hidden');
    });

    update();
  }

  function installTelemediaBlogFeed() {
    if (!/\/telemedia-suite(?:\.html)?(?:\/|$)/.test(window.location.pathname)) return;
    var anchor = document.querySelector('#featured-coverage');
    if (!anchor) return;

    fetch('/blog/feed.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('Blog feed unavailable');
        return response.json();
      })
      .then(function (payload) {
        var articles = Array.isArray(payload && payload.articles) ? payload.articles : [];
        var featured = articles.filter(function (article) { return article && article.featured; }).slice(0, 3);
        if (!featured.length) return;

        if (!document.getElementById('tds-telemedia-blog-styles')) {
          var style = document.createElement('style');
          style.id = 'tds-telemedia-blog-styles';
          style.textContent = '.tds-blog-feed{background:#f7f9fa;border-top:1px solid #e4e9ed;border-bottom:1px solid #e4e9ed;padding:58px 0}.tds-blog-feed .tds-blog-feed-head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:24px}.tds-blog-feed .tds-blog-feed-head span{font-size:11px;letter-spacing:.14em;font-weight:700;color:#b74f2d}.tds-blog-feed .tds-blog-feed-head h2{margin:7px 0 0;font-size:32px}.tds-blog-feed .tds-blog-feed-head a{text-decoration:none;font-weight:700;font-size:12px}.tds-blog-feed-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.tds-blog-feed-card{background:white;border:1px solid #e4e9ed;display:flex;flex-direction:column;min-width:0}.tds-blog-feed-card img{width:100%;height:160px;object-fit:cover;display:block;background:#e7eef1}.tds-blog-feed-card div{padding:18px;display:flex;flex-direction:column;flex:1}.tds-blog-feed-card small{font-size:9px;letter-spacing:.08em;color:#9b4c33;font-weight:700}.tds-blog-feed-card h3{font-size:18px;line-height:1.25;margin:8px 0}.tds-blog-feed-card p{font-size:12px;line-height:1.55;color:#657587;margin:0 0 16px}.tds-blog-feed-card a{margin-top:auto;text-decoration:none;font-size:11px;font-weight:700}@media(max-width:850px){.tds-blog-feed-grid{grid-template-columns:1fr}.tds-blog-feed .tds-blog-feed-head{align-items:flex-start;flex-direction:column}}';
          document.head.appendChild(style);
        }

        var section = document.createElement('section');
        section.className = 'tds-blog-feed';
        var inner = document.createElement('div');
        inner.className = 'section-inner';
        var head = document.createElement('div');
        head.className = 'tds-blog-feed-head';
        var titleWrap = document.createElement('div');
        var eyebrow = document.createElement('span');
        eyebrow.textContent = 'BLOG & INSIGHTS';
        var title = document.createElement('h2');
        title.textContent = 'From the editorial desk';
        titleWrap.appendChild(eyebrow);
        titleWrap.appendChild(title);
        var allLink = document.createElement('a');
        allLink.href = '/blog/';
        allLink.textContent = 'View all stories →';
        head.appendChild(titleWrap);
        head.appendChild(allLink);

        var grid = document.createElement('div');
        grid.className = 'tds-blog-feed-grid';
        featured.forEach(function (article) {
          var card = document.createElement('article');
          card.className = 'tds-blog-feed-card';
          if (article.coverImage && article.coverImage.url) {
            var image = document.createElement('img');
            image.src = article.coverImage.url;
            image.alt = article.coverImage.alt || '';
            image.loading = 'lazy';
            card.appendChild(image);
          }
          var copy = document.createElement('div');
          var category = document.createElement('small');
          category.textContent = article.category || 'Blog & Insights';
          var heading = document.createElement('h3');
          heading.textContent = article.title || 'TeleDoctorSA article';
          var excerpt = document.createElement('p');
          excerpt.textContent = article.excerpt || '';
          var link = document.createElement('a');
          link.href = '/blog/' + encodeURIComponent(article.slug) + '/';
          link.textContent = 'Read article →';
          copy.appendChild(category);
          copy.appendChild(heading);
          copy.appendChild(excerpt);
          copy.appendChild(link);
          card.appendChild(copy);
          grid.appendChild(card);
        });

        inner.appendChild(head);
        inner.appendChild(grid);
        section.appendChild(inner);
        anchor.parentNode.insertBefore(section, anchor);
      })
      .catch(function () {
        /* The main TeleMedia page must remain fully usable when no blog build exists yet. */
      });
  }

  function init() {
    installAutoHideHeader();
    installTelemediaBlogFeed();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
