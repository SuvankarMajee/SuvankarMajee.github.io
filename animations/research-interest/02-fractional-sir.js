/* ==========================================================================
   Fractional-order differential equations: fractional SIR (memory effect)
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/02-fractional-sir"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/02-fractional-sir"]');
  if (host) host.innerHTML = `
<div class="fsir">
  <p>The animation shows the effect of memory on a simple fractional-order SIR model,</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="fsir-eq"><sup>C</sup><i>D</i><sup>&alpha;</sup><i>S</i> = &minus;&beta;<i>SI</i>, &nbsp;&nbsp; <sup>C</sup><i>D</i><sup>&alpha;</sup><i>I</i> = &beta;<i>SI</i> &minus; &gamma;<i>I</i>, &nbsp;&nbsp; <sup>C</sup><i>D</i><sup>&alpha;</sup><i>R</i> = &gamma;<i>I</i>,</p>
  <p>with &beta; = 0.4, &gamma; = 0.1, <i>S</i>(0) = 0.99 and <i>I</i>(0) = 0.01, solved for four orders &alpha;. As &alpha; decreases, the peak of infection becomes lower and later, and the epidemic lasts longer. The parameter values are illustrative and are kept the same for every &alpha;.</p>
  <!-- ↓ Drawing area for the fractional SIR animation. height = its height in pixels. -->
  <div class="fsir-box"><canvas id="fsirCv" height="300" role="img" aria-label="Infected fraction I(t) of a fractional-order SIR model for alpha equal to 1, 0.9, 0.75 and 0.6, showing lower and later peaks for smaller alpha"></canvas></div>
</div>
`;
})();

/* Fractional SIR in the "Fractional-order differential equations" panel.
   Caputo system  D^a S = -b S I,  D^a I = b S I - g I,  D^a R = g I,  b = 0.4, g = 0.1, S(0) = 0.99, I(0) = 0.01,
   solved for a = 1, 0.9, 0.75, 0.6 with the Grunwald-Letnikov scheme (step 0.1, t up to 80).
   The curves are computed once, the first time the panel opens; the animation runs only while it is open. */
