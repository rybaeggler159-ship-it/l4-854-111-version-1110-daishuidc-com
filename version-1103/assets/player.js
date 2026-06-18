(function () {
  window.initMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    if (!video || !overlay || !sourceUrl) {
      return;
    }

    var load = function () {
      if (video.dataset.ready === "1") {
        return;
      }
      video.dataset.ready = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    };

    var start = function () {
      load();
      overlay.classList.add("hidden");
      video.controls = true;
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    };

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
