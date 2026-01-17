FROM node:20-alpine

WORKDIR /app

COPY services/user_service/package*.json ./
RUN npm install

COPY shared ./shared
COPY services/user_service ./

RUN npx prisma generate --schema=prisma/schema.prisma


EXPOSE 8081
CMD ["npm", "run", "dev"]
