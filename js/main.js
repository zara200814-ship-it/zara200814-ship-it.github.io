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

const glowModeButton = document.querySelector("#glow-mode-button");
const glowModeEnabled = localStorage.getItem("portfolio-glow-mode") === "true";
document.documentElement.classList.toggle("glow-mode", glowModeEnabled);

if (glowModeButton) {
  glowModeButton.setAttribute("aria-pressed", String(glowModeEnabled));
  glowModeButton.addEventListener("click", () => {
    const isEnabled = document.documentElement.classList.toggle("glow-mode");
    localStorage.setItem("portfolio-glow-mode", String(isEnabled));
    glowModeButton.setAttribute("aria-pressed", String(isEnabled));
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

const introSplash = document.querySelector("#portfolio-intro");
let introIsActive = Boolean(introSplash && !prefersReducedMotion);

const runAfterIntro = (callback) => {
  if (introIsActive) {
    introSplash.addEventListener("introcomplete", callback, { once: true });
  } else {
    callback();
  }
};

if (introSplash) {
  const skipIntro = introSplash.querySelector(".intro-skip");
  const pageLayers = [
    document.querySelector(".site-header"),
    document.querySelector("main"),
    document.querySelector(".site-footer")
  ].filter(Boolean);

  if (prefersReducedMotion) {
    introSplash.hidden = true;
  } else {
    document.documentElement.classList.add("intro-active");
    pageLayers.forEach((layer) => {
      layer.inert = true;
    });

    let introFinished = false;
    const revealPage = (delay = 0) => {
      if (introFinished) return;
      introFinished = true;

      window.setTimeout(() => {
        introSplash.hidden = true;
        pageLayers.forEach((layer) => {
          layer.inert = false;
        });
        document.documentElement.classList.remove("intro-active");

        if (document.activeElement === skipIntro) {
          document.querySelector(".brand")?.focus({ preventScroll: true });
        }

        introIsActive = false;
        introSplash.dispatchEvent(new Event("introcomplete"));
      }, delay);
    };

    introSplash.addEventListener("animationend", (event) => {
      if (event.target === introSplash && event.animationName === "splash-exit") {
        revealPage();
      }
    });

    skipIntro?.addEventListener("click", () => {
      introSplash.classList.add("is-skipped");
      revealPage(240);
    });
  }
}

const scrambleName = document.querySelector(".scramble-name");

if (scrambleName) {
  const targetText = scrambleName.textContent;
  const scrambleCharacters = ["0", "1", "/", "#", "{", "}", "<", ">", "*", "_"];
  let scrambleFrame = 0;

  const startScramble = () => {
    if (prefersReducedMotion) {
      scrambleName.textContent = targetText;
      return;
    }

    if (scrambleFrame) window.cancelAnimationFrame(scrambleFrame);

    const startTime = performance.now();
    const duration = 1400;
    scrambleName.classList.add("is-scrambling");

    const updateScramble = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const lockedCharacters = Math.floor(progress * targetText.length);
      let output = "";

      for (let index = 0; index < targetText.length; index += 1) {
        const character = targetText[index];
        if (character === " " || index < lockedCharacters || progress === 1) {
          output += character;
        } else {
          output += scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        }
      }

      scrambleName.textContent = output;

      if (progress < 1) {
        scrambleFrame = window.requestAnimationFrame(updateScramble);
      } else {
        scrambleName.textContent = targetText;
        scrambleName.classList.remove("is-scrambling");
        scrambleFrame = 0;
      }
    };

    scrambleFrame = window.requestAnimationFrame(updateScramble);
  };

  runAfterIntro(startScramble);
  scrambleName.addEventListener("mouseenter", startScramble);
  document.querySelector("#redecode-button")?.addEventListener("click", startScramble);
}

const cursorAurora = document.querySelector("#cursor-aurora");

if (cursorAurora) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let targetX = cursorX;
  let targetY = cursorY;
  let trailX = cursorX;
  let trailY = cursorY;
  let animationFrame = 0;
  let touchHideTimeout = 0;

  const renderAuroraPosition = () => {
    cursorAurora.style.setProperty("--aurora-x", `${cursorX}px`);
    cursorAurora.style.setProperty("--aurora-y", `${cursorY}px`);
    cursorAurora.style.setProperty("--aurora-trail-x", `${trailX}px`);
    cursorAurora.style.setProperty("--aurora-trail-y", `${trailY}px`);
  };

  const animateAurora = () => {
    cursorX += (targetX - cursorX) * 0.14;
    cursorY += (targetY - cursorY) * 0.14;
    trailX += (cursorX - trailX) * 0.065;
    trailY += (cursorY - trailY) * 0.065;
    renderAuroraPosition();

    const remainingDistance = Math.abs(targetX - cursorX) + Math.abs(targetY - cursorY)
      + Math.abs(cursorX - trailX) + Math.abs(cursorY - trailY);
    if (remainingDistance > 0.8) {
      animationFrame = window.requestAnimationFrame(animateAurora);
    } else {
      cursorX = targetX;
      cursorY = targetY;
      trailX = targetX;
      trailY = targetY;
      renderAuroraPosition();
      animationFrame = 0;
    }
  };

  const moveAuroraTo = (x, y) => {
    targetX = x;
    targetY = y;
    cursorAurora.classList.add("is-active");

    if (prefersReducedMotion) {
      cursorX = x;
      cursorY = y;
      trailX = x;
      trailY = y;
      renderAuroraPosition();
    } else if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(animateAurora);
    }
  };

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    moveAuroraTo(event.clientX, event.clientY);
  }, { passive: true });

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    moveAuroraTo(event.clientX, event.clientY);
    window.clearTimeout(touchHideTimeout);
    touchHideTimeout = window.setTimeout(() => cursorAurora.classList.remove("is-active"), 850);
  }, { passive: true });

  window.addEventListener("pointerleave", () => cursorAurora.classList.remove("is-active"));
}

