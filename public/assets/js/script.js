/* CloudAlls progressive-enhancement runtime. Keep all critical navigation and forms usable without JavaScript. */
(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
    else callback();
  };

  window.downloadSVG = function downloadSVG(containerId, filename) {
    const container = document.getElementById(containerId);
    const svgNode = container?.querySelector('svg');
    if (!svgNode) return;
    const svgString = new XMLSerializer().serializeToString(svgNode).replace(/^<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));
    link.download = `${filename}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  ready(() => {
    const nav = document.querySelector('.navbar');
    const backToTop = document.getElementById('backToTop');
    const updateScrollState = () => {
      const y = window.scrollY;
      nav?.classList.toggle('scrolled', y > 32);
      backToTop?.classList.toggle('show', y > 480);
    };
    if (nav || backToTop) {
      updateScrollState();
      window.addEventListener('scroll', updateScrollState, { passive: true });
    }

    backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const selector = anchor.getAttribute('href');
        if (!selector || selector === '#' || anchor.hasAttribute('data-bs-toggle')) return;
        const target = document.querySelector(selector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      });
    });

    document.querySelectorAll('#navbarNav a:not(.dropdown-toggle)').forEach((link) => {
      link.addEventListener('click', () => {
        const collapse = document.getElementById('navbarNav');
        if (collapse?.classList.contains('show') && window.bootstrap?.Collapse) {
          window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
        }
      });
    });

    const banner = document.getElementById('cookie-banner');
    if (banner && !localStorage.getItem('cloudalls_cookie_consent')) {
      banner.style.display = 'block';
      requestAnimationFrame(() => banner.classList.add('show-banner'));
      const close = (value) => {
        localStorage.setItem('cloudalls_cookie_consent', value);
        banner.classList.remove('show-banner');
        window.setTimeout(() => { banner.style.display = 'none'; }, 220);
      };
      document.getElementById('btn-accept')?.addEventListener('click', () => close('accepted'));
      document.getElementById('btn-decline')?.addEventListener('click', () => close('declined'));
    }

    const counters = document.querySelectorAll('.counter-value[data-target]');
    const animateCounter = (element) => {
      const target = Number(element.dataset.target);
      if (!Number.isFinite(target)) return;
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (counters.length) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
          if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
        }), { threshold: .2 });
        counters.forEach((counter) => observer.observe(counter));
      } else counters.forEach(animateCounter);
    }
  });

  window.addEventListener('load', () => {
    if (window.AOS && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.AOS.init({ duration: 560, easing: 'ease-out-cubic', once: true, offset: 40 });
    }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, { once: true });
})();
