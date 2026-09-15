# syntax=docker/dockerfile:1

# ---- Build stage -----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables into the JS bundle at build time, so they must
# arrive as build args, not container runtime env vars. On Dokploy, set these
# in the app's "Environment" tab — it injects them before `docker build`.
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""
ARG VITE_FORM_SUBMISSION_API_URL=""
ARG VITE_FORM_SUBMISSION_API_KEY=""
ARG VITE_ASSISTANT_API_URL=""
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_FORM_SUBMISSION_API_URL=${VITE_FORM_SUBMISSION_API_URL} \
    VITE_FORM_SUBMISSION_API_KEY=${VITE_FORM_SUBMISSION_API_KEY} \
    VITE_ASSISTANT_API_URL=${VITE_ASSISTANT_API_URL}

RUN npm run build

# ---- Runtime stage ----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/app.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --retries=3 --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
