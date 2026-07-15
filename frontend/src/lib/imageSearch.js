import { createWorker } from 'tesseract.js';

// All OCR assets are self-hosted (see public/tesseract/) so the feature works
// under our CSP, offline after first load, and inside the Android app.
let workerPromise = null;

function getWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = createWorker('eng', 1, {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract/core',
      langPath: '/tesseract/lang',
      // uncompressed: the Android asset packager strips .gz extensions
      gzip: false,
      workerBlobURL: false,
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) onProgress(m.progress);
      },
    });
  }
  return workerPromise;
}

export async function recognizeText(file, onProgress) {
  try {
    const worker = await getWorker(onProgress);
    const { data } = await worker.recognize(file);
    return data.text || '';
  } catch (e) {
    // Don't cache a failed worker — allow the next attempt to start fresh
    workerPromise = null;
    throw e;
  }
}

// --- Fuzzy matching -------------------------------------------------------

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s) {
  return normalize(s)
    .split(' ')
    .filter((w) => w.length >= 2);
}

// true if a and b are equal or within one edit (for OCR misreads)
function closeEnough(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length < 5 || b.length < 5) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

const STOPWORDS = new Set(['the', 'and', 'hw', 'hot', 'wheels', 'car', 'de', 'la']);

/**
 * Score every car against the OCR text and return the best matches.
 * cars: [{ id, year, collectorNumber, name, series }]
 */
export function matchCars(ocrText, cars, limit = 6) {
  const ocrTokens = tokenize(ocrText);
  if (!ocrTokens.length) return [];
  const ocrSet = new Set(ocrTokens);
  const ocrJoined = ocrTokens.join(' ');

  const scored = [];
  const seenNames = new Set();

  for (const car of cars) {
    const nameTokens = tokenize(car.name).filter((t) => !STOPWORDS.has(t));
    if (!nameTokens.length) continue;

    let hits = 0;
    for (const nt of nameTokens) {
      if (ocrSet.has(nt)) {
        hits += 1;
        continue;
      }
      let best = 0;
      for (const ot of ocrTokens) {
        if (closeEnough(nt, ot)) {
          best = Math.max(best, 0.9);
        } else if (nt.length >= 4 && (ot.includes(nt) || nt.includes(ot)) && ot.length >= 4) {
          best = Math.max(best, 0.7);
        }
      }
      hits += best;
    }

    let score = hits / nameTokens.length;
    if (score <= 0) continue;

    // Bonus: full normalized name appears as a phrase in the OCR text
    if (nameTokens.length > 1 && ocrJoined.includes(nameTokens.join(' '))) score += 0.5;
    // Slight preference for longer (more specific) names among equal ratios
    score += Math.min(nameTokens.length, 5) * 0.01;

    scored.push({ car, score });
  }

  scored.sort((a, b) => b.score - a.score || b.car.year - a.car.year);

  const out = [];
  for (const s of scored) {
    if (s.score < 0.55) break;
    const key = normalize(s.car.name) + '|' + s.car.year;
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
