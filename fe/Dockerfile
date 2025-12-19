# ==================== BUILD STAGE ====================
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL=http://localhost:3000/api

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ==================== PRODUCTION STAGE ====================
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-app && \
    adduser -S nginx-app -u 1001 -G nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
