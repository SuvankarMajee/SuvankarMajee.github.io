/* ==========================================================================
   Spatio-temporal dynamics: Turing pattern (Schnakenberg model)
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/04-turing-pattern"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/04-turing-pattern"]');
  if (host) host.innerHTML = `
<div class="tur">
  <p>The animation shows a Turing pattern forming in the Schnakenberg model,</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="tur-eq"><i>u</i><sub><i>t</i></sub> = &Delta;<i>u</i> + <i>a</i> &minus; <i>u</i> + <i>u</i><sup>2</sup><i>v</i>, &nbsp;&nbsp; <i>v</i><sub><i>t</i></sub> = <i>d</i>&Delta;<i>v</i> + <i>b</i> &minus; <i>u</i><sup>2</sup><i>v</i>,</p>
  <p>with <i>a</i> = 0.1, <i>b</i> = 0.9 and <i>d</i> = 20, on a square of side 128 with periodic boundaries. Without diffusion the equilibrium (<i>u</i>, <i>v</i>) = (1, 0.9) is stable. With diffusion, det(<i>J</i> &minus; <i>k</i><sup>2</sup><i>D</i>) = 20<i>k</i><sup>4</sup> &minus; 15<i>k</i><sup>2</sup> + 1 is negative for 0.27 &lt; <i>k</i> &lt; 0.82, so small random perturbations with these wavenumbers grow into a pattern of spots. The right-hand graph is the growth rate Re&nbsp;&lambda;(<i>k</i>) of the larger eigenvalue, positive only in that band (the corner near <i>k</i> = 0.22 is where the two eigenvalues change from complex to real). Perturbations grow fastest at <i>k</i> &asymp; 0.49; nonlinear effects then select the final spacing, which in this simulation settles at <i>k</i> &asymp; 0.59.</p>
  <!-- ↓ Drawing area for the Turing pattern animation. height = its height in pixels. -->
  <div class="tur-box"><canvas id="turCv" height="330" role="img" aria-label="A Turing pattern of spots forming from small random noise in the Schnakenberg model, beside its dispersion relation showing the band of unstable wavenumbers"></canvas></div>
</div>
`;
})();

/* Turing pattern in the "Spatio-temporal dynamics" panel.
   Schnakenberg: u_t = Lap u + a - u + u^2 v,  v_t = d Lap v + b - u^2 v;  a = 0.1, b = 0.9, d = 20.
   96 x 96 grid on a periodic square of side 128 (dx = 4/3), explicit Euler with dt = 0.02, run to t = 600.
   The field is drawn with bilinear interpolation at screen resolution, so the spots stay sharp.
   Runs only while the panel is open. */
