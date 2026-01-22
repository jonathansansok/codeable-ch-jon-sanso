FROM node:20.19.0-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["sh", "-lc", "npm run dev -- --host 0.0.0.0 --port 5173"]
