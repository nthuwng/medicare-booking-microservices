FROM node:20-alpine

WORKDIR /app

COPY services/auth_service/package*.json ./
RUN npm install

COPY shared ./shared
COPY services/auth_service ./

RUN npx prisma generate --schema=prisma/schema.prisma


EXPOSE 8086
CMD ["npm", "run", "dev"]
