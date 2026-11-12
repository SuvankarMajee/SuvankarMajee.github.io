/* ==========================================================================
   Co-author chord diagram (uses D3)
   Used on: research/co-authors.html
   Loaded by animations/animations.js: the page has
     <div data-anim="d3 co-authors/00-papers-data co-authors/02-chord-diagram"></div>
   so D3 (a drawing library) and the list of papers are loaded first, then this file.
   This file builds the fold-out "Show the chord diagram" (heading, year filter, diagram) inside that <div>.
   Each person is an arc around the circle; a ribbon joins two people for each pair who wrote papers together.
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

/* ============== THE FOLD-OUT ON THE PAGE ============== */
// Put the fold-out into <div data-anim="... co-authors/02-chord-diagram">: a "Show the chord diagram" line that opens
// a heading, the year filter (tick boxes added further down into <div id="yearFilters">) and the empty diagram
// <svg id="chordSvg"> (700 × 520 units) with its hover tooltip.
document.querySelector('[data-anim~="co-authors/02-chord-diagram"]').innerHTML = `
  <details class="tl-table ca-toggle">
  <summary>Show the chord diagram</summary>
  <div class="ca-wrap" style="margin-top:24px">
    <h3 style="text-align:center;margin:10px 0 16px;color:#202124;font-weight:600;font-family:Arial, sans-serif;font-size:22px;">
      Co-author Chord Diagram*
    </h3>
    <div class="ca-row">
      <div class="ca-years">
        <div style="font-weight:600;margin-bottom:8px;">🔎 Years</div>
        <div id="yearFilters" style="display:flex;flex-direction:column;gap:6px;"></div>
      </div>
      <div id="chordWrap">
        <svg id="chordSvg" viewBox="0 0 700 520" role="img" aria-label="Chord diagram of co-authorships"></svg>
        <div id="tooltip"
             style="position:absolute;pointer-events:none;background:#fff;border:1px solid #ccc;border-radius:6px;padding:6px 8px;font-size:12px;color:#333;box-shadow:0 2px 8px rgba(0,0,0,.1);opacity:0;white-space:nowrap;">
        </div>
      </div>
    </div>
  </div>
  </details>
`;

/* ============== CONFIG ============== */
// Drawing size in its own units (the SVG's viewBox, set above, is 700 × 520).
const W = 700, H = 520;
// Inner radius of the circle of arcs (where ribbons end).
const innerR = Math.min(W, H)*0.38;
// Outer radius of the arcs (16 units thick).
const outerR = innerR + 16;
// svg = a group inside <svg id="chordSvg">, moved so that (0, 0) is the centre of the drawing.
const svg = d3.select("#chordSvg")
  .append("g").attr("transform", `translate(${W/2},${H/2})`);
// The hover tooltip box (<div id="tooltip">, built above).
const tooltip = d3.select("#tooltip");
// The diagram's frame (used to position the tooltip).
const wrapNode = document.getElementById("chordWrap");
// color(i) = one of D3's 10 "Tableau" colours, chosen by person number.
const color = d3.scaleOrdinal(d3.schemeTableau10);

/* ============== UTILITIES ============== */
// getYears(data): all years in the papers list, newest first.
function getYears(data){ return Array.from(new Set(data.map(d=>d.year))).sort((a,b)=>b-a); }

// buildMatrix(data): count joint papers for every pair of people.
function buildMatrix(data){
  // authors = everyone in these papers, alphabetically, each once.
  const authors = Array.from(new Set(data.flatMap(d => d.authors))).sort(d3.ascending);
  // idx[name] = that person's number in the list.
  const idx = new Map(authors.map((a,i)=>[a,i]));
  // n = number of people.
  const n = authors.length;
  // M = an n × n table of zeros; M[i][j] will be the joint papers of person i and person j.
  const M = Array.from({length:n}, ()=>Array(n).fill(0));
  // For each paper p:
  data.forEach(p=>{
    // A = the numbers of its authors;
    const A = p.authors.map(a=>idx.get(a)).filter(i=>i!==undefined);
    // for every pair of authors (i, j)...
    for(let i=0;i<A.length;i++){
      for(let j=i+1;j<A.length;j++){
        // ...add 1 in both directions (the table is symmetric).
        M[A[i]][A[j]] += 1;
        M[A[j]][A[i]] += 1;
      }
    }
  });
  // Return the names and the table.
  return {authors, matrix:M};
}

