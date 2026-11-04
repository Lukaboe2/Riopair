# LUKA-AI Pair - Railway and Koyeb
FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

# Baileys has a dependency fetched from Git; install git before npm install.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

EXPOSE 8000
CMD ["npm", "start"]
