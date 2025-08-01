FROM nginx:1.25.1-alpine AS production-stage
COPY ./app /usr/share/nginx/html
EXPOSE 8084
CMD ["nginx", "-g", "daemon off;"]