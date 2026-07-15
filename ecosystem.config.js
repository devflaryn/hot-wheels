// PM2 production config — start with:  pm2 start ecosystem.config.js
// PM2 restarts the app if it crashes; `pm2 save` + `pm2 startup` make it
// start again automatically after a server reboot.
module.exports = {
  apps: [
    {
      name: 'hotwheels',
      script: 'backend/src/server.js',
      cwd: __dirname,

      // Restart behavior
      autorestart: true,        // restart on crash
      restart_delay: 2000,      // wait 2s between restarts
      max_restarts: 20,         // give up after 20 crashes within min_uptime
      min_uptime: '10s',        // a run shorter than 10s counts as a crash
      max_memory_restart: '300M', // restart if memory leaks past 300 MB

      // Logs: ~/.pm2/logs/hotwheels-out.log and hotwheels-error.log
      time: true,               // prefix log lines with a timestamp

      // The app reads PORT / JWT_SECRET etc. from backend/.env itself,
      // so no env vars are needed here.
    },
  ],
};
