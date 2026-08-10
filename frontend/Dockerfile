# ===== Stage 1: Build =====
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first (cache dependency layer)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Build for production (skip type-check in Docker — CI handles it)
RUN npm run build

# ===== Stage 2: Serve with Nginx =====
FROM nginx:alpine

# Copy Nginx config (SPA routing + API proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
