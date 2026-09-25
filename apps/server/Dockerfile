# The API (apps/server, AGENT.md 6.15/6.19): Express + SQLite + uploads.
# Build context is the repo root (docker-compose.yml), because the server
# imports shared/ from there. The client is a separate image
# (apps/client/Dockerfile) - nothing of it ends up in here.
FROM node:24-alpine

WORKDIR /app

# better-sqlite3 13 ships prebuilt addons in the package itself (linuxmusl-x64
# and -arm64 among them), and the npm in this image skips its `node-gyp
# rebuild` install script - so nothing is compiled today. The toolchain stays
# so that an npm which does run that script still succeeds instead of
# failing the build.
RUN apk add --no-cache python3 make g++

# npm workspaces: the lockfile is the root one, and `npm ci` wants every
# workspace's package.json present to validate it - but -w installs only the
# server's own dependencies. Copied before the source so this layer is only
# rebuilt when a dependency changes.
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/client/package.json apps/client/
RUN npm ci -w apps/server --omit=dev

COPY shared shared
COPY apps/server apps/server

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "--experimental-strip-types", "apps/server/index.ts"]
