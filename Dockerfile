# novela-website — Vite React SPA frontend cho Novela (E-reader / Novel platform).
# Multi-stage Dockerfile cho cả local dev (Vite dev server) lẫn production (Nginx static).
# Host KHÔNG cần Node/npm/pnpm — mọi dependency & build toolchain đều chạy trong container.

# --- STAGE 1: Dependencies ---
# Tải & cache node_modules độc lập. Dùng node:22-alpine + pnpm 9 để tránh dính
# breaking change ERR_PNPM_IGNORED_BUILDS trên pnpm 10+.
FROM node:22-alpine AS deps
WORKDIR /app

# Corepack activate pnpm v9 cố định cho reproducible build
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy package configs + .npmrc để pnpm resolve dependencies chính xác
COPY package.json pnpm-workspace.yaml* .npmrc* ./
RUN pnpm install

# --- STAGE 2: Development target (chạy qua docker-compose) ---
# Chạy Vite dev server (:5173 trong container -> :5573 trên host qua quy ước default + 400).
# Mount live source từ host vào container để hỗ trợ HMR (Hot Module Replacement).
FROM node:22-alpine AS dev
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]

# --- STAGE 3: Production Builder ---
# Chạy `pnpm build` biên dịch React + Vite ra static assets tĩnh ở /app/dist.
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# API base URL nhúng vào bundle. Vite chỉ đọc biến VITE_* CÓ TRONG ENV LÚC BUILD,
# nên đây là điểm cấu hình DUY NHẤT — không thể đổi ở runtime bằng env của pod
# nginx (bundle đã compile xong từ stage này).
# CI truyền qua --build-arg (xem .github/workflows/build-and-deploy.yml); giá trị
# là DOMAIN CÔNG KHAI của Kong gateway vì browser gọi trực tiếp, không qua proxy.
# Không truyền -> rỗng -> client.ts rơi về default '/api/v1' (same-origin) = đúng
# hành vi dev, nhưng ở prod sẽ bị nginx SPA-fallback trả index.html cho request
# JSON -> "invalid JSON response". Vậy nên build prod BẮT BUỘC truyền biến này.
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

# Vite build cho production bundle
RUN pnpm build

# --- STAGE 4: Production Runtime (Nginx Alpine) ---
# Serves file tĩnh từ /app/dist bằng Nginx. Siêu nhẹ (<30MB image size).
# Cấu hình SPA routing (try_files -> index.html), gzip & asset cache control.
FROM nginx:alpine AS runtime

# Cấu hình Nginx custom cho SPA frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bundle tĩnh đã compile ở stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
