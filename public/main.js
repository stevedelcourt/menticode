// Toast notification system
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;
  container.appendChild(toast);
  
  // Trigger reflow for animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Alternate hero background image
function initHeroBackground() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const images = ['/fatstack.webp', '/fatstack2.webp'];
  const randomImage = images[Math.floor(Math.random() * images.length)];
  hero.style.backgroundImage = `url('${randomImage}')`;
}

// Nav scroll handler
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

// Mobile menu handler
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  const mobileClose = document.querySelector('.mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
  
  if (!menuToggle || !mobileMenu || !mobileOverlay) return;
  
  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    menuToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  menuToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
  
  mobileOverlay.addEventListener('click', closeMobileMenu);
  
  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileMenu);
  }
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  
  // Escape key closes menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}

// Scroll reveal handler
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length === 0) return;
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => revealObserver.observe(el));
}

// Counter animation handler
function initCounters() {
  const counterElements = document.querySelectorAll('.number-value[data-count]');
  if (counterElements.length === 0) return;
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, prefix, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1 });
  
  counterElements.forEach(el => counterObserver.observe(el));
}

function animateCounter(el, target, prefix = '', suffix = '') {
  const duration = 1500;
  const start = performance.now();
  
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = prefix + target + suffix;
    }
  }
  
  requestAnimationFrame(update);
}

// Form submission handler
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;
  
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button to prevent double submit
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast('Message envoyé ! Nous vous répondrons sous 24h.', 'success');
        contactForm.reset();
      } else {
        showToast(result.error || 'Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer →';
      }
    }
  });
}

// Initialize all handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initHeroBackground();
  initNavScroll();
  initMobileMenu();
  initScrollReveal();
  initCounters();
  initContactForm();
});
