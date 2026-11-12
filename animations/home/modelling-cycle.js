/* ==========================================================================
   Home page: "the modelling cycle"
   Used on: index.html, where the page has <div data-anim="home/modelling-cycle"></div> (next to "About me")
   Comments starting with // explain the line(s) directly below them.

   The nine stages of the modelling workflow sit on a circle, in an order that
   respects every arrow of the original flowchart (a topological order):
     Biological question -> Experiments and data -> Mathematical model -> Fitting to data
     -> Mathematical analysis -> Parameter estimation -> Expected outcomes
     -> Simulation and sensitivity analysis -> Biological interpretation,
   and the dashed arrow from "Biological interpretation" back to "Biological question"
   closes the cycle: results raise new questions.
   Green = biology, blue = mathematics (as in the flowchart).
   The highlight moves one stage every 2.5 s and the caption explains that stage.
   Runs only while the diagram is on screen.
   ========================================================================== */
(function () {
  // host = the empty <div data-anim="home/modelling-cycle"> on the page; stop if it is missing.
  var host = document.querySelector('[data-anim~="home/modelling-cycle"]'); if (!host) return;
  // Build the figure inside it: the drawing area and the caption under it.
  host.innerHTML =
    '<figure class="mc" aria-label="The modelling cycle: from a biological question, through data, models, analysis, parameter estimation and simulation, to biological interpretation and new questions">' +
      '<canvas id="mcCv" role="img" aria-label="Diagram of the modelling cycle with nine stages on a circle"></canvas>' +
      '<p class="mc-cap" id="mcCap"><b>The modelling cycle.</b> From a biological question, through data, models and analysis, to biological interpretation and new questions.</p>' +
    '</figure>';
  // cv = the drawing area; cap = the caption under it.
  var cv = document.getElementById('mcCv'), cap = document.getElementById('mcCap');
  // Colours: navy (highlight), mint (moving dots), grey ring; biology (green) and mathematics (blue) box colours.
  var NAVY = '#10203A', MINT = '#7FD1BE', RING = '#C7D1DA',
      BIO = {f: '#E6F2CC', s: '#7FA51C', t: '#3D5410'}, MATH = {f: '#DDEAF6', s: '#4A7FB5', t: '#1C3E66'};
  // The stages, in workflow order: label lines, colour, caption.
  var ST = [
    {l: ['Biological', 'question'],      k: BIO,  c: 'Start from a question about a disease or a population.'},
    {l: ['Experiments', 'and data'],     k: BIO,  c: 'Collect case reports and experimental or field data.'},
    {l: ['Mathematical', 'model'],       k: MATH, c: 'Translate the biology into equations: ordinary, fractional, delay, stochastic or reaction–diffusion models.'},
    {l: ['Fitting', 'to data'],          k: MATH, c: 'Fit the model to the observed data.'},
    {l: ['Mathematical', 'analysis'],    k: MATH, c: 'Analyse the model: equilibria, R₀, stability and bifurcations.'},
    {l: ['Parameter', 'estimation'],     k: MATH, c: 'Estimate the unknown parameters, for example with a genetic algorithm.'},
    {l: ['Expected', 'outcomes'],        k: MATH, c: 'Predict the expected outcomes from the analysis and the fitted parameters.'},
    {l: ['Simulation,', 'sensitivity'],  k: MATH, c: 'Simulate scenarios and test which parameters matter most.'},
    {l: ['Biological', 'interpretation'], k: BIO, c: 'Interpret the results biologically, to guide control and public health — and ask new questions.'}
  ];
  // m = number of stages; STEP = frames per stage (about 2.5 s); t = frame counter; act = highlighted stage.
  var m = ST.length, STEP = 150, t = 0, act = -1, g, W, H, cx, cy, R, bw, bh, fs, running = false, onScreen = false;
  // ang(i): angle of stage i. Stage 0 sits at the left (180°); stages follow clockwise, 40° apart,
  // so the three biology stages (8, 0, 1) are together on the left and mathematics fills the rest.
  function ang(i) { return Math.PI + i * 2 * Math.PI / m; }
  // pos(a): point of the ring at angle a.
  function pos(a) { return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; }
  // size(): match the canvas to its box (square), sharp on high-resolution screens, and size the boxes to their text.
  function size() {
    var d = window.devicePixelRatio || 1; W = cv.clientWidth; if (!W) return false; H = W;
    cv.width = W * d; cv.height = H * d; cv.style.height = H + 'px'; g = cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0);
    // Font size: 11.5 px on wide screens, down to 9.5 px on phones.
    fs = Math.max(9.5, Math.min(11.5, W / 38)); g.font = '500 ' + fs + 'px sans-serif';
    // Box width = widest label + padding; box height = two lines.
    var tw = 0; ST.forEach(function (s) { tw = Math.max(tw, g.measureText(s.l[0]).width, g.measureText(s.l[1]).width); });
    bw = Math.ceil(tw) + 12; bh = Math.round(fs * 3.2);
    // Ring radius: as large as fits (box inside the canvas), at most 0.36 of the width.
    cx = W / 2; cy = H / 2; R = Math.min(W * 0.36, W / 2 - bw / 2 - 4); return true;
  }
  // inBox(p, i): is point p inside box i (with a 5 px margin)? Used to start/stop arcs at the box edges.
  function inBox(p, i) { var q = pos(ang(i)); return Math.abs(p[0] - q[0]) < bw / 2 + 5 && Math.abs(p[1] - q[1]) < bh / 2 + 5; }
  // arc(i, col, dashed): ring arc from box i to box i+1 (clockwise) with an arrowhead touching box i+1.
  function arc(i, col, dashed) {
    var a0 = ang(i), a1 = ang(i + 1), da = 0.004;
    // Move the start out of box i and the end out of box i+1.
    while (a0 < a1 && inBox(pos(a0), i)) a0 += da;
    while (a1 > a0 && inBox(pos(a1), (i + 1) % m)) a1 -= da;
    if (a1 - a0 < 0.02) return;                                              // boxes touch: no room for an arc
    g.strokeStyle = col; g.lineWidth = dashed ? 1.6 : 1.8; g.setLineDash(dashed ? [5, 4] : []);
    g.beginPath(); g.arc(cx, cy, R, a0, a1 - 0.02); g.stroke(); g.setLineDash([]);
    // Arrowhead at the end, pointing along the ring (clockwise tangent).
    var p = pos(a1), dir = a1 + Math.PI / 2;
    g.fillStyle = col; g.beginPath(); g.moveTo(p[0], p[1]);
    g.lineTo(p[0] - 8 * Math.cos(dir - 0.42), p[1] - 8 * Math.sin(dir - 0.42)); g.lineTo(p[0] - 8 * Math.cos(dir + 0.42), p[1] - 8 * Math.sin(dir + 0.42)); g.fill();
  }
  // draw(): the whole picture for the current frame.
  function draw() {
    g.clearRect(0, 0, W, H); g.textAlign = 'center';
    // Arcs between consecutive stages; the last one (interpretation -> question) is the dashed feedback arrow.
    for (var i = 0; i < m; i++) arc(i, i === m - 1 ? '#7FA51C' : '#9AA9B7', i === m - 1);
    // "new questions", inside the ring next to the feedback arrow.
    var fp = [cx + (R - 26) * Math.cos(ang(-0.5)), cy + (R - 26) * Math.sin(ang(-0.5))];
    g.fillStyle = '#5B7A14'; g.font = 'italic ' + fs + 'px sans-serif'; g.textAlign = 'left'; g.fillText('new questions', fp[0] + 4, fp[1] + 4); g.textAlign = 'center';
    // Dots travelling clockwise along the ring (drawn under the boxes).
    for (var j = 0; j < 5; j++) { var q = pos(ang(0) + ((t / 600 + j / 5) % 1) * 2 * Math.PI); g.fillStyle = MINT; g.beginPath(); g.arc(q[0], q[1], 3.5, 0, 7); g.fill(); }
    // Centre labels: biology on the left, mathematics on the right.
    g.font = '600 ' + (fs + 2) + 'px sans-serif'; g.fillStyle = BIO.t; g.fillText('Biology', cx - R * 0.40, cy - 4);
    g.fillStyle = MATH.t; g.fillText('Mathematics', cx + R * 0.22, cy - 4);
    // The stage boxes; the highlighted one is navy with white text.
    ST.forEach(function (s, i) {
      var p = pos(ang(i)), on = i === act;
      g.fillStyle = on ? NAVY : s.k.f; g.strokeStyle = on ? NAVY : s.k.s; g.lineWidth = on ? 2 : 1.3;
      g.beginPath(); g.roundRect(p[0] - bw / 2, p[1] - bh / 2, bw, bh, 7); g.fill(); g.stroke();
      g.fillStyle = on ? '#fff' : s.k.t; g.font = (on ? '600 ' : '500 ') + fs + 'px sans-serif';
      g.fillText(s.l[0], p[0], p[1] - fs * 0.25); g.fillText(s.l[1], p[0], p[1] + fs * 1.05);
    });
    g.textAlign = 'left';
  }
  // setStage(i): highlight stage i and show its caption.
  function setStage(i) { act = i; cap.innerHTML = '<b>' + (i + 1) + '. ' + ST[i].l.join(' ').replace(',', '') + '.</b> ' + ST[i].c; }
  // tick(): one frame; stops when the diagram is off screen.
  function tick() {
    if (!onScreen) { running = false; return; }
    t++; if (t % STEP === 1) setStage(Math.floor(t / STEP) % m);
    draw(); requestAnimationFrame(tick);
  }
  // Reduced motion: a still picture with the first stage highlighted (the caption still explains it).
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Start/stop as the diagram scrolls into and out of view.
  new IntersectionObserver(function (e) {
    onScreen = e[0].isIntersecting;
    if (!onScreen || !size()) return;
    if (reduce) { setStage(0); draw(); return; }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }).observe(cv);
  // Redraw at the new size when the window is resized.
  addEventListener('resize', function () { if (size()) draw(); });
})();
