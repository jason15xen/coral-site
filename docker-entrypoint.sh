#!/bin/sh
set -e

# Fresh/empty data volume: seed the CMS content so the site isn't blank.
if [ ! -f /app/server/data/content.json ]; then
  echo "seeding server/data/content.json"
  cp /app/seed/content.json /app/server/data/content.json
fi

# ADMIN_PASSWORD env (if set) seeds the admin password on first run —
# handled inside the app (store.ensurePasswordFromEnv).
cd /app/server
exec node server.js
