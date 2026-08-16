(function () {
  var intro = document.getElementById('fwIntro');
  var canvas = document.getElementById('fwCanvas');
  var skipBtn = document.getElementById('fwSkip');
  var sub = document.getElementById('fwSub');
  var words = [
    document.getElementById('fwWord1'),
    document.getElementById('fwWord2'),
    document.getElementById('fwWord3'),
    document.getElementById('fwWord4')
  ];
  if (!intro || !canvas) return;

  // Session-based: only play once per browser session (tab/session, not per-page)
  var alreadySeen = false;
  try {
    alreadySeen = !!sessionStorage.getItem('fwIntroSeen');
  } catch (e) { /* private browsing etc — treat as not seen */ }

  if (alreadySeen) {
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    return;
  }

  try { sessionStorage.setItem('fwIntroSeen', '1'); } catch (e) {}
  document.body.classList.add('fw-lock');

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Logo palette only: dark blue, orange, white
  var COLORS = ['#1E326E', '#12213F', '#E67828', '#B86020', '#ffffff'];

  var particles = [];
  var running = true;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // Particles detonate in place and rush outward, growing the whole way —
  // combined with a streaked trail and a bright glowing core, that reads
  // as objects flying at the viewer rather than flat circles expanding.
  function spawnPop(x, y, big) {
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];
    var count = Math.floor(rand(big ? 110 : 80, big ? 150 : 120));
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
      particles.push({
        ox: x, oy: y,
        angle: angle,
        speed: rand(0.25, big ? 0.9 : 0.75),
        dist: 0,
        prevDist: 0,
        life: 1,
        decay: rand(0.004, 0.007),
        color: color,
        big: big,
        maxSize: rand(big ? 7 : 5, big ? 13 : 9.5)
      });
    }
  }

  // Launches the word from the exact spot its firework detonated (offset +
  // enlarged, invisible), commits that as the "from" state, then on the next
  // frame transitions it to its resting spot — reads as the word coming out
  // of the burst.
  function revealWord(idx, bx, by) {
    var el = words[idx - 1];
    if (el) {
      if (typeof bx === 'number' && typeof by === 'number') {
        var rect = el.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        el.style.setProperty('--fx', (bx - cx) + 'px');
        el.style.setProperty('--fy', (by - cy) + 'px');
      }
      void el.offsetWidth; // force the "from" state to commit before animating
      requestAnimationFrame(function () { el.classList.add('fw-show'); });
    }
    if (idx === words.length) {
      setTimeout(function () {
        if (sub) sub.classList.add('fw-show');
        // hold on the finished name for a beat before going to the site
        setTimeout(endIntro, 1000);
      }, 300);
    }
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    // fading trail effect
    ctx.fillStyle = 'rgba(10,14,26,0.22)';
    ctx.fillRect(0, 0, W, H);

    // particles: streaked trail + glowing core, additive blend for a hot, punchy pop
    ctx.globalCompositeOperation = 'lighter';
    for (var i = particles.length - 1; i >= 0; i--) {
      var pt = particles[i];
      pt.prevDist = pt.dist;
      pt.speed *= 1.012; // accelerates outward, like it's rushing at the viewer (much slower ramp)
      pt.dist += pt.speed;
      pt.life -= pt.decay;

      if (pt.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // size keeps growing across the whole flight, curved so growth
      // accelerates near the end — reads as approaching the camera rather
      // than just expanding at a steady rate
      var growSpan = pt.big ? 260 : 190;
      var growT = Math.min(pt.dist / growSpan, 1);
      var size = pt.maxSize * (Math.pow(growT, 1.6) * 1.15 + 0.05);
      var cosA = Math.cos(pt.angle), sinA = Math.sin(pt.angle);
      var px = pt.ox + cosA * pt.dist;
      var py = pt.oy + sinA * pt.dist;
      var prevPx = pt.ox + cosA * pt.prevDist;
      var prevPy = pt.oy + sinA * pt.prevDist;

      var alpha = Math.max(pt.life, 0);

      // cheap glow: a soft oversized fill instead of ctx.shadowBlur (which is
      // very expensive per-shape and was the main cause of the lag)
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(px, py, size * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = pt.color;
      ctx.lineWidth = Math.max(size * 1.15, 1.5);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prevPx, prevPy);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // hot white center so the burst reads bold instead of just a colored dot
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, size * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(tick);
  }

  function endIntro() {
    if (!running) return;
    running = false;
    intro.classList.add('fw-hide');
    document.body.classList.remove('fw-lock');
    setTimeout(function () {
      if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    }, 650);
  }

  // Reduced motion: skip straight to site
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.body.classList.remove('fw-lock');
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    return;
  }

  // Just four fireworks, one per word — Kevin -> Johnson -> Painting -> Inc,
  // each one detonating exactly where its word will appear, with Inc as the finale.
  var heroTimers = [300, 1900, 3500, 5100];
  heroTimers.forEach(function (delay, i) {
    setTimeout(function () {
      var el = words[i];
      var bx, by;
      if (el) {
        var rect = el.getBoundingClientRect();
        bx = rect.left + rect.width / 2;
        by = rect.top + rect.height / 2;
      } else {
        bx = rand(W * 0.4, W * 0.6);
        by = rand(H * 0.3, H * 0.45);
      }
      spawnPop(bx, by, true);
      // let the burst grow noticeably bigger before the word emerges from it
      setTimeout(function () { revealWord(i + 1, bx, by); }, 650);
    }, delay);
  });

  requestAnimationFrame(tick);

  skipBtn.addEventListener('click', endIntro);

  // Safety fallback in case something stalls the reveal chain —
  // normally the "Inc" pop -> subtitle -> 1s pause chain calls endIntro first.
  setTimeout(endIntro, 9500);
})();
