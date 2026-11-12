/* ==========================================================================
   Scroll reveal: paragraphs and list items fade in and rise as they come into view
   Used on: every page
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

/* ---------- 5. Scroll reveal: paragraphs and list items fade in and rise as they come into view ----------
   Only runs when the browser supports it and the visitor has not asked for reduced motion,
   so the text is always readable without it (and for search engines). */
// Runs once when the script loads.
(function(){
  // Stop if the browser is too old to watch scrolling, or if the visitor prefers reduced motion.
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Which elements fade in (a list of CSS selectors, joined with commas). All are inside <main>:
  const SELECT = [
    // headings, paragraphs and the address on Contact;
    'main h2', 'main h3', 'main p', 'main address',
    // each entry of timelines, research themes, publication years and 2-column lists;
    'main .tl > li', 'main .themes > li', 'main .year > ul > li', 'main ul.year > li', 'main .cols > li',
    // Home tiles, cards, icons, the tag list, and each subject box on Book suggestions;
    'main .tiles > li', 'main .cards > li', 'main .icons > li', 'main .tags', 'main .books > section',
    // map/photo on Contact, filter buttons, fold-outs, gallery photos, metric cards.
    'main .place > .pl-item', 'main .filters', 'main details', 'main .gallery figure', 'main .metrics > *'
  ].join(',');
  // Areas that must NOT fade (theme panels, the animations and charts) — they manage themselves.
  const SKIP = '.th-more, .th-row, #spread, #net, #chordWrap, .tl-tip, #netTip, .cm, .cm-note, .ca-wrap, .tlc, .mc, .mc *';   // panels and charts keep their own behaviour
  // io = a watcher that is told when watched elements scroll into view:
  const io = new IntersectionObserver(entries => {
    // i staggers elements that appear at the same moment.
    let i = 0;
    // For each element whose visibility changed:
    entries.forEach(e => {
      // Ignore it if it is not (yet) on screen.
      if (!e.isIntersecting) return;
      // el = the element.
      const el = e.target;
      // Delay each one 70 ms after the previous (max 350 ms), so a group appears one after another.
      el.style.transitionDelay = Math.min(i++ * 70, 350) + 'ms';      // items arriving together follow one another
      // Add class "in": scroll-reveal.css then fades it in and moves it up into place.
      el.classList.add('in');
      // Stop watching it (each element fades in only once).
      io.unobserve(el);
      // After the fade has finished, remove the delay so later effects (e.g. hover) are not delayed.
      setTimeout(() => { el.style.transitionDelay = ''; }, 1100);
    });
  // rootMargin: trigger when the element is 8% above the bottom of the window; threshold: when 8% of it is visible.
  }, {rootMargin: '0px 0px -8% 0px', threshold: 0.08});
  // revealScan(root): find matching elements (in root, or the whole page) and prepare them to fade in.
  // It is global (window.) so site.js can call it for the recent papers it adds to Home.
  window.revealScan = function (root) {
    // For each element matching SELECT:
    (root || document).querySelectorAll(SELECT).forEach(el => {
      // Skip it if it is already prepared, or lies inside a SKIP area.
      if (el.classList.contains('rv') || el.closest(SKIP)) return;
      // Skip it if an outer element already fades in (avoid fading twice).
      if (el.parentElement && el.parentElement.closest('.rv')) return;           // animate the outer item only
      // Class "rv" makes it invisible and slightly lowered (scroll-reveal.css); then start watching it.
      el.classList.add('rv'); io.observe(el);
    });
  };
  // Prepare everything on the page now.
  window.revealScan();
})();
