/* ==========================================================================
   "Details" buttons on the Main themes (open one theme at a time)
   Used on: research/research-interest.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

/* Main themes: open one theme at a time; its details appear full width under that row */
// Runs once when the script loads.
(function () {
  // list = the themes grid <ul class="themes">; stop if it is missing.
  var list = document.querySelector('.themes'); if (!list) return;
  // Create an extra list item that will hold whichever panel is open, across the full width.
  var row = document.createElement('li');          // full-width holder for the open panel
  // Give it class "th-row" (styled in themes-details-panels.css).
  row.className = 'th-row';
  // open = the theme that is open now (its button, panel and list item), or null if none.
  var open = null;                                  // {btn, panel, item}

  // endOfRow(item): the last theme in the same visual row as "item" (so the panel opens below the whole row).
  function endOfRow(item) {                         // last theme in the same visual row
    // Start with the item itself...
    var end = item;
    // ...and look at every theme in the list:
    Array.prototype.forEach.call(list.children, function (li) {
      // any theme at the same height on screen (same row) further along becomes the new "end".
      if (li !== row && li.offsetTop === item.offsetTop) end = li;
    });
    return end;
  }
  // place(): put the full-width row just after the end of the open theme's row.
  function place() {
    // Nothing open: nothing to do.
    if (!open) return;
    // Take the row out...
    row.remove();
    // ...and insert it after the last theme of that row.
    endOfRow(open.item).after(row);
  }
  // close(): close the open theme, if any.
  function close() {
    if (!open) return;
    // Hide its panel...
    open.panel.hidden = true;
    // ...and move the panel back inside its own theme.
    open.item.appendChild(open.panel);              // put the panel back in its theme
    // Un-highlight the theme title.
    open.item.classList.remove('th-open');
    // Tell screen readers it is collapsed.
    open.btn.setAttribute('aria-expanded', 'false');
    // Button text back to "Details".
    open.btn.textContent = 'Details';
    // Remove the full-width row.
    row.remove();
    // Nothing is open now.
    open = null;
  }
  // For each "Details" button in the themes list:
  list.querySelectorAll('.th-btn').forEach(function (btn) {
    // its panel (the element whose id is in the button's aria-controls, e.g. "th-3");
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    // its theme (the list item containing the button).
    var item = btn.closest('li');
    // When the button is clicked:
    btn.addEventListener('click', function () {
      // was this theme the open one?
      var wasOpen = open && open.btn === btn;
      // close whatever is open;
      close();                                      // close whichever theme is open
      // if it was this one, we are done (the click closed it);
      if (wasOpen) return;
      // otherwise open this theme:
      open = {btn: btn, panel: panel, item: item};
      // move its panel into the full-width row,
      row.appendChild(panel);
      // place the row under the theme's row,
      place();
      // show the panel (this also starts its animation: each animation file watches its panel's "hidden" attribute),
      panel.hidden = false;
      // highlight the theme title,
      item.classList.add('th-open');
      // tell screen readers it is expanded,
      btn.setAttribute('aria-expanded', 'true');
      // and change the button text.
      btn.textContent = 'Hide details';
      // If the panel's bottom is below the window, scroll it into view (smoothly, unless reduced motion is preferred).
      var r = row.getBoundingClientRect();          // bring the panel into view if it opened off-screen
      if (r.bottom > innerHeight) row.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    });
  });
  // When the window is resized (the number of themes per row may change), re-place the open panel 120 ms after resizing stops.
  var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(place, 120); });
})();
