# Stage 1: Build the React application
FROM docker.io/library/node:latest AS build
WORKDIR /app

# Define build-time variable
ARG VITE_API_URL

# Create .env file with the API URL
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the project
RUN node node_modules/typescript/bin/tsc -b && npx vite build

# Stage 2: Serve the application using Nginx
FROM docker.io/library/nginx:stable-alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80
