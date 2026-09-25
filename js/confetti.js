/* Guitar-pick confetti drawn on a single full-screen canvas.
   Skipped entirely for users who prefer reduced motion. */
const Confetti = (() => {
  const COLORS = ["#f26b1d", "#f26b1d", "#e8b33c", "#eceef1"];
  const PICK = new Path2D(
    "M12 1C5.5 1 1 3.8 1 8.3 1 14.4 7.6 21.6 12 23c4.4-1.4 11-8.6 11-14.7C23 3.8 18.5 1 12 1z",
  );
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let canvas, ctx, particles = [], running = false;

  function setup() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("popover", "manual");
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(x, y, count, spread, power) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const speed = power * (0.5 + Math.random() * 0.7);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        size: 8 + Math.random() * 8,
        flip: Math.random() * Math.PI,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        gravity: 0.28,
        maxLife: 360,
        fade: false,
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles = particles.filter((p) => p.y < window.innerHeight + 40 && p.life < p.maxLife);

    particles.forEach((p) => {
      p.life += 1;
      p.vy += p.gravity;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.flip += p.spin ?? 0.12;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      // Squash on one axis so picks look like they are tumbling
      ctx.scale((p.size / 24) * Math.cos(p.flip), p.size / 24);
      ctx.translate(-12, -12);
      ctx.fillStyle = p.color;
      // Fading pieces stay solid for the first half of their life
      ctx.globalAlpha = p.fade ? Math.min(1, 2 * (1 - p.life / p.maxLife)) : 1;
      ctx.fill(PICK);
      ctx.restore();
    });

    if (particles.length) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      if (canvas.matches(":popover-open")) canvas.hidePopover();
      canvas.remove();
    }
  }

  function start() {
    if (!canvas.isConnected) document.body.appendChild(canvas);
    // Re-open as a popover so the canvas sits in the top layer, above any
    // modal dialog that was opened after it
    if (canvas.showPopover) {
      if (canvas.matches(":popover-open")) canvas.hidePopover();
      canvas.showPopover();
    }
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  // Small burst from a point, e.g. the button that was pressed
  function burst(x, y, count = 28) {
    if (reducedMotion) return;
    setup();
    spawn(x, y, count, Math.PI * 1.1, 10);
    start();
  }

  // Small ring of picks that bursts outward from every edge of an element,
  // then fades. Used as feedback on button presses. With reduced motion the
  // picks barely drift and do not spin, so the feedback is still visible.
  function popAround(el, count = 26) {
    const calm = reducedMotion;
    setup();
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = calm ? 0.3 + Math.random() * 0.3 : 2 + Math.random() * 2.5;
      particles.push({
        // Start on the button's outline rather than its centre
        x: cx + Math.cos(angle) * (r.width / 2),
        y: cy + Math.sin(angle) * (r.height / 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vr: calm ? 0 : (Math.random() - 0.5) * 0.3,
        size: 8 + Math.random() * 6,
        flip: Math.random() * Math.PI,
        spin: calm ? 0 : 0.12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        gravity: calm ? 0 : 0.06,
        maxLife: 70 + Math.random() * 25,
        fade: true,
      });
    }
    start();
  }

  // Burst from an element's centre
  function burstFrom(el, count) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, count);
  }

  // Big celebration: waves from two cannons in the bottom corners
  function celebrate() {
    if (reducedMotion) return;
    setup();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const count = 40;
    const waves = 2;
    for (let wave = 0; wave < waves; wave++) {
      setTimeout(() => {
        // Left cannon fires up and to the right, right cannon mirrors it
        spawn(0, h, count, 0.9, 22);
        particles.slice(-count).forEach((p) => (p.vx = Math.abs(p.vx) + 6));
        spawn(w, h, count, 0.9, 22);
        particles.slice(-count).forEach((p) => (p.vx = -Math.abs(p.vx) - 6));
        start();
      }, wave * 450);
    }
  }

  return { burst, burstFrom, popAround, celebrate };
})();
