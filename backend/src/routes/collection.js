const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_PHOTOS_PER_CAR = 12;
const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic' };

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(UPLOAD_DIR, String(req.user.id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ALLOWED[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) return cb(null, true);
    cb(new Error('Only JPG, PNG, WEBP or HEIC images are allowed.'));
  },
});

function carOr404(res, carId) {
  const car = db.prepare('SELECT id FROM cars WHERE id = ?').get(carId);
  if (!car) res.status(404).json({ error: 'Car not found.' });
  return car;
}

function getPhotos(userId, carId) {
  return db
    .prepare('SELECT id, path FROM photos WHERE user_id = ? AND car_id = ? ORDER BY id')
    .all(userId, carId)
    .map((p) => ({ id: p.id, url: `/uploads/${p.path}` }));
}

function rowToItem(r, photos) {
  return {
    carId: r.car_id,
    owned: !!r.owned,
    condition: r.condition,
    notes: r.notes,
    photos: photos ?? [],
    updatedAt: r.updated_at,
  };
}

function itemFor(userId, carId) {
  const row = db
    .prepare('SELECT * FROM ownership WHERE user_id = ? AND car_id = ?')
    .get(userId, carId);
  if (!row) return null;
  return rowToItem(row, getPhotos(userId, carId));
}

// GET /api/collection — everything the user owns / has annotated
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM ownership WHERE user_id = ?').all(req.user.id);
  const allPhotos = db
    .prepare('SELECT id, car_id, path FROM photos WHERE user_id = ? ORDER BY id')
    .all(req.user.id);
  const byCar = {};
  for (const p of allPhotos) {
    (byCar[p.car_id] ||= []).push({ id: p.id, url: `/uploads/${p.path}` });
  }
  res.json({ items: rows.map((r) => rowToItem(r, byCar[r.car_id])) });
});

// PUT /api/collection/:carId — toggle/set ownership, condition, notes
router.put('/:carId', (req, res) => {
  const { carId } = req.params;
  if (!carOr404(res, carId)) return;
  const { owned, condition, notes } = req.body || {};

  db.prepare(`
    INSERT INTO ownership (user_id, car_id, owned, condition, notes, updated_at)
    VALUES (@userId, @carId, @owned, @condition, @notes, datetime('now'))
    ON CONFLICT(user_id, car_id) DO UPDATE SET
      owned = COALESCE(@owned, ownership.owned),
      condition = COALESCE(@condition, ownership.condition),
      notes = COALESCE(@notes, ownership.notes),
      updated_at = datetime('now')
  `).run({
    userId: req.user.id,
    carId,
    owned: owned === undefined ? 1 : owned ? 1 : 0,
    condition: condition === undefined ? null : String(condition).slice(0, 50),
    notes: notes === undefined ? null : String(notes).slice(0, 500),
  });

  res.json({ item: itemFor(req.user.id, carId) });
});

// POST /api/collection/:carId/photo — add a photo (multiple allowed)
router.post('/:carId/photo', (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    const { carId } = req.params;
    if (!carOr404(res, carId)) return;
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded.' });

    const count = db
      .prepare('SELECT COUNT(*) AS n FROM photos WHERE user_id = ? AND car_id = ?')
      .get(req.user.id, carId).n;
    if (count >= MAX_PHOTOS_PER_CAR) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: `Maximum ${MAX_PHOTOS_PER_CAR} photos per car.` });
    }

    const relPath = path.join(String(req.user.id), req.file.filename);
    db.transaction(() => {
      db.prepare(`
        INSERT INTO ownership (user_id, car_id, owned, updated_at)
        VALUES (?, ?, 1, datetime('now'))
        ON CONFLICT(user_id, car_id) DO UPDATE SET owned = 1, updated_at = datetime('now')
      `).run(req.user.id, carId);
      db.prepare('INSERT INTO photos (user_id, car_id, path) VALUES (?, ?, ?)').run(
        req.user.id,
        carId,
        relPath
      );
    })();

    res.json({ item: itemFor(req.user.id, carId) });
  });
});

// DELETE /api/collection/:carId/photo/:photoId — remove one photo
router.delete('/:carId/photo/:photoId', (req, res) => {
  const { carId, photoId } = req.params;
  const photo = db
    .prepare('SELECT * FROM photos WHERE id = ? AND user_id = ? AND car_id = ?')
    .get(Number(photoId), req.user.id, carId);
  if (photo) {
    fs.unlink(path.join(UPLOAD_DIR, photo.path), () => {});
    db.prepare('DELETE FROM photos WHERE id = ?').run(photo.id);
  }
  res.json({ item: itemFor(req.user.id, carId) });
});

// DELETE /api/collection/:carId — un-own (also deletes all photos)
router.delete('/:carId', (req, res) => {
  const { carId } = req.params;
  const photos = db
    .prepare('SELECT path FROM photos WHERE user_id = ? AND car_id = ?')
    .all(req.user.id, carId);
  for (const p of photos) fs.unlink(path.join(UPLOAD_DIR, p.path), () => {});
  db.transaction(() => {
    db.prepare('DELETE FROM photos WHERE user_id = ? AND car_id = ?').run(req.user.id, carId);
    db.prepare('DELETE FROM ownership WHERE user_id = ? AND car_id = ?').run(req.user.id, carId);
  })();
  res.json({ ok: true });
});

module.exports = router;
