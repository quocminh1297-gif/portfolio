// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) progressBar.style.width = progress + '%';
  if (nav) {
    if (scrollTop > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  if (backToTop) {
    if (scrollTop > 400) backToTop.classList.add('show');
    else backToTop.classList.remove('show');
  }
});

// ===== BACK TO TOP =====
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== ANIMATED COUNTER =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, step);
}

// ===== INTERSECTION OBSERVER (Scroll Reveal + Counters + Bars) =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      el.classList.add('visible');

      // Animate counters
      const counter = el.querySelector('[data-target]');
      if (counter) animateCounter(counter);

      // Animate skill/assessment bars
      el.querySelectorAll('.skill-bar-fill, .assessment-bar-fill, .week-progress-fill').forEach(bar => {
        // width is set via CSS var, just trigger transition
      });

      observer.unobserve(el);
    }
  });
}, observerOptions);

// Observe everything that needs reveal or animation
document.querySelectorAll(
  '.project-section, .skill-card, .challenge-big, .future-card, ' +
  '.week-card, .growth-item, .assessment-metric-item, .sum-section'
).forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Stat counters (hero section)
document.querySelectorAll('.stat-item').forEach(el => {
  observer.observe(el);
});

// ===== TAB SYSTEM =====
document.querySelectorAll('.tab-nav').forEach(nav => {
  nav.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.tab-container');
      if (!container) return;

      // Deactivate all tabs and panels in this container
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      // Activate clicked
      btn.classList.add('active');
      const panel = container.querySelector(`#${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
});

// ===== RADAR CHART (SVG) =====
function drawRadar(svgId, data) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  const cx = 110, cy = 110, r = 85;
  const n = data.length;
  const angle = (2 * Math.PI) / n;

  // Clear
  svg.innerHTML = '';

  // Rings
  for (let ring = 1; ring <= 5; ring++) {
    const rr = (r / 5) * ring;
    const pts = Array.from({ length: n }, (_, i) => {
      const a = angle * i - Math.PI / 2;
      return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
    }).join(' ');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', pts);
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', 'rgba(255,255,255,0.06)');
    poly.setAttribute('stroke-width', '1');
    svg.appendChild(poly);
  }

  // Axes
  data.forEach((_, i) => {
    const a = angle * i - Math.PI / 2;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + r * Math.cos(a));
    line.setAttribute('y2', cy + r * Math.sin(a));
    line.setAttribute('stroke', 'rgba(255,255,255,0.06)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  });

  // Data polygon
  const pts = data.map((d, i) => {
    const a = angle * i - Math.PI / 2;
    const rr = (r * d.value) / 5;
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(' ');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill', 'rgba(0,212,180,0.2)');
  poly.setAttribute('stroke', '#00d4b4');
  poly.setAttribute('stroke-width', '2');
  svg.appendChild(poly);

  // Data points + labels
  data.forEach((d, i) => {
    const a = angle * i - Math.PI / 2;
    const rr = (r * d.value) / 5;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx + rr * Math.cos(a));
    dot.setAttribute('cy', cy + rr * Math.sin(a));
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', '#00d4b4');
    svg.appendChild(dot);

    // Label
    const la = angle * i - Math.PI / 2;
    const lr = r + 18;
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx + lr * Math.cos(la));
    text.setAttribute('y', cy + lr * Math.sin(la) + 4);
    text.setAttribute('fill', 'rgba(122,132,153,0.9)');
    text.setAttribute('font-size', '8');
    text.setAttribute('font-family', 'Space Mono, monospace');
    text.setAttribute('text-anchor', 'middle');
    text.textContent = d.label;
    svg.appendChild(text);
  });
}

drawRadar('radar-svg', [
  { label: 'Tổ chức', value: 4.5 },
  { label: 'Tìm kiếm', value: 4.2 },
  { label: 'Prompt', value: 4.8 },
  { label: 'Hợp tác', value: 4.0 },
  { label: 'Sáng tạo', value: 4.3 },
  { label: 'Đạo đức', value: 4.6 },
]);

console.log('✓ Portfolio v2.0 loaded');
