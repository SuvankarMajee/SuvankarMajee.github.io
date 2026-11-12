/* ==========================================================================
   Co-author network graph (uses D3)
   Used on: research/co-authors.html
   Loaded by animations/animations.js: the page has
     <div data-anim="d3 co-authors/00-papers-data co-authors/01-network-graph"></div>
   so D3 (a drawing library) and the list of papers are loaded first, then this file.
   This file builds the whole section (heading, how-to-read text, graph, key, table) inside that <div>.
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

/* ============== CO-AUTHOR NETWORK GRAPH (reads the same `papers` list) ============== */
// Runs once when the script loads.
(function(){
  // host = the empty <div data-anim="... co-authors/01-network-graph"> on the page; stop if it is missing.
  const host = document.querySelector('[data-anim~="co-authors/01-network-graph"]'); if (!host) return;
  // Build the section: heading, how to read the graph, the graph container with its tooltip and zoom
  // buttons (+, −, reset), a hint, the colour key, and the fold-out table (filled in further down).
  host.innerHTML = `
    <section class="tlc" aria-labelledby="net-h">
      <h3 id="net-h">Co-author Network Graph*</h3>
      <p class="how">Larger circles closer to the centre are co-authors I have written more papers with. A line joins two co-authors who have published together; thicker lines mean more joint papers. Hover over or tap a name to see that person&rsquo;s connections.</p>
      <div id="net"><div id="netTip"></div>
        <div class="zbtns" role="group" aria-label="Zoom">
          <button type="button" id="zIn" aria-label="Zoom in">+</button>
          <button type="button" id="zOut" aria-label="Zoom out">&minus;</button>
          <button type="button" id="zReset" aria-label="Reset zoom">&#8634;</button>
        </div>
      </div>
      <p class="zhint">Zoom with the + and &minus; buttons, Ctrl + scroll or a two-finger pinch. Drag to move around.</p>
      <div class="net-key">
        <span><i style="width:14px;height:14px;background:#10203A"></i>Me</span>
        <span><i style="width:12px;height:12px;background:#0E7C7B"></i>Co-author</span>
        <span><svg width="24" height="4" aria-hidden="true"><line x1="1" y1="2" x2="23" y2="2" stroke="#10203A" stroke-opacity=".6" stroke-width="1.6" stroke-dasharray="5 4" stroke-linecap="round"/></svg>My papers with that co-author</span>
        <span><i style="width:22px;height:3px;border-radius:0;background:#9FB4B8"></i>Co-authors who published together</span>
      </div>
      <details class="tl-table"><summary>Show the numbers as a table</summary><div id="netTable"></div></details>
    </section>
  `;
  // box = the graph container <div id="net">; tip = the hover tooltip <div id="netTip">.
  const box = document.getElementById('net'), tip = document.getElementById('netTip');
  // count[name] = number of papers; links["A|B"] = papers A and B wrote together; perYear[name] = {year: papers with you}.
  const count = new Map(), links = new Map(), perYear = new Map();
  // Go through every paper p:
  papers.forEach(p => {
    // its authors, with any accidental duplicate removed;
    const a = [...new Set(p.authors)];
    // for each author x:
    a.forEach(x => {
      // add 1 to their paper count;
      count.set(x, (count.get(x) || 0) + 1);
      // for co-authors (not you), also count papers per year.
      if (x !== ME){ if (!perYear.has(x)) perYear.set(x, {}); const y = perYear.get(x); y[p.year] = (y[p.year] || 0) + 1; }
    });
    // For every pair of authors on the paper...
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++){
      // ...skip pairs that include you (you are joined to everyone by dashed "spokes" instead)...
      if (a[i] === ME || a[j] === ME) continue;                 // you are on every paper: drawn as faint spokes instead
      // ...and add 1 to that pair's joint-paper count (key "A|B" in alphabetical order).
      const k = [a[i], a[j]].sort().join('|'); links.set(k, (links.get(k) || 0) + 1);
    }
  });
  // plural(3, 'paper') -> "3 papers"; plural(1, 'paper') -> "1 paper".
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  // draw(): build the whole graph (called at start and when the width changes).
  function draw(){
    // Remove the previous drawing, if any.
    box.querySelector('svg')?.remove();
    // Drawing width W (at least 330) and height H (taller than wide on phones, 540 otherwise).
    const W = Math.max(330, box.clientWidth), H = W < 600 ? Math.round(W * 1.15) : 540;
    // R = radius of the outer ring where the least frequent co-authors sit.
    const R = Math.min(W, H) / 2 - (W < 600 ? 30 : 40);
    // k = shrink factor for small screens (1 on wide screens).
    const k = Math.min(1, W / 680);
    // nodes = one circle per person, with their paper count n.
    const nodes = [...count.keys()].map(id => ({id, n: count.get(id)}));
    // edges = one line per co-author pair, with weight w = joint papers.
    const edges = [...links].map(([key, w]) => { const [s, t] = key.split('|'); return {source: s, target: t, w}; });
    // r(d) = circle radius: large for you; for others it grows with √(papers).
    const r = d => d.id === ME ? 22 * k + 4 : (4 + Math.sqrt(d.n) * 3.2) * (0.6 + 0.4 * k);
    // maxN = most papers with any single co-author.
    const maxN = Math.max(...nodes.filter(d => d.id !== ME).map(d => d.n));
    // fs = label font size; est(d) = rough width of a person's name label.
    const fs = W < 600 ? 10.5 : 12.5, est = d => d.id.length * fs * 0.55;           // rough label width
    // Pin your circle at the centre.
    const me = nodes.find(d => d.id === ME); me.fx = W/2; me.fy = H/2;

    // Physics layout (D3 force simulation), set up and then run manually:
    const sim = d3.forceSimulation(nodes)
      // co-authors who wrote together are pulled towards each other;
      .force('link', d3.forceLink(edges).id(d => d.id).distance(R * 0.42))
      // all circles repel each other;
      .force('charge', d3.forceManyBody().strength(-520 * k))
      // circles (and their name labels) may not overlap;
      .force('collide', d3.forceCollide(d => d.id === ME ? Math.max(r(d) + 10, 14 * fs * 0.55 / 2 + 8) : Math.max(r(d) + 8, est(d) / 2 + 6)).strength(1).iterations(3))
      // frequent co-authors are pulled to a ring close to you, occasional ones to the outer ring;
      .force('radial', d3.forceRadial(d => d.id === ME ? 0 : R * (1 - 0.6 * Math.sqrt(d.n / maxN)), W/2, H/2).strength(0.3))
      // (do not run automatically).
      .stop();
    // Run 400 steps of the simulation now.
    for (let i = 0; i < 400; i++) sim.tick();                    // fixed number of steps: same layout every visit
    // Keep every circle and label inside the drawing.
    nodes.forEach(d => { const h = d.id === ME ? 0 : est(d) / 2; d.x = Math.max(h + 4, Math.min(W - h - 4, d.x)); d.y = Math.max(16, Math.min(H - 30, d.y)); });

    // crop to the drawing: centre it horizontally and trim empty space above and below
    // Left and right edges of everything drawn (circles and labels).
    const x0 = d3.min(nodes, d => d.x - (d.id === ME ? r(d) : Math.max(r(d), est(d)/2))), x1 = d3.max(nodes, d => d.x + (d.id === ME ? r(d) : Math.max(r(d), est(d)/2)));
    // Top and bottom edges (including the labels under the circles).
    const y0 = d3.min(nodes, d => d.y - r(d)), y1 = d3.max(nodes, d => d.y + r(d) + fs + 6);
    // Shift needed to centre horizontally (dx) and to start 12 px from the top (dy); Hc = trimmed height.
    const dx = (W - (x1 - x0)) / 2 - x0, dy = 12 - y0, Hc = Math.round(y1 - y0 + 24);
    // Apply the shift to every circle.
    nodes.forEach(d => { d.x += dx; d.y += dy; });
    // Your (shifted) centre position.
    const cx = W/2 + dx, cy = H/2 + dy;
    // Create the SVG drawing at the top of the container, sized W × Hc, with a description for screen readers.
    const svg = d3.select(box).insert('svg', ':first-child').attr('viewBox', `0 0 ${W} ${Hc}`).attr('width', W).attr('height', Hc)
      .attr('role', 'img').attr('aria-label', 'Network of co-authors: circle size shows joint papers, lines join co-authors who published together');
    // gz = one group holding everything (this is what zooming moves).
    const gz = svg.append('g');
    // Spokes: a dashed navy line from you to each co-author.
    const spoke = gz.append('g').selectAll('line').data(nodes.filter(d => d.id !== ME)).join('line')
      // from the centre to the co-author;
      .attr('x1', cx).attr('y1', cy).attr('x2', d => d.x).attr('y2', d => d.y)
      // navy, 45% opaque, 1.4 px, dashed (5 on, 4 off);
      .attr('stroke', '#10203A').attr('stroke-opacity', 0.45).attr('stroke-width', 1.4).attr('stroke-dasharray', '5 4')
      // with rounded dash ends.
      .attr('stroke-linecap', 'round');
    // Links: a grey line between each pair of co-authors who wrote together...
    const link = gz.append('g').selectAll('line').data(edges).join('line')
      // ...from one to the other...
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      // ...thicker for more joint papers.
      .attr('stroke', '#9FB4B8').attr('stroke-opacity', 0.7).attr('stroke-width', d => 0.8 + Math.sqrt(d.w) * 1.1);
    // One group per person, moved to their position; co-authors can be reached with the Tab key (tabindex 0).
    const node = gz.append('g').selectAll('g').data(nodes).join('g')
      .attr('transform', d => `translate(${d.x},${d.y})`).attr('tabindex', d => d.id === ME ? null : 0);
    // Their circle: navy for you, teal for co-authors, white edge.
    node.append('circle').attr('r', r).attr('fill', d => d.id === ME ? '#10203A' : '#0E7C7B').attr('stroke', '#fff').attr('stroke-width', 2);
    // The name written under your circle (instead of "S. Majee").
    const ME_LABEL = 'Suvankar Majee';                             // name shown under the centre circle
    // label(d) = the text under a circle.
    const label = d => d.id === ME ? ME_LABEL : d.id;
    // First copy of the name: a thick white outline ("halo") so names stay readable over lines...
    node.append('text').text(label).attr('text-anchor', 'middle').attr('dy', d => r(d) + fs + 2)    // white halo
      // ...Arial, bold for you...
      .attr('font-family', 'Arial, sans-serif').attr('font-size', fs).attr('font-weight', d => d.id === ME ? 700 : 400)
      // ...drawn in white with a 3 px white stroke.
      .attr('stroke', '#fff').attr('stroke-width', 3).attr('stroke-linejoin', 'round').attr('fill', '#fff');
    // Second copy on top: the name itself...
    node.append('text').text(label).attr('text-anchor', 'middle').attr('dy', d => r(d) + fs + 2)    // the name itself
      // ...same font...
      .attr('font-family', 'Arial, sans-serif').attr('font-size', fs).attr('font-weight', d => d.id === ME ? 700 : 400)
      // ...in navy for you, dark grey for others.
      .attr('fill', d => d.id === ME ? '#10203A' : '#1B2533');

    // neighbours(d) = the set of people linked to d by a line.
    const neighbours = d => new Set(edges.filter(l => l.source === d || l.target === d).map(l => l.source === d ? l.target : l.source));
    // on(event, d): highlight co-author d (mouse over or keyboard focus).
    const on = (e, d) => {
      // Nothing for your own circle.
      if (d.id === ME) return;
      // Their collaborators.
      const nb = neighbours(d);
      // Their lines stay bright; all other lines almost vanish.
      link.attr('stroke-opacity', l => (l.source === d || l.target === d) ? 1 : 0.06);
      // Their spoke brightens; other spokes fade.
      spoke.attr('stroke-opacity', n => n === d ? 0.9 : 0.1);
      // They, you and their collaborators stay visible; everyone else fades.
      node.attr('opacity', n => n === d || n.id === ME || nb.has(n) ? 1 : 0.22);
      // Papers per year, e.g. "2023: 2, 2024: 3".
      const yrs = Object.entries(perYear.get(d.id)).map(([y, c]) => `${y}: ${c}`).join(', ');
      // Tooltip text: name, number of joint papers, per-year breakdown.
      tip.innerHTML = `<strong>${d.id}</strong><br>${plural(d.n, 'joint paper')} with you<br><span style="color:#666">${yrs}</span>`;
      // b = container position; c = the circle's position on screen.
      const b = box.getBoundingClientRect(), c = e.currentTarget.querySelector('circle').getBoundingClientRect();
      // Place the tooltip just above the circle and show it.
      tip.style.left = (c.left + c.width/2 - b.left) + 'px'; tip.style.top = (c.top - b.top - 8) + 'px'; tip.style.opacity = 1;
    };
    // off(): undo the highlight and hide the tooltip.
    const off = () => { link.attr('stroke-opacity', 0.7); spoke.attr('stroke-opacity', 0.45); node.attr('opacity', 1); tip.style.opacity = 0; };
    // Highlight on mouse over or keyboard focus; undo when the mouse leaves or focus moves away.
    node.on('mouseenter', on).on('focus', on).on('mouseleave', off).on('blur', off);

    /* zoom and pan */
    // K = current zoom level.
    let K = 1;
    // Zoom behaviour: from 0.7× to 4×...
    zoom = d3.zoom().scaleExtent([0.7, 4])
      // ...with small steps for each wheel click...
      .wheelDelta(e => -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002))   // gentle Ctrl + scroll steps
      // ...and only for some gestures:
      .filter(e => {
        // mouse wheel zooms only with Ctrl (or Cmd) held, so normal scrolling still scrolls the page;
        if (e.type === 'wheel') return e.ctrlKey || e.metaKey;           // plain scrolling keeps scrolling the page
        // on touch screens, two fingers zoom; one finger drags only when already zoomed in;
        if (e.type === 'touchstart') return e.touches.length > 1 || K > 1; // one finger scrolls the page unless zoomed in
        // mouse dragging with the main button pans.
        return !e.button;
      })
      // On every zoom/pan: remember the level, move the drawing, hide the tooltip.
      .on('zoom', e => { K = e.transform.k; gz.attr('transform', e.transform); tip.style.opacity = 0; });
    // Attach zooming to the SVG, and let the browser still scroll the page on touch.
    svgSel = svg.call(zoom).style('touch-action', 'pan-x pan-y');
  }
  // zoom = the zoom behaviour; svgSel = the current drawing (both set inside draw()).
  let zoom, svgSel;
  // "+" button: zoom in 1.5× over 0.25 s.
  document.getElementById('zIn').onclick    = () => svgSel.transition().duration(250).call(zoom.scaleBy, 1.5);
  // "−" button: zoom out.
  document.getElementById('zOut').onclick   = () => svgSel.transition().duration(250).call(zoom.scaleBy, 1/1.5);
  // Reset button: back to the original view.
  document.getElementById('zReset').onclick = () => svgSel.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
  // Draw the graph now.
  draw();
  // t = resize timer; lastW = width when last drawn.
  let t, lastW = box.clientWidth;
  // When the window is resized, redraw 200 ms after resizing stops — but only if the width actually changed.
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (box.clientWidth !== lastW){ lastW = box.clientWidth; draw(); } }, 200); });

  /* table view: co-author × year */
  // All years that appear in the papers, oldest first.
  const years = [...new Set(papers.map(p => p.year))].sort((a,b) => a-b);
  // One row per co-author: name, papers per year, total, and first year...
  const rows = [...perYear.entries()].map(([name, ys]) => ({name, ys, total: count.get(name), first: Math.min(...Object.keys(ys).map(Number))}))
    // ...sorted by total (most first), then by first year, then alphabetically.
    .sort((a,b) => b.total - a.total || a.first - b.first || a.name.localeCompare(b.name));
  // Build the table: a header row (Co-author, the years, Total)...
  document.getElementById('netTable').innerHTML = '<table><tr><th>Co-author</th>' + years.map(y => `<th>${y}</th>`).join('') + '<th>Total</th></tr>' +
    // ...then one row per co-author (blank cell for years with no joint paper, bold total).
    rows.map(r => `<tr><td>${r.name}</td>` + years.map(y => `<td>${r.ys[y] || ''}</td>`).join('') + `<td><b>${r.total}</b></td></tr>`).join('') + '</table>';
})();