// Runs once when the script loads.
(function () {
  // cv = the drawing area <canvas id="turCv">; stop if it is missing.
  var cv = document.getElementById('turCv'); if (!cv) return;
  // Grid N×N = 96×96; domain side L = 128; dx = 4/3; dt = 0.02; model parameters a, b, d; end time 600; PER = steps per frame.
  var N = 96, L = 128, dx = L / N, dt = 0.02, a = 0.1, b = 0.9, d = 20, TEND = 600, PER = 80;
  // Colours.
  var NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE', TEAL = '#0E7C7B';
  // Arrays for u and v, and for their next-step values.
  var u = new Float32Array(N * N), v = new Float32Array(N * N), nu = new Float32Array(N * N), nv = new Float32Array(N * N);
  // t = model time; hold = end pause; running; g = pen; W, Hh = canvas size; S = side of the pattern square;
  // dpr = pixel density; pimg = pixel buffer for the pattern; frameNo = frame counter.
  var t = 0, hold = 0, running = false, g, W, Hh, S, dpr, pimg, frameNo = 0;
  // reset(): start near the homogeneous steady state (u*, v*) = (1, 0.9) with tiny random perturbations (±0.5%).
  function reset() {
    for (var i = 0; i < N * N; i++) { u[i] = 1 + (Math.random() - .5) * 0.01; v[i] = 0.9 + (Math.random() - .5) * 0.01; }
    // Time back to 0, no pause.
    t = 0; hold = 0;
  }
  // step(): one explicit Euler step of the reaction–diffusion system.
  function step() {
    // c = 1/dx² (Laplacian factor).
    var c = 1 / (dx * dx), x, y;
    // For each row y:
    for (y = 0; y < N; y++) {
      // start of the row above, this row and the row below (wrapping around: periodic boundaries);
      var ym = ((y + N - 1) % N) * N, y0 = y * N, yp = ((y + 1) % N) * N;
      // for each column x:
      for (x = 0; x < N; x++) {
        // columns left/right (wrapping), and the index i of this cell;
        var xm = (x + N - 1) % N, xp = (x + 1) % N, i = y0 + x;
        // 5-point Laplacian of u: (left + right + up + down − 4·centre)/dx²;
        var Lu = (u[y0 + xm] + u[y0 + xp] + u[ym + x] + u[yp + x] - 4 * u[i]) * c;
        // same for v;
        var Lv = (v[y0 + xm] + v[y0 + xp] + v[ym + x] + v[yp + x] - 4 * v[i]) * c;
        // reaction term u²v;
        var uuv = u[i] * u[i] * v[i];
        // u_new = u + dt (Δu + a − u + u²v);
        nu[i] = u[i] + dt * (Lu + a - u[i] + uuv);
        // v_new = v + dt (d Δv + b − u²v).
        nv[i] = v[i] + dt * (d * Lv + b - uuv);
      }
    }
    // Swap current and next arrays, and advance the clock.
    var tmp = u; u = nu; nu = tmp; tmp = v; v = nv; nv = tmp; t += dt;
  }
  // lam(k²): dispersion relation — the largest real part of the eigenvalues of J − k²D at the steady state,
  // where J = [[0.8, 1], [−1.8, −1]] is the Jacobian and D = diag(1, d).
  function lam(k2) {                                          // largest real part of the eigenvalues of J - k^2 D
    // Entries of J − k²D, its trace tr, determinant de, and discriminant tr² − 4·de.
    var a11 = 0.8 - k2, a22 = -1 - d * k2, tr = a11 + a22, de = a11 * a22 + 1.8, disc = tr * tr - 4 * de;
    // Real eigenvalues: the larger one; complex pair: their common real part tr/2.
    return disc >= 0 ? (tr + Math.sqrt(disc)) / 2 : tr / 2;
  }
  // size(): fit the canvas to the screen and decide the layout. Returns false if hidden.
  function size() {
    // Pixel density; width on screen; stop if 0.
    dpr = window.devicePixelRatio || 1; W = cv.clientWidth; if (!W) return false;
    // Phones (< 560 px): the pattern square is the full width, with the graph below it (250 px more height).
    if (W < 560) { S = W; Hh = S + 250; }                      // phones: pattern on top, graph below
    // Wider screens: height from the page; the square is at most half the width, graph to its right.
    else { Hh = +cv.getAttribute('height'); S = Math.min(Hh - 22, W * 0.5); }   // side of the pattern square (CSS px)
    // Set the canvas's internal and displayed size; get the pen.
    cv.width = W * dpr; cv.height = Hh * dpr; cv.style.height = Hh + 'px'; g = cv.getContext('2d');
    // Pixel buffer for the pattern square at full screen resolution. Success.
    var P = Math.round(S * dpr); pimg = g.createImageData(P, P); return true;
  }
  // paintPattern(): colour every screen pixel of the square from u (smoothly interpolated between grid points).
  function paintPattern() {                                   // bilinear interpolation of u, then a smooth colour ramp
    // P = square size in pixels; data = raw pixels; sc = grid cells per pixel; u values from lo to hi map to dark → light.
    var P = pimg.width, data = pimg.data, sc = N / P, lo = 0.7, hi = 2.1;   // steep ramp: crisp spot edges
    // For each pixel row py:
    for (var py = 0; py < P; py++) {
      // its position between grid rows: lower row y0 (wrapped to ya), next row yb, and the fraction ty between them;
      var fy = py * sc - 0.5, y0 = Math.floor(fy), ty = fy - y0, ya = ((y0 % N) + N) % N, yb = (ya + 1) % N;
      // for each pixel column px:
      for (var px = 0; px < P; px++) {
        // the same between grid columns: xa, xb and fraction tx;
        var fx = px * sc - 0.5, x0 = Math.floor(fx), tx = fx - x0, xa = ((x0 % N) + N) % N, xb = (xa + 1) % N;
        // bilinear interpolation of u from the four surrounding grid points;
        var val = (u[ya * N + xa] * (1 - tx) + u[ya * N + xb] * tx) * (1 - ty) + (u[yb * N + xa] * (1 - tx) + u[yb * N + xb] * tx) * ty;
        // brightness s in [0, 1], then a smoothstep (3s² − 2s³) for soft but crisp edges;
        var s = Math.max(0, Math.min(1, (val - lo) / (hi - lo))); s = s * s * (3 - 2 * s);
        // position of this pixel in the raw data (4 numbers per pixel);
        var o = 4 * (py * P + px);
        // colour from navy (s = 0) to mint (s = 1), fully opaque.
        data[o] = 16 + 111 * s; data[o + 1] = 32 + 177 * s; data[o + 2] = 58 + 132 * s; data[o + 3] = 255;
      }
    }
  }
  // draw(full): paint the pattern and its time label; if full = true, also redraw the dispersion graph.
  function draw(full) {
    // Work in raw pixels for the pattern.
    g.setTransform(1, 0, 0, 1, 0, 0);
    // Full redraw: clear the whole canvas first.
    if (full) { g.clearRect(0, 0, cv.width, cv.height); }
    // Paint the pattern and copy it to the top-left of the canvas.
    paintPattern(); g.putImageData(pimg, 0, 0);
    // Back to normal (CSS-pixel) units.
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Clear just the strip under the square where the time label goes.
    g.clearRect(0, S, Math.min(S + 2, 200), 20);                  // refresh only the time label under the pattern
    // Write "u(x, y),  t = 123".
    g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText('u(x, y),  t = ' + Math.round(t), 4, S + 15);
    // The graph does not change, so it is only redrawn on full redraws.
    if (!full) return;
    // Graph area (right of the square, or below it on phones); k axis from 0 to K = 1.2; growth-rate axis from lo to hi.
    var x0 = W < 560 ? 34 : S + 64, x1 = W - 14, y0 = W < 560 ? S + 52 : 28, y1 = Hh - 34, K = 1.2, lo = -1.2, hi = 0.25;
    // X(k): wavenumber -> horizontal position; Y(l): growth rate -> vertical position.
    var X = function (k) { return x0 + (x1 - x0) * k / K; }, Y = function (l) { return y1 - (y1 - y0) * (l - lo) / (hi - lo); };
    // Shade the unstable band 0.272 < k < 0.822 (where det(J − k²D) < 0, i.e. 20k⁴ − 15k² + 1 < 0) in pale teal.
    g.fillStyle = 'rgba(14,124,123,.12)'; g.fillRect(X(0.272), y0, X(0.822) - X(0.272), y1 - y0);
    // Axes in light grey...
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1);
    // ...plus a horizontal line at growth rate 0.
    g.moveTo(x0, Y(0)); g.lineTo(x1, Y(0)); g.stroke();
    // The dispersion curve in navy:
    g.strokeStyle = NAVY; g.lineWidth = 2; g.beginPath();
    // Re λ(k) for k from 0 to 1.2 in steps of 0.005 (cut off at the bottom of the graph).
    for (var k = 0; k <= K; k += 0.005) { var yy = Y(Math.max(lo, lam(k * k))); k ? g.lineTo(X(k), yy) : g.moveTo(X(k), yy); }
    g.stroke(); g.lineWidth = 1;
    // Graph title.
    g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText('growth rate, Re λ(k)', x0 + 6, y0 - 10);
    // "0" on the vertical axis and "k" on the horizontal axis.
    g.fillText('0', x0 - 12, Y(0) + 4); g.fillText('k', x1 - 6, y1 + 15);
    // Tick labels 0.3, 0.6, 0.9.
    [0.3, 0.6, 0.9].forEach(function (kk) { g.fillText(kk, X(kk) - 7, y1 + 15); });
    // Label the shaded band.
    g.fillStyle = TEAL; g.fillText('unstable band', X(0.547) - 36, y1 - 10);
  }
  // tick(): one animation frame.
  function tick() {
    // Panel closed: stop.
    if (!cv.offsetParent) { running = false; return; }       // panel closed: stop
    // End pause: count down then restart from new random noise.
    if (hold > 0) { if (--hold === 0) { reset(); } }
    // Otherwise compute 80 time steps; at t = 600 pause for 240 frames.
    else { for (var s = 0; s < PER; s++) step(); if (t >= TEND) hold = 240; }
    // Redraw (fully every 30th frame, otherwise just the pattern) and ask for the next frame.
    frameNo++; draw(frameNo % 30 === 1); requestAnimationFrame(tick);
  }
  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // go(): start when the panel opens (do nothing if hidden); new random start.
  function go() {
    if (!cv.offsetParent || !size()) return; reset(); frameNo = 0;
    // Reduced motion: compute up to t = 300 and show the formed pattern once.
    if (reduce) { while (t < 300) step(); draw(true); return; }  // still picture of a formed pattern
    // Otherwise start the frame loop (if not already running).
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  // Watch the theme's details panel (id="th-4"); when it opens or closes, call go() 30 ms later.
  new MutationObserver(function () { setTimeout(go, 30); })
    .observe(document.getElementById('th-4'), {attributes: true, attributeFilter: ['hidden']});
  // On window resize while open: resize the canvas and redraw fully.
  addEventListener('resize', function () { if (cv.offsetParent && size()) draw(true); });
})();
