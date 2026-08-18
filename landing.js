/**
 * Interactive Controller for AI Code Review Buddy Product Landing Page
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Neural Particle Canvas Animation
  initLandingNeuralBackground();

  // 2. Interactive Complexity Sandbox Preview
  initComplexityTeaser();

  // 3. Hero Mockup Sample Switcher
  initMockupSwitcher();
});

/**
 * Neural Network Ambient Background Canvas
 */
function initLandingNeuralBackground() {
  const canvas = document.getElementById('landingNeuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createNodes();
  });

  const nodeCount = Math.min(50, Math.floor((width * height) / 26000));
  let nodes = [];
  let pulses = [];
  let mouse = { x: -1000, y: -1000, active: false };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  function createNodes() {
    nodes = [];
    pulses = [];
    for (let i = 0; i < nodeCount; i++) {
      const isCyan = Math.random() > 0.5;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        isCyan,
        baseAlpha: Math.random() * 0.4 + 0.35
      });
    }
  }

  createNodes();

  // Pulse generator
  setInterval(() => {
    if (nodes.length < 2) return;
    const srcIdx = Math.floor(Math.random() * nodes.length);
    let bestDist = Infinity;
    let targetIdx = -1;
    for (let j = 0; j < nodes.length; j++) {
      if (j === srcIdx) continue;
      const dx = nodes[srcIdx].x - nodes[j].x;
      const dy = nodes[srcIdx].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 150 && d < bestDist) {
        bestDist = d;
        targetIdx = j;
      }
    }
    if (targetIdx !== -1 && pulses.length < 12) {
      pulses.push({
        from: nodes[srcIdx],
        to: nodes[targetIdx],
        progress: 0,
        speed: 0.015 + Math.random() * 0.015,
        isCyan: nodes[srcIdx].isCyan
      });
    }
  }, 750);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & Draw Nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      if (mouse.active) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          n.x -= (dx / dist) * 0.35;
          n.y -= (dy / dist) * 0.35;
        }
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = n.isCyan 
        ? `rgba(56, 189, 248, ${n.baseAlpha})` 
        : `rgba(167, 139, 250, ${n.baseAlpha})`;
      ctx.shadowColor = n.isCyan ? '#38bdf8' : '#a78bfa';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connections
      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dx = n.x - n2.x;
        const dy = n.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          const lineAlpha = (1 - dist / 140) * 0.22;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = n.isCyan 
            ? `rgba(56, 189, 248, ${lineAlpha})` 
            : `rgba(139, 92, 246, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw Pulses
    for (let p = pulses.length - 1; p >= 0; p--) {
      const pulse = pulses[p];
      pulse.progress += pulse.speed;

      if (pulse.progress >= 1) {
        pulses.splice(p, 1);
        continue;
      }

      const px = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
      const py = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = pulse.isCyan ? '#38bdf8' : '#c084fc';
      ctx.shadowColor = pulse.isCyan ? '#38bdf8' : '#c084fc';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Interactive Complexity Sandbox Preview on Landing Page
 */
function initComplexityTeaser() {
  const slider = document.getElementById('teaserSlider');
  const sliderVal = document.getElementById('teaserNVal');
  const speedupVal = document.getElementById('teaserSpeedup');
  const svg = document.getElementById('teaserCurveSvg');
  if (!slider || !svg) return;

  const width = 460;
  const height = 200;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  function formatOps(ops) {
    if (ops >= 1e9) return (ops / 1e9).toFixed(1) + 'B ops';
    if (ops >= 1e6) return (ops / 1e6).toFixed(1) + 'M ops';
    if (ops >= 1e3) return (ops / 1e3).toFixed(1) + 'K ops';
    return Math.round(ops).toLocaleString() + ' ops';
  }

  function update(n) {
    const numN = Number(n);
    if (sliderVal) sliderVal.textContent = numN.toLocaleString();

    const userOps = numN * numN;
    const optOps = numN;
    const speedup = Math.max(1, Math.round(userOps / optOps));

    if (speedupVal) {
      speedupVal.textContent = `🚀 ${speedup.toLocaleString()}x Faster`;
    }

    // Compute normalized coordinates
    const minLog = Math.log10(10);
    const maxLog = Math.log10(10000);
    const curLog = Math.log10(Math.max(10, Math.min(10000, numN)));
    const normX = Math.max(0.02, Math.min(0.98, (curLog - minLog) / (maxLog - minLog)));

    const px = padding.left + normX * chartW;
    const userPy = padding.top + chartH - (Math.pow(normX, 2) * chartH);
    const optPy = padding.top + chartH - (normX * 0.35 * chartH);

    // Move guide line and probe dots
    const line = svg.querySelector('.teaser-crosshair');
    const uProbe = svg.querySelector('.teaser-probe-user');
    const oProbe = svg.querySelector('.teaser-probe-opt');
    const uText = svg.querySelector('.teaser-user-text');
    const oText = svg.querySelector('.teaser-opt-text');

    if (line) {
      line.setAttribute('x1', px);
      line.setAttribute('x2', px);
    }
    if (uProbe) uProbe.setAttribute('transform', `translate(${px}, ${userPy})`);
    if (oProbe) oProbe.setAttribute('transform', `translate(${px}, ${optPy})`);
    if (uText) uText.textContent = formatOps(userOps);
    if (oText) oText.textContent = formatOps(optOps);
  }

  slider.addEventListener('input', (e) => update(e.target.value));
  update(slider.value || 100);
}

/**
 * Hero Mockup Sample Switcher
 */
function initMockupSwitcher() {
  const tabs = document.querySelectorAll('.mockup-tab-pill');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.style.borderColor = 'var(--border-subtle)');
      tab.style.borderColor = 'var(--cyan-400)';
    });
  });
}
