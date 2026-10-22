# The website (apps/client): built with Vite, served by nginx, which also
# forwards /api/ and /uploads/ to the server container (nginx.conf) - so the
# browser only ever talks to one origin, as it does with Vite's dev proxy.
# Build context is the repo root (docker-compose.yml), because the client
# imports shared/ from there.

FROM node:24-alpine AS build
WORKDIR /app

# Only the client's dependencies (npm workspaces, see apps/server/Dockerfile).
COPY package.json package-lock.json ./
COPY apps/client/package.json apps/client/
COPY apps/server/package.json apps/server/
RUN npm ci -w apps/client

COPY shared shared
COPY apps/client apps/client
RUN npm run build -w apps/client

FROM nginx:1.27-alpine
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
# No media in here: the mirrored images and PDFs live in the server's database
# (apps/client/Dockerfile.dockerignore keeps public/media out of the build).
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
EXPOSE 80
