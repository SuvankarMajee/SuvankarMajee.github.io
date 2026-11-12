/* ================= Suvankar Majee — shared script =================
   1. Builds the top menu on every page (edit MENU below to change it).
   3. Publication topic filter (Publications page only).
   4. Recent publications on the home page.
   The animations that used to be here (banner pattern = 2, scroll reveal = 5)
   are now in animations/all-pages/.
   How to read this file: lines starting with // (and blocks like this one) are comments
   that explain the code line(s) directly below them; the browser ignores them.          */

/* ---------- 0. Site root ----------
   Pages live in sub-folders (research/, conferences/, ...). Every link below is written
   relative to the site's top folder, and SITE_ROOT turns it into a working address from any page. */
// SITE_ROOT = the web address of the site's top folder, worked out once when the page loads.
const SITE_ROOT = (function(){
  // The full address this script was loaded from, e.g. "https://.../assets/js/site.js?v=7".
  const s = document.currentScript && document.currentScript.src;
  // Cut "assets/js/site.js?v=7" off the end, leaving the top-folder address. (Fallback: the current page's folder.)
  return s ? s.replace(/assets\/js\/site\.js[^/]*$/, '') : new URL('./', location.href).href;
})();
// siteUrl('research/publications.html') -> full address of that page, valid from any folder.
const siteUrl = p => SITE_ROOT + p;
// isCurrentPage(path) -> true if that path is the page now open (used to highlight it in the menu).
const isCurrentPage = p => {
  // Normalise an address so different spellings compare equal: "/index.html" -> "/", and ".html" is dropped
  // (GitHub Pages also serves "/research/publications" without ".html").
  const norm = x => decodeURIComponent(new URL(x, location.href).pathname).replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  // Compare the menu entry's address with the address in the browser bar.
  return norm(siteUrl(p)) === norm(location.href);
};

/* ---------- 1. Menu: [label, file] or [label, [[label, file], ...]]
   File paths are relative to the site's top folder, e.g. 'research/publications.html'. ---------- */
// The menu, in order. ['Label', 'file'] = a plain link; ['Label', [ ... ]] = a drop-down with the listed links.
const MENU = [
  // Plain link: "Home".
  ['Home', 'index.html'],
  // Drop-down "Achievements" with three pages:
  ['Achievements', [
    ['Education', 'achievements/education.html'],
    ['Experience', 'achievements/experience.html'],
    ['Achievements', 'achievements/achievements.html']]],
  // Drop-down "Research" with four pages:
  ['Research', [
    ['Research interest', 'research/research-interest.html'],
    ['Publications', 'research/publications.html'],
    ['Co-authors', 'research/co-authors.html'],
    ['Citations', 'research/citations.html']]],
  // Drop-down "Activities" with two pages:
  ['Activities', [
    ['Teaching', 'activities/teaching.html'],
    ['Role in journals', 'activities/role-in-journals.html']]],
  // Drop-down "Conferences" with three pages:
  ['Conferences', [
    ['Conferences', 'conferences/conferences.html'],
    ['Workshops', 'conferences/workshops.html'],
    ['Certification programmes & FDPs', 'conferences/certification-fdp.html']]],
  // Three plain links at the end of the menu:
  ['Book suggestions', 'book-suggestions/book-suggestion.html'],
  ['Gallery', 'gallery/photo-gallery.html'],
  ['Contact', 'contact/contact.html']
];

