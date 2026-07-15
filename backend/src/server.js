const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const carsRoutes = require('./routes/cars');
const collectionRoutes = require('./routes/collection');

const app = express();
app.set('trust proxy', 1);

// The app is served over plain HTTP (IP address, no domain/TLS yet), so the
// HTTPS-only headers must be off: upgrade-insecure-requests would force the
// browser to fetch every asset over https:// and break the page entirely.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'data:', 'blob:'],
        // wasm-unsafe-eval + workers: needed by the on-device OCR (image search)
        'script-src': ["'self'", "'wasm-unsafe-eval'"],
        'worker-src': ["'self'", 'blob:'],
        // null removes the directive from helmet's defaults
        'upgrade-insecure-requests': null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
    hsts: false,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));

// CORS: needed for the Capacitor mobile app (runs from capacitor:// / localhost origin)
app.use(cors({ origin: true, credentials: false }));

// API
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/collection', collectionRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// User-uploaded photos
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', fallthrough: false }));

// Android APK download. The APK is not in git — copy it to the project root on
// the server (scp HotWheelsCollection.apk user@server:~/hotwheels/). The login
// page only shows the download link when this file exists.
const APK_FILE = process.env.APK_FILE || path.join(__dirname, '..', '..', 'HotWheelsCollection.apk');
app.get('/HotWheelsCollection.apk', (_req, res) => {
  if (!fs.existsSync(APK_FILE)) return res.status(404).json({ error: 'APK not available' });
  res.download(APK_FILE, 'HotWheelsCollection.apk');
});

// Frontend build (single-host deployment: Express serves the React app)
const FRONTEND_DIST = process.env.FRONTEND_DIST || path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST, { maxAge: '1h', index: 'index.html' }));
  // SPA fallback for client-side routes
  app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.get('/', (_req, res) =>
    res
      .status(503)
      .send('Frontend build not found. Run "npm run build" inside the frontend folder.')
  );
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Hot Wheels catalog running at http://${HOST}:${PORT}`);
});
