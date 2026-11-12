/* ==========================================================================
   Animation loader
   Used on: every page (one line in the <head>:
            <script src="animations/animations.js"></script>, with ../ on pages in a folder).
   Comments starting with // explain the line(s) directly below them.

   HOW TO PUT AN ANIMATION ON A PAGE
   Write one empty element where the animation should appear, naming its file
   (path inside animations/, without .js):
       <div data-anim="home/modelling-cycle"></div>
   This loader then loads  animations/home/modelling-cycle.css  and
   animations/home/modelling-cycle.js , and the .js file builds the animation
   (drawing, captions, explanatory text) inside that element.

   Several names can be listed, separated by spaces; they load in that order.
   Use this for a library or a data file the animation needs first, e.g.
       <div data-anim="d3 co-authors/00-papers-data co-authors/01-network-graph"></div>
   "d3" and "chartjs" are short names for the libraries in LIBS below.
   Files ending in "-data" have no .css file. Anything listed twice on a page
   is loaded only once.

   The fade-in on scrolling (all-pages/scroll-reveal) is added to every page
   automatically, after all the other animations.
   ========================================================================== */
(function () {
  // base = the address of the animations/ folder (the folder this file is in).
  var base = document.currentScript.src.replace(/[^\/]*$/, '');
  // Short names for libraries from the internet.
  var LIBS = {
    d3: 'https://cdn.jsdelivr.net/npm/d3@7',
    chartjs: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.js'
  };
  // Loaded on every page, after everything else.
  var ALWAYS = ['all-pages/scroll-reveal'];

  // Keep text that an animation rewrites (your name on Home) hidden until the animation has started,
  // so it does not flash as plain text first. This runs in the <head>, before anything is drawn.
  var st = document.createElement('style');
  st.textContent = 'h1[data-anim]:not([data-ready]){visibility:hidden}';
  document.head.appendChild(st);

  // When the whole page has been read:
  document.addEventListener('DOMContentLoaded', function () {
    // jobs = list of {name, host} in page order; seen = names already listed (load each once).
    var jobs = [], seen = {};
    // For every element with data-anim, in page order...
    document.querySelectorAll('[data-anim]').forEach(function (host) {
      // ...add each name it lists.
      host.getAttribute('data-anim').trim().split(/\s+/).forEach(function (n) {
        if (!seen[n]) { seen[n] = 1; jobs.push({ name: n, host: host }); }
      });
    });
    // Then the animations used on every page.
    ALWAYS.forEach(function (n) { if (!seen[n]) jobs.push({ name: n, host: null }); });

    // src(n) = address of the .js file (or of the library).
    function src(n) { return LIBS[n] || (/^https?:/.test(n) ? n : base + n + '.js'); }
    // hasCss(n) = true if the name has its own .css file (not a library, not a data file).
    function hasCss(n) { return !LIBS[n] && !/^https?:/.test(n) && !/-data$/.test(n); }

    // Step 1: add all the .css files at once and wait until they have arrived (or failed),
    // so each animation measures its final size when it starts.
    var pending = 0;
    jobs.forEach(function (j) {
      if (!hasCss(j.name)) return;
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = base + j.name + '.css';
      pending++; l.onload = l.onerror = function () { if (--pending === 0) run(0); };
      document.head.appendChild(l);
    });
    if (pending === 0) run(0);

    // Step 2: load the .js files one after another, in order.
    function run(i) {
      if (i >= jobs.length) return;
      var j = jobs[i], s = document.createElement('script');
      s.src = src(j.name);
      // When a file has run (or failed to load), mark its element as ready and load the next file.
      s.onload = s.onerror = function () { if (j.host) j.host.setAttribute('data-ready', ''); run(i + 1); };
      document.body.appendChild(s);
    }
    // Safety: if something never answers, show the name anyway after 3 s.
    setTimeout(function () { document.querySelectorAll('[data-anim]').forEach(function (h) { h.setAttribute('data-ready', ''); }); }, 3000);
  });
})();
