/* TeleDoctorSA homepage editorial feed, same-origin published-only static content. */
(function () {
  'use strict';
  var section = document.getElementById('tdsaHomeInsights');
  var grid = document.getElementById('tdsaInsightsGrid');
  var banner = document.getElementById('tdsaNewsAnnouncement');
  if (!section || !grid || !banner) return;
  var bannerTitle = document.getElementById('tdsaNewsTitle');
  var bannerLink = document.getElementById('tdsaNewsLink');
  var closeButton = document.getElementById('tdsaNewsClose');
  function storyUrl(story) {
    return '/blog/' + encodeURIComponent(story.slug) + '/';
  }
  function dateLabel(value) {
    var date = new Date(value || '');
    return isNaN(date.getTime()) ? 'Latest insight' : date.toLocaleDateString('en-ZA', {day:'numeric',month:'short',year:'numeric'});
  }
  function createCard(article) {
    var card = document.createElement('article');
    card.className = 'tdsa-insight-card';
    var meta = document.createElement('p');
    meta.className = 'tdsa-insight-meta';
    meta.textContent = (article.category || 'Blog & Insights') + ' / ' + dateLabel(article.publishedAt);
    var heading = document.createElement('h3');
    var link = document.createElement('a');
    link.href = storyUrl(article);
    link.textContent = article.title;
    heading.appendChild(link);
    var excerpt = document.createElement('p');
    excerpt.className = 'tdsa-insight-excerpt';
    excerpt.textContent = article.excerpt || 'Read the latest from the TeleDoctorSA editorial team.';
    var read = document.createElement('a');
    read.className = 'tdsa-insight-read';
    read.href = storyUrl(article);
    read.textContent = 'Read article';
    read.setAttribute('aria-label', 'Read: ' + article.title);
    card.append(meta, heading, excerpt, read);
    return card;
  }
  fetch('/blog/feed.json', {cache:'no-store', credentials:'omit'})
    .then(function (response) {
      if (!response.ok) throw new Error('Blog feed unavailable');
      return response.json();
    })
    .then(function (data) {
      var articles = Array.isArray(data.articles) ? data.articles : [];
      articles = articles.filter(function (item) {
        return item && typeof item.title === 'string' && item.title.trim() &&
          typeof item.slug === 'string' && /^[a-z0-9-]+$/.test(item.slug);
      }).sort(function (a, b) {
        return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      }).slice(0, 3);
      if (!articles.length) return;
      articles.forEach(function (article) { grid.appendChild(createCard(article)); });
      section.hidden = false;
      var newest = articles[0];
      var date = new Date(newest.publishedAt || '');
      var recent = !isNaN(date.getTime()) && Date.now() - date.getTime() >= 0 &&
        Date.now() - date.getTime() < 14 * 24 * 60 * 60 * 1000;
      var dismissKey = 'tdsaNewsDismissed:' + newest.slug;
      if (!recent) return;
      try { if (sessionStorage.getItem(dismissKey) === '1') return; } catch (_) {}
      bannerTitle.textContent = newest.title;
      bannerLink.href = storyUrl(newest);
      banner.hidden = false;
      closeButton.addEventListener('click', function () {
        banner.hidden = true;
        try { sessionStorage.setItem(dismissKey, '1'); } catch (_) {}
      }, {once:true});
    })
    .catch(function () {
      // Keep public homepage available if blog feed is not deployed yet.
      section.hidden = true;
      banner.hidden = true;
    });
}());
