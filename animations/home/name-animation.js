/* ==========================================================================
   Name in the banner: each letter forms out of a blur
   Used on: index.html
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Runs once, loaded by animations/animations.js because the Home <h1 id="myname"> has data-anim="home/name-animation".
(function(){
  // h = the heading with your name; stop if it is not on this page.
  var h = document.getElementById('myname'); if (!h) return;
  // words = ["Suvankar", "Majee"]; i = running letter count (for the delays); html = the new heading contents.
  var words = h.textContent.trim().split(/\s+/), i = 0, html = '';
  // For each word w (k = its position):
  words.forEach(function(w, k){
    // open a word wrapper (hidden from screen readers, which read the aria-label on the <h1> instead);
    html += '<span class="w" aria-hidden="true">';
    // wrap each letter in <span class="ch">, each starting 0.06 s after the previous one (first at 0.15 s);
    for (var c = 0; c < w.length; c++) html += '<span class="ch" style="animation-delay:' + (0.15 + i++ * 0.06).toFixed(2) + 's">' + w[c] + '</span>';
    // close the word, and add a space between words.
    html += '</span>' + (k < words.length - 1 ? ' ' : '');
  });
  // Replace the heading's text with the letter spans and switch on the animation (class "name-anim", see name-animation.css).
  h.innerHTML = html; h.classList.add('name-anim');
})();
