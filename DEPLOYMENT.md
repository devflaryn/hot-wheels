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

## 4. Keep it running with PM2 (auto-restart on crash and on reboot)

PM2 supervises the Node process: if the app crashes it is restarted within
seconds, and after `pm2 startup` it also comes back automatically when the
whole server reboots. The settings live in `ecosystem.config.js`.

```bash
sudo npm install -g pm2
cd ~/hotwheels
pm2 start ecosystem.config.js   # starts the app with the production settings
pm2 save                        # remember the process list
pm2 startup                     # print a command — run it once with sudo,
                                # so PM2 itself starts on every reboot
```

Useful commands:

```bash
pm2 status              # is it running? how many restarts?
pm2 logs hotwheels      # live logs (errors + output)
pm2 restart hotwheels   # manual restart after an update
```

Check it: open `http://YOUR_VPS_IP/` in a browser, create your account, done.

## 5. Updating later

```bash
cd ~/hotwheels && git pull        # or rsync again
npm install && npm run build
pm2 restart hotwheels
```

Test that auto-restart works: `pm2 status` shows the app `online`; kill it with
`kill <pid>` and PM2 brings it back within a couple of seconds (the restart
counter in `pm2 status` goes up by one).

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
wrapped in a Capacitor WebView. The server address is baked into the build via
`frontend/.env.mobile` (`VITE_API_URL=http://72.62.59.232`), so the app connects
directly on launch with no setup screen. If the server IP ever changes, either
tap "Change server" on the login screen, or update `.env.mobile` and rebuild.

## Installing on your phone

1. The APK ships with the repo, so a normal deploy (`git pull` / rsync) puts it
   on the server. The website then automatically shows a
   "Download the Android app (.apk)" link — on the login page and, once signed
   in, in the header ("Android app"). The link hides itself while the file is
   missing. Open the site on the phone and tap it — or copy the APK over by
   USB/Drive instead.
2. Open the file and allow "install from unknown sources" when prompted.
3. Launch the app and log in — it connects to the baked-in server automatically.

## Rebuilding the APK after changing the frontend

```bash
cd frontend
npm run build -- --mode mobile   # bakes VITE_API_URL from .env.mobile into the app
npx cap sync android
cd android && JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Afterwards run a plain `npm run build` again so `frontend/dist` (what the server
hosts) goes back to same-origin URLs without the baked IP.

This is a debug-signed APK — perfect for installing on your own phone. If you ever
publish to the Play Store you'll need a release keystore (Android Studio →
Build → Generate Signed App Bundle / APK).

> The app talks to your server over plain HTTP (no domain/HTTPS yet); the manifest
> sets `usesCleartextTraffic="true"` for that. When you get a domain with HTTPS,
> nothing needs to change in the app — just enter the https address.
