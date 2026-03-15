FROM node:20-slim

# Install system deps
RUN apt-get update && apt-get install -y openssl netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy ONLY package files first (layer caching)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Remove dist if it exists from your host
RUN rm -rf dist

# Generate Prisma client BEFORE build
RUN npx prisma generate

# Build fresh
RUN npm run build

# Entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

CMD ["sh", "/app/docker-entrypoint.sh"]
