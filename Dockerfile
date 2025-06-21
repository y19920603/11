FROM node:lts-alpine AS frontend

# 接收版本參數
ARG VITE_APP_VERSION=dev
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN npm install -g pnpm
WORKDIR /app
COPY package.json ./
COPY packages ./packages  
RUN pnpm install
COPY . ./
RUN pnpm run build

FROM nginx:alpine

ENV API_HOST=pokercmsapi_gateway
ENV API_PORT=8039

COPY --from=frontend /app/dist /usr/share/nginx/html

COPY nginx/nginx.conf.template /etc/nginx/conf.d/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]