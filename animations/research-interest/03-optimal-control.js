/* ==========================================================================
   Optimal control: comparing treatment and vaccination strategies
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/03-optimal-control"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/03-optimal-control"]');
  if (host) host.innerHTML = `
<div class="ctrl">
  <p>The animation compares control strategies in an SEIR model with treatment and vaccination,</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="ctrl-eq"><i>S</i>&prime; = &minus;&beta;<i>SI</i> &minus; <i>vS</i>, &nbsp;&nbsp; <i>E</i>&prime; = &beta;<i>SI</i> &minus; &sigma;<i>E</i>, &nbsp;&nbsp; <i>I</i>&prime; = &sigma;<i>E</i> &minus; (&gamma; + <i>u</i>)<i>I</i>, &nbsp;&nbsp; <i>R</i>&prime; = (&gamma; + <i>u</i>)<i>I</i> + <i>vS</i>,</p>
  <p>with &beta; = 0.5, &sigma; = 0.2 and &gamma; = 0.1. Treatment <i>u</i> = 0.06 speeds up recovery, and vaccination <i>v</i> = 0.01 moves susceptible people directly to the protected class. Treatment alone lowers the infection peak from about 31% to 17%; adding vaccination lowers it to about 6% and delays it. The control levels here are fixed and illustrative; optimal control instead lets them vary in time to minimise the cost functional above.</p>
  <!-- ↓ Drawing area for the optimal-control comparison animation. height = its height in pixels. -->
  <div class="ctrl-box"><canvas id="ctrlCv" height="300" role="img" aria-label="Infected fraction I(t) with no control, with treatment, and with treatment plus vaccination; the peak falls from about 31 percent to 17 percent to 6 percent"></canvas></div>
</div>
`;
})();

/* Control strategies in the "Optimal control" panel.
   SEIR: S' = -b S I - v S, E' = b S I - s E, I' = s E - (g + u) I, R' = (g + u) I + v S;  b = 0.5, s = 0.2, g = 0.1.
   Strategies: no control (u = 0, v = 0), treatment (u = 0.06), treatment + vaccination (u = 0.06, v = 0.01).
   Euler steps of 0.1 up to t = 200. Runs only while the panel is open. */
