FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci --only=production

COPY src ./src

RUN mkdir -p data

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/backloggdbot.db

CMD ["node", "src/index.js"]
