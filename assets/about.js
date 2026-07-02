// Hackathon IT School - About Page JavaScript

// Configuration - Replace with your Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase
let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
  console.error('Supabase initialization error:', error);
}

// DOM Elements
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initHeroCanvas();
  initTabToggle();
  initMapToggle();
  initCopyCoords();
  initCounters();
});

// Navigation
function initNavigation() {
  if (navBurger) {
    navBurger.addEventListener('click', () => {
      navMobile.classList.toggle('show');
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('show');
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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
}

// Scroll animations
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
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

// Hero canvas animation
function initHeroCanvas() {
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    };
  }

  function initParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.fill();
    });
    
    animationId = requestAnimationFrame(animate);
  }

  resizeCanvas();
  initParticles();
  animate();

  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });
}

// Tab toggle functionality
function initTabToggle() {
  const toggle = document.querySelector('.tab-toggle');
  if (!toggle) return;
  
  const buttons = toggle.querySelectorAll('button');
  const grids = toggle.parentElement.querySelectorAll('.subject-grid');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const track = button.dataset.track;
      
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      grids.forEach(grid => {
        if (grid.dataset.grid === track) {
          grid.classList.add('active');
        } else {
          grid.classList.remove('active');
        }
      });
    });
  });
}

// Map toggle functionality
function initMapToggle() {
  const toggle = document.querySelector('.map-toggle');
  if (!toggle) return;
  
  const buttons = toggle.querySelectorAll('button');
  const panes = document.querySelectorAll('.map-pane');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const map = button.dataset.map;
      
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      panes.forEach(pane => {
        if (pane.dataset.pane === map) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });
}

// Copy coordinates
function initCopyCoords() {
  const copyCoordsBtn = document.getElementById('copyCoords');
  if (!copyCoordsBtn) return;
  
  copyCoordsBtn.addEventListener('click', () => {
    const coords = '40.355617, 71.767729';
    
    navigator.clipboard.writeText(coords).then(() => {
      const originalText = copyCoordsBtn.textContent;
      copyCoordsBtn.textContent = 'Nusxalandi!';
      setTimeout(() => {
        copyCoordsBtn.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  });
}

// Counter animation
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(counter) {
  const target = counter.getAttribute('data-count');
  const isRange = target.includes('+');
  const targetNum = parseInt(target);
  
  let current = 0;
  const increment = targetNum / 50;
  const duration = 2000;
  const stepTime = duration / 50;
  
  const updateCounter = () => {
    current += increment;
    if (current < targetNum) {
      counter.textContent = Math.floor(current) + (isRange ? '+' : '');
      setTimeout(updateCounter, stepTime);
    } else {
      counter.textContent = target;
    }
  };
  
  updateCounter();
}
