/* ==========================================================================
   Infectious disease modelling: agent-based outbreak
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/01-infectious-disease-agents"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/01-infectious-disease-agents"]');
  if (host) host.innerHTML = `
<div class="ab">
  <p>The animation below is a simple agent-based picture of an outbreak. Each dot is a person who moves at random; an infected person can infect a susceptible one on close contact, and recovers after a fixed time. The curves on the right follow the numbers susceptible, infected and recovered, the same quantities that the S, I and R compartments of a model track.</p>
  <!-- ↓ Drawing area for the agent-based outbreak animation. height = its height in pixels. -->
  <div class="ab-box"><canvas id="abCv" height="320" role="img" aria-label="Animation of an outbreak spreading among moving individuals, with the numbers susceptible, infected and recovered plotted over time"></canvas></div>
  <!-- ↓ Colour key: blue = susceptible, red = infected, teal = recovered. -->
  <p class="ab-key"><i style="background:#3B82C4"></i>Susceptible <i style="background:#D9512C"></i>Infected <i style="background:#0E7C7B"></i>Recovered</p>
</div>
`;
})();

/* Agent-based outbreak in the "Infectious disease modelling" panel.
   N people move at random in a box; an infected person infects a susceptible one within distance 11 px
   with probability 0.25 per frame, and recovers after 260 frames. Runs only while the panel is open. */
