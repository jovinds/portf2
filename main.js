const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const pageTriggers = document.querySelectorAll("[data-page]");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-links");
const yearEl = document.getElementById("year");
const typedEl = document.getElementById("typed-text");
const cursorGlow = document.querySelector(".cursor-glow");
const canvas = document.getElementById("particles");

const typedPhrases = [
  "Software Engineer at Amdocs — building at scale.",
  "Software development · cloud · enterprise support.",
  "MERN stack, SQL, ServiceNow & SAP experience.",
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Page navigation */
const TRANSITION_MS = 380;
const pageViewport = document.querySelector(".page-viewport");
let currentPageId = "home";
let isTransitioning = false;

function updateNav(pageId) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });
  history.replaceState(null, "", `#${pageId}`);
  navMenu?.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
}

function triggerReveals(pageEl) {
  const reveals = pageEl.querySelectorAll(".reveal");
  reveals.forEach((el) => el.classList.remove("visible"));
  requestAnimationFrame(() => {
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), i * 35);
    });
  });
}

function setViewportHeight(el) {
  if (pageViewport && el) {
    pageViewport.style.minHeight = `${el.offsetHeight}px`;
  }
}

function finalizePageSwitch(outgoing, incoming, pageId) {
  if (outgoing) {
    outgoing.classList.remove("active", "is-leaving");
    outgoing.setAttribute("aria-hidden", "true");
  }
  incoming.classList.remove("is-entering");
  incoming.classList.add("active");
  incoming.setAttribute("aria-hidden", "false");
  currentPageId = pageId;
  isTransitioning = false;
  setViewportHeight(incoming);
  updateNav(pageId);
  triggerReveals(incoming);
}

function showPage(pageId, instant = false) {
  if (pageId === currentPageId && !instant) return;

  const incoming = document.getElementById(pageId);
  const outgoing = document.getElementById(currentPageId);
  if (!incoming) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (instant || reducedMotion || !outgoing) {
    pages.forEach((section) => {
      section.classList.remove("active", "is-leaving", "is-entering");
      const isTarget = section.id === pageId;
      section.classList.toggle("active", isTarget);
      section.setAttribute("aria-hidden", isTarget ? "false" : "true");
    });
    currentPageId = pageId;
    isTransitioning = false;
    setViewportHeight(incoming);
    updateNav(pageId);
    triggerReveals(incoming);
    return;
  }

  if (isTransitioning) return;
  isTransitioning = true;

  setViewportHeight(outgoing);

  outgoing.classList.remove("active");
  outgoing.classList.add("is-leaving");
  outgoing.setAttribute("aria-hidden", "true");

  incoming.classList.add("is-entering");
  incoming.setAttribute("aria-hidden", "false");

  updateNav(pageId);

  setTimeout(() => {
    finalizePageSwitch(outgoing, incoming, pageId);
  }, TRANSITION_MS);
}

pageTriggers.forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const pageId = el.dataset.page;
    if (pageId && document.getElementById(pageId)) showPage(pageId);
  });
});

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

const hash = location.hash.slice(1);
const initial = hash && document.getElementById(hash) ? hash : "home";
showPage(initial, true);

window.addEventListener("resize", () => {
  const active = document.getElementById(currentPageId);
  if (active) setViewportHeight(active);
});

/* Typing effect */
function typeLoop() {
  if (!typedEl) return;

  const current = typedPhrases[phraseIndex];
  const speed = isDeleting ? 35 : 65;

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2200);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typedPhrases.length;
    }
  }

  setTimeout(typeLoop, speed);
}

typeLoop();

/* Cursor glow */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (cursorGlow && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;

  document.body.classList.add("cursor-ready");

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

/* Magnetic buttons */
document.querySelectorAll(".magnetic").forEach((btn) => {
  if (prefersReducedMotion) return;

  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.2}px)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

/* 3D tilt cards */
document.querySelectorAll(".tilt-card").forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* Particle network */
function initParticles() {
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 14000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationId);
    resize();
    createParticles();
    draw();
  });
}

initParticles();

/* Parallax orbs on mouse */
if (!prefersReducedMotion) {
  const orbs = document.querySelectorAll(".orb");
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    orbs.forEach((orb, i) => {
      const strength = (i + 1) * 12;
      orb.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
  });
}
