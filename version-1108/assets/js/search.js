(function () {
  const data = Array.isArray(window.MOVIE_DATA) ? window.MOVIE_DATA : [];
  const input = document.querySelector("[data-search-input]");
  const typeSelect = document.querySelector("[data-search-type]");
  const yearSelect = document.querySelector("[data-search-year]");
  const resultRoot = document.querySelector("[data-search-results]");
  const countLabel = document.querySelector("[data-search-count]");

  if (!input || !typeSelect || !yearSelect || !resultRoot || !countLabel) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function renderCard(item) {
    const tags = item.tags.slice(0, 4).map(function (tag) {
      return `<span>${escapeHtml(tag)}</span>`;
    }).join("");

    return `
      <article class="movie-card">
        <a class="poster-link" href="${item.url}" aria-label="查看 ${escapeHtml(item.title)}">
          <div class="poster" style="--poster-hue: ${item.hue};">
            <span class="poster-kicker">${escapeHtml(item.type)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.year)}</small>
          </div>
        </a>
        <div class="movie-card__body">
          <div class="meta-line">
            <span>${escapeHtml(item.year)}</span>
            <span>${escapeHtml(item.region)}</span>
            <span>${escapeHtml(item.channel)}</span>
          </div>
          <h3>
            <a href="${item.url}">${escapeHtml(item.title)}</a>
          </h3>
          <p>${escapeHtml(item.line)}</p>
          <div class="mini-tags">
            ${tags || "<span>精选</span>"}
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function runSearch() {
    const keyword = normalize(input.value);
    const type = typeSelect.value;
    const year = yearSelect.value;

    let results = data.filter(function (item) {
      const matchKeyword = !keyword || item.searchText.includes(keyword);
      const matchType = !type || item.channelSlug === type;
      const matchYear = !year || item.year === year;
      return matchKeyword && matchType && matchYear;
    });

    results = results.slice(0, 96);
    countLabel.textContent = `显示 ${results.length} 条结果`;

    if (!results.length) {
      resultRoot.innerHTML = `
        <div class="empty-state">
          没有找到匹配内容，可以尝试减少关键词或切换分类。
        </div>
      `;
      return;
    }

    resultRoot.innerHTML = results.map(renderCard).join("");
  }

  input.addEventListener("input", runSearch);
  typeSelect.addEventListener("change", runSearch);
  yearSelect.addEventListener("change", runSearch);

  runSearch();
})();
