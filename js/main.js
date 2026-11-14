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
}

const codeCanvas = document.querySelector("#ambient-canvas");
const canvasContext = codeCanvas?.getContext("2d");

if (codeCanvas && canvasContext) {
  const codeFont = getComputedStyle(document.documentElement).getPropertyValue("--mono").trim() || "monospace";
  const phi = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
  ];
  const edges = [];
  let shortestEdge = Infinity;

  for (let first = 0; first < vertices.length; first += 1) {
    for (let second = first + 1; second < vertices.length; second += 1) {
      const distance = Math.hypot(
        vertices[first][0] - vertices[second][0],
        vertices[first][1] - vertices[second][1],
        vertices[first][2] - vertices[second][2]
      );
      shortestEdge = Math.min(shortestEdge, distance);
      edges.push({ first, second, distance });
    }
  }

  const polyhedronEdges = edges.filter((edge) => Math.abs(edge.distance - shortestEdge) < 0.001);
  const codeLabels = ["{ }", "</>", "0", "1"];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let lastFrameTime = performance.now();
  let pointerX = 0;
  let pointerY = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;

  const resizeCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    codeCanvas.width = Math.round(canvasWidth * pixelRatio);
    codeCanvas.height = Math.round(canvasHeight * pixelRatio);
    canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    targetPointerX = 0;
    targetPointerY = 0;
  };

  const drawCanvas = (currentTime) => {
    const delta = Math.min((currentTime - lastFrameTime) / 1000, 0.05);
    lastFrameTime = currentTime;
    const isDark = document.documentElement.dataset.theme === "dark";
    const blue = isDark ? "145, 176, 204" : "82, 114, 146";
    pointerX += (targetPointerX - pointerX) * 0.025;
    pointerY += (targetPointerY - pointerY) * 0.025;

    canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

    const scale = Math.min(canvasWidth, canvasHeight) * 0.12;
    const centerX = canvasWidth * (canvasWidth > 760 ? 0.72 : 0.56) + pointerX * 12;
    const centerY = canvasHeight * 0.52 + pointerY * 10;
    const rotationY = currentTime * 0.00016 + pointerX * 0.22;
    const rotationX = 0.28 + Math.sin(currentTime * 0.00011) * 0.12 + pointerY * 0.16;
    const cosineY = Math.cos(rotationY);
    const sineY = Math.sin(rotationY);
    const cosineX = Math.cos(rotationX);
    const sineX = Math.sin(rotationX);
    const projectedVertices = vertices.map(([x, y, z]) => {
      const rotatedX = x * cosineY - z * sineY;
      const rotatedZ = x * sineY + z * cosineY;
      const tiltedY = y * cosineX - rotatedZ * sineX;
      const tiltedZ = y * sineX + rotatedZ * cosineX;
      const perspective = 4.2 / (4.2 - tiltedZ);

      return {
        x: centerX + rotatedX * scale * perspective,
        y: centerY + tiltedY * scale * perspective,
        depth: tiltedZ
      };
    });

    polyhedronEdges.forEach(({ first, second }) => {
      const start = projectedVertices[first];
      const end = projectedVertices[second];
      const depth = (start.depth + end.depth) / 2;
      const alpha = 0.09 + Math.max(0, depth / 2) * 0.05;

      canvasContext.beginPath();
      canvasContext.moveTo(start.x, start.y);
      canvasContext.lineTo(end.x, end.y);
      canvasContext.strokeStyle = `rgba(${blue}, ${alpha})`;
      canvasContext.lineWidth = 0.8;
      canvasContext.stroke();
    });

    projectedVertices.forEach((point, index) => {
      const radius = point.depth > 0 ? 2 : 1.4;
      canvasContext.beginPath();
      canvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
      canvasContext.fillStyle = `rgba(${blue}, ${point.depth > 0 ? 0.38 : 0.22})`;
      canvasContext.shadowBlur = point.depth > 0 ? 8 : 4;
      canvasContext.shadowColor = `rgba(${blue}, 0.42)`;
      canvasContext.fill();

      if (index % 3 === 0) {
        canvasContext.font = `11px ${codeFont}`;
        canvasContext.fillStyle = `rgba(${blue}, 0.2)`;
        canvasContext.fillText(codeLabels[index / 3], point.x + 8, point.y - 7);
      }
    });
    canvasContext.shadowBlur = 0;

    if (!prefersReducedMotion) window.requestAnimationFrame(drawCanvas);
  };

  const updatePointerTarget = (event) => {
    if (event.pointerType === "touch") return;
    targetPointerX = event.clientX / Math.max(canvasWidth, 1) - 0.5;
    targetPointerY = event.clientY / Math.max(canvasHeight, 1) - 0.5;
  };

  window.addEventListener("pointermove", updatePointerTarget, { passive: true });
  window.addEventListener("pointerleave", () => {
    targetPointerX = 0;
    targetPointerY = 0;
  });
  window.addEventListener("resize", () => {
    resizeCanvas();
    if (prefersReducedMotion) drawCanvas(performance.now());
  }, { passive: true });

  if (prefersReducedMotion) {
    const themeObserver = new MutationObserver(() => drawCanvas(performance.now()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  resizeCanvas();

  if (prefersReducedMotion) {
    drawCanvas(lastFrameTime);
  } else {
    window.requestAnimationFrame(drawCanvas);
  }
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

document.querySelectorAll(".intro-grid, .about-section, .project-card").forEach((card) => {
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
