const slider = document.getElementById('slider');
const track  = document.getElementById('track');
const btnprev = document.getElementById('prev');
const btnnext = document.getElementById('next');

const ANIMATION_TIME = 300;
const AUTOPLAY_MS    = 3500;

let autoplayTimer = null;
let isAnimating = false;

if (track.dataset.inited === '1') {
} else {
  track.dataset.inited = '1';

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
}
