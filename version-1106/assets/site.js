(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-target");
      var grid = document.querySelector(targetSelector);
      if (!grid) {
        return;
      }
      var search = panel.querySelector("[data-filter-search]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        cards.forEach(function (card) {
          var matchesKeyword = !keyword || (card.getAttribute("data-search") || "").indexOf(keyword) !== -1;
          var matchesRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          card.classList.toggle("is-hidden", !(matchesKeyword && matchesRegion && matchesType && matchesYear));
        });
      }

      [search, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayer() {
    var video = document.getElementById("movie-video");
    var trigger = document.getElementById("movie-play-trigger");
    var stream = window.__RIHAN_PLAYER__;
    if (!video || !trigger || !stream) {
      return;
    }
    var attached = false;
    var attachPromise = null;

    function attach() {
      if (attachPromise) {
        return attachPromise;
      }
      attachPromise = new Promise(function (resolve) {
        if (attached) {
          resolve();
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.__RIHAN_HLS__ = hls;
          window.setTimeout(resolve, 1600);
          return;
        }
        video.src = stream;
        resolve();
      });
      return attachPromise;
    }

    function play() {
      attach().then(function () {
        trigger.classList.add("is-hidden");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            trigger.classList.remove("is-hidden");
          });
        }
      });
    }

    trigger.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
