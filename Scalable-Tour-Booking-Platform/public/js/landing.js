// Advanced Landing Page JavaScript
class LandingPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupParallax();
    this.setupScrollAnimations();
    this.setupTestimonialCarousel();
    this.setupCounterAnimation();
    this.setupSmoothScrolling();
    this.setupNewsletterForm();
    this.setupTourCardAnimations();
  }

  // Parallax scrolling effect for hero section
  setupParallax() {
    const heroLayers = document.querySelectorAll('.hero__bg-layer');
    
    if (heroLayers.length === 0) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      heroLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.1;
        layer.style.transform = `translateY(${rate * speed}px)`;
      });
    });
  }

  // Intersection Observer for scroll animations
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          
          // Special handling for tour cards with staggered animation
          if (entry.target.classList.contains('tour-card')) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => {
              entry.target.style.animationDelay = `${delay}ms`;
              entry.target.classList.add('animated');
            }, delay);
          }
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
      .feature-card,
      .stat-item,
      .tour-card,
      .testimonial,
      .cta__title,
      .cta__subtitle,
      .cta__buttons
    `);

    animatedElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  // Testimonial carousel functionality
  setupTestimonialCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.testimonials__btn--prev');
    const nextBtn = document.querySelector('.testimonials__btn--next');
    
    if (slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    };

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      showSlide(currentSlide);
    };

    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // Auto-advance carousel
    setInterval(nextSlide, 5000);

    // Touch/swipe support
    let startX = 0;
    let endX = 0;

    const carousel = document.querySelector('.testimonials__carousel');
    if (carousel) {
      carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });

      carousel.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      });
    }
  }

  // Animated counter for statistics
  setupCounterAnimation() {
    const counters = document.querySelectorAll('.stat-item__number');
    
    if (counters.length === 0) return;

    const animateCounter = (counter) => {
      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };

      updateCounter();
    };

    // Intersection Observer for counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  // Smooth scrolling for anchor links
  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Newsletter form handling
  setupNewsletterForm() {
    const form = document.querySelector('.newsletter__form');
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('.newsletter__input').value;
      const button = form.querySelector('.newsletter__btn');
      const originalText = button.textContent;
      
      // Show loading state
      button.textContent = 'Subscribing...';
      button.disabled = true;
      
      try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success message
        button.textContent = 'Subscribed!';
        button.style.background = '#28b485';
        
        // Reset form
        form.reset();
        
        // Reset button after delay
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          button.style.background = '';
        }, 3000);
        
      } catch (error) {
        button.textContent = 'Error - Try Again';
        button.style.background = '#ff6b6b';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.disabled = false;
          button.style.background = '';
        }, 3000);
      }
    });
  }

  // Enhanced tour card animations
  setupTourCardAnimations() {
    const tourCards = document.querySelectorAll('.tour-card');
    
    tourCards.forEach(card => {
      // Hover effect for image zoom
      const image = card.querySelector('.tour-card__image img');
      if (image) {
        card.addEventListener('mouseenter', () => {
          image.style.transform = 'scale(1.1)';
        });
        
        card.addEventListener('mouseleave', () => {
          image.style.transform = 'scale(1)';
        });
      }

      // Staggered animation on scroll
      const delay = card.dataset.delay || 0;
      card.style.animationDelay = `${delay}ms`;
    });
  }

  // Utility method for debouncing
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Performance optimization for scroll events
  optimizeScrollEvents() {
    const debouncedParallax = this.debounce(() => {
      this.setupParallax();
    }, 10);

    window.addEventListener('scroll', debouncedParallax);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new LandingPage();
});

// Additional utility functions
const utils = {
  // Check if element is in viewport
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Generate random delay for staggered animations
  randomDelay(min = 0, max = 500) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Add loading animation to buttons
  addLoadingState(button, text = 'Loading...') {
    const originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
    
    return () => {
      button.textContent = originalText;
      button.disabled = false;
    };
  }
};

// Export for potential use in other scripts
window.LandingPage = LandingPage;
window.LandingUtils = utils;
