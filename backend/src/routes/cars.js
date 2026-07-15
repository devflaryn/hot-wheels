const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/cars?year=2025 — full catalog (optionally per year), grouped client-side
router.get('/', (req, res) => {
  const { year } = req.query;
  let rows;
  if (year) {
    rows = db
      .prepare('SELECT * FROM cars WHERE year = ? ORDER BY collector_number, id')
      .all(Number(year));
  } else {
    rows = db.prepare('SELECT * FROM cars ORDER BY year DESC, collector_number, id').all();
  }
  res.json({
    cars: rows.map((r) => ({
      id: r.id,
      year: r.year,
      collectorNumber: r.collector_number,
      seriesPosition: r.series_position,
      name: r.name,
      series: r.series,
    })),
  });
});

// GET /api/cars/years — available years with counts
router.get('/years', (_req, res) => {
  const rows = db
    .prepare('SELECT year, COUNT(*) AS total FROM cars GROUP BY year ORDER BY year DESC')
    .all();
  res.json({ years: rows });
});

module.exports = router;
