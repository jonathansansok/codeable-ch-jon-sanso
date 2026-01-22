FROM node:20.19.0-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20.19.0-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20.19.0-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json package-lock.json ./
EXPOSE 4000
CMD ["node","dist/index.js"]
