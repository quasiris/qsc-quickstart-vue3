# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vue.js app
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the built files from the build stage
COPY --from=build /app/dist ./dist

# Copy the server files
COPY server ./server

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]