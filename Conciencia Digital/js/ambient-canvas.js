/* =====================================================================
   CISCO NETACAD & UMSA // CONCIENCIA DIGITAL - AMBIENT CANVAS FX
   Cinematic Cyber-Constellation Background
   Color Theme: Cisco Cyber Cyan (#00BCEB) & Gold/Orange (#FF9E1B)
   ===================================================================== */

(function() {
  'use strict';

  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let animationId = null;
  let mouse = { x: null, y: null, radius: 120 };

  const PARTICLE_COUNT = 32;
  const particles = [];
  let orbitalAngle = 0;
  let shootingStar = null;
  let nextStarTime = Date.now() + randomRange(6000, 14000);

  function randomRange(min, max) { return min + Math.random() * (max - min); }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor(index) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.baseSize = Math.random() * 2 + 1;
      this.size = this.baseSize;
      // 65% Cisco Cyan [0, 188, 235], 35% Cisco Gold [255, 158, 27]
      this.isCyan = index % 3 !== 0;
      this.baseColor = this.isCyan ? [0, 188, 235] : [255, 158, 27];
      this.alpha = 0.55;
      this.isProximate = false;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      this.isProximate = false;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          this.isProximate = true;
          this.alpha = 0.9;
          this.size = this.baseSize * 1.5;
        } else {
          this.alpha = 0.55;
          this.size = this.baseSize;
        }

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.1;
          this.y += (dy / dist) * force * 1.1;
        }
      } else {
        this.alpha = 0.55;
        this.size = this.baseSize;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      const [r, g, b] = this.baseColor;
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
      ctx.fill();

      if (this.isProximate) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(i));
  }

  function drawLines() {
    const maxDist = 95;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          let alpha = (1 - dist / maxDist) * 0.2;
          if (particles[i].isProximate || particles[j].isProximate) {
            alpha *= 2.5;
          }
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const [r, g, b] = particles[i].baseColor;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }
  }

  function drawOrbitalRing() {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.18;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(orbitalAngle);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 188, 235, 0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 14]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-orbitalAngle * 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 158, 27, 0.04)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 18]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    orbitalAngle += 0.0025;
  }

  function updateShootingStar() {
    const now = Date.now();
    if (!shootingStar && now >= nextStarTime) {
      const sx = randomRange(width * 0.3, width * 0.9);
      const sy = -10;
      const angle = randomRange(Math.PI * 0.2, Math.PI * 0.4);
      const speed = randomRange(450, 750);
      const len = randomRange(45, 90);

      shootingStar = {
        x: sx, y: sy,
        vx: Math.cos(angle) * speed / 60,
        vy: Math.sin(angle) * speed / 60,
        length: len,
        life: 1.0
      };
    }

    if (shootingStar) {
      const s = shootingStar;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.009;

      const norm = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const tailX = s.x - (s.vx / norm) * s.length;
      const tailY = s.y - (s.vy / norm) * s.length;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(0, 188, 235, 0)');
      grad.addColorStop(0.7, `rgba(0, 188, 235, ${0.45 * s.life})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${0.85 * s.life})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * s.life})`;
      ctx.fill();

      if (s.x < -100 || s.x > width + 100 || s.y < -100 || s.y > height + 100 || s.life <= 0) {
        shootingStar = null;
        nextStarTime = Date.now() + randomRange(7000, 16000);
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    drawOrbitalRing();
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    drawLines();
    updateShootingStar();
    animationId = requestAnimationFrame(render);
  }

  render();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      render();
    }
  });
})();
