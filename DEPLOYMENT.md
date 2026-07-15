# Deploying to your VPS (no domain, IP access)

One Node process serves the API, the website and uploaded photos. You reach it at
`http://YOUR_VPS_IP/`.

## 1. Install Node.js on the VPS (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
```

`build-essential` is needed once so `better-sqlite3` can compile its native module.

## 2. Copy the project to the VPS

From your Mac:

```bash
rsync -av --exclude node_modules --exclude dist --exclude legacy \
  "~/Desktop/Hot Wheels/" youruser@YOUR_VPS_IP:~/hotwheels/
```

(or push to a git repo and clone it on the VPS.)

## 3. Install and build on the VPS

```bash
cd ~/hotwheels
npm install              # one install for backend + frontend (npm workspaces)
npm run build            # creates frontend/dist

cp backend/.env.example backend/.env
nano backend/.env        # REQUIRED: set JWT_SECRET (long random string), set PORT=80
```

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Port 80 note:** binding to port 80 needs root. The cleanest way without running
> the app as root:
>
> ```bash
> sudo setcap 'cap_net_bind_service=+ep' $(which node)
> ```
>
> Or keep `PORT=3000` and access the site as `http://YOUR_VPS_IP:3000` (open the port
> in your firewall: `sudo ufw allow 3000`).

## 4. Keep it running with PM2

```bash
sudo npm install -g pm2
cd ~/hotwheels
pm2 start backend/src/server.js --name hotwheels
pm2 save
pm2 startup            # run the command it prints, so it survives reboots
```

Check it: open `http://YOUR_VPS_IP/` in a browser, create your account, done.

## 5. Updating later

```bash
cd ~/hotwheels && git pull        # or rsync again
npm install && npm run build
pm2 restart hotwheels
```

Your data is safe across updates — it lives in `backend/data/` and `backend/uploads/`.
**Back up those two folders regularly**, e.g.:

```bash
tar czf hotwheels-backup-$(date +%F).tgz backend/data backend/uploads
```

## 6. When you get a domain (later)

Point the domain's A record at your VPS IP, put nginx or Caddy in front for HTTPS
(Caddy is easiest: `caddy reverse-proxy --from yourdomain.com --to localhost:3000`),
and switch `PORT` back to 3000.

---

# The Android APK

The app ships as `HotWheelsCollection.apk` in the project root — the React app
wrapped in a Capacitor WebView. **You don't need to bake your server IP into the
build**: on first launch the app asks for your server address (e.g.
`http://YOUR_VPS_IP:3000`), checks it, and remembers it. If the IP ever changes,
tap "Change server" on the login screen.

## Installing on your phone

1. Copy `HotWheelsCollection.apk` to the phone (USB, Google Drive, or just open
   `http://YOUR_VPS_IP:3000/HotWheelsCollection.apk` if you copy the APK into
   `frontend/dist/` on the server).
2. Open the file and allow "install from unknown sources" when prompted.
3. Launch the app, enter your server address, and log in.

## Rebuilding the APK after changing the frontend

```bash
cd frontend
npm run build
npx cap sync android
cd android && JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

This is a debug-signed APK — perfect for installing on your own phone. If you ever
publish to the Play Store you'll need a release keystore (Android Studio →
Build → Generate Signed App Bundle / APK).

> The app talks to your server over plain HTTP (no domain/HTTPS yet); the manifest
> sets `usesCleartextTraffic="true"` for that. When you get a domain with HTTPS,
> nothing needs to change in the app — just enter the https address.
