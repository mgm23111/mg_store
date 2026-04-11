# Multi-stage build for React + Vite application

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_CULQI_PUBLIC_KEY

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_CULQI_PUBLIC_KEY=${VITE_CULQI_PUBLIC_KEY}

# Copy package files
COPY package*.json ./

# Install all dependencies required for build (tsc/vite are devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy built files from build stage
COPY --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
