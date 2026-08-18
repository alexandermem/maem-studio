
(() => {
  const carousel = document.querySelector('[data-portfolio-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-portfolio-track]');
  const slides = [...carousel.querySelectorAll('[data-portfolio-slide]')];
  const prev = document.querySelector('[data-portfolio-prev]');
  const next = document.querySelector('[data-portfolio-next]');
  const current = document.querySelector('[data-portfolio-current]');
  const total = document.querySelector('[data-portfolio-total]');
  const dots = [...document.querySelectorAll('[data-portfolio-dot]')];

  let index = 0;
  let pointerStart = null;

  const pad = value => String(value).padStart(2, '0');

  function render({ focus = false } = {}) {
    track.style.transform = `translate3d(-${index * 100}%,0,0)`;

    if (current) current.textContent = pad(index + 1);
    if (total) total.textContent = pad(slides.length);

    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });

    if (focus) carousel.focus({ preventScroll: true });
  }

  function go(nextIndex, options) {
    index = (nextIndex + slides.length) % slides.length;
    render(options);
  }

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => go(i));
  });

  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    }
  });

  carousel.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointerStart = event.clientX;
  });

  carousel.addEventListener('pointerup', event => {
    if (pointerStart === null) return;
    const delta = event.clientX - pointerStart;
    pointerStart = null;

    if (Math.abs(delta) < 48) return;
    if (delta < 0) go(index + 1);
    else go(index - 1);
  });

  carousel.addEventListener('pointercancel', () => {
    pointerStart = null;
  });

  render();
})();
