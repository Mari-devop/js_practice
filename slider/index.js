(() => {
  const slider  = document.getElementById('slider');
  const track   = document.getElementById('track');
  const btnprev = document.getElementById('prev');
  const btnnext = document.getElementById('next');

  if (!slider || !track || !btnprev || !btnnext) return;
  if (track.dataset.inited === '1') return;
  track.dataset.inited = '1';

  const ANIMATION_TIME = 300;
  const AUTOPLAY_MS    = 3500;

  let autoplayTimer = null;
  let isAnimating = false;

  const firstClone = track.firstElementChild.cloneNode(true);
  const lastClone  = track.lastElementChild.cloneNode(true);
  firstClone.dataset.clone = '1';
  lastClone.dataset.clone = '1';
  track.appendChild(firstClone);
  track.prepend(lastClone);

  const slides = track.children;
  const realCount = slides.length - 2;   
  let index = 1;                         

  const frameWidth = () => slider.clientWidth;
  const offsetOf = (i) => i * frameWidth();

  function setSmooth(on) {
    slider.style.scrollBehavior = on ? 'smooth' : 'auto';
  }

  function jumpTo(realIndex) {
    setSmooth(false);
    index = realIndex;
    slider.scrollLeft = offsetOf(index);
    requestAnimationFrame(() => setSmooth(true));
    updateDots();
  }

  let dotsContainer = null;
  let dots = [];

  function realIndex0toN() {
    if (index === 0) return realCount - 1;
    if (index === realCount + 1) return 0;
    return index - 1;
  }

  function updateDots() {
    if (!dots.length) return;
    const active = realIndex0toN();
    dots.forEach((d, i) => {
      const isActive = i === active;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  }

  function createDots() {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots';
    dotsContainer.setAttribute('role', 'tablist');
  
    for (let i = 0; i < realCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      // из-за клонов реальный индекс сдвинут на +1
      dot.addEventListener('click', () => goTo(i + 1));
      dotsContainer.appendChild(dot);
    }
  
    // ← ВАЖНО: ставим точки СРАЗУ ПОСЛЕ .slider, чтобы они не прокручивались
    slider.insertAdjacentElement('afterend', dotsContainer);
  
    // пауза автоплея при наведении/фокусе на точках
    dotsContainer.addEventListener('mouseenter', stopAutoplay);
    dotsContainer.addEventListener('mouseleave', startAutoplay);
    dotsContainer.addEventListener('focusin', stopAutoplay);
    dotsContainer.addEventListener('focusout', startAutoplay);
  
    dots = Array.from(dotsContainer.children);
    updateDots();
  }
  

  function goTo(target) {
    if (isAnimating) return;
    isAnimating = true;

    const maxIdx = slides.length - 1;
    index = Math.max(0, Math.min(target, maxIdx));

    const prevSnap = slider.style.scrollSnapType;
    slider.style.scrollSnapType = 'none';
    slider.scrollTo({ left: offsetOf(index), behavior: 'smooth' });

    setTimeout(() => {
      if (index === 0) {
        jumpTo(realCount);
      } else if (index === realCount + 1) {
        jumpTo(1);
      } else {
        updateDots();
      }
      slider.style.scrollSnapType = prevSnap || '';
      isAnimating = false;
    }, ANIMATION_TIME);
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  setSmooth(false);
  slider.scrollLeft = offsetOf(index);
  requestAnimationFrame(() => setSmooth(true));

  btnnext.addEventListener('click', next);
  btnprev.addEventListener('click', prev);

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (!isAnimating) next();
    }, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  createDots();

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });
  startAutoplay();

  window.addEventListener('resize', () => {
    setSmooth(false);
    slider.scrollLeft = offsetOf(index);
    requestAnimationFrame(() => setSmooth(true));
  });

  let scrollTimer = null;
  slider.addEventListener('scroll', () => {
    if (isAnimating) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const approx = Math.round(slider.scrollLeft / frameWidth());
      if (approx !== index) {
        index = approx;
        if (index === 0)      jumpTo(realCount);
        else if (index === realCount + 1) jumpTo(1);
        else updateDots();
      } else {
        updateDots();
      }
    }, 80);
  });
})();
