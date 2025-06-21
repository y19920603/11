#!/bin/sh

echo "🌐 Substituting API_HOST=${API_HOST}, API_PORT=${API_PORT} into Nginx config..."
envsubst '$API_HOST $API_PORT' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'