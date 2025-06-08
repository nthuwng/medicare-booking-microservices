FROM node:20

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cài đặt và cài npm
COPY package*.json ./
RUN npm install

# Copy source code vào
COPY . .

# Mở port container
EXPOSE 8085

# Sử dụng npm start (sẽ chạy nodemon)
CMD ["npm", "start"]