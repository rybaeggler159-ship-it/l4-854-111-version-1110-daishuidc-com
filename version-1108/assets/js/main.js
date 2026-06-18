(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-main-nav]");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  const cards = document.querySelectorAll(".movie-card");

  for (const card of cards) {
    card.addEventListener("mouseenter", function () {
      card.setAttribute("data-hovered", "true");
    });

    card.addEventListener("mouseleave", function () {
      card.removeAttribute("data-hovered");
    });
  }
})();
