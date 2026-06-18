(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });

    initHero();
    initFilters();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
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

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-filter-search]");
    var type = document.querySelector("[data-filter-type]");
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (search && initial) {
      search.value = initial;
    }

    function matchCard(card) {
      var keyword = normalize(search ? search.value : "");
      var typeValue = normalize(type ? type.value : "");
      var regionValue = normalize(region ? region.value : "");
      var yearValue = normalize(year ? year.value : "");
      var haystack = normalize(card.getAttribute("data-keywords"));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var cardYear = normalize(card.getAttribute("data-year"));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      if (typeValue && cardType.indexOf(typeValue) === -1) {
        return false;
      }
      if (regionValue && cardRegion.indexOf(regionValue) === -1) {
        return false;
      }
      if (yearValue && cardYear.indexOf(yearValue) === -1) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var matched = matchCard(card);
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [search, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.initMoviePlayer = function (mediaUrl) {
    var shell = document.querySelector(".movie-player");
    if (!shell || !mediaUrl) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-play-button]");
    var hlsInstance = null;
    var loaded = false;

    function load() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
