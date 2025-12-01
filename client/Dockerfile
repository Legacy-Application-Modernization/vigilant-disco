# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_URL
ARG VITE_BACKEND_API_URL
ARG VITE_APP_ENV
ARG VITE_MCP_API_URL
ARG VITE_MCP_API_KEY
ARG VITE_ENABLE_ANALYTICS

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_MCP_API_URL=$VITE_MCP_API_URL
ENV VITE_MCP_API_KEY=$VITE_MCP_API_KEY
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built files from build stage to nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]