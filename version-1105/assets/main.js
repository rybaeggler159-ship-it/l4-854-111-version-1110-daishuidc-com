(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide') || '0'));
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5600);
  }

  var pageSearch = document.querySelector('.page-search');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
  var noResults = document.querySelector('.no-results');
  var activeType = 'all';

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
    var visibleCount = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var matchedText = !keyword || text.indexOf(keyword) !== -1;
      var matchedType = activeType === 'all' || type === activeType;
      var visible = matchedText && matchedType;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });
    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      pageSearch.value = q;
    }
    pageSearch.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeType = button.getAttribute('data-type') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilters();
    });
  });

  applyFilters();
})();

function initMoviePlayer(videoId, buttonId, overlayId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !button || !overlay || !source) {
    return;
  }

  function beginPlay() {
    overlay.classList.add('hidden');

    if (!loaded) {
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {
          overlay.classList.remove('hidden');
        });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            overlay.classList.remove('hidden');
          });
        });
      } else {
        video.src = source;
        video.play().catch(function () {
          overlay.classList.remove('hidden');
        });
      }
    } else {
      video.play().catch(function () {
        overlay.classList.remove('hidden');
      });
    }
  }

  overlay.addEventListener('click', beginPlay);
  button.addEventListener('click', function (event) {
    event.stopPropagation();
    beginPlay();
  });
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