// Everything inside (function buildMenu(){ ... })(); runs once, as soon as the script loads.
(function buildMenu(){
  // If a page forgot its tab icon (favicon), add one automatically.
  if (!document.querySelector('link[rel="icon"]')){            // tab icon on every page
    // Create <link rel="icon" href=".../SM-logo.png"> and put it in the page's <head>.
    const l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/png'; l.href = siteUrl('assets/images/SM-logo.png'); document.head.appendChild(l);
  }
  // The small down-arrow drawn next to drop-down names (an inline SVG picture).
  const caret = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  // The menu's HTML is built up in this text variable, one item at a time.
  let html = '';
  // Go through MENU; for each entry, label = its name, target = a file (plain link) or a list (drop-down); n = its position.
  MENU.forEach(([label, target], n) => {
    // A plain link (target is a single file name)...
    if (typeof target === 'string'){
      // ...is it the page we are on?
      const cur = isCurrentPage(target);
      // Add <li><a href="...">Label</a></li>; class "here" + aria-current mark the current page (styled in style.css).
      html += `<li class="${cur ? 'here' : ''}"><a href="${siteUrl(target)}"${cur ? ' aria-current="page"' : ''}>${label}</a></li>`;
    // ...otherwise it is a drop-down:
    } else {
      // Is the current page one of the drop-down's pages? (then the group name is highlighted)
      const cur = target.some(t => isCurrentPage(t[1]));
      // Add a button with the group name + arrow, followed by a hidden list <ul class="sub" id="sub2"> ...
      html += `<li class="${cur ? 'here' : ''}"><button type="button" aria-expanded="false" aria-controls="sub${n}">${label}${caret}</button><ul class="sub" id="sub${n}">` +
        // ... containing one <li><a> per page in the group, then close the list.
        target.map(([l, f]) => `<li><a href="${siteUrl(f)}"${isCurrentPage(f) ? ' aria-current="page"' : ''}>${l}</a></li>`).join('') + '</ul></li>';
    }
  });
  // The empty <header id="topbar"> written in every page.
  const bar = document.getElementById('topbar');
  // Fill it (next 3 lines are one piece of text): your logo + name linking to Home, the "Menu" button for phones,
  // and the menu list built above. If the logo image fails to load, onerror swaps in an "SM" circle (class "nologo").
  bar.innerHTML = `<div class="topbar-in"><a class="brand" href="${siteUrl('index.html')}"><i class="logo"><img src="${siteUrl('assets/images/SM-logo.png')}" alt="" onerror="this.parentNode.classList.add('nologo');this.remove()"></i>Suvankar Majee</a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <ul class="menu" id="menu">${html}</ul></div>`;

  // Keep handles to the menu list and the phone "Menu" button just created.
  const menu = bar.querySelector('.menu'), burger = bar.querySelector('.burger');
  // wide() = true on screens wider than 980 px (desktop menu); false on phones/tablets (fold-out menu).
  const wide = () => matchMedia('(min-width:981px)').matches;
  // closeAll(except) closes every open drop-down except the one given:
  const closeAll = except => menu.querySelectorAll('li.open').forEach(li => {
    // remove class "open" (hides it via style.css) and tell screen readers it is collapsed.
    if (li !== except){ li.classList.remove('open'); li.querySelector('button').setAttribute('aria-expanded', 'false'); } });

  // For each drop-down button in the menu:
  menu.querySelectorAll('li > button').forEach(btn => {
    // li = the menu item that holds this button and its sub-list.
    const li = btn.parentElement;
    // Clicking/tapping the button opens the drop-down (or closes it if it was open).
    btn.addEventListener('click', () => {
      // open = the new state (the opposite of the current one).
      const open = !li.classList.contains('open');
      // On desktop, only one drop-down may be open at a time.
      if (wide()) closeAll(li);
      // Apply the new state, and report it to screen readers.
      li.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    });
    // Timer used to close the drop-down a moment after the mouse leaves.
    let shut;                                         // short delay before closing, so a slip of the mouse doesn't close it
    // Desktop: moving the mouse onto a menu item opens its drop-down at once (and closes the others).
    li.addEventListener('mouseenter', () => { if (wide()){ clearTimeout(shut); closeAll(li); li.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); } });
    // Desktop: moving the mouse away closes it after 180 milliseconds.
    li.addEventListener('mouseleave', () => { if (wide()){ shut = setTimeout(() => { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 180); } });
  });
  // On phones, open the group that contains the current page
  menu.querySelectorAll('li.here > button').forEach(b => { if (!wide()){ b.parentElement.classList.add('open'); b.setAttribute('aria-expanded', 'true'); } });
  // Transparent bar over the banner; solid once the banner has scrolled away (or the phone menu is open)
  // (The banner element; not used further below, kept for reference.)
  const banner = document.querySelector('.banner');
  // paint() decides whether the bar is transparent or solid navy:
  const paint = () => {
    // How far (in pixels) the page may be scrolled before the bar turns solid.
    const limit = 24;                     // transparent only at the very top, so the names never sit on top of the banner text
    // Add class "solid" when scrolled past the limit, or while the phone menu is open; remove it otherwise.
    bar.classList.toggle('solid', window.scrollY > limit || menu.classList.contains('show'));
  };
  // Re-check the bar whenever the page scrolls or the window is resized, and once now.
  addEventListener('scroll', paint, {passive: true}); addEventListener('resize', paint); paint();
  // Phone "Menu" button: show/hide the fold-out menu; the button's text switches between "Menu" and "Close".
  burger.addEventListener('click', () => { const s = menu.classList.toggle('show'); burger.setAttribute('aria-expanded', s); burger.textContent = s ? 'Close' : 'Menu'; paint(); });
  // Desktop: clicking anywhere outside the menu bar closes any open drop-down.
  document.addEventListener('click', e => { if (wide() && !bar.contains(e.target)) closeAll(); });
  // Pressing the Esc key closes any open drop-down.
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  // Footer: replace the year in <span id="yr"> with the current year, so the © line never goes out of date.
  const yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
})();