/* ============== RENDER ============== */
// render(selectedYears): draw the diagram using only papers from the ticked years.
function render(selectedYears){
  // Papers from the ticked years.
  const filtered = papers.filter(p => selectedYears.has(p.year));
  // Names and joint-paper table for those papers.
  const {authors, matrix} = buildMatrix(filtered);

  // Remove the previous drawing.
  svg.selectAll("*").remove();

  // If no year is ticked, show a message instead.
  if (authors.length === 0){
    svg.append("text").attr("text-anchor","middle").attr("y",4)
      .style("fill","#666").text("Tick at least one year to see co-authorships");
    return;
  }

  // Compute the chord layout from the table:
  const chord = d3.chord()
    // small gap between neighbouring arcs;
    .padAngle(0.02)
    // within each arc, the biggest ribbons first;
    .sortSubgroups(d3.descending)
    // (applied to a copy of the table).
    (matrix.map(row => row.map(v=>v)));

  // arc = shape generator for the arcs (a ring between innerR and outerR).
  const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
  // ribbon = shape generator for the ribbons (ending at innerR).
  const ribbon = d3.ribbon().radius(innerR);

  // Groups (author arcs)
  // One group per person...
  const group = svg.append("g")
    .selectAll("g")
    // ...using the arcs computed by the chord layout...
    .data(chord.groups)
    .join("g");

  // ...containing their arc:
  group.append("path")
    .attr("class", "arc")
    // the arc shape,
    .attr("d", arc)
    // in the person's colour,
    .attr("fill", d => color(d.index))
    // with a thin dark edge,
    .attr("stroke", "#333")
    .attr("stroke-width", 0.6)
    // slightly transparent.
    .attr("opacity", 0.85);

  // Author labels
  // The person's name, outside their arc:
  group.append("text")
    // the angle of the arc's middle;
    .each(d => d.angle = (d.startAngle + d.endAngle)/2)
    // vertically centred on the line;
    .attr("dy",".35em")
    // turn to that angle, move outwards past the arc, and flip names on the left half so they are not upside down;
    .attr("transform", d => `
      rotate(${d.angle * 180/Math.PI - 90})
      translate(${outerR + 10})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    // 11 px dark text;
    .style("font-size","11px")
    .style("fill","#1f1f1f")
    // names on the left half end at the arc, names on the right half start at it;
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    // the name itself.
    .text(d => authors[d.index]);

  // Chords (links)
  // One ribbon per pair of people who wrote together:
  const ribbons = svg.append("g")
    // 60% opaque fill;
    .attr("fill-opacity", 0.6)
    .selectAll("path")
    .data(chord)
    .join("path")
      .attr("class", "ribbon")
      // the ribbon shape (its width at each end shows the number of joint papers);
      .attr("d", ribbon)
      // coloured like the first person of the pair;
      .attr("fill", d => color(d.source.index))
      // with a light grey edge.
      .attr("stroke", "#bbb")
      // While the mouse moves over a ribbon:
      .on("mousemove", (event,d) => {
        // mouse position inside the frame;
        const [x, y] = d3.pointer(event, wrapNode);
        // show the tooltip just below-right of the mouse...
        tooltip.style("opacity",1)
               .style("left", (x+15)+"px")
               .style("top",  (y+15)+"px")
               // ...with the two names and their number of joint papers.
               .html(`<strong>${authors[d.source.index]}</strong> ↔ <strong>${authors[d.target.index]}</strong><br/>Co-authored papers: <strong>${d.source.value}</strong>`);
      })
      // Mouse leaves the ribbon: hide the tooltip.
      .on("mouseleave", ()=> tooltip.style("opacity",0));

  // Hover an author: highlight that author's links
  group.on("mouseover", (event,d)=>{
      // i = that person's number;
      const i = d.index;
      // their ribbons stay fully visible, all others almost vanish.
      ribbons.attr("opacity", p => (p.source.index===i || p.target.index===i) ? 1 : 0.08);
    })
    // Mouse leaves: all ribbons visible again.
    .on("mouseout", ()=> ribbons.attr("opacity", 1));
}

/* ============== YEAR FILTER UI ============== */
// All years, newest first.
const years = getYears(papers);
// The set of ticked years — all of them at the start.
const selected = new Set(years); // all on by default
// The empty year list (<div id="yearFilters">, built above).
const yWrap = d3.select("#yearFilters");
// For each year y, add a tick box:
years.forEach(y=>{
  // a unique id, e.g. "y_2025";
  const id = "y_"+y;
  // a <label> line (clicking anywhere on it toggles the box);
  const row = yWrap.append("label").attr("for", id);
  // the tick box itself, ticked at the start;
  row.append("input")
    .attr("type","checkbox")
    .attr("id", id).property("checked", true)
    // when it is ticked/unticked: add/remove the year and redraw the diagram;
    .on("change", function(){
      if(this.checked) selected.add(y); else selected.delete(y);
      render(selected);
    });
  // and the year number beside it.
  row.append("span").text(y);
});
// Draw the diagram with all years ticked.
render(selected);
