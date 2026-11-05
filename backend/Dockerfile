FROM node:20-alpine
ENV NODE_ENV=production

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend ./

EXPOSE 3001
CMD ["node", "src/index.js"]