// Runs once when the script loads.
(function () {
  // cv = the drawing area <canvas id="abCv"> (built at the top of this file); stop if it is missing.
  var cv = document.getElementById('abCv'); if (!cv) return;
  // Model settings: 130 people; contact distance 11 px; infection probability 0.25 per contact per frame; recovery after 260 frames.
  var N = 130, CONTACT = 11, P_INF = 0.25, T_REC = 260;
  // Colours: S = blue, I = red-orange, R = teal; plus navy, grey text and light grey lines.
  var COL = {S: '#3B82C4', I: '#D9512C', R: '#0E7C7B'}, NAVY = '#10203A', MUTED = '#5A6672', RULE = '#D9E0DE';
  // g = drawing pen; W, H = canvas size; bw = width of the box people move in; ag = the people ("agents");
  // hist = S/I/R counts over time (for the graph); t = frame number; hold = pause frames after the outbreak ends; running = animating?
  var g, W, H, bw, ag, hist, t, hold, running = false;
  // size(): match the canvas to its size on screen (sharp on high-resolution screens). Returns false if not visible yet.
  function size() {
    // d = screen pixel density; W = width on screen; H = the height written in the block at the top of this file (height="320"); stop if width is 0 (hidden).
    var d = window.devicePixelRatio || 1; W = cv.clientWidth; H = +cv.getAttribute('height'); if (!W) return false;
    // Make the canvas d times larger internally, keep its displayed height, get the pen, and scale drawing by d.
    cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px'; g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    // The people's box is the full width on phones (< 560 px), otherwise 58% of the width (graph on the right). Success.
    bw = W < 560 ? W : Math.round(W * 0.58); return true;
  }
  // Height of the people's box: on phones 130 px are left at the bottom for the graph.
  function boxH() { return W < 560 ? H - 130 : H; }               // on phones the graph sits below the box
  // reset(): start a new outbreak.
  function reset() {
    // Empty the people list and history, reset the clock and pause.
    var bh = boxH(); ag = []; hist = []; t = 0; hold = 0;
    // Create N people at random positions (10 px from the edges) with small random velocities;
    // the first 2 start infected ('I'), the rest susceptible ('S'); d = days infected so far.
    for (var i = 0; i < N; i++) ag.push({x: Math.random() * (bw - 20) + 10, y: Math.random() * (bh - 20) + 10,
      vx: (Math.random() - .5) * 1.4, vy: (Math.random() - .5) * 1.4, s: i < 2 ? 'I' : 'S', d: 0});
  }
  // step(): advance one frame.
  function step() {
    // Box height; advance the frame counter.
    var bh = boxH(); t++;
    // Move each person by its velocity...
    ag.forEach(function (a) { a.x += a.vx; a.y += a.vy;
      // ...bounce off the walls (reverse direction near an edge)...
      if (a.x < 6 || a.x > bw - 6) a.vx *= -1; if (a.y < 6 || a.y > bh - 6) a.vy *= -1;
      // ...and an infected person recovers ('R') after T_REC frames.
      if (a.s === 'I' && ++a.d > T_REC) a.s = 'R'; });
    // For each infected person...
    ag.forEach(function (a) { if (a.s !== 'I') return;
      // ...every susceptible person closer than CONTACT is infected with probability P_INF.
      ag.forEach(function (b) { if (b.s === 'S' && Math.hypot(a.x - b.x, a.y - b.y) < CONTACT && Math.random() < P_INF) b.s = 'I'; }); });
    // Every 4th frame: count S, I and R and store them for the graph; if nobody is infected any more, pause 150 frames.
    if (t % 4 === 0) { var c = {S: 0, I: 0, R: 0}; ag.forEach(function (a) { c[a.s]++; }); hist.push(c); if (!c.I) hold = 150; }
  }
  // draw(): paint the box of people and the S/I/R graph.
  function draw() {
    // Box height; clear the canvas.
    var bh = boxH(); g.clearRect(0, 0, W, H);
    // Thin grey outline of the box.
    g.strokeStyle = RULE; g.lineWidth = 1; g.strokeRect(0.5, 0.5, bw - 1, bh - 1);
    // Each person as a dot in their state's colour (infected dots slightly bigger).
    ag.forEach(function (a) { g.fillStyle = COL[a.s]; g.beginPath(); g.arc(a.x, a.y, a.s === 'I' ? 4.2 : 3.4, 0, 7); g.fill(); });
    // Graph area: x0–x1 horizontally, y0 (top) – y1 (bottom); below the box on phones, to the right otherwise.
    // L = number of time points across the graph (at least 60, so the curves grow from the left).
    var phone = W < 560, x0 = phone ? 36 : bw + 44, x1 = W - 12, y0 = phone ? bh + 16 : 14, y1 = H - 22, L = Math.max(hist.length, 60);
    // Draw the two axes.
    g.strokeStyle = RULE; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    // Axis numbers: N at the top, 0 at the bottom.
    g.fillStyle = MUTED; g.font = '11px sans-serif'; g.fillText(N, x0 - 26, y0 + 4); g.fillText(0, x0 - 12, y1 + 4);
    // Axis labels "time" and "people".
    g.fillText('time', x1 - 26, y1 + 14); g.fillText('people', x0 + 6, y0 + 4);
    // One line for each of S, I, R, in its colour:
    ['S', 'I', 'R'].forEach(function (s) { g.strokeStyle = COL[s]; g.lineWidth = 2; g.beginPath();
      // through every stored count (m = its position in time): x from time, y from the count.
      hist.forEach(function (h, m) { var X = x0 + (x1 - x0) * m / L, Y = y1 - (y1 - y0) * h[s] / N; m ? g.lineTo(X, Y) : g.moveTo(X, Y); });
      g.stroke(); });
    // Reset the line width.
    g.lineWidth = 1;
  }
  // tick(): one animation frame.
  function tick() {
    // If the panel has been closed (canvas not visible), stop animating.
    if (!cv.offsetParent) { running = false; return; }            // panel closed: stop
    // During the pause after an outbreak, count down and then restart; otherwise advance the model.
    if (hold > 0) { if (--hold === 0) reset(); } else step();
    // Redraw and ask for the next frame.
    draw(); requestAnimationFrame(tick);
  }
  // reduce = visitor prefers reduced motion.
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // go(): start when the panel opens.
  function go() {
    // Do nothing if the canvas is still hidden or has no size.
    if (!cv.offsetParent || !size()) return;
    // New outbreak.
    reset();
    // Reduced motion: run the whole outbreak at once (safety limit 4000 steps) and show the final picture.
    if (reduce) { var guard = 0; while (hold === 0 && guard++ < 4000) step(); draw(); return; }   // still picture of a finished outbreak
    // Otherwise start the frame loop (if not already running).
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  // Watch the theme's details panel (id="th-1"): whenever it is opened or closed (its "hidden" attribute changes),
  // call go() 30 ms later.
  new MutationObserver(function () { setTimeout(go, 30); })
    .observe(document.getElementById('th-1'), {attributes: true, attributeFilter: ['hidden']});
  // If the window is resized while the panel is open, resize the canvas and restart.
  addEventListener('resize', function () { if (cv.offsetParent && size()) reset(); });
})();
