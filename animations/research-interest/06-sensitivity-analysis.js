/* ==========================================================================
   Sensitivity analysis: PRCC and sensitivity indices of R0
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/06-sensitivity-analysis"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/06-sensitivity-analysis"]');
  if (host) host.innerHTML = `
<div class="sens">
  <p>The two animations use the basic reproduction number of an SEIR model with natural death rate &mu; and disease-induced death rate &delta;,</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="sens-eq"><i>R</i><sub>0</sub> = &beta;&sigma; / ((&sigma; + &mu;)(&gamma; + &delta; + &mu;)),</p>
  <p>with base values &beta; = 0.5, &sigma; = 0.2, &gamma; = 0.1, &delta; = 0.01 and &mu; = 0.02, so that <i>R</i><sub>0</sub> &asymp; 3.5. These values are illustrative.</p>
  <!-- ↓ Bold caption describing the drawing below it. -->
  <p class="sens-cap"><b>Global sensitivity (PRCC).</b> One thousand parameter sets are drawn by Latin hypercube sampling, each parameter ranging over &plusmn;50% of its base value. As the samples accumulate, the scatter of <i>R</i><sub>0</sub> against &beta; fills in and the partial rank correlation coefficients settle to their final values: positive for parameters that raise <i>R</i><sub>0</sub>, negative for those that lower it.</p>
  <!-- ↓ Drawing area for the sensitivity analysis animation. height = its height in pixels. -->
  <div class="sens-box"><canvas id="prccCv" height="300" role="img" aria-label="Latin hypercube samples of R0 against beta accumulating, beside PRCC bars for beta, sigma, gamma, delta and mu settling to their final values"></canvas></div>
  <!-- ↓ Bold caption describing the drawing below it. -->
  <p class="sens-cap"><b>Local sensitivity indices.</b> Each parameter in turn is raised by 10%. The gauge shows the resulting change in <i>R</i><sub>0</sub>, and the bar records its normalised index &Upsilon;<sub><i>p</i></sub>: here &Upsilon;<sub>&beta;</sub> = 1, &Upsilon;<sub>&sigma;</sub> &asymp; 0.09, &Upsilon;<sub>&gamma;</sub> &asymp; &minus;0.77, &Upsilon;<sub>&delta;</sub> &asymp; &minus;0.08 and &Upsilon;<sub>&mu;</sub> &asymp; &minus;0.25. Because <i>R</i><sub>0</sub> is nonlinear, a 10% change gives only approximately 10&Upsilon;<sub><i>p</i></sub> per cent.</p>
  <!-- ↓ Drawing area for the sensitivity analysis animation. height = its height in pixels. -->
  <div class="sens-box"><canvas id="idxCv" height="280" role="img" aria-label="Each parameter raised by 10 percent in turn, with a gauge showing the change in R0 and bars recording the normalised sensitivity indices"></canvas></div>
</div>
`;
})();

/* Sensitivity analysis panel: PRCC from Latin hypercube samples, and normalised sensitivity indices of R0.
   R0 = beta sigma / ((sigma + mu)(gamma + delta + mu)); base beta = 0.5, sigma = 0.2, gamma = 0.1, delta = 0.01, mu = 0.02.
   Both run only while the panel is open. */
