/* =====================================================================
   CISCO NETACAD & UMSA // CONCIENCIA SOBRE SEGURIDAD - AMBIENT CANVAS
   Cyber Radar Grid & Subtle Violet Defense Particles
   ===================================================================== */

(function() {
  'use strict';

  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 38;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(139, 92, 246, ' : 'rgba(0, 188, 235, ',
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw subtle connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });

  resize();
  initParticles();
  render();
})();
