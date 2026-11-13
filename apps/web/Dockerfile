# Étape 1 : Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN npm run build || true

# Étape 2 : Production
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
