/* ==========================================================================
   Delay differential equations: delayed SIRS flow diagram
   Used on: research/research-interest.html
   The diagram itself (<svg id="dde-dia">: boxes, arrows, clock, inset) is built at the top of this file;
   this script solves the delayed model and moves little "person" tokens along the arrows.
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Build this animation's block inside <div data-anim="research-interest/07-delay-sirs-diagram"> on the page:
// the explanation, the model's equations and the drawing area.
(function () {
  var host = document.querySelector('[data-anim~="research-interest/07-delay-sirs-diagram"]');
  if (host) host.innerHTML = `
<div class="dde">
  <p>The animation shows a delayed SIRS model in which new infections at time <i>t</i> depend on the number infected at time <i>t</i> &minus; &tau;:</p>
  <!-- ↓ The model's equations, centred. -->
  <p class="dde-eq"><i>S</i>&prime;(<i>t</i>) = <i>rS</i>(1 &minus; <i>S</i>/<i>K</i>) &minus; &beta;<i>S</i>(<i>t</i>)<i>I</i>(<i>t</i> &minus; &tau;)/(1 + &eta;<i>S</i>(<i>t</i>)) &minus; <i>dS</i> + &sigma;<i>R</i>,<br>
  <i>I</i>&prime;(<i>t</i>) = &beta;<i>S</i>(<i>t</i>)<i>I</i>(<i>t</i> &minus; &tau;)/(1 + &eta;<i>S</i>(<i>t</i>)) &minus; (<i>d</i> + &delta; + <i>m</i>)<i>I</i>,<br>
  <i>R</i>&prime;(<i>t</i>) = <i>mI</i> &minus; (<i>d</i> + &sigma;)<i>R</i>,</p>
  <p>with logistic growth of susceptibles (<i>r</i> = 1, <i>K</i> = 100), saturated incidence (&beta; = 0.05, &eta; = 0.02), natural death <i>d</i> = 0.1, disease death &delta; = 0.1, recovery <i>m</i> = 0.2, loss of immunity &sigma; = 0.1 and incubation delay &tau; = 6. Each moving figure stands for a small share of the flow along that arrow, so busier arrows carry larger flows; the bar under each box shows its current size. The clock on the S&nbsp;&rarr;&nbsp;I arrow marks the incubation period, and the inset shows a contact that leads to infection &tau; days later.</p>
  <!-- ↓ White card holding the diagram. -->
  <div class="dde-card">
<!-- ============ ANIMATION PICTURE: drawn here, animated by animations/research-interest/07-delay-sirs-diagram.js ==== -->
<!-- ↓ The delayed-SIRS diagram (SVG). The comments inside it label each part: arrows (flow paths), clock, boxes S/I/R, contacts, inset, and the token layer used by the script. -->
<svg id="dde-dia" viewBox="0 20 1000 520" aria-label="Animated SIRS compartment diagram">
<defs>
<marker id="dde-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="#1b2440"/>
</marker>
<marker id="dde-ahb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
  <path d="M0,0 L10,5 L0,10 z" fill="#4472c4"/>
</marker>
<linearGradient id="dde-tileG" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#6f8fd6"/><stop offset="1" stop-color="#2c4a8f"/>
</linearGradient>
<linearGradient id="dde-tileIn" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#4d6cb8"/><stop offset="1" stop-color="#3a5aa3"/>
</linearGradient>
<filter id="dde-glow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<g id="dde-person">
  <circle cx="0" cy="-12" r="4.6"/>
  <path d="M-5.5,-6.2 h11 a1.6,1.6 0 0 1 1.6,1.6 v9.2 h-2.6 v9.4 h-3 v-8 h-1 v8 h-3 v-9.4 h-2.6 v-9.2 a1.6,1.6 0 0 1 1.6,-1.6z"/>
</g>
</defs>

<!-- ===== Flow paths (also used for token motion) ===== -->
<g fill="none" stroke="#1b2440" stroke-width="1.8">
<path id="dde-pBirth" d="M265,285 L265,212" marker-end="url(#dde-ah)"/>
<path id="dde-pDS"    d="M265,98 L265,28"   marker-end="url(#dde-ah)"/>
<path id="dde-pDR"    d="M820,98 L820,28"   marker-end="url(#dde-ah)"/>
<path id="dde-pRS"    d="M688,155 L412,155" marker-end="url(#dde-ah)"/>
<path id="dde-pSI"    d="M270,212 L470,328" marker-end="url(#dde-ah)"/>
<path id="dde-pIR"    d="M650,328 L800,212" marker-end="url(#dde-ah)"/>
<path id="dde-pDI"    d="M560,442 L560,515" marker-end="url(#dde-ah)"/>
</g>

<!-- ===== Flow labels ===== -->
<!-- incubation clock on the S->I arrow -->
<g id="dde-clock" transform="translate(330,300)">
<circle r="17" fill="#fff" stroke="#c9cfdd" stroke-width="1.5"/>
<path id="dde-clockArc" d="" fill="#f4a63a" opacity=".85"/>
<line id="dde-clockHand" x1="0" y1="0" x2="0" y2="-13" stroke="#1b2440" stroke-width="1.8" stroke-linecap="round"/>
<circle r="2" fill="#1b2440"/>
<text x="0" y="36" text-anchor="middle" style="font-size:12px;fill:#5b6478">incubation</text>
</g>

<!-- ===== Compartments ===== -->
<!-- S -->
<g id="dde-boxS">
<rect x="150" y="100" width="260" height="110" rx="16" fill="#fff" stroke="#1b2440" stroke-width="2.2"/>
<rect id="dde-fillS" x="152" y="206" width="0" height="2.5" fill="#22b14c" rx="1"/>
<g transform="translate(160,112)">
  <rect width="80" height="80" rx="4" fill="url(#dde-tileG)"/>
  <rect x="10" y="10" width="60" height="60" fill="url(#dde-tileIn)" stroke="#203a74" stroke-width="1"/>
  <text x="40" y="58" text-anchor="middle" style="font:700 46px Georgia,serif;fill:#fff">S</text>
</g>
<text class="boxlbl" x="252" y="146" fill="#22b14c">Healthy &amp;</text>
<text class="boxlbl" x="252" y="168" fill="#22b14c">Susceptible</text>
<use href="#dde-person" transform="translate(372,160) scale(2.4)" fill="#22b14c"/>
</g>
<!-- R -->
<g id="dde-boxR">
<rect x="690" y="100" width="260" height="110" rx="16" fill="#fff" stroke="#1b2440" stroke-width="2.2"/>
<rect id="dde-fillR" x="692" y="206" width="0" height="2.5" fill="#6aa3d8" rx="1"/>
<g transform="translate(700,112)">
  <rect width="80" height="80" rx="4" fill="url(#dde-tileG)"/>
  <rect x="10" y="10" width="60" height="60" fill="url(#dde-tileIn)" stroke="#203a74" stroke-width="1"/>
  <text x="40" y="58" text-anchor="middle" style="font:700 46px Georgia,serif;fill:#fff">R</text>
</g>
<text class="boxlbl" x="790" y="146" fill="#6c8fb3">Recovered</text>
<text class="boxlbl" x="790" y="168" fill="#6c8fb3">(Immune)</text>
<use href="#dde-person" transform="translate(912,160) scale(2.4)" fill="#b9d3ee" stroke="#5a7fa8" stroke-width=".5"/>
</g>
<!-- I -->
<g id="dde-boxI">
<rect id="dde-glowI" x="430" y="330" width="260" height="110" rx="16" fill="#ffd6d4" opacity="0" filter="url(#dde-glow)"/>
<rect x="430" y="330" width="260" height="110" rx="16" fill="#fff" stroke="#1b2440" stroke-width="2.2"/>
<rect id="dde-fillI" x="432" y="436" width="0" height="2.5" fill="#e0201b" rx="1"/>
<g transform="translate(440,342)">
  <rect width="80" height="80" rx="4" fill="url(#dde-tileG)"/>
  <rect x="10" y="10" width="60" height="60" fill="url(#dde-tileIn)" stroke="#203a74" stroke-width="1"/>
  <text x="40" y="58" text-anchor="middle" style="font:700 46px Georgia,serif;fill:#fff">I</text>
</g>
<text class="boxlbl" x="530" y="376" fill="#e0201b">Infected &amp;</text>
<text class="boxlbl" x="530" y="398" fill="#e0201b">Infectious</text>
<use id="dde-iPerson" href="#dde-person" transform="translate(655,390) scale(2.4)" fill="#e0201b"/>
</g>

<!-- infectious spread from I to contacts -->
<g id="dde-spread">
<path d="M672,390 L718,352" stroke="#4472c4" stroke-width="1.6" fill="none" marker-end="url(#dde-ahb)" class="sp"/>
<path d="M672,392 L718,392" stroke="#4472c4" stroke-width="1.6" fill="none" marker-end="url(#dde-ahb)" class="sp"/>
<path d="M672,394 L718,432" stroke="#4472c4" stroke-width="1.6" fill="none" marker-end="url(#dde-ahb)" class="sp"/>
<use class="contact" href="#dde-person" transform="translate(738,345) scale(1.9)" fill="#22b14c"/>
<use class="contact" href="#dde-person" transform="translate(738,392) scale(1.9)" fill="#22b14c"/>
<use class="contact" href="#dde-person" transform="translate(738,440) scale(1.9)" fill="#22b14c"/>
</g>

<!-- ===== Inset: contact -> tau days -> both infected ===== -->
<g id="dde-inset" transform="translate(70,370)">
<path d="M22,-8 C34,-26 52,-26 64,-8" fill="none" stroke="#2f4f8f" stroke-width="1.6" marker-end="url(#dde-ahb)"/>
<path d="M64,22 C52,40 34,40 22,22" fill="none" stroke="#2f4f8f" stroke-width="1.6" marker-end="url(#dde-ahb)"/>
<use id="dde-inA" href="#dde-person" transform="translate(28,12) scale(2)" fill="#22b14c"/>
<use href="#dde-person" transform="translate(60,12) scale(2)" fill="#e0201b"/>
<line x1="85" y1="12" x2="225" y2="12" stroke="#cfd6e6" stroke-width="7"/>
<line id="dde-inBar" x1="85" y1="12" x2="85" y2="12" stroke="#3d5fa8" stroke-width="7"/>
<path d="M225,4 L240,12 L225,20 z" fill="#3d5fa8"/>
<text x="155" y="0" text-anchor="middle" style="font:700 14px 'Segoe UI',sans-serif;fill:#1b2440"><tspan font-style="italic" font-family="Cambria Math,Times New Roman,serif" font-size="17">τ</tspan> days after</text>

<use id="dde-inC" href="#dde-person" transform="translate(262,12) scale(2)" fill="#22b14c" opacity=".25"/>
<use id="dde-inD" href="#dde-person" transform="translate(292,12) scale(2)" fill="#e0201b" opacity=".25"/>
</g>

<!-- token layer -->
<g id="dde-tokens"></g>
</svg>
  </div>
</div>
`;
})();

/* Delayed SIRS flow diagram in the "Delay differential equations" panel (runs only while the panel is open). */
// Runs once when the script loads.
(() => {
  // ---------------- Model ----------------
  // Parameters: logistic growth r, capacity K, natural death d, saturation η, recovery m, disease death δ,
  // transmission β, loss of immunity σ, and the delay τ (days).
  const P = { r:1, K:100, d:0.1, eta:0.02, m:0.2, delta:0.1, beta:0.05, sigma:0.1, tau:6 };
  // Euler time step, and the constant value of I used for the history before t = 0.
  const DT = 0.01, I_HIST = 5;
  // Current S, I, R, time t, and hist = past values of I (needed for I(t − τ)).
  let S, I, R, t, hist;
  // reset(): back to the starting state.
  function reset(){
    // S = 60, I = 5, R = 0 at t = 0, empty history.
    S = 60; I = I_HIST; R = 0; t = 0; hist = [];
    // Remove all moving tokens from the diagram.
    tokens.forEach(k => k.el.remove()); tokens.length = 0;
    // Reset the token counters.
    for (const k in acc) acc[k] = 0;
  }
  // Idelayed(): the value of I(t − τ).
  function Idelayed(){
    // lag = τ in steps; n = position of t − τ in the history.
    const lag = Math.round(P.tau / DT), n = hist.length - lag;
    // If t − τ is before the start, use the constant initial history.
    return n >= 0 ? hist[n] : I_HIST;          // constant initial history
  }
  // fluxes(Id): the rate of each flow in the diagram, given I(t − τ) = Id.
  function fluxes(Id){
    // incidence = β S(t) I(t − τ) / (1 + η S(t))  (saturated incidence with delay).
    const inc = P.beta * S * Id / (1 + P.eta * S);
    return {
      // births = logistic growth r S (1 − S/K), not negative;
      birth: Math.max(P.r * S * (1 - S / P.K), 0),
      // deaths of S, infections, recoveries m I, deaths of I (natural + disease);
      dS: P.d * S, inc, rec: P.m * I, dI: (P.d + P.delta) * I,
      // loss of immunity σ R (R → S), and deaths of R.
      wane: P.sigma * R, dR: P.d * R
    };
  }
  // step(): one Euler step of the delayed SIRS model; returns the flows (used to release tokens).
  function step(){
    // I(t − τ).
    const Id = Idelayed();
    // Store the current I in the history.
    hist.push(I);
    // Trim the history now and then so it does not grow for ever (still longer than τ needs).
    if (hist.length > 4000) hist.splice(0, hist.length - 2000);   // keep ≥ max τ / DT = 1500
    // All flows at this moment.
    const f = fluxes(Id);
    // Logistic growth term.
    const logi = P.r * S * (1 - S / P.K);
    // S' = r S (1 − S/K) − incidence − d S + σ R
    const dS = logi - f.inc - f.dS + f.wane;
    // I' = incidence − (d + δ + m) I
    const dI = f.inc - (P.d + P.delta + P.m) * I;
    // R' = m I − (d + σ) R
    const dR = f.rec - (P.d + P.sigma) * R;
    // Euler update (values kept ≥ 0).
    S = Math.max(S + DT * dS, 0); I = Math.max(I + DT * dI, 0); R = Math.max(R + DT * dR, 0);
    // Advance time.
    t += DT;
    return f;
  }

  // ---------------- Tokens ----------------
  // The SVG "namespace" — needed when a script creates SVG shapes.
  const NS = "http://www.w3.org/2000/svg";
  // The SVG group where moving tokens are placed.
  const layer = document.getElementById("dde-tokens");
  // Shortcut: path("id") = the element with that id.
  const path = id => document.getElementById(id);
  // Colours as [red, green, blue]: green (S), red (I), blue (R), grey (death), orange (in incubation).
  const G = [34,177,76], Rd = [224,32,27], B = [156,195,230], Gy = [150,150,150], Or = [244,166,58];
  // For each flow: the SVG path tokens follow (p), the colours they change through (c),
  // whether they fade in/out, and how long the trip takes in seconds (dur).
  const ROUTES = {
    // births: appear (fade in) and walk into S, green;
    birth: { p:"dde-pBirth", c:[G,G],     fadeIn:true,  dur:1.3 },
    // deaths from S: green to grey, fading out;
    dS:    { p:"dde-pDS",    c:[G,Gy],    fadeOut:true, dur:1.3 },
    // infections S → I: green, orange (incubating), red; the trip time grows with τ;
    inc:   { p:"dde-pSI",    c:[G,Or,Rd], dur:null },              // duration tied to τ
    // recoveries I → R: red to blue;
    rec:   { p:"dde-pIR",    c:[Rd,B],    dur:1.6 },
    // deaths from I: red to grey, fading out;
    dI:    { p:"dde-pDI",    c:[Rd,Gy],   fadeOut:true, dur:1.3 },
    // loss of immunity R → S: blue to green;
    wane:  { p:"dde-pRS",    c:[B,G],     dur:2.2 },
    // deaths from R: blue to grey, fading out.
    dR:    { p:"dde-pDR",    c:[B,Gy],    fadeOut:true, dur:1.3 },
  };
  // How many people one token represents on each route (bigger = fewer tokens).
  const UNIT = { birth:2, dS:2, inc:2.7, rec:2, dI:2, wane:1.7, dR:1.7 }; // population per token
  // acc[route] = people accumulated on that route since the last token was released (starts at 0).
  const acc = {}; Object.keys(ROUTES).forEach(k => acc[k] = 0);
  // List of tokens currently moving.
  const tokens = [];
  // Length of each route's path (measured once).
  const lens = {}; Object.values(ROUTES).forEach(r => lens[r.p] = path(r.p).getTotalLength());
  // lerp(a, b, u): the value a fraction u of the way from a to b.
  const lerp = (a,b,u) => a + (b - a) * u;
  // colorAt(colours, u): colour a fraction u (0–1) of the way through a list of colours.
  function colorAt(cs, u){
    // which pair of colours we are between (i), and how far between them (v);
    const seg = (cs.length - 1) * u, i = Math.min(Math.floor(seg), cs.length - 2), v = seg - i;
    // blend each of red, green, blue;
    const c = cs[i].map((x,j) => Math.round(lerp(x, cs[i+1][j], v)));
    // as a CSS colour, e.g. "rgb(200,120,40)".
    return `rgb(${c})`;
  }
  // spawn(kind, now): release a new token on route "kind".
  function spawn(kind, now){
    // The route's settings.
    const r = ROUTES[kind];
    // How many tokens are already on this route...
    const active = tokens.filter(k => k.kind === kind).length;
    // ...at most 8 at a time, to keep the picture clear.
    if (active > 7) return;
    // Create an SVG <use> element that copies the little person shape (#dde-person, defined in the SVG at the top of this file)...
    const el = document.createElementNS(NS, "use");
    el.setAttribute("href", "#dde-person");
    // ...and add it to the token layer.
    layer.appendChild(el);
    // Trip time: the route's own, or for infections 1 + 0.22 τ seconds (longer delay = slower walk).
    const dur = r.dur ?? (1.0 + 0.22 * P.tau);
    // Remember the token: route, element, start time, duration, and a small random sideways offset.
    tokens.push({ kind, el, t0: now, dur, jitter: (Math.random() - .5) * 6 });
  }
  // drawTokens(now): move every token to its current place.
  function drawTokens(now){
    // Go through the tokens from last to first (so finished ones can be removed safely).
    for (let n = tokens.length - 1; n >= 0; n--){
      // k = the token, r = its route.
      const k = tokens[n], r = ROUTES[k.kind];
      // u = how far through its trip it is (0 to 1).
      const u = (now - k.t0) / k.dur;
      // Trip finished: remove it.
      if (u >= 1){ k.el.remove(); tokens.splice(n, 1); continue; }
      // e = eased progress (slightly slower at the ends, never stopping).
      const e = u - Math.sin(2 * Math.PI * u) / (2 * Math.PI) * 0.35;   // gentle ease, no stalling
      // pt = point on the path at that progress; pt2 = a point 1 unit further on (gives the direction).
      const pt = path(r.p).getPointAtLength(e * lens[r.p]);
      const pt2 = path(r.p).getPointAtLength(Math.min(e * lens[r.p] + 1, lens[r.p]));
      // (nx, ny) = the sideways direction, perpendicular to the path, of length nl.
      const nx = -(pt2.y - pt.y), ny = (pt2.x - pt.x), nl = Math.hypot(nx, ny) || 1;
      // Place the token at the point, shifted sideways by its jitter, slightly enlarged.
      k.el.setAttribute("transform", `translate(${pt.x + k.jitter*nx/nl},${pt.y + 2 + k.jitter*ny/nl}) scale(1.1)`);
      // Colour it according to how far it has gone (e.g. green → orange → red for infections).
      k.el.setAttribute("fill", colorAt(r.c, e));
      // Opacity: fully visible...
      let op = 1;
      // ...except fading in at the start of a birth...
      if (r.fadeIn)  op = Math.min(1, u * 3);
      // ...or fading out at the end of a death.
      if (r.fadeOut) op = Math.min(1, (1 - u) * 2.2);
      k.el.setAttribute("opacity", op.toFixed(2));
    }
  }

  // ---------------- Decorations ----------------
  // The incubation clock on the S → I arrow: its filled sector and its hand.
  const clockArc = path("dde-clockArc"), clockHand = path("dde-clockHand");
  // drawClock(now): the clock goes round once per infection trip time.
  function drawClock(now){
    // per = seconds per turn; u = fraction of the turn; a = angle; rr = radius 14.
    const per = 1.0 + 0.22 * P.tau, u = (now % per) / per, a = u * 2 * Math.PI, rr = 14;
    // End point of the sector (x, y); "large" = sector more than half the circle.
    const x = rr * Math.sin(a), y = -rr * Math.cos(a), large = u > .5 ? 1 : 0;
    // Draw the filled sector from 12 o'clock to the current angle (nothing if τ ≈ 0).
    clockArc.setAttribute("d", P.tau < 0.05 ? "" : `M0,0 L0,${-rr} A${rr},${rr} 0 ${large} 1 ${x.toFixed(2)},${y.toFixed(2)} z`);
    // Point the hand at the current angle.
    clockHand.setAttribute("x2", (13*Math.sin(a)).toFixed(2));
    clockHand.setAttribute("y2", (-13*Math.cos(a)).toFixed(2));
  }
  // The small inset ("contact → τ days → both infected"): person A, the progress bar, and the persons C and D.
  const inA = path("dde-inA"), inBar = path("dde-inBar"), inC = path("dde-inC"), inD = path("dde-inD");
  // drawInset(now): a 4.5-second cycle.
  function drawInset(now){
    // u = fraction of the cycle.
    const cyc = 4.5, u = (now % cyc) / cyc;
    // pulse = a value going smoothly between 0 and 1 (for flashing).
    const pulse = 0.5 + 0.5 * Math.sin(now * 6);
    // First 15% of the cycle: person A flashes (the contact); otherwise plain green.
    inA.setAttribute("fill", u < .15 ? colorAt([G,[120,200,120]], pulse) : "#22b14c");
    // From 15% to 70%: the "τ days" bar fills from left to right.
    const prog = Math.min(Math.max((u - .15) / .55, 0), 1);
    inBar.setAttribute("x2", 85 + 140 * prog);

    // From 70% to 80%: C and D fade in fully...
    const show = Math.min(Math.max((u - .7) / .1, 0), 1);
    inC.setAttribute("opacity", (.25 + .75 * show).toFixed(2));
    inD.setAttribute("opacity", (.25 + .75 * show).toFixed(2));
    // ...and C turns red (now infected).
    inC.setAttribute("fill", show > .5 ? "#e0201b" : "#22b14c");
  }
  // The three contacts to the right of the I box, and the little lines reaching them.
  const contacts = document.querySelectorAll("#dde-spread .contact"), sps = document.querySelectorAll("#dde-spread .sp");
  // drawSpread(now): infection reaches each contact in turn, every 2.4 s.
  function drawSpread(now){
    const per = 2.4;
    // For each contact c (j = its number, which staggers them by 0.35 s):
    contacts.forEach((c, j) => {
      const u = ((now + j * .35) % per) / per;
      // between 55% and 90% of its cycle it turns from green to red; otherwise green.
      c.setAttribute("fill", u > .55 && u < .9 ? colorAt([G,Rd], Math.min((u - .55) / .15, 1)) : "#22b14c");
    });
    // For each line s:
    sps.forEach((s, j) => {
      const u = ((now + j * .35) % per) / per;
      // it draws itself during the first half of the cycle (dash trick: a 60-unit dash slid into view).
      s.setAttribute("stroke-dasharray", "60");
      s.setAttribute("stroke-dashoffset", (60 - 60 * Math.min(u / .5, 1)).toFixed(1));
    });
  }
  // The red glow behind the I box.
  const glowI = path("dde-glowI");
  // drawBoxes(): fill bars inside the S, I, R boxes show the current sizes (full bar = K = 100); the I glow grows with I.
  function drawBoxes(){
    path("dde-fillS").setAttribute("width", Math.min(256, 256 * S / P.K));
    path("dde-fillI").setAttribute("width", Math.min(256, 256 * I / P.K));
    path("dde-fillR").setAttribute("width", Math.min(256, 256 * R / P.K));
    glowI.setAttribute("opacity", Math.min(I / 60, 1).toFixed(2));
  }


  // (Left over from an earlier version with on-screen controls; not used now.)
  const ctl = id => path(id);
  // speed = model time per real second (×1); playing = whether the animation runs.
  let speed = 1, playing = true;
  // (Empty: the earlier version updated control labels here.)
  function syncLabels(){
  }

  // ---------------- Main loop ----------------
  // last = time of the previous frame (seconds); anim = animation clock.
  let last = performance.now() / 1000, anim = 0;
  // Start from the initial state.
  reset(); syncLabels();
  // running = whether the frame loop is active.
  let running = false;
  // The diagram's SVG element.
  const svgEl = document.getElementById("dde-dia");
  // frame(ms): one animation frame.
  function frame(ms){
    // Panel closed (diagram not visible): stop.
    if (!svgEl.parentElement.offsetParent){ running = false; return; }        // panel closed: stop
    // Seconds since the last frame (at most 0.1, so a pause in the browser does not cause a jump).
    const now = ms / 1000, real = Math.min(now - last, 0.1); last = now;
    // While playing:
    if (playing){
      // advance the animation clock;
      anim += real;
      // number of model steps for this frame;
      const nSteps = Math.round(speed * real / DT);
      // take them one by one:
      for (let s = 0; s < nSteps; s++){
        const f = step();
        // for each flow, add the people moved in this step (in token units);
        for (const k in acc){
          acc[k] += f[k] * DT / UNIT[k];
          // whenever a full token's worth has built up, release a token on that route.
          if (acc[k] >= 1){ acc[k] -= 1; spawn(k, anim); }
        }
      }
      // Move the tokens and update the clock, the inset and the contacts.
      drawTokens(anim); drawClock(anim); drawInset(anim); drawSpread(anim);
    }
    // Update the box fill bars.
    drawBoxes();
    // Ask for the next frame.
    requestAnimationFrame(frame);
  }
  // go(): start when the panel opens (unless already running or hidden): reset the clock and the model.
  function go(){
    if (running || !svgEl.parentElement.offsetParent) return;
    running = true; last = performance.now() / 1000; reset(); requestAnimationFrame(frame);
  }
  // Reduced motion: run at 40% speed.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) speed = 0.4;   // slower, gentler motion
  // Watch the theme's details panel (id="th-7"); when it opens or closes, call go() 30 ms later.
  new MutationObserver(() => setTimeout(go, 30))
    .observe(document.getElementById("th-7"), {attributes: true, attributeFilter: ["hidden"]});
})();
