FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/db ./db
COPY --from=builder /app/public ./public

USER appuser

EXPOSE 1112

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:1112/api/health || exit 1

CMD ["node", "server.js"]
