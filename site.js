/* ================= Suvankar Majee — shared script =================
   1. Builds the top menu on every page (edit MENU below to change it).
   2. Runs the Gray–Scott pattern in the page banner.
   3. Publication topic filter (Publications page only).               */

/* ---------- 1. Menu: [label, file] or [label, [[label, file], ...]] ---------- */
const MENU = [
  ['Home', 'index.html'],
  ['Achievements', [
    ['Education', 'education.html'],
    ['Experience', 'experience.html'],
    ['Achievements', 'achievements.html']]],
  ['Research', [
    ['Research interest', 'research-interest.html'],
    ['Publications', 'publications.html'],
    ['Co-authors', 'co-authors.html'],
    ['Citations', 'citations.html']]],
  ['Activities', [
    ['Teaching', 'teaching.html'],
    ['Role in journals', 'role-in-journals.html']]],
  ['Conferences', [
    ['Conferences', 'conferences.html'],
    ['Workshops', 'workshops.html'],
    ['Certification programmes & FDPs', 'certification-fdp.html']]],
  ['Books', 'book-suggestion.html'],
  ['Gallery', 'photo-gallery.html'],
  ['Contact', 'contact.html']
];

(function buildMenu(){
  if (!document.querySelector('link[rel="icon"]')){            // tab icon on every page
    const l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/png'; l.href = 'SM-logo.png'; document.head.appendChild(l);
  }
  const here = location.pathname.split('/').pop() || 'index.html';
  const caret = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  let html = '';
  MENU.forEach(([label, target], n) => {
    if (typeof target === 'string'){
      const cur = target === here;
      html += `<li class="${cur ? 'here' : ''}"><a href="${target}"${cur ? ' aria-current="page"' : ''}>${label}</a></li>`;
    } else {
      const cur = target.some(t => t[1] === here);
      html += `<li class="${cur ? 'here' : ''}"><button type="button" aria-expanded="false" aria-controls="sub${n}">${label}${caret}</button><ul class="sub" id="sub${n}">` +
        target.map(([l, f]) => `<li><a href="${f}"${f === here ? ' aria-current="page"' : ''}>${l}</a></li>`).join('') + '</ul></li>';
    }
  });
  const bar = document.getElementById('topbar');
  bar.innerHTML = `<div class="topbar-in"><a class="brand" href="index.html"><i class="logo"><img src="SM-logo.png" alt="" onerror="this.parentNode.classList.add('nologo');this.remove()"></i>Suvankar Majee</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <ul class="menu" id="menu">${html}</ul></div>`;

  const menu = bar.querySelector('.menu'), burger = bar.querySelector('.burger');
  const wide = () => matchMedia('(min-width:981px)').matches;
  const closeAll = except => menu.querySelectorAll('li.open').forEach(li => {
    if (li !== except){ li.classList.remove('open'); li.querySelector('button').setAttribute('aria-expanded', 'false'); } });

  menu.querySelectorAll('li > button').forEach(btn => {
    const li = btn.parentElement;
    btn.addEventListener('click', () => {
      const open = !li.classList.contains('open');
      if (wide()) closeAll(li);
      li.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    });
    let shut;                                         // short delay before closing, so a slip of the mouse doesn't close it
    li.addEventListener('mouseenter', () => { if (wide()){ clearTimeout(shut); closeAll(li); li.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); } });
    li.addEventListener('mouseleave', () => { if (wide()){ shut = setTimeout(() => { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 180); } });
  });
  // On phones, open the group that contains the current page
  menu.querySelectorAll('li.here > button').forEach(b => { if (!wide()){ b.parentElement.classList.add('open'); b.setAttribute('aria-expanded', 'true'); } });
  // Transparent bar over the banner; solid once the banner has scrolled away (or the phone menu is open)
  const banner = document.querySelector('.banner');
  const paint = () => {
    const limit = 24;                     // transparent only at the very top, so the names never sit on top of the banner text
    bar.classList.toggle('solid', window.scrollY > limit || menu.classList.contains('show'));
  };
  addEventListener('scroll', paint, {passive: true}); addEventListener('resize', paint); paint();
  burger.addEventListener('click', () => { const s = menu.classList.toggle('show'); burger.setAttribute('aria-expanded', s); burger.textContent = s ? 'Close' : 'Menu'; paint(); });
  document.addEventListener('click', e => { if (wide() && !bar.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();

/* ---------- 2. Gray–Scott reaction–diffusion in the banner ----------
   u_t = Du Δu − u v² + F(1 − u),   v_t = Dv Δv + u v² − (F + k) v
   Explicit Euler, dt = 1, 9-point Laplacian, periodic boundaries.      */
(function(){
  const cv = document.getElementById('rd'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Du = 1.0, Dv = 0.5, F = 0.0545, k = 0.062, MAX = 9000;
  let W, H, u, v, u2, v2, img, steps = 0, running = true, visible = true, perFrame = 4;

  function size(){
    const r = cv.getBoundingClientRect(), s = r.width < 700 ? 2.2 : (r.width > 1400 ? 3.6 : 3);
    W = Math.max(80, Math.round(r.width / s)); H = Math.max(50, Math.round(r.height / s));
    cv.width = W; cv.height = H;
    u = new Float32Array(W*H); v = new Float32Array(W*H); u2 = new Float32Array(W*H); v2 = new Float32Array(W*H);
    img = ctx.createImageData(W, H); seed();
  }
  function blob(cx, cy, r){
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++){
      if (x*x + y*y > r*r) continue;
      const i = ((cy+y+H)%H)*W + ((cx+x+W)%W); u[i] = 0.5; v[i] = 0.25 + Math.random()*0.05;
    }
  }
  function seed(){
    u.fill(1); v.fill(0); steps = 0; running = true;
    for (let j = 0, n = Math.max(6, Math.round(W*H/1800)); j < n; j++)
      blob(Math.random()*W|0, Math.random()*H|0, 2 + (Math.random()*3|0));
  }
  function step(){
    for (let y = 0; y < H; y++){
      const ym = ((y-1+H)%H)*W, y0 = y*W, yp = ((y+1)%H)*W;
      for (let x = 0; x < W; x++){
        const xm = (x-1+W)%W, xp = (x+1)%W, i = y0 + x;
        const lu = .2*(u[y0+xm]+u[y0+xp]+u[ym+x]+u[yp+x]) + .05*(u[ym+xm]+u[ym+xp]+u[yp+xm]+u[yp+xp]) - u[i];
        const lv = .2*(v[y0+xm]+v[y0+xp]+v[ym+x]+v[yp+x]) + .05*(v[ym+xm]+v[ym+xp]+v[yp+xm]+v[yp+xp]) - v[i];
        const uvv = u[i]*v[i]*v[i];
        u2[i] = u[i] + Du*lu - uvv + F*(1 - u[i]);
        v2[i] = v[i] + Dv*lv + uvv - (F + k)*v[i];
      }
    }
    let t = u; u = u2; u2 = t; t = v; v = v2; v2 = t;
  }
  function draw(){
    const d = img.data;
    for (let i = 0, p = 0; i < W*H; i++, p += 4){
      let s = (v[i] - 0.05)*3.2; s = s < 0 ? 0 : s > 1 ? 1 : s;
      d[p] = 16 + 111*s; d[p+1] = 32 + 177*s; d[p+2] = 58 + 132*s; d[p+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  const settle = n => { for (let i = 0; i < n; i++) step(); draw(); running = false; };
  function loop(){
    if (running && visible && !document.hidden){
      const t0 = performance.now();
      for (let n = 0; n < perFrame; n++) step();
      const ms = (performance.now() - t0) / perFrame;   // time per step on this device
      perFrame = Math.max(2, Math.min(12, Math.floor(5 / Math.max(ms, 0.05))));   // keep the work under ~5 ms per frame
      steps += perFrame; draw(); if (steps > MAX) running = false;
    }
    requestAnimationFrame(loop);
  }
  size();
  if (reduce) settle(4000); else { draw(); loop(); }
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(cv);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (reduce) settle(4000); }, 250); });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    blob(Math.round((e.clientX - r.left)/r.width*W), Math.round((e.clientY - r.top)/r.height*H), 4);
    steps = Math.min(steps, MAX - 3000); running = true; if (reduce) settle(1500);
  });
  const rs = document.getElementById('reseed');
  if (rs) rs.addEventListener('click', () => { seed(); if (reduce) settle(4000); });
})();

/* ---------- 3. Publication filter (journal articles and conference proceedings) ---------- */
(function(){
  const btns = document.querySelectorAll('.filters button'); if (!btns.length) return;
  const groups = ['#publist', '#conflist'].map(sel => document.querySelector(sel)).filter(Boolean);
  const count = document.getElementById('count');
  const label = {frac:'fractional-order', space:'spatio-temporal', delay:'time-delay', ctrl:'optimal-control', eco:'ecology'};
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  btns.forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.f, shown = [];
    btns.forEach(x => x.setAttribute('aria-pressed', x === b));
    groups.forEach(g => {
      let n = 0;
      g.querySelectorAll('li').forEach(li => {
        const on = f === 'all' || (li.dataset.t || '').split(' ').includes(f);
        li.classList.toggle('hidden', !on); if (on) n++;
      });
      g.querySelectorAll('.year').forEach(y => y.classList.toggle('hidden', !y.querySelector('li:not(.hidden)')));
      if (g.id === 'conflist') g.classList.toggle('hidden', n === 0);   // hide the heading when no conference paper matches
      shown.push(n);
    });
    const [j, c = 0] = shown, topic = f === 'all' ? '' : label[f] + ' ';
    const parts = [];
    if (j) parts.push(plural(j, topic + 'journal article'));
    if (c) parts.push(plural(c, (parts.length ? '' : topic) + 'conference paper'));
    count.textContent = parts.length ? parts.join(' and ') : 'No papers on this topic yet';
  }));
})();

/* ---------- 4. Recent publications on the home page (read from publications.html) ---------- */
(function(){
  const list = document.getElementById('recent-pubs'); if (!list) return;
  const n = parseInt(list.dataset.count, 10) || 4;
  fetch('publications.html')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const journal = [...doc.querySelectorAll('#publist li')];
      const all = [...doc.querySelectorAll('main .year li')];
      list.innerHTML = '';
      journal.slice(0, n).forEach(li => { const c = document.importNode(li, true); c.removeAttribute('data-t'); list.appendChild(c); });
      const conf = all.length - journal.length, link = document.getElementById('all-pubs');
      if (link) link.textContent = `See all ${journal.length} journal articles` + (conf > 0 ? ` and ${conf} conference paper${conf === 1 ? '' : 's'}` : '');
    })
    .catch(() => {
      list.innerHTML = '<li class="muted">Recent papers are listed on the <a href="publications.html">Publications</a> page.</li>';
    });
})();
