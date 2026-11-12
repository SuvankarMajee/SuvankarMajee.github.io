/* ==========================================================================
   Gray–Scott reaction–diffusion pattern in the banner at the top of every page
   Used on: every page
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

/* ---------- 2. Gray–Scott reaction–diffusion in the banner ----------
   u_t = Du Δu − u v² + F(1 − u),   v_t = Dv Δv + u v² − (F + k) v
   Explicit Euler, dt = 1, 9-point Laplacian, periodic boundaries.      */
// Everything runs inside this function, once, when the script loads (keeps its variables private).
(function(){
  // host = the banner (<div class="banner ..." data-anim="all-pages/banner-pattern">); stop if the page has none.
  const host = document.querySelector('[data-anim~="all-pages/banner-pattern"]'); if (!host) return;
  // cv = the drawing area: a new <canvas> put first inside the banner, behind the text.
  const cv = document.createElement('canvas'); cv.id = 'rd'; cv.setAttribute('aria-hidden', 'true'); host.prepend(cv);
  // On Home only (the banner has a <div class="hero-side">): add the caption explaining the pattern, with a "start again" button.
  const side = host.querySelector('.hero-side');
  if (side) side.insertAdjacentHTML('beforeend', '<p class="caption">A Gray&ndash;Scott reaction&ndash;diffusion system. Click the pattern to add a perturbation, or <button type="button" id="reseed">start again</button>.</p>');
  // ctx = the 2-D "pen" used to draw pixels on the canvas.
  const ctx = cv.getContext('2d');
  // reduce = true if the visitor's device asks for reduced motion (then a still pattern is shown instead of a moving one).
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Model parameters: diffusion rates Du, Dv; feed rate F; kill rate k (these give the spotted pattern). MAX = steps before the animation stops.
  const Du = 1.0, Dv = 0.5, F = 0.0545, k = 0.062, MAX = 9000;
  // W×H = grid size; u, v = concentrations; u2, v2 = next-step buffers; img = pixel buffer; steps taken so far;
  // running/visible = whether to keep animating; perFrame = how many time steps to compute per screen refresh.
  let W, H, u, v, u2, v2, img, steps = 0, running = true, visible = true, perFrame = 4;

  // size(): fit the simulation grid to the banner's current size.
  function size(){
    // r = banner size on screen; s = how many screen pixels one grid cell covers (bigger cells on big screens = faster).
    const r = cv.getBoundingClientRect(), s = r.width < 700 ? 2.2 : (r.width > 1400 ? 3.6 : 3);
    // Grid width and height in cells (at least 80 × 50).
    W = Math.max(80, Math.round(r.width / s)); H = Math.max(50, Math.round(r.height / s));
    // The canvas has one pixel per cell; CSS stretches it to fill the banner.
    cv.width = W; cv.height = H;
    // Create the four arrays of W·H numbers (current and next values of u and v).
    u = new Float32Array(W*H); v = new Float32Array(W*H); u2 = new Float32Array(W*H); v2 = new Float32Array(W*H);
    // Pixel buffer for drawing, then scatter the starting spots.
    img = ctx.createImageData(W, H); seed();
  }
  // blob(cx, cy, r): put a round spot of radius r at cell (cx, cy) — this is what starts a pattern growing.
  function blob(cx, cy, r){
    // Visit every cell in the square around the centre...
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++){
      // ...skip cells outside the circle...
      if (x*x + y*y > r*r) continue;
      // ...and set u = 0.5, v ≈ 0.25 there. The % wraps around the edges (periodic boundaries).
      const i = ((cy+y+H)%H)*W + ((cx+x+W)%W); u[i] = 0.5; v[i] = 0.25 + Math.random()*0.05;
    }
  }
  // seed(): reset to the uniform state (u = 1, v = 0) and drop a few random spots.
  function seed(){
    // Uniform state, step counter reset, animation on.
    u.fill(1); v.fill(0); steps = 0; running = true;
    // Number of spots grows with the banner size (at least 6)...
    for (let j = 0, n = Math.max(6, Math.round(W*H/1800)); j < n; j++)
      // ...each at a random position with a random radius of 2–4 cells.
      blob(Math.random()*W|0, Math.random()*H|0, 2 + (Math.random()*3|0));
  }
  // step(): advance the model by one time step (explicit Euler, dt = 1).
  function step(){
    // For each row y...
    for (let y = 0; y < H; y++){
      // ...start positions of the row above (ym), this row (y0) and the row below (yp), wrapping at the edges.
      const ym = ((y-1+H)%H)*W, y0 = y*W, yp = ((y+1)%H)*W;
      // For each column x in the row...
      for (let x = 0; x < W; x++){
        // ...columns to the left (xm) and right (xp), wrapping; i = index of this cell.
        const xm = (x-1+W)%W, xp = (x+1)%W, i = y0 + x;
        // Discrete Laplacian of u (9-point stencil: weight 0.2 for the 4 side neighbours, 0.05 for the 4 corners, −1 for the cell).
        const lu = .2*(u[y0+xm]+u[y0+xp]+u[ym+x]+u[yp+x]) + .05*(u[ym+xm]+u[ym+xp]+u[yp+xm]+u[yp+xp]) - u[i];
        // Same Laplacian for v.
        const lv = .2*(v[y0+xm]+v[y0+xp]+v[ym+x]+v[yp+x]) + .05*(v[ym+xm]+v[ym+xp]+v[yp+xm]+v[yp+xp]) - v[i];
        // Reaction term u·v².
        const uvv = u[i]*v[i]*v[i];
        // New u = u + Du·Δu − u v² + F(1 − u).
        u2[i] = u[i] + Du*lu - uvv + F*(1 - u[i]);
        // New v = v + Dv·Δv + u v² − (F + k) v.
        v2[i] = v[i] + Dv*lv + uvv - (F + k)*v[i];
      }
    }
    // Swap current and next arrays (so the new values become the current ones, without copying).
    let t = u; u = u2; u2 = t; t = v; v = v2; v2 = t;
  }
  // draw(): colour each pixel by its v value — navy where v is low, mint where v is high.
  function draw(){
    // d = the raw pixel data (4 numbers per pixel: red, green, blue, opacity).
    const d = img.data;
    // For each cell i (pixel data position p moves 4 at a time):
    for (let i = 0, p = 0; i < W*H; i++, p += 4){
      // s = brightness between 0 and 1, from v (values below 0.05 are dark; clipped at 1).
      let s = (v[i] - 0.05)*3.2; s = s < 0 ? 0 : s > 1 ? 1 : s;
      // Blend from navy (16, 32, 58) at s = 0 to mint (127, 209, 190) at s = 1; fully opaque.
      d[p] = 16 + 111*s; d[p+1] = 32 + 177*s; d[p+2] = 58 + 132*s; d[p+3] = 255;
    }
    // Copy the pixels onto the canvas.
    ctx.putImageData(img, 0, 0);
  }
  // settle(n): for reduced motion — compute n steps at once, draw the result, and stop (a still picture).
  const settle = n => { for (let i = 0; i < n; i++) step(); draw(); running = false; };
  // loop(): the animation, called by the browser before each screen refresh (~60 times a second).
  function loop(){
    // Only work while running, while the banner is on screen, and while the browser tab is visible.
    if (running && visible && !document.hidden){
      // Start a stopwatch.
      const t0 = performance.now();
      // Compute perFrame time steps.
      for (let n = 0; n < perFrame; n++) step();
      // Measure how long one step took on this device.
      const ms = (performance.now() - t0) / perFrame;   // time per step on this device
      // Adjust steps-per-frame (between 2 and 12) so slow devices are not overloaded.
      perFrame = Math.max(2, Math.min(12, Math.floor(4 / Math.max(ms, 0.05))));   // keep the work under ~5 ms per frame
      // Count the steps, redraw, and stop once MAX steps are reached (the pattern has settled by then).
      steps += perFrame; draw(); if (steps > MAX) running = false;
    }
    // Ask to be called again at the next screen refresh.
    requestAnimationFrame(loop);
  }
  // Set up the grid now.
  size();
  // Reduced motion: show a finished still pattern. Otherwise: draw once and start the animation.
  if (reduce) settle(4000); else { draw(); loop(); }
  // Watch whether the banner is on screen; pause the work when it is scrolled out of view.
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(cv);
  // When the window is resized, wait 250 ms (until resizing stops), then rebuild the grid at the new size.
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (reduce) settle(4000); }, 250); });
  // Clicking the pattern adds a new spot where you clicked:
  cv.addEventListener('click', e => {
    // r = banner position on screen.
    const r = cv.getBoundingClientRect();
    // Convert the click position to a grid cell and drop a spot of radius 4 there.
    blob(Math.round((e.clientX - r.left)/r.width*W), Math.round((e.clientY - r.top)/r.height*H), 4);
    // Give the animation at least 3000 more steps so the new spot can grow, and restart it.
    steps = Math.min(steps, MAX - 3000); running = true; if (reduce) settle(1500);
  });
  // The "start again" button in the Home caption (only on Home).
  const rs = document.getElementById('reseed');
  // Clicking it scatters new random spots and restarts.
  if (rs) rs.addEventListener('click', () => { seed(); if (reduce) settle(4000); });
})();
