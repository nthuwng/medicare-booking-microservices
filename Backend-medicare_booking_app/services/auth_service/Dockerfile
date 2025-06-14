FROM node:20

# Tạo thư mục làm việc
WORKDIR /app

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema và generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Mở port container
EXPOSE 8086

# Chạy service
CMD ["npm", "start"]