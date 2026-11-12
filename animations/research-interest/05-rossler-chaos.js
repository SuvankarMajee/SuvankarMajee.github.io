/* ==========================================================================
   Stability, chaos and bifurcation: Rössler system route to chaos
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/05-rossler-chaos"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/05-rossler-chaos"]');
  if (host) host.innerHTML = `
<div class="chaos">
  <p>The animation shows these changes in the R&ouml;ssler system, a standard example of the route from stability to chaos:</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="chaos-eq"><i>x</i>&prime; = &minus;<i>y</i> &minus; <i>z</i>, &nbsp;&nbsp; <i>y</i>&prime; = <i>x</i> + <i>a</i><i>y</i>, &nbsp;&nbsp; <i>z</i>&prime; = <i>b</i> + <i>z</i>(<i>x</i> &minus; <i>c</i>), &nbsp;&nbsp; with <i>b</i> = 0.2 and <i>c</i> = 5.7.</p>
  <p>As the parameter <i>a</i> increases, the equilibrium loses stability through a Hopf bifurcation near <i>a</i> = 0, the resulting limit cycle doubles its period, and the motion becomes chaotic. Each stage starts from the same initial point (<i>x</i>, <i>y</i>, <i>z</i>) = (6, 0, 0.02); the upper panel is the trajectory in the <i>x</i>&ndash;<i>y</i> plane and the lower panel is <i>x</i>(<i>t</i>) from <i>t</i> = 0.</p>
  <!-- ↓ Drawing area for the Rössler animation, with the stage label (chaosLab) and progress dots (chaosDots) placed on top. -->
  <div class="chaos-box">
    <canvas id="chaosCv" height="400" aria-label="Animation of the Rössler system passing from a stable equilibrium through a limit cycle and period doubling to chaos" role="img"></canvas>
    <div class="chaos-lab" id="chaosLab"></div>
    <div class="chaos-dots" id="chaosDots"></div>
  </div>
</div>
`;
})();

/* Rössler animation in the "Stability, chaos and bifurcation" panel.
   x' = -y - z,  y' = x + a y,  z' = b + z(x - c),  b = 0.2, c = 5.7; a is varied.  RK4, step 0.02.
   Each stage starts from (6, 0, 0.02) at t = 0; runs only while the panel is open. */
