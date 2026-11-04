# LUKA-AI Pair - portable container for Railway and Koyeb
FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

# Railway injects PORT. On Koyeb, configure PORT=8000 and expose service port 8000.
EXPOSE 8000

CMD ["npm", "start"]
