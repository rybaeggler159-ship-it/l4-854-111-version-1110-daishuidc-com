(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-card-filter]');
    var list = document.querySelector('[data-card-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('searchInput');
    var typeFilter = document.getElementById('typeFilter');
    var yearFilter = document.getElementById('yearFilter');
    var results = document.getElementById('searchResults');
    var summary = document.getElementById('searchSummary');
    if (!input || !typeFilter || !yearFilter || !results || !Array.isArray(window.SEARCH_DATA)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var years = Array.from(new Set(window.SEARCH_DATA.map(function (item) {
      return item.year;
    }))).filter(Boolean).sort(function (a, b) {
      return String(b).localeCompare(String(a));
    });

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    input.value = initialQuery;

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '    <div class="card-cover">',
        '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '      <span class="card-badge">' + escapeHtml(item.type) + '</span>',
        '      <span class="play-dot">▶</span>',
        '    </div>',
        '    <div class="card-body">',
        '      <h3>' + escapeHtml(item.title) + '</h3>',
        '      <p>' + escapeHtml(item.oneLine) + '</p>',
        '      <div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function render() {
      var query = normalize(input.value);
      var typeValue = normalize(typeFilter.value);
      var yearValue = normalize(yearFilter.value);
      var matches = window.SEARCH_DATA.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.oneLine
        ].join(' '));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var typeMatch = !typeValue || normalize(item.type).indexOf(typeValue) !== -1;
        var yearMatch = !yearValue || normalize(item.year) === yearValue;
        return queryMatch && typeMatch && yearMatch;
      }).slice(0, 96);

      if (!matches.length) {
        results.innerHTML = '';
        if (summary) {
          summary.textContent = '没有找到匹配内容。';
        }
        return;
      }

      results.innerHTML = matches.map(cardTemplate).join('');
      if (summary) {
        summary.textContent = query || typeValue || yearValue ? '已显示匹配内容。' : '推荐浏览以下热门内容。';
      }
    }

    input.addEventListener('input', render);
    typeFilter.addEventListener('change', render);
    yearFilter.addEventListener('change', render);
    render();
  }

  window.startMoviePlayer = function (videoId, buttonId, shellId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var shell = document.getElementById(shellId);
    if (!video || !button || !shell || !url) {
      return;
    }
    var prepared = false;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          maxBufferLength: 30,
          capLevelToPlayerSize: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function begin() {
      prepare();
      shell.classList.add('is-playing');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    prepare();
    button.addEventListener('click', begin);
    shell.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
  };

  onReady(function () {
    setupMenu();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
