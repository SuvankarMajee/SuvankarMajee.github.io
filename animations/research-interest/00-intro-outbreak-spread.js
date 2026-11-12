/* ==========================================================================
   Intro picture: an outbreak spreading from one person (top of the page)
   Used on: research/research-interest.html
   The picture itself (<figure id="spread"> with its SVG) is built at the top of this file; this script places the
   people, draws the transmission arrows and plays the spread in a loop.
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/00-intro-outbreak-spread"> on the page:
// the framed picture (SVG, 520 × 500 units) and its caption; the code below adds the people and arrows.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/00-intro-outbreak-spread"]');
  if (host) host.innerHTML = `
<figure id="spread" style="margin:0">
<!-- ↓ Rounded frame around the picture. -->
<div class="frame">
<!-- ↓ The picture (SVG, 520 × 500 units). The script adds the people and arrows into <g id="people"> and <g id="arrows"> at the bottom of it. -->
<svg id="scene" viewBox="0 0 520 500" aria-label="Animation of an infection spreading from person to person">
  <!-- ↓ Definitions used by the picture (not drawn directly): colour gradients and the person template. -->
  <defs>
    <!-- ↓ Light-blue background gradient. -->
    <linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#c6e7f7"/><stop offset="1" stop-color="#a6d4ee"/>
    </linearGradient>
    <!-- ↓ Orange gradient for infected people. -->
    <linearGradient id="orangeG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffa53a"/><stop offset="1" stop-color="#ea5a1c"/>
    </linearGradient>
    <!-- ↓ Orange-red gradient for the first case. -->
    <linearGradient id="indexG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff9a2e"/><stop offset="1" stop-color="#ff6a10"/>
    </linearGradient>
    <!-- ↓ Orange-to-red gradient for the arrows. -->
    <linearGradient id="arrowG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="520" y2="500">
      <stop offset="0" stop-color="#ffb02e"/><stop offset="1" stop-color="#e5351c"/>
    </linearGradient>
    <!-- ↓ Glow (orange centre fading to transparent white) behind the first case. -->
    <radialGradient id="haloG">
      <stop offset="0" stop-color="#ff7a10" stop-opacity="1"/>
      <stop offset=".35" stop-color="#ff9a33" stop-opacity=".9"/>
      <stop offset=".6" stop-color="#ffffff" stop-opacity=".85"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <!-- person: centred at (0,0), roughly 100 units tall -->
    <!-- ↓ Person template: a head (circle) and body (path); the script copies it for each person. -->
    <g id="body">
      <circle class="fill" cx="0" cy="-39" r="9.5"/>
      <path class="fill" d="M-12,-26 Q0,-29 12,-26 Q17,-25 18,-19 L20,10 Q20,13 17,13 Q14,13 14,10 L12,-12
               L11,46 Q11,50 7,50 Q3,50 3,46 L2,14 L-2,14 L-3,46 Q-3,50 -7,50 Q-11,50 -11,46 L-12,-12
               L-14,10 Q-14,13 -17,13 Q-20,13 -20,10 L-18,-19 Q-17,-25 -12,-26 Z"/>
    </g>
  </defs>

  <!-- background -->
  <!-- ↓ Background rectangle. -->
  <rect width="520" height="500" fill="url(#bgG)"/>
  <!-- ↓ Faint globe drawn in light blue (decoration). -->
  <g opacity=".35" fill="none" stroke="#7fb6de" stroke-width="7">
    <!-- faint globe -->
    <circle cx="160" cy="330" r="190"/>
    <ellipse cx="160" cy="330" rx="85" ry="190"/>
    <line x1="160" y1="140" x2="160" y2="520"/>
    <path d="M-25,250 Q160,215 345,250"/>
    <path d="M-30,390 Q160,425 350,390"/>
  </g>
  <!-- faint flame -->
  <!-- ↓ Faint flame shape (decoration). -->
  <path opacity=".35" fill="#7fb6de"
        d="M70,240 C30,215 35,170 60,140 C62,165 75,170 82,160 C78,130 95,105 120,95 C110,125 135,150 130,185 C128,215 105,240 70,240 Z"/>

  <!-- glow behind index case -->
  <!-- ↓ Pulsing glow behind the first case (animated by 00-intro-outbreak-spread.css). -->
  <ellipse id="indexGlow" cx="380" cy="212" rx="62" ry="78" fill="url(#haloG)"/>

  <!-- ↓ Empty groups that the script fills with arrows and people. -->
  <g id="arrows"></g>
  <g id="people"></g>
</svg>
</div>
<!-- ↓ Caption under the picture. -->
<figcaption class="cap">How an infection travels from one person to the next</figcaption>
</figure>
`;
})();

// Runs once when the script loads.
(() => {
  // The SVG "namespace" — needed whenever a script creates SVG shapes.
  const NS = "http://www.w3.org/2000/svg";
  // Size of each person figure (82% of the drawn template).
  const S = 0.82;                          // figure scale
  // positions (x, y = figure centre)
  // One entry per person: name: [x, y] in the SVG's coordinates. X = the first case (index case).
  const P = {
    // top row
    a:[100,90],  b:[243,82],  c:[340,82],  d:[400,100], e:[462,78],
    // second row (X is the index case)
    f:[183,128], g:[295,168], X:[380,212],
    // third row
    h:[115,222], i:[243,210], j:[452,232],
    // fourth row
    k:[192,268], l:[310,290],
    // fifth row
    m:[62,330],  n:[262,368], o:[407,372], p:[455,345],
    // bottom row
    q:[115,412], r:[195,412], s:[328,418]
  };
  // transmission tree: [from, to, generation, bend]
  // Who infects whom: [source, new case, generation (1 = infected by X), how much the arrow curves (+/− = which side)].
  const EDGES = [
    // generation 1: X infects g and o
    ["X","g",1,-0.25], ["X","o",1, 0.25],
    // generation 2: g infects b and c; o infects s
    ["g","b",2,-0.15], ["g","c",2, 0.15], ["o","s",2, 0.3],
    // generation 3: s infects r
    ["s","r",3, 0.3],
    // generation 4: r infects q
    ["r","q",4, 0.25],
    // generation 5: q infects k
    ["q","k",5,-0.35],
    // generation 6: k infects h
    ["k","h",6, 0.2]
  ];

  // people[name] = that person's figure; rings[name] = their pulse ring.
  const people = {}, rings = {};
  // The two empty groups in the SVG where people and arrows are added.
  const gPeople = document.getElementById("people"), gArrows = document.getElementById("arrows");
  // For each person (id = name, x, y = position):
  for (const [id,[x,y]] of Object.entries(P)){
    // create a group <g> for the figure;
    const g = document.createElementNS(NS,"g");
    // class "person" (plus "index" for X) — colours come from 00-intro-outbreak-spread.css;
    g.setAttribute("class","person" + (id === "X" ? " index" : ""));
    // move it to (x, y) and scale it;
    g.setAttribute("transform",`translate(${x},${y}) scale(${S})`);
    // copy the shapes of the person template (<g id="body"> in the SVG) into it;
    for (const ch of document.getElementById("body").children) g.appendChild(ch.cloneNode(true));
    // add it to the picture and remember it.
    gPeople.appendChild(g); people[id] = g;
    // Create the person's pulse ring (a circle of radius 34 at the same spot)...
    const ring = document.createElementNS(NS,"circle");
    ring.setAttribute("class","ring"); ring.setAttribute("cx",x); ring.setAttribute("cy",y); ring.setAttribute("r",34);
    // ...placed behind the figure, and remember it.
    gPeople.insertBefore(ring, g); rings[id] = ring;
  }

  // build arrows (curved quadratic Béziers, trimmed at both ends)
  // For each transmission (f = from, t = to, gen = generation, bend = curvature), build one arrow:
  const arrows = EDGES.map(([f,t,gen,bend]) => {
    // start and end person positions;
    const [x1,y1] = P[f], [x2,y2] = P[t];
    // direction (dx, dy), length L, and unit direction (ux, uy) between them;
    const dx = x2-x1, dy = y2-y1, L = Math.hypot(dx,dy), ux = dx/L, uy = dy/L;
    // trim to an ellipse around each (tall, narrow) figure
    // distance from a figure's centre to the edge of an a×b ellipse, in this direction;
    const ell = (a,b) => 1/Math.hypot(ux/a, uy/b);
    // so the arrow starts just outside the source figure and ends just outside the target figure;
    const trimA = ell(22,40), trimB = ell(26,46);
    // start point (sx, sy) and end point (ex, ey) after trimming;
    const sx = x1+ux*trimA, sy = y1+uy*trimA, ex = x2-ux*trimB, ey = y2-uy*trimB;
    // control point (mx, my): the midpoint pushed sideways by "bend", which makes the curve;
    const mx = (sx+ex)/2 - uy*bend*L, my = (sy+ey)/2 + ux*bend*L;
    // create the curved line (an SVG path) with class "arrow";
    const path = document.createElementNS(NS,"path");
    path.setAttribute("class","arrow");
    // "M start Q control end" = a quadratic Bézier curve;
    path.setAttribute("d",`M${sx},${sy} Q${mx},${my} ${ex},${ey}`);
    gArrows.appendChild(path);
    // hide the line by "dashing" it with one dash as long as the line, shifted fully away
    // (moving the offset to 0 later makes the line appear to draw itself);
    const len = path.getTotalLength();
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    // arrow head oriented along end tangent
    // angle of the curve at its end, in degrees;
    const ang = Math.atan2(ey-my, ex-mx) * 180/Math.PI;
    // create the arrow head (a small triangle) with class "head";
    const head = document.createElementNS(NS,"path");
    head.setAttribute("class","head");
    head.setAttribute("d","M0,0 L-13,-7.5 L-10,0 L-13,7.5 Z");
    // place it at the end point, turned to follow the curve;
    head.setAttribute("transform",`translate(${ex},${ey}) rotate(${ang})`);
    gArrows.appendChild(head);
    // keep everything needed to animate this arrow.
    return {f,t,gen,path,head,len};
  });

  // ---------- timeline ----------
  // Seconds between generations, and seconds for one arrow to draw.
  const GEN_GAP = 1.25, DRAW = 0.8;          // seconds
  // The last generation number (6).
  const lastGen = Math.max(...EDGES.map(e=>e[2]));
  // Length of one full loop in seconds: start delay + all generations + 3 s pause.
  const CYCLE = 1.0 + lastGen*GEN_GAP + 3.0; // pause at the end, then restart
  // t = time within the loop; last = time of the previous frame; paused = frozen (reduced motion).
  let t = 0, last = null, paused = false;
  // For each arrow, how far it has got: 0 = not started, 1 = drawing, 2 = done.
  const state = new Map();                    // edge -> stage reached

  // resetScene(): back to the start — only X infected, no arrows.
  function resetScene(){
    // For each arrow:
    arrows.forEach(a => {
      // hide the line instantly (no transition);
      a.path.style.transition = "none"; a.path.style.strokeDashoffset = a.len;
      // hide its head and mark it "not started".
      a.head.classList.remove("on"); state.set(a,0);
    });
    // Everyone except X becomes healthy again.
    Object.entries(people).forEach(([id,g]) => { if (id !== "X") g.classList.remove("infected"); });
    // Stop all pulse rings.
    Object.values(rings).forEach(r => r.classList.remove("go"));
    // Arrows group fully visible.
    gArrows.style.opacity = 1;
  }

  // tick(now): called before every screen refresh; now = time in milliseconds.
  function tick(now){
    // First call: start the clock.
    if (last === null) last = now;
    // dt = seconds since the previous frame.
    const dt = (now - last)/1000; last = now;
    // Unless frozen:
    if (!paused){
      // advance the loop clock;
      t += dt;
      // at the end of a loop, start again from scratch;
      if (t >= CYCLE){ t = 0; resetScene(); }
      // for each arrow:
      for (const a of arrows){
        // when it should start drawing (generation 1 at 0.8 s, then every 1.25 s);
        const start = 0.8 + (a.gen-1)*GEN_GAP;
        // how far it has got;
        const st = state.get(a);
        // time to start drawing it:
        if (st === 0 && t >= start){
          // animate the dash offset to 0 over 0.8 s (the line draws itself);
          a.path.style.transition = `stroke-dashoffset ${DRAW}s ease-in-out`;
          // (forces the browser to register the starting point before animating)
          a.path.getBoundingClientRect();     // flush
          a.path.style.strokeDashoffset = 0;
          state.set(a,1);
        }
        // line almost finished:
        if (st === 1 && t >= start + DRAW*0.9){
          // show the arrow head;
          a.head.classList.add("on");
          // the target person turns orange (infected);
          people[a.t].classList.add("infected");
          // restart their pulse ring (remove the class, force a refresh, add it again).
          const r = rings[a.t]; r.classList.remove("go"); void r.getBBox(); r.classList.add("go");
          state.set(a,2);
        }
      }
    }
    // ask to be called again next frame.
    requestAnimationFrame(tick);
  }


  // Start from the initial scene.
  resetScene();
  // Reduced motion: show the finished spread as a still picture.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches){   // show the finished spread, without motion
    // all arrows drawn, all heads shown, all targets infected;
    t = CYCLE - 3.05; arrows.forEach(a => { a.path.style.strokeDashoffset = 0; a.head.classList.add("on"); people[a.t].classList.add("infected"); state.set(a,2); });
    // and freeze.
    paused = true;
  }
  // Start the frame loop.
  requestAnimationFrame(tick);
})();