// Runs once when the script loads.
(function () {
  // cv = the drawing area <canvas id="ctrlCv">; stop if it is missing.
  var cv = document.getElementById('ctrlCv'); if (!cv) return;
  // Colours; final time T = 200 days; Euler step dt = 0.1; n = 2000 steps.
  var NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE', T = 200, dt = 0.1, n = Math.round(T / dt);
  // The three strategies: label, curve colour, treatment rate u and vaccination rate v.
  var RUNS = [{lab: 'No control', c: '#D9512C', u: 0, v: 0}, {lab: 'Treatment', c: '#E8A33C', u: 0.06, v: 0},
              {lab: 'Treatment + vaccination', c: '#0E7C7B', u: 0.06, v: 0.01}];
  // Solve the model once for each strategy r (done immediately, it is fast):
  RUNS.forEach(function (r) {
    // Initial state: 99.9% susceptible, 0.1% infected; r.I will hold I(t) at every step.
    var S = 0.999, E = 0, I = 0.001, R = 0; r.I = [];
    // For each step k: store I, compute new infections β S I with β = 0.5;
    for (var k = 0; k <= n; k++) { r.I.push(I); var inf = 0.5 * S * I;
      // explicit Euler update of S, E, I, R (σ = 0.2, γ = 0.1, plus this strategy's u and v);
      var nS = S + dt * (-inf - r.v * S), nE = E + dt * (inf - 0.2 * E), nI = I + dt * (0.2 * E - (0.1 + r.u) * I), nR = R + dt * ((0.1 + r.u) * I + r.v * S);
      // then move to the new values.
      S = nS; E = nE; I = nI; R = nR; }
  });
  // top = vertical axis top (the no-control peak rounded up to the next 10%); g = pen; W, Hh = canvas size;
  // k = how many steps are drawn so far; hold = end pause; running = animating?
  var top = Math.ceil(Math.max.apply(null, RUNS[0].I) * 10) / 10, g, W, Hh, k = 0, hold = 0, running = false;
  // size(): match the canvas to its size on screen (sharp on high-resolution screens). Returns false if hidden.
  function size() {
    // d = pixel density; W = width on screen; Hh = height written in the block at the top of this file; stop if width is 0.
    var d = window.devicePixelRatio || 1; W = cv.clientWidth; Hh = +cv.getAttribute('height'); if (!W) return false;
    // Enlarge the canvas internally by d, keep its displayed height, get the pen, scale by d. Success.
    cv.width = W * d; cv.height = Hh * d; cv.style.height = Hh + 'px'; g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return true;
  }
  // draw(): axes, the three curves up to step k, peak labels, legend.
  function draw() {
    // Plot area: x from x0 to x1, y from y0 (top) to y1 (bottom).
    var x0 = 46, x1 = W - 14, y0 = 22, y1 = Hh - 30;
    // X(t): time -> horizontal position; Y(v): I value -> vertical position.
    var X = function (t) { return x0 + (x1 - x0) * t / T; }, Y = function (v) { return y1 - (y1 - y0) * v / top; };
    // Clear the canvas.
    g.clearRect(0, 0, W, Hh);
    // Two axes in light grey.
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    // Small grey label font.
    g.fillStyle = MUTED; g.font = '11px sans-serif';
    // Day ticks 0–200 under the axis, and "days" at its end.
    [0, 50, 100, 150, 200].forEach(function (t) { g.fillText(t, X(t) - 6, y1 + 14); }); g.fillText('days', x1 - 28, y1 - 6);
    // Percentages on the vertical axis.
    [0, top / 2, top].forEach(function (v) { g.fillText(Math.round(v * 100) + '%', x0 - 32, Y(v) + 4); });
    // Axis title.
    g.fillText('infected, I(t)', x0 + 6, y0 - 6);
    // For each strategy r (i = its position):
    RUNS.forEach(function (r, i) {
      // pen in its colour; pk = peak position found so far;
      g.strokeStyle = r.c; g.lineWidth = 2.2; g.beginPath(); var pk = 0;
      // join every 2nd point up to step k, tracking the highest point;
      for (var m = 0; m <= k; m += 2) { m ? g.lineTo(X(m * dt), Y(r.I[m])) : g.moveTo(X(0), Y(r.I[0])); if (r.I[m] > r.I[pk]) pk = m; }
      g.stroke();
      // once the peak is clearly passed: dot at the peak...
      if (pk < k - 20) { var px = X(pk * dt), py = Y(r.I[pk]); g.fillStyle = r.c; g.beginPath(); g.arc(px, py, 3.5, 0, 7); g.fill();
        // ...and a label "peak 12.3%" beside it...
        var lbl = 'peak ' + (r.I[pk] * 100).toFixed(1) + '%'; g.font = '11px sans-serif'; g.lineJoin = 'round';
        // ...written with a white outline first so it stays readable over the curves.
        g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.strokeText(lbl, px + 7, py - 7); g.fillText(lbl, px + 7, py - 7); }
      // Legend entry at the top right: coloured dash...
      g.fillStyle = r.c; g.fillRect(x1 - 180, y0 + 4 + i * 17, 12, 3);
      // ...and the strategy's name.
      g.fillStyle = NAVY; g.font = '12px sans-serif'; g.fillText(r.lab, x1 - 162, y0 + 9 + i * 17);
    });
  }
  // tick(): one animation frame.
  function tick() {
    // Panel closed: stop.
    if (!cv.offsetParent) { running = false; return; }            // panel closed: stop
    // End pause: count down then restart; otherwise extend the curves by 6 steps (pause 240 frames when complete).
    if (hold > 0) { if (--hold === 0) k = 0; } else { k = Math.min(k + 6, n); if (k === n) hold = 240; }
    // Redraw and ask for the next frame.
    draw(); requestAnimationFrame(tick);
  }
  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // go(): start when the panel opens (do nothing if hidden); begin at t = 0.
  function go() {
    if (!cv.offsetParent || !size()) return; k = 0; hold = 0;
    // Reduced motion: draw the complete curves once.
    if (reduce) { k = n; draw(); return; }
    // Otherwise start the frame loop (if not already running).
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  // Watch the theme's details panel (id="th-3"); when it opens or closes, call go() 30 ms later.
  new MutationObserver(function () { setTimeout(go, 30); })
    .observe(document.getElementById('th-3'), {attributes: true, attributeFilter: ['hidden']});
  // On window resize while open: resize the canvas and redraw.
  addEventListener('resize', function () { if (cv.offsetParent && size()) draw(); });
})();
