(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".nav-links");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length > 1) {
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var searchInput = document.querySelector(".local-search");
    var yearFilter = document.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var applyFilter = function () {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var year = yearFilter ? yearFilter.value : "";
      cards.forEach(function (card) {
        var haystack = normalize(card.dataset.title + " " + card.dataset.region + " " + card.dataset.tags);
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.dataset.year === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
      });
    };
    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilter);
    }

    var globalInput = document.getElementById("global-search");
    var globalResults = document.getElementById("global-results");
    var globalButton = document.getElementById("global-search-button");
    var renderGlobal = function () {
      if (!globalInput || !globalResults || !window.SEARCH_MOVIES) {
        return;
      }
      var keyword = normalize(globalInput.value);
      globalResults.innerHTML = "";
      if (!keyword) {
        globalResults.classList.remove("is-open");
        return;
      }
      var list = window.SEARCH_MOVIES.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.tags).indexOf(keyword) !== -1;
      }).slice(0, 12);
      list.forEach(function (item) {
        var link = document.createElement("a");
        link.className = "compact-card";
        link.href = item.href;
        link.innerHTML = '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.region + '</em></span>';
        globalResults.appendChild(link);
      });
      globalResults.classList.toggle("is-open", list.length > 0);
    };
    if (globalInput) {
      globalInput.addEventListener("input", renderGlobal);
      globalInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          renderGlobal();
        }
      });
    }
    if (globalButton) {
      globalButton.addEventListener("click", renderGlobal);
    }
  });
})();
