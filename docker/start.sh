mkdir -p /usr/share/nginx/html/scripts/configs/ && envsubst < /usr/share/nginx/config.template.json > /usr/share/nginx/html/scripts/configs/config.json && exec nginx -g 'daemon off;'
