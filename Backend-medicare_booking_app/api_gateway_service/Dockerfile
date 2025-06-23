# Chọn Node.js image
FROM node:20-alpine

# Tạo thư mục ứng dụng
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build TypeScript nếu có
RUN npm run build || true

# Expose cổng
EXPOSE 8080

# Start server
CMD ["npm", "run", "dev"]
