# Suvankar Majee — personal website

The page folders follow the site's top menu, so the menu item tells you which folder to open.
Every animation has its own file in `animations/`, in a folder named after its page.
A page only *calls* an animation, with one empty line where it should appear (see "How animations are placed on a page" below).

```
index.html                      Home
achievements/                   Menu: Achievements
    education.html                  Education
    experience.html                 Experience
    achievements.html               Achievements
research/                       Menu: Research
    research-interest.html          Research interest
    publications.html               Publications   (the Home page reads its newest papers from here)
    co-authors.html                 Co-authors
    citations.html                  Citations
activities/                     Menu: Activities
    teaching.html                   Teaching
    role-in-journals.html           Role in journals
conferences/                    Menu: Conferences
    conferences.html                Conferences
    workshops.html                  Workshops
    certification-fdp.html          Certification programmes & FDPs
book-suggestions/
    book-suggestion.html        Menu: Book suggestions
gallery/
    photo-gallery.html          Menu: Gallery
    photos/                     put gallery photos here
contact/
    contact.html                Menu: Contact

animations/                     one folder per page; each animation = a .js file + a .css file for its look
    animations.js                   the loader: finds every data-anim="..." on a page and loads those files
    all-pages/                      used on every page
        banner-pattern.js / .css        Gray–Scott pattern in the banner at the top (and its caption on Home)
        scroll-reveal.js / .css         text fading in as you scroll (added to every page automatically)
    home/                           index.html
        name-animation.js / .css        your name forming letter by letter
        modelling-cycle.js / .css       "the modelling cycle" next to About me
    research-interest/              research/research-interest.html (numbered in page order)
        00-intro-outbreak-spread        picture at the top of the page
        01-infectious-disease-agents    theme 1: Infectious disease modelling
        02-fractional-sir               theme 2: Fractional-order differential equations
        03-optimal-control              theme 3: Optimal control
        04-turing-pattern               theme 4: Spatio-temporal dynamics
        05-rossler-chaos                theme 5: Stability, chaos and bifurcation
        06-sensitivity-analysis         theme 6: Sensitivity analysis
        07-delay-sirs-diagram           theme 7: Delay differential equations
        08-stochastic-sis               theme 8: Stochastic differential equations
        themes-details-panels           the "Details" buttons that open each theme
    citations/                      research/citations.html
        citation-charts.js / .css       Google Scholar and Scopus charts (uses Chart.js)
    co-authors/                     research/co-authors.html
        00-papers-data.js               YOUR DATA: papers and co-authors, edit this to update both diagrams
        01-network-graph.js / .css      co-author network (uses D3)
        02-chord-diagram.js / .css      chord diagram with year filter (uses D3)

assets/                         shared files (not pages)
    css/style.css               fonts, colours, layout for every page
    js/site.js                  top menu, publication filter, recent papers on Home
    images/                     SM-logo.png, suvankar.jpg, iitk.png
sitemap.xml, robots.txt         for search engines (must stay at the top level)
```

## Reading the comments

Every file explains itself, line by line. A comment always describes the line(s) directly BELOW it:

| File type | Comment looks like | Example |
|---|---|---|
| HTML pages (`.html`) | `<!-- ↓ ... -->` | `<!-- ↓ Your position (bold) and department. -->` |
| Styles (`.css`, and `<style>` blocks) | `/* ... */` | `/* Links turn navy when the mouse is over them. */` |
| Scripts (`.js`, and `<script>` blocks) | `// ...` | `// Draw the diagram with all years ticked.` |

Browsers ignore comments, so they never appear on the website. Lists of similar entries
(papers, books, journals, conferences, co-authors) explain their format once, at the top
of the list, instead of on every entry.

Two things to avoid when you add your own comments:
- inside an HTML comment, never type `-->` (it ends the comment early);
- inside a CSS or JS `/* ... */` comment, never type `*/` (same reason).

## Finding things inside a page

Every page has the same labelled blocks, written as HTML comments:

```
<!-- PAGE / FILE / MENU -->            which page this is
<!-- ===== TOP MENU ===== -->           built by assets/js/site.js (nothing to edit here)
<!-- ===== BANNER ===== -->             the page title at the top
<!-- ===== MAIN CONTENT ===== -->       the text of the page: edit here
<!-- ===== SECTION: ... ===== -->       each heading inside the page
<!-- ===== THEME: ... ===== -->         each theme on Research interest
<!-- ===== YEAR 2026 ===== -->          each year on Publications
<!-- ===== END OF MAIN CONTENT ===== -->
<!-- ===== FOOTER ===== -->
```

Search the file (Ctrl+F) for `SECTION`, `THEME` or `YEAR` to jump to a block, and for `data-anim` to find the animations.

## How animations are placed on a page

Each page has one line in its `<head>` that loads the animation loader:

```
<script src="../animations/animations.js"></script>      (no ../ on index.html)
```

To show an animation, write one empty element where it should appear, naming its file
(the path inside `animations/`, without `.js`):

```
<div data-anim="home/modelling-cycle"></div>
```

The loader then loads `animations/home/modelling-cycle.css` and `.js`, and the `.js` file
builds everything that belongs to the animation inside that element: the drawing, its
caption or key, and the paragraphs and equations that explain it. So to change the text
about an animation, edit the block at the top of its `.js` file.

If an animation needs a library or a data file first, list them before it, separated by spaces:

```
<div data-anim="d3 co-authors/00-papers-data co-authors/01-network-graph"></div>
```

`d3` and `chartjs` are short names for the two libraries (set in `animations/animations.js`).
A few animations sit on an element that is already there instead of an empty one:
the banner (`<div class="banner ..." data-anim="all-pages/banner-pattern">`), your name on Home,
the theme list on Research interest, and the citation cards (the numbers in the tables
stay in the page so you can edit them there).

## Common tasks

- **Add a page to the menu:** edit `MENU` near the top of `assets/js/site.js`. Paths there are written from the top folder, for example `'research/publications.html'`.
- **Add a new page:** copy a page from the same folder and edit it. If it goes in a different folder, check that its links to `../assets/...` and `../animations/...` still start with the right number of `../`.
- **Change an animation, or the text that explains it:** open its file in `animations/<page>/`. Its look (sizes, colours) is in the `.css` file with the same name.
- **Add a new animation:** make `animations/<page>/<name>.js` and `<name>.css`, then put `<div data-anim="<page>/<name>"></div>` where it should appear. Nothing else on the page needs to change.
- **Update the co-author diagrams:** edit `animations/co-authors/00-papers-data.js`.
- **After changing style.css or site.js:** raise the `?v=8` number on every page so visitors' browsers load the new file.
- **Add a paper:** in `research/publications.html`, copy one `<li ...>` under the right `YEAR` and edit it.
