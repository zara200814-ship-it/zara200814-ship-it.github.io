const themeToggle = document.querySelector(".theme-toggle");
const storedTheme = localStorage.getItem("portfolio-theme");
const initialTheme = storedTheme === "dark" ? "dark" : "light";

document.documentElement.dataset.theme = initialTheme;

const updateThemeToggle = (theme) => {
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeToggle.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} mode`);
};

if (themeToggle) {
  updateThemeToggle(initialTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
    updateThemeToggle(nextTheme);
  });
}

const menuToggle = document.querySelector(".menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");

if (menuToggle && primaryMenu) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryMenu.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryMenu.classList.toggle("is-open", !isExpanded);
  });

  primaryMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
}

const siteHeader = document.querySelector(".site-header");
const backToTopButton = document.querySelector(".back-to-top");

if (backToTopButton) {
  backToTopButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "auto" });
  });
}

if (siteHeader || backToTopButton) {
  let scrollUpdateScheduled = false;

  const updateHeader = () => {
    const isScrolled = window.scrollY > 8;
    const showBackToTop = window.scrollY > 320;

    if (siteHeader) siteHeader.classList.toggle("is-scrolled", isScrolled);
    if (backToTopButton) {
      backToTopButton.classList.toggle("is-visible", showBackToTop);
      backToTopButton.setAttribute("aria-hidden", String(!showBackToTop));
      backToTopButton.tabIndex = showBackToTop ? 0 : -1;
    }

    scrollUpdateScheduled = false;
  };

  window.addEventListener("scroll", () => {
    if (!scrollUpdateScheduled) {
      scrollUpdateScheduled = true;
      window.requestAnimationFrame(updateHeader);
    }
  }, { passive: true });

  updateHeader();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  document.querySelectorAll("[data-count-up]").forEach((element) => {
    const target = Number(element.dataset.countUp);
    const duration = 1000;
    const startTime = performance.now();

    element.textContent = "0";

    const updateCount = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      element.textContent = String(Math.round(target * easedProgress));

      if (progress < 1) {
        window.requestAnimationFrame(updateCount);
      } else {
        element.textContent = String(target);
      }
    };

    window.requestAnimationFrame(updateCount);
  });
}

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealTargets = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  revealTargets.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}
