/* ==========================================================================
   Google Scholar and Scopus citation charts (uses Chart.js)
   Used on: research/citations.html
   Loaded by animations/animations.js: the page has <div class="cm" data-anim="chartjs citations/citation-charts">,
   so Chart.js (a charting library) is loaded first, then this file.
   This file adds the two drawing areas (<canvas>) into the chart spaces of the page.
   TO UPDATE THE NUMBERS: edit the lines marked "<-- your data" (and the year labels above them).
   Comments starting with // explain the line(s) directly below them.
   ========================================================================== */

// Put a drawing area into each chart space: <div class="gs-chart"> (Google Scholar) and <div id="scopusChartWrap"> (Scopus).
document.querySelector('.gs-chart').innerHTML = '<canvas id="citationsChart"></canvas>';
document.getElementById('scopusChartWrap').innerHTML = '<canvas id="docCitationChart"></canvas>';

/* ---------- Google Scholar: citations per year ---------- */
// Draw a new chart in <canvas id="citationsChart"> with these settings:
new Chart(document.getElementById('citationsChart'), {
  // a bar chart;
  type: 'bar',
  data: {
    // the years along the bottom (one per bar);
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    datasets: [{
      // name of the series (shown in the tooltip);
      label: 'Citations',
      // citations in each year, in the same order as the years above;
      data: [3, 7, 51, 86, 195, 173],                    // <-- your data
      // bar colour: grey, 80% opaque.
      backgroundColor: 'rgba(128, 128, 128, 0.8)',
    }]
  },
  options: {
    // resize with the page,
    responsive: true,
    // and fill the box's height instead of keeping a fixed shape.
    maintainAspectRatio: false,
    scales: {
      // horizontal axis: no grid lines, dark grey labels;
      x: { grid: { display: false }, ticks: { color: '#333' } },
      // vertical axis: starts at 0, no grid lines, dark grey labels.
      y: { beginAtZero: true, grid: { display: false }, ticks: { color: '#333' } }
    },
    // No legend (there is only one series).
    plugins: { legend: { display: false } }
  }
});

/* ---------- Scopus: documents (bars, left axis) + citations (line, right axis) ---------- */
// Draw a new chart in <canvas id="docCitationChart">: bars for documents and a line for citations.
new Chart(document.getElementById('docCitationChart'), {
  // default type: bar (each series below sets its own type);
  type: 'bar',
  data: {
    // the years along the bottom;
    labels: ['2022', '2023', '2024', '2025', '2026', '2027'],
    datasets: [
      // Series 1: documents per year, as bars.
      {
        type: 'bar',
        label: 'Documents',
        // documents in each year, same order as the years;
        data: [5, 4, 3, 9, 5, 0],                        // <-- your data
        // blue bars, 70% opaque;
        backgroundColor: 'rgba(0, 102, 204, 0.7)',
        // measured on the left axis (yDocs, defined below);
        yAxisID: 'yDocs',
        // shown as a square in the legend.
        pointStyle: 'rect'
      },
      // Series 2: citations per year, as a line.
      {
        type: 'line',
        label: 'Citations',
        // citations in each year, same order as the years;
        data: [7, 44, 77, 163, 144, 3],                  // <-- your data
        // dark navy line;
        borderColor: 'rgba(10, 10, 60, 0.9)',
        backgroundColor: 'rgba(10, 10, 60, 0.9)',
        // measured on the right axis (yCite);
        yAxisID: 'yCite',
        // straight segments (no curving), 2 px thick;
        tension: 0,
        borderWidth: 2,
        // points: white circles with a navy edge, radius 4;
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(10, 10, 60, 0.9)',
        pointBorderWidth: 2,
        pointRadius: 4,
        // shown as a circle in the legend.
        pointStyle: 'circle'
      }
    ]
  },
  options: {
    // resize with the page and fill the box's height;
    responsive: true,
    maintainAspectRatio: false,
    // hovering anywhere over a year shows both values for that year.
    interaction: { mode: 'index', intersect: false },
    scales: {
      // Left axis for documents: from 0, titled "Documents", ticks every 2, no grid lines.
      yDocs: { type: 'linear', position: 'left', beginAtZero: true,
               title: { display: true, text: 'Documents' }, ticks: { stepSize: 2, color: '#333' }, grid: { display: false } },
      // Right axis for citations: from 0, titled "Citations", ticks every 40, no grid lines.
      yCite: { type: 'linear', position: 'right', beginAtZero: true,
               title: { display: true, text: 'Citations' }, ticks: { stepSize: 40, color: '#333' }, grid: { display: false } },
      // Year axis: dark grey labels, no grid lines.
      x:     { ticks: { color: '#333' }, grid: { display: false } }
    },
    plugins: {
      // Legend at the bottom, using each series' square/circle symbol.
      legend: { display: true, position: 'bottom', labels: { usePointStyle: true } },
      // Tooltip on hover: both series for the year, each with its symbol...
      tooltip: {
        enabled: true, mode: 'index', usePointStyle: true,
        // ...circle for Citations, square for Documents.
        callbacks: { labelPointStyle: (ctx) => ({ pointStyle: ctx.dataset.label === 'Citations' ? 'circle' : 'rect', rotation: 0 }) }
      }
    }
  }
});
