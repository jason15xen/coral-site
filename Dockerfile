FROM node:20-alpine

WORKDIR /app

# install production deps first (layer cache)
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev --no-audit --no-fund

# app code + static site
COPY index.html ./
COPY assets ./assets
COPY server ./server

# keep a pristine copy of the seed content: the data volume shadows
# /app/server/data, so the entrypoint restores content.json when missing
RUN mkdir -p /app/seed && cp server/data/content.json /app/seed/content.json

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && mkdir -p server/data assets/uploads \
 && chown -R node:node /app

USER node

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
