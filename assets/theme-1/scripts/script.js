const loaderOverlay = document.getElementById('loaderOverlay');
const pageShell = document.querySelector('.page-shell');
const revealItems = document.querySelectorAll('.reveal');
const galleryTrack = document.querySelector('.gallery-track');
const galleryDots = document.querySelectorAll('.dot');

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

const LOADER_MIN_DURATION = 3000;

const showLoader = () => {
  loaderOverlay.classList.remove('hidden');
  pageShell.classList.add('page-hidden');
  pageShell.classList.remove('loaded');
};

const hideLoader = () => {
  if (loaderOverlay.classList.contains('hidden')) {
    return;
  }

  loaderOverlay.classList.add('hidden');
  pageShell.classList.add('loaded');
  pageShell.classList.remove('page-hidden');
};

const waitForPageReady = () => {
  const imageLoadPromise = preloadImages().catch(() => {});
  const minimumDisplayPromise = new Promise((resolve) => {
    window.setTimeout(resolve, LOADER_MIN_DURATION);
  });
  const pageLoadPromise = new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });

  return Promise.all([imageLoadPromise, minimumDisplayPromise, pageLoadPromise]);
};

const initializeGallery = () => {
  if (!galleryTrack || !galleryDots.length) {
    return;
  }

  const slides = Array.from(galleryTrack.querySelectorAll('.gallery-slide'));
  let activeIndex = 0;

  const updateGallery = (index) => {
    activeIndex = index;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    galleryDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  updateGallery(0);

  galleryDots.forEach((dot, index) => {
    dot.addEventListener('click', () => updateGallery(index));
  });

  let touchStartX = 0;
  let touchEndX = 0;

  galleryTrack.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  galleryTrack.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;

    if (delta > 50) {
      updateGallery(Math.max(0, activeIndex - 1));
    } else if (delta < -50) {
      updateGallery(Math.min(slides.length - 1, activeIndex + 1));
    }
  }, { passive: true });

  let mouseStartX = 0;
  let mouseEndX = 0;

  galleryTrack.addEventListener('mousedown', (event) => {
    mouseStartX = event.clientX;
  });

  galleryTrack.addEventListener('mouseup', (event) => {
    mouseEndX = event.clientX;
    const delta = mouseEndX - mouseStartX;

    if (delta > 50) {
      updateGallery(Math.max(0, activeIndex - 1));
    } else if (delta < -50) {
      updateGallery(Math.min(slides.length - 1, activeIndex + 1));
    }
  });

  setInterval(() => {
    const nextIndex = (activeIndex + 1) % slides.length;
    updateGallery(nextIndex);
  }, 4000);
};

window.addEventListener('DOMContentLoaded', () => {
  showLoader();
  resetScrollPosition();
  waitForPageReady()
    .finally(() => {
      hideLoader();
      initializeReveal();
      initializeGallery();
    });
});

window.addEventListener('load', resetScrollPosition);
window.addEventListener('orientationchange', () => {
  setTimeout(resetScrollPosition, 120);
});
