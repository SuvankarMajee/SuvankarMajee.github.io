/* ==========================================================================
   Stochastic differential equations: stochastic SIS sample paths
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/08-stochastic-sis"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/08-stochastic-sis"]');
  if (host) host.innerHTML = `
<div class="sde">
  <p>The animation shows a stochastic SIS model in which the transmission rate fluctuates,</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="sde-eq">d<i>I</i> = [&beta;<i>I</i>(1 &minus; <i>I</i>) &minus; &gamma;<i>I</i>]&nbsp;d<i>t</i> + <i>s</i>&thinsp;<i>I</i>(1 &minus; <i>I</i>)&nbsp;d<i>W</i>(<i>t</i>),</p>
  <p>with &beta; = 0.3, &gamma; = 0.1, noise intensity <i>s</i> = 0.15 and <i>I</i>(0) = 0.05, solved by the Euler&ndash;Maruyama scheme. Each thin line is one possible course of the epidemic; the dark line is the deterministic model (<i>s</i> = 0). The histogram shows the fraction infected across 200 simulated paths at the current time. As time goes on it settles into a stable spread around the deterministic endemic level 1 &minus; &gamma;/&beta; &asymp; 0.67, an approximation of the model&rsquo;s stationary distribution.</p>
  <!-- ↓ Drawing area for the stochastic SIS animation. height = its height in pixels. -->
  <div class="sde-box"><canvas id="sdeCv" height="300" role="img" aria-label="Sample paths of a stochastic SIS model spreading around the deterministic curve, beside a histogram of the infected fraction that settles into a stationary distribution"></canvas></div>
</div>
`;
})();

/* Stochastic SIS in the "Stochastic differential equations" panel.
   dI = [b I (1 - I) - g I] dt + s I (1 - I) dW,  b = 0.3, g = 0.1, s = 0.15, I(0) = 0.05; Euler-Maruyama, dt = 0.05, t up to 150.
   200 paths are simulated (40 are drawn); the histogram uses all 200. Runs only while the panel is open. */
