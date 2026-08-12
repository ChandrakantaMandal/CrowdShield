# ---------- Dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app/deps

COPY package*.json ./

RUN npm ci


# ---------- Build ----------
FROM node:22-alpine AS builder

WORKDIR /app/build

COPY --from=deps /app/deps/node_modules ./node_modules
COPY package*.json ./
COPY . .

RUN npm run build


# ---------- Production ----------
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/build/dist ./dist

RUN npm install -g serve

USER node

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]