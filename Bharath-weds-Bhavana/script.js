const loaderOverlay = document.getElementById('loaderOverlay');
const pageShell = document.querySelector('.page-shell');
const revealItems = document.querySelectorAll('.reveal');

const resetScrollPosition = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: '0px 0px -10% 0px',
  }
);

const initializeReveal = () => {
  revealItems.forEach((item) => {
    const delay = item.dataset.delay || '0ms';
    item.style.setProperty('--delay', delay);
    observer.observe(item);
  });
};

const preloadImages = () => {
  const selectors = ['img[src]', '.hero-photo-float', '.photo-frame img'];
  const images = Array.from(document.querySelectorAll('img'));
  const imageUrls = images.map((img) => img.src).filter(Boolean);

  const promises = imageUrls.map((url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      if (img.complete) {
        resolve();
      } else {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      }
    })
  );

  return Promise.all(promises);
};

const hideLoader = () => {
  loaderOverlay.classList.add('hidden');
  pageShell.classList.add('loaded');
  pageShell.classList.remove('page-hidden');
};

window.addEventListener('DOMContentLoaded', () => {
  resetScrollPosition();
  preloadImages()
    .catch(() => {})
    .finally(() => {
      hideLoader();
      initializeReveal();
    });
});

window.addEventListener('load', resetScrollPosition);
window.addEventListener('orientationchange', () => {
  setTimeout(resetScrollPosition, 120);
});