const funFactButton = document.querySelector("#fun-fact-button");
const quickFactDisplay = document.querySelector("#quick-fact");

if (funFactButton && quickFactDisplay) {
  const facts = [
    "I earned 300/300 and ranked #1 nationally on the 2026 graduation exam.",
    "My curiosity about computers and technology began in 2020.",
    "At ADA University, I’m building and testing logic gates in SITE 1101.",
    "I freelance as a CapCut creator, making promotional content and custom invitations.",
    "I’ve volunteered at Formula 1 in Baku."
  ];
  let factIndex = 0;

  funFactButton.addEventListener("click", () => {
    factIndex = (factIndex + 1) % facts.length;
    quickFactDisplay.classList.remove("is-changing");
    void quickFactDisplay.offsetWidth;
    quickFactDisplay.textContent = facts[factIndex];
    quickFactDisplay.classList.add("is-changing");
  });
}

const confettiButton = document.querySelector("#confetti-button");

if (confettiButton) {
  const confettiColors = ["var(--accent)", "var(--highlight)", "#aeb8c5", "#d7dee7"];

  confettiButton.addEventListener("click", () => {
    const bounds = confettiButton.getBoundingClientRect();
    const originX = bounds.left + bounds.width / 2;
    const originY = bounds.top + bounds.height / 2;
    const particleCount = prefersReducedMotion ? 18 : 42;
    const particles = [];

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      const isReducedMotion = prefersReducedMotion;
      particle.className = "confetti-piece";
      particle.setAttribute("aria-hidden", "true");
      particle.style.setProperty("--confetti-x", `${isReducedMotion ? Math.random() * window.innerWidth : originX}px`);
      particle.style.setProperty("--confetti-y", `${isReducedMotion ? Math.random() * window.innerHeight : originY}px`);
      particle.style.setProperty("--confetti-size", `${4 + Math.random() * 5}px`);
      particle.style.setProperty("--confetti-color", confettiColors[index % confettiColors.length]);
      particle.style.setProperty("--confetti-dx", `${isReducedMotion ? 0 : (Math.random() - 0.5) * window.innerWidth * 0.9}px`);
      particle.style.setProperty("--confetti-dy", `${isReducedMotion ? 0 : (Math.random() - 0.5) * window.innerHeight * 0.9}px`);
      particle.style.setProperty("--confetti-spin", `${180 + Math.random() * 720}deg`);
      particle.style.setProperty("--confetti-delay", `${Math.random() * 160}ms`);
      document.body.append(particle);
      particles.push(particle);
    }

    window.setTimeout(() => particles.forEach((particle) => particle.remove()), prefersReducedMotion ? 650 : 1800);
  });
}

if (!prefersReducedMotion) {
  runAfterIntro(() => {
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
  });
}

const typingRole = document.querySelector(".typing-role");

if (typingRole && !prefersReducedMotion) {
  const roles = [
    "Computer Engineering Student at ADA University",
    "300/300 National Graduation Exam Top Scorer",
    "Freelance CapCut Content & Invitation Creator",
    "Formula 1 Baku Volunteer"
  ];
  let roleIndex = 0;
  let characterIndex = roles[0].length;
  let isDeleting = true;

  const updateRole = () => {
    const role = roles[roleIndex];

    if (isDeleting) {
      characterIndex -= 1;
      typingRole.textContent = role.slice(0, characterIndex);
      if (characterIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        window.setTimeout(updateRole, 260);
        return;
      }
      window.setTimeout(updateRole, 24);
      return;
    }

    characterIndex += 1;
    typingRole.textContent = roles[roleIndex].slice(0, characterIndex);
    if (characterIndex === roles[roleIndex].length) {
      isDeleting = true;
      window.setTimeout(updateRole, 1450);
      return;
    }
    window.setTimeout(updateRole, 42);
  };

  runAfterIntro(() => window.setTimeout(updateRole, 1800));
}

document.querySelectorAll(".intro-grid, .about-section, .project-card, .quick-actions-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    const bounds = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
    card.classList.add("spotlight-active");
  }, { passive: true });

  card.addEventListener("pointerleave", () => {
    card.classList.remove("spotlight-active");
  });
});

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
