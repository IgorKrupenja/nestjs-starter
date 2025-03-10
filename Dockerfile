FROM node:22

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -a
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main"]