

'use strict';

 // Cursor personalizado: anillo + punto
(function initCursor() {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');

  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let dotX   = 0, dotY   = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // El punto sigue directamente
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // El anillo sigue con suavidad
  function animateCursor() {
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;
    cursor.style.left = dotX + 'px';
    cursor.style.top  = dotY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

 // navbar
(function initNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Estado inicial
})();


 // menu tipo hamburguesa para móvil
(function initBurger() {
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileClose');

  if (!burgerBtn || !mobileMenu) return;

  let isOpen = false;

  function open() {
    isOpen = true;
    burgerBtn.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    burgerBtn.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burgerBtn.addEventListener('click', () => isOpen ? close() : open());
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Links dentro del menú cierran automáticamente
  mobileMenu.querySelectorAll('[data-close]').forEach(link => {
    link.addEventListener('click', close);
  });

  // Tecla ESC cierra el menú
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });
})();


(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Desobservamos una vez que ya apareció
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  elements.forEach((el) => observer.observe(el));
})();


 // Contador animado
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200; // ms
        const stepTime = 20;   // ms por frame
        const steps    = duration / stepTime;
        const increment = Math.ceil(target / steps);
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target.toLocaleString('es-MX') + suffix;
            clearInterval(timer);
          } else {
            el.textContent = current.toLocaleString('es-MX') + suffix;
          }
        }, stepTime);

        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => counterObserver.observe(c));
})();


 // Carrousel
(function initCarousel() {
  const track       = document.getElementById('carouselTrack');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const dotsWrapper = document.getElementById('carouselDots');

  if (!track) return;

  const slides = track.querySelectorAll('.carousel__slide');
  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_DELAY = 4500;

  /* Cantidad de slides visibles según ancho */
  function visibleCount() {
    const w = window.innerWidth;
    if (w < 700)  return 1;
    if (w < 1024) return 2;
    return 3;
  }

  /* Ancho de cada slide */
  function slideWidth() {
    return slides[0].offsetWidth + 24; 
  }

  function maxIndex() {
    return Math.max(0, slides.length - visibleCount());
  }

  function goTo(idx) {
    currentIndex = Math.max(0, Math.min(idx, maxIndex()));
    track.style.transform = `translateX(-${currentIndex * slideWidth()}px)`;
    updateDots();
  }

  function buildDots() {
    dotsWrapper.innerHTML = '';
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === currentIndex ? ' is-active' : '');
      dot.setAttribute('aria-label', `Ir a la opinión ${i + 1}`);
      dot.addEventListener('click', () => {
        goTo(i);
        resetAutoPlay();
      });
      dotsWrapper.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrapper.querySelectorAll('.carousel__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }

  /* Autoplay */
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      const next = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
      goTo(next);
    }, AUTOPLAY_DELAY);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  /* Botones anterior / siguiente */
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goTo(currentIndex - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goTo(currentIndex + 1);
      resetAutoPlay();
    });
  }

  /* Pausa al pasar el cursor */
  track.parentElement.addEventListener('mouseenter', stopAutoPlay);
  track.parentElement.addEventListener('mouseleave', startAutoPlay);

  /* Swipe táctil */
  let touchStartX = 0;
  let touchStartY = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diffX = touchStartX - e.changedTouches[0].clientX;
    const diffY = Math.abs(touchStartY - e.changedTouches[0].clientY);

    if (Math.abs(diffX) > 50 && diffY < 40) {
      goTo(diffX > 0 ? currentIndex + 1 : currentIndex - 1);
      resetAutoPlay();
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildDots();
      goTo(0);
    }, 200);
  });

  buildDots();
  startAutoPlay();
})();


 // Botones
(function initCart() {
  const toast     = document.getElementById('toast');
  const cartBtns  = document.querySelectorAll('.card__btn');
  let toastTimer  = null;

  if (!toast || !cartBtns.length) return;

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  cartBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const productName = this.dataset.product || 'Producto';
      const originalText = this.textContent;

      // Feedback visual
      this.textContent  = '✓ Añadido';
      this.style.background = '#4caf50';
      this.disabled = true;

      setTimeout(() => {
        this.textContent = originalText;
        this.style.background = '';
        this.disabled = false;
      }, 2000);

      showToast(`🛒 «${productName}» añadido al carrito`);
    });
  });
})();


 // Botón scroll top
(function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
