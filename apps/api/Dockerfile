# Étape 1 : Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm install
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npm run build || true

# Étape 2 : Production
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs
COPY --from=builder /app/apps/api ./
EXPOSE 4000
CMD ["npm", "run", "start"]
