/* SM Logo Ticker: turns a gallery grid block into an endless scrolling ticker. Speed comes from the --ticker-speed CSS variable on the gallery (default 40). Load in Footer Code Injection: <script src="https://cdn.jsdelivr.net/gh/StudioMesa/sm-logo-ticker@main/script.js"></script> */
(function () {
  var rows = document.querySelectorAll('.sqs-gallery-block-grid .sqs-gallery');
  for (var r = 0; r < rows.length; r++) ticker(rows[r]);

  function ticker(row) {
    var speed = parseFloat(getComputedStyle(row).getPropertyValue('--ticker-speed')) || 40;

    // Load every original logo now. They sit off to the side of the viewport,
    // so Squarespace's lazy loader would otherwise leave some of them blank.
    var own = row.querySelectorAll(':scope > .slide:not([data-sm-copy]) img[data-src]');
    for (var o = 0; o < own.length; o++) {
      if (!own[o].getAttribute('src')) {
        var ob = own[o].getAttribute('data-src').split('?')[0];
        own[o].setAttribute('src', ob.indexOf('squarespace') > -1 ? ob + '?format=300w' : ob);
      }
    }

    // One hidden copy of every logo after the originals, so moving left by one
    // copy loops seamlessly. Rebuilt if Squarespace ever re-renders the slides.
    function fill() {
      var originals = row.querySelectorAll(':scope > .slide:not([data-sm-copy])');
      var copies = row.querySelectorAll(':scope > [data-sm-copy]');
      if (!originals.length || copies.length === originals.length) return;
      for (var c = 0; c < copies.length; c++) row.removeChild(copies[c]);
      for (var i = 0; i < originals.length; i++) {
        var copy = originals[i].cloneNode(true);
        copy.setAttribute('data-sm-copy', '');
        copy.setAttribute('aria-hidden', 'true');

        var links = copy.querySelectorAll('a');
        for (var a = 0; a < links.length; a++) links[a].setAttribute('tabindex', '-1');

        // Squarespace lazy-loads, so a copy made early has no image yet
        var imgs = copy.querySelectorAll('img[data-src]');
        for (var m = 0; m < imgs.length; m++) {
          var src = imgs[m].getAttribute('src');
          if (!src || src.indexOf('data:') === 0) {
            var base = imgs[m].getAttribute('data-src').split('?')[0];
            imgs[m].setAttribute('src', base.indexOf('squarespace') > -1 ? base + '?format=300w' : base);
          }
        }
        row.appendChild(copy);
      }
      tune();
    }

    // Same speed however many logos there are. Changing the playback rate
    // instead of the duration means re-measuring never makes the row jump.
    function tune() {
      var anim = row.getAnimations && row.getAnimations()[0];
      var half = row.scrollWidth / 2;
      if (!anim || !half) return;
      var rate = speed * (anim.effect.getComputedTiming().duration / 1000) / half;
      if (anim.updatePlaybackRate) anim.updatePlaybackRate(rate); else anim.playbackRate = rate;
    }

    fill();
    new MutationObserver(fill).observe(row, { childList: true });
    window.addEventListener('load', tune);
    window.addEventListener('resize', tune);
  }
})();