/* ---------- 3. Publication filter (journal articles and conference proceedings) ---------- */
// Runs on every page, but stops immediately unless the page has filter buttons (only Publications does).
(function(){
  // All topic buttons (<div class="filters"><button data-f="...">); if there are none, stop here.
  const btns = document.querySelectorAll('.filters button'); if (!btns.length) return;
  // The two paper lists: journal articles (#publist) and conference papers (#conflist), whichever exist.
  const groups = ['#publist', '#conflist'].map(sel => document.querySelector(sel)).filter(Boolean);
  // The counter line, e.g. "26 journal articles and 2 conference papers".
  const count = document.getElementById('count');
  // Words used in the counter for each topic code (the codes are the data-t values on each paper).
  const label = {frac:'fractional-order', space:'spatio-temporal', delay:'time-delay', ctrl:'optimal-control', eco:'ecology'};
  // plural(3, 'paper') -> "3 papers"; plural(1, 'paper') -> "1 paper".
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  // When any topic button is clicked:
  btns.forEach(b => b.addEventListener('click', () => {
    // f = the chosen topic code (from the button's data-f); shown = how many papers stay visible in each list.
    const f = b.dataset.f, shown = [];
    // Mark only the clicked button as pressed (style.css fills it navy).
    btns.forEach(x => x.setAttribute('aria-pressed', x === b));
    // For each list (journal, then conference):
    groups.forEach(g => {
      // n counts the visible papers in this list.
      let n = 0;
      // For each paper (<li data-t="frac ctrl">) in the list:
      g.querySelectorAll('li').forEach(li => {
        // Keep it if "All" was chosen, or if its data-t topics include the chosen one.
        const on = f === 'all' || (li.dataset.t || '').split(' ').includes(f);
        // Hide the papers that do not match (class "hidden"); count the ones that do.
        li.classList.toggle('hidden', !on); if (on) n++;
      });
      // Hide a whole year if none of its papers are visible.
      g.querySelectorAll('.year').forEach(y => y.classList.toggle('hidden', !y.querySelector('li:not(.hidden)')));
      // Hide the "Conference proceedings" section completely when none of its papers match.
      if (g.id === 'conflist') g.classList.toggle('hidden', n === 0);   // hide the heading when no conference paper matches
      // Remember this list's count.
      shown.push(n);
    });
    // j = visible journal articles, c = visible conference papers; topic = e.g. "fractional-order " (empty for All).
    const [j, c = 0] = shown, topic = f === 'all' ? '' : label[f] + ' ';
    // Build the counter text in parts:
    const parts = [];
    // e.g. "12 fractional-order journal articles"
    if (j) parts.push(plural(j, topic + 'journal article'));
    // e.g. "and 1 conference paper" (the topic word is only written once).
    if (c) parts.push(plural(c, (parts.length ? '' : topic) + 'conference paper'));
    // Show the counter, or a message if no paper matches.
    count.textContent = parts.length ? parts.join(' and ') : 'No papers on this topic yet';
  }));
})();

/* ---------- 4. Recent publications on the home page (read from research/publications.html) ---------- */
// Runs on every page, but only does something on Home (where <ul id="recent-pubs"> exists).
(function(){
  // The empty list on Home that will receive the newest papers; if it is not on this page, stop.
  const list = document.getElementById('recent-pubs'); if (!list) return;
  // How many papers to show: the number in data-count="4" on that list (4 if missing).
  const n = parseInt(list.dataset.count, 10) || 4;
  // Download the Publications page in the background...
  fetch(siteUrl('research/publications.html'))
    // ...stop with an error if it could not be loaded; otherwise read it as text.
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    // Then, with the page's HTML text:
    .then(html => {
      // Turn the text into a document we can search.
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // All journal-article entries, newest first (the order they are written in publications.html).
      const journal = [...doc.querySelectorAll('#publist li')];
      // All entries, journal + conference.
      const all = [...doc.querySelectorAll('main .year li')];
      // Empty the list on Home.
      list.innerHTML = '';
      // Copy the first n journal entries into it (removing their topic tags, which are only needed on Publications).
      journal.slice(0, n).forEach(li => { const c = document.importNode(li, true); c.removeAttribute('data-t'); list.appendChild(c); });
      // Let the new entries fade in like the rest of the page (animations/all-pages/scroll-reveal.js).
      if (window.revealScan) window.revealScan(list);
      // conf = number of conference papers; link = the "See all publications" link under the list.
      const conf = all.length - journal.length, link = document.getElementById('all-pubs');
      // Rewrite that link with real numbers, e.g. "See all 26 journal articles and 2 conference papers".
      if (link) link.textContent = `See all ${journal.length} journal articles` + (conf > 0 ? ` and ${conf} conference paper${conf === 1 ? '' : 's'}` : '');
    })
    // If anything went wrong (e.g. the page was opened from your computer without a web server):
    .catch(() => {
      // show a short message with a link to the Publications page instead.
      list.innerHTML = `<li class="muted">Recent papers are listed on the <a href="${siteUrl('research/publications.html')}">Publications</a> page.</li>`;
    });
})();
