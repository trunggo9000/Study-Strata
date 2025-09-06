# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./
COPY frontend/bun.lockb .

# Install dependencies
RUN npm ci --production

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy .env file for runtime configuration
COPY frontend/.env.production /usr/share/nginx/html/.env

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /etc/nginx/conf.d

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*.html /usr/share/nginx/html/*.ico

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