// Runs once when the script loads.
(function () {
  // c1 = PRCC drawing <canvas id="prccCv">; c2 = sensitivity-index drawing <canvas id="idxCv">; stop if either is missing.
  var c1 = document.getElementById('prccCv'), c2 = document.getElementById('idxCv'); if (!c1 || !c2) return;
  // Colours: navy, grey, light grey, teal (positive values), red (negative values).
  var NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE', TEAL = '#0E7C7B', RED = '#D9512C';
  // The five parameters: name (n) and base value (v).
  var P = [{n: 'β', v: 0.5}, {n: 'σ', v: 0.2}, {n: 'γ', v: 0.1}, {n: 'δ', v: 0.01}, {n: 'μ', v: 0.02}];
  // R0(p) for a parameter list p = [β, σ, γ, δ, μ]: R0 = βσ / ((σ + μ)(γ + δ + μ)).
  function R0(p) { return p[0] * p[1] / ((p[1] + p[4]) * (p[2] + p[3] + p[4])); }
  // size(canvas, phoneHeight): match a canvas to its size on screen; returns {g: pen, W: width, H: height}, or null if hidden.
  function size(cv, phoneH) {
    // Pixel density and width on screen; stop if 0.
    var d = window.devicePixelRatio || 1, W = cv.clientWidth; if (!W) return null;
    // Height: a taller fixed height on phones, otherwise the height written in the block at the top of this file.
    var H = W < 560 ? phoneH : +cv.getAttribute('height');
    // Enlarge the canvas internally by d, keep its displayed height.
    cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px';
    // Get the pen, scale by d, and return the details.
    var g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); return {g: g, W: W, H: H};
  }
  // bars(...): draw a horizontal bar chart from −1 to 1 (one bar per parameter) in the box x0–x1, y0–y1.
  // frac(q) (optional) = how much of bar q to draw (0 to 1), used to grow bars one at a time.
  function bars(g, vals, labels, x0, x1, y0, y1, title, frac) {   // horizontal bars from -1 to 1
    // mid = position of zero; rowH = height per bar.
    var mid = (x0 + x1) / 2, rowH = (y1 - y0) / vals.length;
    // Vertical grey line at zero.
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath(); g.moveTo(mid, y0); g.lineTo(mid, y1); g.stroke();
    // Chart title above it.
    g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText(title, x0, y0 - 8);
    // Scale labels −1, 0, 1 at the bottom.
    g.fillText('−1', x0 - 4, y1 + 14); g.fillText('0', mid - 3, y1 + 14); g.fillText('1', x1 - 4, y1 + 14);
    // For each value v (q = its row):
    vals.forEach(function (v, q) {
      // f = fraction to draw; y = top of the bar; h = bar thickness; w = bar length (negative = to the left).
      var f = frac ? frac(q) : 1, y = y0 + q * rowH + rowH * 0.25, h = rowH * 0.5, w = (x1 - mid) * v * f;
      // Bar in teal (positive) or red (negative).
      g.fillStyle = v >= 0 ? TEAL : RED; g.fillRect(Math.min(mid, mid + w), y, Math.abs(w), h);
      // Parameter name on the left.
      g.fillStyle = NAVY; g.font = '13px sans-serif'; g.fillText(labels[q], x0 - 22, y + h - 3);
      // If the bar has started, write its value just across the zero line from the bar.
      if (f > 0) { g.fillStyle = MUTED; g.font = '11px sans-serif'; g.textAlign = v >= 0 ? 'right' : 'left';      // value on the other side of the zero line
        g.fillText((v * f).toFixed(2), v >= 0 ? mid - 5 : mid + 5, y + h - 3); g.textAlign = 'left'; }
    });
  }

  /* ---- A. PRCC ---- */
  // NT = 1000 samples; BATCH = samples added per frame; smp = parameter samples; out = their R0 values; shown = samples drawn so far;
  // holdA = end pause; vals = current PRCC values (start at 0); runA = animating?; A = canvas details.
  var NT = 1000, BATCH = 20, smp = [], out = [], shown = 0, holdA = 0, vals = P.map(function () { return 0; }), runA = false, A;
  // lhs(): draw a new Latin hypercube sample.
  function lhs() {
    // For each parameter: the NT strata (i + random)/NT, one random point in each of NT equal slices of [0, 1]...
    var cols = P.map(function () { var a = [], i, j, t; for (i = 0; i < NT; i++) a.push((i + Math.random()) / NT);
      // ...then shuffled (Fisher–Yates), so the strata are paired at random across parameters.
      for (i = NT - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; });
    // Empty the sample lists.
    smp = []; out = [];
    // Sample i: each parameter = base × (0.5 + stratum value), i.e. uniform on ±50% of its base value; store it and its R0.
    for (var i = 0; i < NT; i++) { var p = P.map(function (q, c) { return q.v * (0.5 + cols[c][i]); }); smp.push(p); out.push(R0(p)); }
    // Restart the drawing and the bars.
    shown = 0; holdA = 0; vals = P.map(function () { return 0; });
  }
  // rank(a): replace each value by its rank (0 = smallest) — PRCC works on ranks.
  function rank(a) { var idx = a.map(function (v, i) { return i; }).sort(function (x, y) { return a[x] - a[y]; }), r = new Array(a.length);
    // r[i] = position of a[i] in sorted order.
    idx.forEach(function (i, k) { r[i] = k; }); return r; }
  // resid(y, X): residuals of a least-squares fit of y on the columns of X plus a constant.
  function resid(y, X) {                                      // residuals of least-squares regression of y on X (with intercept)
    // n = data points; m = unknown coefficients (intercept + one per column); M = normal-equations matrix XᵀX; bb = Xᵀy.
    var n = y.length, m = X.length + 1, M = [], bb = [], i, j, k;
    // Start M and bb at zero.
    for (i = 0; i < m; i++) { M.push(new Array(m).fill(0)); bb.push(0); }
    // Accumulate XᵀX and Xᵀy row by row (each row = [1, x1, x2, ...]).
    for (k = 0; k < n; k++) { var row = [1].concat(X.map(function (c) { return c[k]; }));
      for (i = 0; i < m; i++) { bb[i] += row[i] * y[k]; for (j = 0; j < m; j++) M[i][j] += row[i] * row[j]; } }
    // Solve M·coef = bb by Gauss–Jordan elimination: scale row i so its pivot is 1...
    for (i = 0; i < m; i++) { var piv = M[i][i]; for (j = i; j < m; j++) M[i][j] /= piv; bb[i] /= piv;
      // ...and remove column i from every other row. Afterwards bb holds the coefficients.
      for (var r = 0; r < m; r++) if (r !== i) { var f = M[r][i]; for (j = i; j < m; j++) M[r][j] -= f * M[i][j]; bb[r] -= f * bb[i]; } }
    // Residual = actual value − fitted value, for every data point.
    return y.map(function (v, k) { var p = bb[0]; X.forEach(function (c, q) { p += bb[q + 1] * c[k]; }); return v - p; });
  }
  // corr(a, b): Pearson correlation coefficient of two lists.
  function corr(a, b) { var n = a.length, ma = 0, mb = 0, i, s = 0, sa = 0, sb = 0;
    // means of a and b;
    for (i = 0; i < n; i++) { ma += a[i]; mb += b[i]; } ma /= n; mb /= n;
    // covariance sum s and variance sums sa, sb;
    for (i = 0; i < n; i++) { s += (a[i] - ma) * (b[i] - mb); sa += (a[i] - ma) * (a[i] - ma); sb += (b[i] - mb) * (b[i] - mb); }
    // r = s / √(sa·sb).
    return s / Math.sqrt(sa * sb); }
  // prcc(n): PRCC of each parameter with R0, using the first n samples.
  function prcc(n) {
    // Rank-transform each parameter column and the R0 values.
    var cols = P.map(function (_, c) { return rank(smp.slice(0, n).map(function (p) { return p[c]; })); }), y = rank(out.slice(0, n));
    // For parameter c: remove the linear effect of the other parameters from both its ranks and R0's ranks,
    // then correlate the two residuals — that is the partial rank correlation coefficient.
    return P.map(function (_, c) { var others = cols.filter(function (__, q) { return q !== c; }); return corr(resid(cols[c], others), resid(y, others)); });
  }
  // drawA(): scatter of R0 against β on the left (top on phones), PRCC bars on the right (below on phones).
  function drawA() {
    // Canvas details; phone layout below 560 px; clear.
    var g = A.g, W = A.W, H = A.H, phone = W < 560; g.clearRect(0, 0, W, H);
    // Scatter area x0–x1, y0–y1; β axis from 0.25 to 0.75; R0 axis from 0 to 9.
    var x0 = 40, x1 = phone ? W - 12 : W * 0.45 - 10, y0 = 24, y1 = phone ? 220 : H - 30, bmin = 0.25, bmax = 0.75, rmax = 9;
    // Axes.
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    // Axis names "R₀" and "β".
    g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText('R₀', x0 + 6, y0 - 8); g.fillText('β', (x0 + x1) / 2 - 3, y1 + 14);
    // Axis numbers.
    g.fillText(rmax, x0 - 16, y0 + 4); g.fillText('0', x0 - 12, y1 + 4); g.fillText('0.25', x0 - 8, y1 + 14); g.fillText('0.75', x1 - 26, y1 + 14);
    // Semi-transparent teal for the dots.
    g.fillStyle = 'rgba(14,124,123,.45)';
    // One small square per sample drawn so far: x from its β, y from its R0 (capped at 9).
    for (var i = 0; i < shown; i++) g.fillRect(x0 + (x1 - x0) * (smp[i][0] - bmin) / (bmax - bmin) - 1, y1 - (y1 - y0) * Math.min(out[i], rmax) / rmax - 1, 2.4, 2.4);
    // Sample counter at the top right of the scatter.
    g.fillStyle = NAVY; g.font = '12px sans-serif'; g.fillText(shown + ' samples', x1 - 82, y0 + 4);
    // PRCC bars: below the scatter on phones...
    if (phone) bars(g, vals, P.map(function (q) { return q.n; }), 64, W - 24, 266, H - 26, 'PRCC with R₀');
    // ...or to its right on wider screens.
    else bars(g, vals, P.map(function (q) { return q.n; }), W * 0.45 + 50, W - 24, y0 + 6, H - 30, 'PRCC with R₀');
  }
  // tickA(): one frame of the PRCC animation.
  function tickA() {
    // Panel closed: stop.
    if (!c1.offsetParent) { runA = false; return; }
    // End pause: count down, then draw a fresh sample.
    if (holdA > 0) { if (--holdA === 0) lhs(); }
    // Otherwise add 20 more samples; once there are at least 40, recompute the PRCCs; when all 1000 are in, pause 240 frames.
    else { shown = Math.min(NT, shown + BATCH); if (shown >= 40) vals = prcc(shown); if (shown === NT) holdA = 240; }
    // Redraw and ask for the next frame.
    drawA(); requestAnimationFrame(tickA);
  }

  /* ---- B. sensitivity indices ---- */
  // base = base parameter values; Rb = R0 at the base (≈ 3.5).
  var base = P.map(function (q) { return q.v; }), Rb = R0(base);
  // Normalised forward sensitivity index Υ_p = (∂R0/∂p)(p/R0), estimated by a tiny relative change e = 10⁻⁶ in p.
  var idx = P.map(function (q, c) { var e = 1e-6, p = base.slice(); p[c] *= 1 + e; return (R0(p) - Rb) / (Rb * e); });
  // cur = parameter being raised now; ph = how far it has been raised (0 to 1 = 0% to 10%); holdB = pause; runB = animating?; B = canvas details.
  var cur = 0, ph = 0, holdB = 0, runB = false, B;
  // drawB(): a gauge showing R0 as one parameter rises by up to 10%, plus the index bars.
  function drawB() {
    // Canvas details; phone layout; clear.
    var g = B.g, W = B.W, H = B.H, phone = W < 560; g.clearRect(0, 0, W, H);
    // Gauge position gx, gy and length gw; p = parameters with the current one raised by 10%·ph.
    var gx = phone ? 20 : 24, gw = phone ? W - 40 : W * 0.32, gy = phone ? 58 : H / 2, p = base.slice(); p[cur] *= 1 + 0.1 * ph;
    // Rn = the new R0; sc(r) = position on the gauge (gauge spans 85% to 115% of the base R0).
    var Rn = R0(p), sc = function (r) { return gx + gw * (r - Rb * 0.85) / (Rb * 0.3); };
    // Heading, e.g. "raise β by 7%".
    g.fillStyle = NAVY; g.font = '500 13px sans-serif'; g.fillText('raise ' + P[cur].n + ' by ' + (10 * ph).toFixed(0) + '%', gx, gy - 26);
    // Grey gauge track (thick line with round ends).
    g.lineCap = 'round'; g.strokeStyle = RULE; g.lineWidth = 10; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + gw, gy); g.stroke();
    // Coloured part from the base R0 to the new R0 (teal if R0 rose, red if it fell); reset line settings.
    g.strokeStyle = Rn >= Rb ? TEAL : RED; g.beginPath(); g.moveTo(sc(Rb), gy); g.lineTo(sc(Rn), gy); g.stroke(); g.lineWidth = 1; g.lineCap = 'butt';
    // Navy tick marking the base R0.
    g.fillStyle = NAVY; g.fillRect(sc(Rb) - 1, gy - 12, 2, 24);
    // New R0 value under the gauge.
    g.font = '12px sans-serif'; g.fillText('R₀ = ' + Rn.toFixed(3), gx, gy + 30);
    // Percentage change (beside it on phones, below it otherwise).
    g.fillStyle = MUTED; g.fillText('change ' + ((Rn / Rb - 1) * 100).toFixed(1) + '%', gx + (phone ? 120 : 0), gy + (phone ? 30 : 48));
    // Bars already done are full, the current bar grows with ph, later bars are empty.
    var frac = function (q) { return q < cur ? 1 : (q === cur ? ph : 0); };
    // Index bars: below the gauge on phones...
    if (phone) bars(g, idx, P.map(function (q) { return q.n; }), 64, W - 24, 130, H - 26, 'index Υₚ', frac);
    // ...or to its right on wider screens.
    else bars(g, idx, P.map(function (q) { return q.n; }), W * 0.42 + 40, W - 24, 30, H - 30, 'index Υₚ', frac);
  }
  // tickB(): one frame of the sensitivity-index animation.
  function tickB() {
    // Panel closed: stop.
    if (!c2.offsetParent) { runB = false; return; }
    // After a pause: move to the next parameter (back to the first after the last).
    if (holdB > 0) { if (--holdB === 0) { cur++; ph = 0; if (cur >= P.length) { cur = 0; holdB = 0; } } }
    // Otherwise raise the current parameter a little more; when it reaches 10%, pause (longer after the last one).
    else { ph = Math.min(1, ph + 0.015); if (ph >= 1) holdB = cur === P.length - 1 ? 200 : 50; }
    // Redraw and ask for the next frame.
    drawB(); requestAnimationFrame(tickB);
  }

  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // go(): start both animations when the panel opens.
  function go() {
    // Do nothing if hidden.
    if (!c1.offsetParent) return;
    // Size both canvases (taller on phones); stop if either is not ready.
    A = size(c1, 470); B = size(c2, 330); if (!A || !B) return;
    // New sample; restart the index animation.
    lhs(); cur = 0; ph = 0; holdB = 0;
    // Reduced motion: show both finished pictures once.
    if (reduce) { shown = NT; vals = prcc(NT); drawA(); cur = P.length - 1; ph = 1; drawB(); return; }   // finished pictures
    // Otherwise start each frame loop (if not already running).
    if (!runA) { runA = true; requestAnimationFrame(tickA); }
    if (!runB) { runB = true; requestAnimationFrame(tickB); }
  }
  // Watch the theme's details panel (id="th-6"); when it opens or closes, call go() 30 ms later.
  new MutationObserver(function () { setTimeout(go, 30); })
    .observe(document.getElementById('th-6'), {attributes: true, attributeFilter: ['hidden']});
  // On window resize while open: resize both canvases.
  addEventListener('resize', function () { if (c1.offsetParent) { A = size(c1, 470); B = size(c2, 330); } });
})();
