/* =========================================================
   PORTÓN DE ENTRADA: reproduce el audio local, revela la página
   y habilita el scroll con una transición suave.
   ========================================================= */
const audioGate = document.getElementById('audioGate');
const gateButton = document.getElementById('gateButton');
const bgAudio = document.getElementById('bgAudio');

gateButton.addEventListener(
  'click',
  () => {
    bgAudio.play().catch(() => {
      // El navegador bloqueó la reproducción o falta el archivo en assets/audio/musica-de-fondo.mp3
    });

    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
    audioGate.classList.add('is-unlocked');

    audioGate.addEventListener('transitionend', () => audioGate.remove(), { once: true });
  },
  { once: true }
);

/* =========================================================
   ANIMACIONES DE SCROLL (fade-in / slide-up)
   ========================================================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* =========================================================
   TARJETAS INTERACTIVAS DEL REFUGIO DIGITAL
   ========================================================= */
document.querySelectorAll('.flip-card').forEach((card) => {
  card.addEventListener('click', () => {
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-expanded', String(isFlipped));
  });
});

/* =========================================================
   CARRUSELES AUTO-PLAY (cada 3s) CON SCROLL MANUAL
   Cada carrusel avanza solo mientras el usuario no interactúa;
   al tocar/arrastrar se detiene y se reanuda tras una pausa.
   ========================================================= */
const AUTOPLAY_INTERVAL = 3000;
const RESUME_DELAY = 4000;

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track.children);
  if (slides.length < 2) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  let resumeTimer = null;

  const goToSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.scrollTo({
      left: slides[currentIndex].offsetLeft - track.offsetLeft,
      behavior: 'smooth',
    });
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  };

  const pauseAndScheduleResume = () => {
    stopAutoplay();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoplay, RESUME_DELAY);
  };

  // Mantiene currentIndex sincronizado cuando el usuario desliza manualmente
  let scrollSyncTimer = null;
  track.addEventListener('scroll', () => {
    pauseAndScheduleResume();
    if (scrollSyncTimer) clearTimeout(scrollSyncTimer);
    scrollSyncTimer = setTimeout(() => {
      const trackCenter = track.scrollLeft + track.offsetWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft - track.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(trackCenter - slideCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = i;
        }
      });
      currentIndex = closest;
    }, 120);
  });

  ['pointerdown', 'touchstart'].forEach((evt) =>
    track.addEventListener(evt, pauseAndScheduleResume, { passive: true })
  );

  startAutoplay();
});

/* =========================================================
   LINTERNAS DE FONDO (capa de profundidad / parallax)
   Genera linternas pequeñas, borrosas y a distinta velocidad
   para simular lejanía frente a las 4 linternas principales.
   ========================================================= */
const bgLayer = document.getElementById('lanternsBgLayer');

if (bgLayer) {
  const LANTERN_COUNT = 14;

  for (let i = 0; i < LANTERN_COUNT; i += 1) {
    const lantern = document.createElement('span');
    lantern.className = 'lanterns__bg-lantern';

    const size = 8 + Math.random() * 18;        // 8px a 26px: variedad de profundidad
    const blur = size < 16 ? 3 : 1;               // las más pequeñas, más borrosas (más lejanas)
    const duration = 10 + Math.random() * 12;     // 10s a 22s: distintas velocidades
    const delay = Math.random() * 14;
    const leftPos = Math.random() * 100;
    const opacity = 0.25 + Math.random() * 0.35;
    const drift = (Math.random() * 40 - 20).toFixed(0);

    lantern.style.width = `${size}px`;
    lantern.style.height = `${size * 1.3}px`;
    lantern.style.left = `${leftPos}%`;
    lantern.style.filter = `blur(${blur}px)`;
    lantern.style.animationDuration = `${duration}s`;
    lantern.style.animationDelay = `${delay}s`;
    lantern.style.setProperty('--lantern-opacity', opacity);
    lantern.style.setProperty('--lantern-drift', `${drift}px`);

    bgLayer.appendChild(lantern);
  }
}

/* La música de fondo se reproduce ahora mediante el iframe embebido de
   Spotify en #hero (ver index.html), por lo que no requiere JS propio. */
