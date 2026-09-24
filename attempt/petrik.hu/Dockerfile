# Builds the static pixel-port (vite build) and runs the /hirkezelo/ Express
# backend (server/, see AGENT.md 6.15), which also serves that built site -
# see server/index.ts. One image, one process, one command to run the whole
# app - docker-compose.yml is the "one command" this was asked for.
FROM node:24-alpine

WORKDIR /app

# better-sqlite3 falls back to compiling its native addon from source on
# Alpine/arm64 rather than using its own prebuilt binary - these are what
# node-gyp needs to do that.
RUN apk add --no-cache python3 make g++

# Installed separately from the rest of the source so this layer only
# rebuilds when a dependency actually changes, not on every code edit.
COPY package.json package-lock.json ./
RUN npm ci

# server/ imports shared/pnw/categories.ts, which in turn reads
# src/data/archives.ts (a plain data file, no browser APIs) - the backend
# needs the frontend's generated data present too, not just its own code.
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "--experimental-strip-types", "server/index.ts"]
