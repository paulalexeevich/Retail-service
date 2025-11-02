FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories
RUN mkdir -p /var/www/certbot

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

