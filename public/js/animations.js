// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = `fadeInUp 0.6s ease forwards`;
      entry.target.style.opacity = '0';
      entry.target.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 100);
    }
  });
}, observerOptions);

// Initialize animations
document.addEventListener('DOMContentLoaded', function() {
  // Observe elements for scroll animations
  const animateElements = document.querySelectorAll('.property-card, .stat-card, .section-title');
  animateElements.forEach(el => {
    observer.observe(el);
  });

  // Hero text animation
  const heroText = document.querySelector('.hero-content');
  if (heroText) {
    setTimeout(() => {
      heroText.style.opacity = '1';
      heroText.style.transform = 'translateY(0)';
    }, 300);
  }

  // Floating animation for featured properties
  const propertyCards = document.querySelectorAll('.property-card');
  propertyCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  if (hero) {
    const rate = scrolled * 0.5;
    hero.style.transform = `translateY(${rate}px)`;
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Loading animations for buttons
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    if (this.classList.contains('btn-loading')) return;
    
    const originalText = this.innerHTML;
    this.innerHTML = '<div class="loading"></div>';
    this.classList.add('btn-loading');
    
    setTimeout(() => {
      this.innerHTML = originalText;
      this.classList.remove('btn-loading');
    }, 2000);
  });
});

// Hover effects for interactive elements
document.querySelectorAll('.property-card, .stat-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Typewriter effect for hero text
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Initialize typewriter if on home page
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    setTimeout(() => {
      typeWriter(heroTitle, text, 80);
    }, 1000);
  }
}