// Runs once when the script loads.
(function () {
  // cv = the drawing area <canvas id="chaosCv">; stop if it is missing.
  var cv = document.getElementById('chaosCv'); if (!cv) return;
  // The stage label box and the progress dots (both built at the top of this file, on top of the canvas).
  var lab = document.getElementById('chaosLab'), dots = document.getElementById('chaosDots');
  // b = 0.2, c = 5.7; RK4 step H = 0.02; PER = steps per frame; STEPS = 6000 steps per stage; TMAX = 120 time units.
  var B = 0.2, C = 5.7, H = 0.02, PER = 12, STEPS = 500 * PER, TMAX = STEPS * H;   // 120 time units per stage
  // Colours (TEAL is written as "r,g,b" so its transparency can be varied).
  var TEAL = '14,124,123', NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE';
  // The five stages shown in turn: value of a, title (t) and explanation (s). − is a minus sign.
  var REG = [
    {a: -0.1,  t: 'Stable equilibrium', s: 'a = −0.1: the trajectory spirals into a fixed point'},
    {a: 0.1,   t: 'Limit cycle',        s: 'a = 0.1: after a Hopf bifurcation, a sustained oscillation'},
    {a: 0.125, t: 'Period 2',           s: 'a = 0.125: the cycle has doubled'},
    {a: 0.15,  t: 'Period 4',           s: 'a = 0.15: doubled again'},
    {a: 0.2,   t: 'Chaos',              s: 'a = 0.2: aperiodic, never repeating'}
  ];
  // f(state, a): right-hand side of the Rössler system [x', y', z'] at state [x, y, z].
  function f(s, a) { return [-s[1] - s[2], s[0] + a * s[1], B + s[2] * (s[0] - C)]; }
  // rk(state, a): one classical 4th-order Runge–Kutta step of size H.
  function rk(s, a) {
    // k1 = slope at the start; p, q, r = intermediate states.
    var k1 = f(s, a), p = [], q = [], r = [], i;
    // k2 = slope at the half-step using k1;
    for (i = 0; i < 3; i++) p[i] = s[i] + H / 2 * k1[i]; var k2 = f(p, a);
    // k3 = slope at the half-step using k2;
    for (i = 0; i < 3; i++) q[i] = s[i] + H / 2 * k2[i]; var k3 = f(q, a);
    // k4 = slope at the full step using k3;
    for (i = 0; i < 3; i++) r[i] = s[i] + H * k3[i];     var k4 = f(r, a);
    // new state = old + H/6 (k1 + 2k2 + 2k3 + k4).
    return [0, 1, 2].map(function (i) { return s[i] + H / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]); });
  }
  // g = pen; W, Ht = canvas size; phH = height of the phase-plane area; ri = current stage; st = current state;
  // pts = stored points [t, x, y]; n = steps taken in this stage; running = animating?
  var g, W, Ht, phH, ri = 0, st, pts = [], n = 0, running = false;
  // size(): match the canvas to its size on screen. Returns false if hidden.
  function size() {
    // Pixel density; width on screen; height written in the block at the top of this file.
    var d = window.devicePixelRatio || 1; W = cv.clientWidth; Ht = +cv.getAttribute('height');
    // Stop if not visible yet.
    if (!W) return false;
    // Enlarge the canvas internally by d, keep its displayed height.
    cv.width = W * d; cv.height = Ht * d; cv.style.height = Ht + 'px';
    // Get the pen, scale by d; the phase plane uses all but the bottom 130 px (the x(t) graph goes there). Success.
    g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); phH = Ht - 130; return true;
  }
  // start(): begin the current stage.
  function start() {
    // Initial state (6, 0, 0.02); first stored point at t = 0; step counter 0.
    st = [6, 0, 0.02]; pts = [[0, st[0], st[1]]]; n = 0;
    // Show the stage's title and explanation in the label box.
    lab.innerHTML = REG[ri].t + '<div>' + REG[ri].s + '</div>';
    // Redraw the 5 progress dots, with the current one highlighted (class "on").
    dots.innerHTML = REG.map(function (_, k) { return '<i class="' + (k === ri ? 'on' : '') + '"></i>'; }).join('');
  }
  // sc(): horizontal scale of the phase plane (pixels per unit of x).
  var sc = function () { return Math.min(W, phH * 1.35) / 27; };
  // px(x): x value -> horizontal position (0 at the centre).
  function px(x) { return W / 2 + x * sc(); }
  // py(y): y value -> vertical position (slightly below centre, upwards positive).
  function py(y) { return phH / 2 + 18 - y * (phH / 25); }
  // draw(): the (x, y) phase plane on top and the x(t) time series below.
  function draw() {
    // Clear the canvas.
    g.clearRect(0, 0, W, Ht);
    // phase plane
    // Light grey axes through the origin.
    g.strokeStyle = RULE; g.lineWidth = 1; g.beginPath();
    g.moveTo(px(-13), py(0)); g.lineTo(px(13), py(0)); g.moveTo(px(0), py(-12)); g.lineTo(px(0), py(10)); g.stroke();
    // Axis letters "x" and "y".
    g.fillStyle = MUTED; g.font = '11px sans-serif';
    g.fillText('x', px(13) - 8, py(0) - 6); g.fillText('y', px(0) + 6, py(10) + 10);
    // m = number of stored points; trajectory line width.
    var m = pts.length; g.lineWidth = 1.4;
    // Draw the trajectory segment by segment...
    for (var k = 1; k < m; k++) {
      // ...older parts faint (15% opacity), newest parts solid teal...
      g.strokeStyle = 'rgba(' + TEAL + ',' + (0.15 + 0.85 * k / m).toFixed(3) + ')';
      // ...each segment from the previous point to this one.
      g.beginPath(); g.moveTo(px(pts[k - 1][1]), py(pts[k - 1][2])); g.lineTo(px(pts[k][1]), py(pts[k][2])); g.stroke();
    }
    // Navy dot at the current position.
    var e = pts[m - 1]; g.fillStyle = NAVY; g.beginPath(); g.arc(px(e[1]), py(e[2]), 3.5, 0, 7); g.fill();
    // time series x(t), from t = 0, on a fixed time axis
    // Graph area at the bottom: from x0 to x1 horizontally, top y0, height hh.
    var x0 = 34, x1 = W - 20, y0 = Ht - 106, hh = 82;
    // Its two axes.
    g.strokeStyle = RULE; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y0 + hh); g.lineTo(x1, y0 + hh); g.stroke();
    // TX(t): time -> horizontal position (0 to 120); XY(v): x value -> vertical position.
    var TX = function (t) { return x0 + t / TMAX * (x1 - x0); }, XY = function (v) { return y0 + hh / 2 - v * (hh / 26); };
    // Title "x(t)".
    g.fillStyle = MUTED; g.fillText('x(t)', x0 + 6, y0 + 2);
    // Vertical tick labels −10, 0, 10.
    [-10, 0, 10].forEach(function (v) { g.fillText(v, x0 - 22, XY(v) + 4); });
    // Time tick labels every 20 units.
    for (var t = 0; t <= TMAX; t += 20) g.fillText(t, TX(t) - 4, y0 + hh + 14);
    // "t" at the end of the time axis.
    g.fillText('t', x1 + 8, y0 + hh + 4);
    // The x(t) curve in navy, through all stored points.
    g.strokeStyle = NAVY; g.lineWidth = 1.2; g.beginPath();
    for (k = 0; k < m; k++) { var X = TX(pts[k][0]), Y = XY(pts[k][1]); k ? g.lineTo(X, Y) : g.moveTo(X, Y); }
    g.stroke();
  }
  // hold = pause frames between stages.
  var hold = 0;
  // tick(): one animation frame.
  function tick() {
    // Panel closed: stop.
    if (!cv.offsetParent) { running = false; return; }        // panel closed: stop
    // During the pause: count down, then move to the next stage (looping back to the first after the last).
    if (hold > 0) { if (--hold === 0) { ri = (ri + 1) % REG.length; start(); } }
    // Otherwise:
    else {
      // take PER RK4 steps, storing [t, x, y] after each;
      for (var i = 0; i < PER; i++) { st = rk(st, REG[ri].a); n++; pts.push([n * H, st[0], st[1]]); }
      // when the stage is complete (t = 120), pause 70 frames.
      if (n >= STEPS) hold = 70;                                  // pause briefly on the finished stage
    }
    // Redraw and ask for the next frame.
    draw(); requestAnimationFrame(tick);
  }
  // go(): start from stage 1 when the panel opens (unless already running, hidden, or sizeless).
  function go() { if (running || !cv.offsetParent) return; if (!size()) return; running = true; ri = 0; hold = 0; start(); requestAnimationFrame(tick); }
  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // still(): for reduced motion — show the finished chaotic stage (a = 0.2) as a still picture.
  function still() {                                             // reduced motion: show the chaotic stage, finished, without animating
    // Do nothing if hidden; choose stage 5 (index 4) and set it up.
    if (!cv.offsetParent || !size()) return; ri = 4; start();
    // Compute the whole stage at once, then draw.
    while (n < STEPS) { st = rk(st, REG[ri].a); n++; pts.push([n * H, st[0], st[1]]); } draw();
  }
  // Watch the theme's details panel (id="th-5"); when it opens or closes, call go() (or still()) 30 ms later.
  new MutationObserver(function () { setTimeout(reduce ? still : go, 30); })
    .observe(document.getElementById('th-5'), {attributes: true, attributeFilter: ['hidden']});
  // On window resize: resize the canvas (or redraw the still picture).
  addEventListener('resize', function () { if (running) size(); else if (reduce) still(); });
})();
