# Coral CMS — operations

A small Node/Express app that renders the public site and provides an admin to
add/edit/delete **Service** and **Works** entries and edit the **Recruit** page.
Content lives in `server/data/content.json`; uploaded images in `assets/uploads/`.

## Where things run (VPS 162.43.37.193)

- App dir: `/var/www/coral/server` — runs as the `coral-cms` systemd service (user `www-data`, port 3000).
- nginx reverse-proxies `:80` → `:3000` (config: `/etc/nginx/sites-available/coral`).
- Public site: `http://162.43.37.193/`  ·  Admin: `http://162.43.37.193/admin`

## Service control

```bash
systemctl status coral-cms
systemctl restart coral-cms
journalctl -u coral-cms -e        # logs
```

## Change the admin password

```bash
cd /var/www/coral/server
node scripts/set-password.js 'a-new-strong-password'   # min 8 chars
systemctl restart coral-cms
```

## ⚠ Security TODO (before real use)

- The admin login currently runs over **plain HTTP** — the password is sent in clear text.
  Set up a domain + free TLS (Let's Encrypt) before using the admin over the internet:
  point an A record at the VPS, then `certbot --nginx -d <domain>`, and set
  `Environment=COOKIE_SECURE=1` in `/etc/systemd/system/coral-cms.service`.
- Until then, optionally lock `/admin` to your IP (see the commented block in the nginx config).

## Redeploying code from the local repo  — IMPORTANT

The server's `server/data/` (content the client edits) and `assets/uploads/` (uploaded
images) are the source of truth once the CMS is in use. **Exclude them** so a code deploy
never overwrites client content or deletes uploads:

```bash
cd ~/Documents/coral-site
rsync -avz \
  --exclude 'server/node_modules' \
  --exclude 'server/data' \
  --exclude 'assets/uploads' \
  --exclude 'server/data/config.json' \
  --exclude '.git' \
  ./index.html ./assets ./server root@162.43.37.193:/var/www/coral/
ssh root@162.43.37.193 'cd /var/www/coral/server && npm install --omit=dev && systemctl restart coral-cms'
```

(`index.html` here is the **template** with the `<!--CMS:…-->` markers; the app injects
Service/Works/Recruit into it at request time.)