// Runs once when the script loads.
(function () {
  // cv = the drawing area <canvas id="fsirCv">; stop if it is missing.
  var cv = document.getElementById('fsirCv'); if (!cv) return;
  // The four fractional orders α to compare, and the colour of each curve (navy, teal, amber, red).
  var ALPHAS = [1, 0.9, 0.75, 0.6], COLS = ['#10203A', '#0E7C7B', '#E8A33C', '#D9512C'];
  // Colours; final time T = 80; step h = 0.1; n = 800 steps; transmission b = β = 0.4; recovery gm = γ = 0.1.
  var NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE', T = 80, h = 0.1, n = Math.round(T / h), b = 0.4, gm = 0.1;
  // sols = the computed I(t) curves; top = top of the vertical axis; g = pen; W, Hh = canvas size;
  // k = how many steps of each curve are drawn so far; hold = pause frames at the end; running = animating?
  var sols = null, top, g, W, Hh, k = 0, hold = 0, running = false;
  // solve(a): solve the Caputo SIR system of order a; returns the list of I values at t = 0, h, 2h, ..., T.
  function solve(a) {
    // w = Grünwald–Letnikov weights (w0 = 1); x0 = initial state [S, I, R]; xs = solution so far; ha = h^a.
    var w = [1], j, i, kk, x0 = [0.99, 0.01, 0], xs = [x0.slice()], ha = Math.pow(h, a);
    // Weights by the recursion w_j = w_{j−1} (1 − (a + 1)/j), i.e. w_j = (−1)^j C(a, j).
    for (j = 1; j <= n; j++) w.push(w[j - 1] * (1 - (a + 1) / j));
    // For each time step kk:
    for (kk = 1; kk <= n; kk++) {
      // x = previous state; inf = b·S·I (new infections); f = right-hand side [−bSI, bSI − γI, γI]; nx = new state.
      var x = xs[kk - 1], inf = b * x[0] * x[1], f = [-inf, inf - gm * x[1], gm * x[1]], nx = [];
      // For S, I and R: memory term Σ_{j=1..kk} w_j (x_{kk−j} − x0) over the whole past, then
      // x_kk = x0 + h^a f(x_{kk−1}) − memory  (explicit Grünwald–Letnikov scheme for the Caputo derivative).
      for (i = 0; i < 3; i++) { var mem = 0; for (j = 1; j <= kk; j++) mem += w[j] * (xs[kk - j][i] - x0[i]); nx.push(x0[i] + ha * f[i] - mem); }
      // Store the new state.
      xs.push(nx);
    }
    // Keep only the infected fraction I (index 1) at each step.
    return xs.map(function (v) { return v[1]; });
  }
  // size(): match the canvas to its size on screen (sharp on high-resolution screens). Returns false if hidden.
  function size() {
    // d = pixel density; W = width on screen; Hh = the height written in the block at the top of this file; stop if width is 0.
    var d = window.devicePixelRatio || 1; W = cv.clientWidth; Hh = +cv.getAttribute('height'); if (!W) return false;
    // Enlarge the canvas internally by d, keep its displayed height, get the pen, scale by d. Success.
    cv.width = W * d; cv.height = Hh * d; cv.style.height = Hh + 'px'; g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return true;
  }
  // draw(): paint the axes, the curves up to step k, the peak markers and the legend.
  function draw() {
    // Plot area: x from x0 to x1, y from y0 (top) to y1 (bottom).
    var x0 = 46, x1 = W - 14, y0 = 22, y1 = Hh - 30;
    // X(t) converts time to a horizontal position; Y(v) converts an I value to a vertical position.
    var X = function (t) { return x0 + (x1 - x0) * t / T; }, Y = function (v) { return y1 - (y1 - y0) * v / top; };
    // Clear the canvas.
    g.clearRect(0, 0, W, Hh);
    // Draw the two axes in light grey.
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    // Small grey label font.
    g.fillStyle = MUTED; g.font = '11px sans-serif';
    // Time ticks 0, 20, 40, 60, 80 under the axis, and "t" at the end of the axis.
    [0, 20, 40, 60, 80].forEach(function (t) { g.fillText(t, X(t) - 5, y1 + 14); }); g.fillText('t', x1 - 6, y1 - 6);
    // Percentages on the vertical axis: 0, half of the top, the top.
    [0, top / 2, top].forEach(function (v) { g.fillText(Math.round(v * 100) + '%', x0 - 32, Y(v) + 4); });
    // Axis title.
    g.fillText('infected, I(t)', x0 + 6, y0 - 6);
    // For each curve s (i = which α):
    sols.forEach(function (s, i) {
      // pen in its colour; pk = position of the peak found so far.
      g.strokeStyle = COLS[i]; g.lineWidth = 2; g.beginPath(); var pk = 0;
      // join every 2nd point up to step k, and track the highest point (the epidemic peak).
      for (var m = 0; m <= k; m += 2) { m ? g.lineTo(X(m * h), Y(s[m])) : g.moveTo(X(0), Y(s[0])); if (s[m] > s[pk]) pk = m; }
      g.stroke();
      // Once the curve has clearly passed its peak, mark the peak with a dot.
      if (pk < k - 30) { g.fillStyle = COLS[i]; g.beginPath(); g.arc(X(pk * h), Y(s[pk]), 3.5, 0, 7); g.fill(); }
    });
    // Legend at the top right: a coloured dash and "α = ..." for each curve ("(classical)" for α = 1).
    ALPHAS.forEach(function (a, i) {
      g.fillStyle = COLS[i]; g.fillRect(x1 - 112, y0 + 4 + i * 17, 12, 3);
      g.fillStyle = NAVY; g.font = '12px sans-serif'; g.fillText('α = ' + a + (a === 1 ? ' (classical)' : ''), x1 - 94, y0 + 9 + i * 17);
    });
  }
  // tick(): one animation frame.
  function tick() {
    // Panel closed (canvas not visible): stop.
    if (!cv.offsetParent) { running = false; return; }            // panel closed: stop
    // During the end pause, count down then restart from t = 0; otherwise extend the curves by 3 steps
    // (and start a 240-frame pause once they are complete).
    if (hold > 0) { if (--hold === 0) k = 0; } else { k = Math.min(k + 3, n); if (k === n) hold = 240; }
    // Redraw and ask for the next frame.
    draw(); requestAnimationFrame(tick);
  }
  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // go(): start when the panel opens.
  function go() {
    // Do nothing if the canvas is hidden or has no size.
    if (!cv.offsetParent || !size()) return;
    // First time only: solve for all four α, and set the axis top to the classical peak rounded up to the next 10%.
    if (!sols) { sols = ALPHAS.map(solve); top = Math.ceil(Math.max.apply(null, sols[0]) * 10) / 10; }
    // Start drawing from t = 0.
    k = 0; hold = 0;
    // Reduced motion: draw the complete curves once.
    if (reduce) { k = n; draw(); return; }                          // still picture with all curves complete
    // Otherwise start the frame loop (if not already running).
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  // Watch the theme's details panel (id="th-2"); when it opens or closes, call go() 30 ms later.
  new MutationObserver(function () { setTimeout(go, 30); })
    .observe(document.getElementById('th-2'), {attributes: true, attributeFilter: ['hidden']});
  // On window resize while open: resize the canvas and redraw.
  addEventListener('resize', function () { if (cv.offsetParent && sols && size()) draw(); });
})();
