# Stage 1: builder — compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY backend/ ./backend/

RUN npm ci

RUN npx prisma generate --schema=backend/prisma/schema.prisma

RUN npx tsc -p backend/tsconfig.build.json

# Stage 2: deps — backend-only production dependencies
FROM node:20-alpine AS deps

WORKDIR /app

RUN npm init -y && \
    npm install @prisma/client@^5.13.0 prisma@^5.13.0 cors@^2.8.6 dotenv@^16.4.5 express@^4.19.2 zod@^4.4.3 tsx@^4.19.0

COPY --from=builder /app/backend/prisma/ ./backend/prisma/

# Stage 3: runner — minimal production image
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=builder /app/backend/src/ ./backend/src/
COPY --from=builder /app/backend/prisma/ ./backend/prisma/

RUN npx prisma generate --schema=backend/prisma/schema.prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=backend/prisma/schema.prisma && npx tsx backend/src/main.ts"]
