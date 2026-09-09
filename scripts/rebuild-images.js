(function () {
  'use strict';

  function loadOnce(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  loadOnce('tds-rebuild-images-core-loader', '/scripts/rebuild-images-core.js');
})();
