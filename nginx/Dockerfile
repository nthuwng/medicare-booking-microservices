# nginx/Dockerfile
FROM node:20-alpine AS build-stage
WORKDIR /usr/frontend
COPY ../Frontend-medicare_booking_app/package*.json ./
RUN npm ci
COPY ../Frontend-medicare_booking_app/ .

# Định nghĩa build args
ARG VITE_BACKEND_URL
ARG VITE_SOCKET_URL
ARG VITE_MESSAGE_SOCKET_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set environment variables cho Vite build
ENV VITE_BACKEND_URL=https://api-gateway-r2nf.onrender.com
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_MESSAGE_SOCKET_URL=$VITE_MESSAGE_SOCKET_URL
ENV VITE_GOOGLE_CLIENT_ID="99710604858-pdku385v2dodo7nlf9fj6nc3uf5e3k67.apps.googleusercontent.com"

RUN npm run build

FROM nginx:alpine
COPY ./nginx/config/nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /usr/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]