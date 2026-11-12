/* ==========================================================================
   YOUR DATA: list of papers and co-authors (edit this file to update both diagrams)
   Used on: research/co-authors.html
   ========================================================================== */

/* ===================== YOUR DATA =====================
   One entry per paper: { year: 2025, authors: ["Alice", "Bob", "Carol"] }
   Both charts on this page are drawn from this one list.
   Write each person's name the same way every time.
*/
// ME = your name as it appears in the author lists below; the diagrams put this person in the centre.
const ME = "S. Majee";   // your own name, exactly as written in the list
// papers = one line per paper, in any order. Each line is {year: YEAR, authors:["Name 1", "Name 2", ...]},
// ending with a comma. To add a paper, copy any line, paste it on a new line, and change the year and names.
// (The same co-author spelled two ways, e.g. "S. Jana" and "Shymashree Jana", counts as two different people.)
const papers = [
  {year: 2027, authors:["S. Majee", "S. Jana", "Anand R.", "J. Ramprabhakar", "S. M. Venthan", "N. Thakkar"]},
  {year: 2026, authors:["Shymashree Jana", "S. Jana", "S. Majee", "T. K. Kar"]},
  {year: 2026, authors:["S. Rit", "S. Majee", "S. Barman", "A. De", "S. Jana"]},
  {year: 2022, authors:["S. Majee", "S. Jana", "A. Khatua", "T. K. Kar"]},
  {year: 2022, authors:["S. Majee", "S. Adak", "S. Jana", "M. Mandal", "T. K. Kar"]},
  {year: 2022, authors:["S. Majee", "S. Jana", "D. K. Das", "T. K. Kar"]},
  {year: 2022, authors:["S. Adak", "R. Majumder", "S. Majee", "S. Jana", "T. K. Kar"]},
  {year: 2022, authors:["M. Mandal", "S. Jana", "S. Majee", "A. Khatua", "T. K. Kar"]},
  {year: 2023, authors:["S. Majee", "S. Jana", "S. Barman", "T. K. Kar"]},
  {year: 2023, authors:["S. Majee", "S. Jana", "T. K. Kar"]},
  {year: 2023, authors:["S. Majee", "S. Barman", "A. Khatua", "T. K. Kar", "S. Jana"]},
  {year: 2023, authors:["S. Majee", "S. Jana", "T. K. Kar", "S. Barman", "D. K. Das"]},
  {year: 2023, authors:["S. Majee", "T. K. Kar", "S. Jana", "D. K. Das", "J. J. Nieto"]},
  {year: 2024, authors:["S. Barman", "S. Jana", "S. Majee", "T. K. Kar"]},
  {year: 2024, authors:["S. Majee", "S. Jana", "T. K. Kar", "B. Bhunia"]},
  {year: 2024, authors:["S. Barman", "S. Jana", "S. Majee", "D. K. Das", "T. K. Kar"]},
  {year: 2024, authors:["S. Barman", "S. Jana", "S. Majee", "A. Khatua", "T. K. Kar"]},
  {year: 2024, authors:["S. Adak", "S. Barman", "S. Jana", "S. Majee", "T. K. Kar"]},
  {year: 2024, authors:["S. Barman", "S. Jana", "S. Majee", "T. K. Kar"]},
  {year: 2025, authors:["S. Patra", "S. Jana", "S. Adak", "S. Majee", "T. K. Kar"]},
  {year: 2025, authors:["S. Majee", "S. Jana", "T. K. Kar", "Anand R.", "J. Ramprabhakar"]},
  {year: 2025, authors:["S. Barman", "S. Majee", "S. Patra", "S. Jana", "T. K. Kar"]},
  {year: 2025, authors:["Shymashree Jana", "S. Jana", "S. Majee", "T. K. Kar"]},
  {year: 2025, authors:["S. Majee", "S. Jana", "T. K. Kar"]},
  {year: 2026, authors:["S. Patra", "S. Jana", "S. Adak", "S. Barman", "S. Majee", "T. K. Kar"]},
  {year: 2026, authors:["S. Majee", "S. Jana", "Anand R.", "J. Ramprabhakar"]},
  {year: 2026, authors:["S. Adak", "S. Jana", "S. Majee", "T. K. Kar"]},
  {year: 2026, authors:["S. Rit", "S. Jana", "A. De", "S. Majee", "S. Barman"]},
// End of the list.
];
