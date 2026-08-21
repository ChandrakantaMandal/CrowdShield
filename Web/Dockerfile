# ---------- Dependencies ----------
FROM node:22-alpine AS deps

WORKDIR /app/dependencies

COPY package*.json ./
RUN npm ci


# ---------- Build ----------
FROM node:22-alpine AS builder

WORKDIR /app/build

COPY --from=deps /app/dependencies/node_modules ./node_modules
COPY package*.json ./
COPY . .

RUN npm run build


# ---------- Production ----------
FROM node:22-alpine AS production

WORKDIR /app


USER node

COPY --from=builder --chown=node:node /app/build/package*.json ./
COPY --from=builder --chown=node:node /app/build/dist ./dist
COPY --from=deps --chown=node:node /app/dependencies/node_modules ./node_modules

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]