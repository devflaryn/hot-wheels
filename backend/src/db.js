const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'hotwheels.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cars (
    id TEXT PRIMARY KEY,
    year INTEGER NOT NULL,
    collector_number TEXT NOT NULL,
    series_position TEXT,
    name TEXT NOT NULL,
    series TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
  CREATE INDEX IF NOT EXISTS idx_cars_number ON cars(year, collector_number);

  CREATE TABLE IF NOT EXISTS ownership (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    owned INTEGER NOT NULL DEFAULT 1,
    condition TEXT,
    notes TEXT,
    photo_path TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, car_id)
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_photos_user_car ON photos(user_id, car_id);
`);

// Migration: move single-photo records (v1 schema) into the photos table
const legacyPhotos = db
  .prepare('SELECT user_id, car_id, photo_path FROM ownership WHERE photo_path IS NOT NULL')
  .all();
if (legacyPhotos.length) {
  const insert = db.prepare('INSERT INTO photos (user_id, car_id, path) VALUES (?, ?, ?)');
  const clear = db.prepare('UPDATE ownership SET photo_path = NULL WHERE user_id = ? AND car_id = ?');
  db.transaction(() => {
    for (const p of legacyPhotos) {
      insert.run(p.user_id, p.car_id, p.photo_path);
      clear.run(p.user_id, p.car_id);
    }
  })();
  console.log(`Migrated ${legacyPhotos.length} photo(s) to the multi-photo table.`);
}

function seedCars() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM cars').get().n;
  const seedPath = path.join(__dirname, 'seed', 'cars.json');
  if (!fs.existsSync(seedPath)) return;
  const cars = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  if (count >= cars.length) return;

  const upsert = db.prepare(`
    INSERT INTO cars (id, year, collector_number, series_position, name, series)
    VALUES (@id, @year, @collectorNumber, @seriesPosition, @name, @series)
    ON CONFLICT(id) DO UPDATE SET
      series_position = excluded.series_position,
      name = excluded.name,
      series = excluded.series
  `);
  const tx = db.transaction((rows) => rows.forEach((r) => upsert.run(r)));
  tx(cars);
  console.log(`Seeded ${cars.length} cars into the catalog.`);
}

seedCars();

module.exports = db;