// Runs once when the script loads.
(function () {
  // cv = the drawing area <canvas id="sdeCv">; stop if it is missing.
  var cv = document.getElementById('sdeCv'); if (!cv) return;
  // β = 0.3, γ = 0.1, noise s = 0.15, I(0) = 0.05, T = 150, dt = 0.05, n = 3000 steps; NP = 200 paths, SHOW = 40 drawn, NB = 25 histogram bins.
  var B = 0.3, GM = 0.1, S = 0.15, I0 = 0.05, T = 150, dt = 0.05, n = Math.round(T / dt), NP = 200, SHOW = 40, NB = 25;
  // Colours.
  var NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE';
  // paths = simulated sample paths; det = deterministic solution; k = step drawn up to; hold = end pause; running; g = pen; W, H = size.
  var paths, det, k = 0, hold = 0, running = false, g, W, H;
  // gauss(): a standard normal random number (Box–Muller method).
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // simulate(): compute all 200 sample paths and the deterministic curve.
  function simulate() {
    // Empty list; sq = √dt (the size of a Brownian increment).
    paths = []; var j, p, sq = Math.sqrt(dt);
    // For each path p: start at I(0); a = its values at every step.
    for (p = 0; p < NP; p++) { var I = I0, a = new Float32Array(n + 1); a[0] = I;
      // Euler–Maruyama: I += [βI(1 − I) − γI] dt + s I(1 − I) √dt · N(0,1); keep I between 0 and 1; store it.
      for (j = 0; j < n; j++) { I = I + (B * I * (1 - I) - GM * I) * dt + S * I * (1 - I) * sq * gauss(); I = Math.max(0, Math.min(1, I)); a[j + 1] = I; }
      paths.push(a); }
    // Deterministic model (no noise), same starting value.
    det = new Float32Array(n + 1); var d = I0; det[0] = d;
    // Plain Euler steps of I' = βI(1 − I) − γI.
    for (j = 0; j < n; j++) { d += (B * d * (1 - d) - GM * d) * dt; det[j + 1] = d; }
  }
  // size(): match the canvas to its size on screen (470 px tall on phones). Returns false if hidden.
  function size() {
    // Pixel density; width on screen; stop if 0.
    var dpr = window.devicePixelRatio || 1; W = cv.clientWidth; if (!W) return false;
    // Height: 470 on phones, otherwise the height written in the block at the top of this file.
    H = W < 560 ? 470 : +cv.getAttribute('height');
    // Enlarge the canvas internally, keep its displayed height, get the pen, scale. Success.
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px'; g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return true;
  }
  // draw(): sample paths + deterministic curve, and the histogram of I at the current time.
  function draw() {
    // Paths area x0–x1, y0–y1 (full width on phones, 68% of the width otherwise).
    var phone = W < 560, x0 = 40, x1 = phone ? W - 14 : W * 0.68, y0 = 24, y1 = phone ? 250 : H - 30;
    // X(j): step number -> horizontal position; Y(v): I value (0–1) -> vertical position.
    var X = function (j) { return x0 + (x1 - x0) * j / n; }, Y = function (v) { return y1 - (y1 - y0) * v; };
    // Clear the canvas.
    g.clearRect(0, 0, W, H);
    // Axes.
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    // Axis numbers 1 and 0.
    g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText('1', x0 - 12, y0 + 4); g.fillText('0', x0 - 12, y1 + 4);
    // Axis labels.
    g.fillText('t', x1 - 6, y1 + 14); g.fillText('infected fraction, I(t)', x0 + 6, y0 - 8);
    // The first 40 sample paths as faint teal lines...
    for (var q = 0; q < SHOW; q++) { var a = paths[q]; g.strokeStyle = 'rgba(14,124,123,.25)'; g.beginPath();
      // ...through every 4th point up to step k.
      for (var j = 0; j <= k; j += 4) { j ? g.lineTo(X(j), Y(a[j])) : g.moveTo(X(0), Y(a[0])); } g.stroke(); }
    // The deterministic curve as a thick navy line...
    g.strokeStyle = NAVY; g.lineWidth = 2.2; g.beginPath();
    // ...through every 4th point up to step k.
    for (j = 0; j <= k; j += 4) { j ? g.lineTo(X(j), Y(det[j])) : g.moveTo(X(0), Y(det[0])); } g.stroke(); g.lineWidth = 1;
    // Legend: navy dash "deterministic"...
    g.fillStyle = NAVY; g.fillRect(x1 - 150, y0 - 2, 12, 3); g.font = '12px sans-serif'; g.fillText('deterministic', x1 - 132, y0 + 3);
    // ...and teal dash "sample paths".
    g.fillStyle = 'rgba(14,124,123,.6)'; g.fillRect(x1 - 150, y0 + 14, 12, 3); g.fillStyle = NAVY; g.fillText('sample paths', x1 - 132, y0 + 19);
    // histogram of I across all paths at the current time
    // Count how many of the 200 paths fall in each of the 25 bins of [0, 1] at step k.
    var bins = new Array(NB).fill(0); paths.forEach(function (p) { bins[Math.min(NB - 1, Math.floor(p[k] * NB))]++; });
    // mx = the largest count (bars are scaled to it).
    var mx = Math.max.apply(null, bins) || 1;
    // Phones: histogram below the paths, vertical bars.
    if (phone) {
      // Histogram area hx0–hx1, hy0–hy1; bw = bar width.
      var hx0 = 40, hx1 = W - 14, hy0 = y1 + 64, hy1 = H - 26, bw = (hx1 - hx0) / NB;
      // Base line.
      g.strokeStyle = RULE; g.beginPath(); g.moveTo(hx0, hy1); g.lineTo(hx1, hy1); g.stroke();
      // One teal bar per bin, height proportional to its count.
      g.fillStyle = 'rgba(14,124,123,.6)'; bins.forEach(function (c, i) { var hh = (hy1 - hy0) * c / mx; g.fillRect(hx0 + i * bw + 0.5, hy1 - hh, bw - 1, hh); });
      // Title with the current time.
      g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText('distribution of I across 200 paths, t = ' + Math.round(k * dt), hx0, hy0 - 10);
      // Axis labels 0, I, 1.
      g.fillText('0', hx0 - 3, hy1 + 14); g.fillText('I', (hx0 + hx1) / 2 - 2, hy1 + 14); g.fillText('1', hx1 - 4, hy1 + 14);
    // Wider screens: histogram to the right of the paths, horizontal bars sharing the same I axis.
    } else {
      // Its left edge hx and available width hw.
      var hx = x1 + 34, hw = W - hx - 14;
      // Vertical base line.
      g.strokeStyle = RULE; g.beginPath(); g.moveTo(hx, y0); g.lineTo(hx, y1); g.stroke();
      // One teal bar per bin, at the height of its I range, length proportional to its count.
      g.fillStyle = 'rgba(14,124,123,.6)'; bins.forEach(function (c, i) { var ya = Y((i + 1) / NB), yb = Y(i / NB); g.fillRect(hx, ya + 0.5, hw * c / mx, yb - ya - 1); });
      // Title with the current time.
      g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText('distribution of I, t = ' + Math.round(k * dt), hx, y0 - 8);
    }
  }
  // tick(): one animation frame.
  function tick() {
    // Panel closed: stop.
    if (!cv.offsetParent) { running = false; return; }        // panel closed: stop
    // End pause: count down, then simulate new paths and restart; otherwise advance 12 steps (pause 240 frames at the end).
    if (hold > 0) { if (--hold === 0) { simulate(); k = 0; } } else { k = Math.min(n, k + 12); if (k === n) hold = 240; }
    // Redraw and ask for the next frame.
    draw(); requestAnimationFrame(tick);
  }
  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // go(): start when the panel opens (do nothing if hidden); simulate and start at t = 0.
  function go() {
    if (!cv.offsetParent || !size()) return; simulate(); k = 0; hold = 0;
    // Reduced motion: show the picture at the final time once.
    if (reduce) { k = n; draw(); return; }                       // still picture at the final time
    // Otherwise start the frame loop (if not already running).
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  // Watch the theme's details panel (id="th-8"); when it opens or closes, call go() 30 ms later.
  new MutationObserver(function () { setTimeout(go, 30); })
    .observe(document.getElementById('th-8'), {attributes: true, attributeFilter: ['hidden']});
  // On window resize while open: resize the canvas and redraw.
  addEventListener('resize', function () { if (cv.offsetParent && paths && size()) draw(); });
})();
