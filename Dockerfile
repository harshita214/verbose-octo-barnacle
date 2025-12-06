FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000 5173

# Set environment
ENV NODE_ENV=production

# Start both frontend and backend
CMD ["npm", "run", "dev"]
