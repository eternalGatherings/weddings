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

revealItems.forEach((item) => {
  const delay = item.dataset.delay || '0ms';
  item.style.setProperty('--delay', delay);
  observer.observe(item);
});

document.addEventListener('DOMContentLoaded', resetScrollPosition);
window.addEventListener('load', resetScrollPosition);
window.addEventListener('orientationchange', () => {
  setTimeout(resetScrollPosition, 120);
});
