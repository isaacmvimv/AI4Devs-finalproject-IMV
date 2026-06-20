# Stage 1: builder — compile Vite SPA
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY vite.config.ts tsconfig.json ./
COPY frontend/ ./frontend/

RUN npm ci && npm run build

# Stage 2: runner — serve static assets with nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/frontend/dist/ /usr/share/nginx/html/
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
