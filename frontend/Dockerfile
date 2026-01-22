FROM node:20.19.0-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20.19.0-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_GRAPHQL_URL
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
RUN npm run build

FROM nginx:1.27-alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
