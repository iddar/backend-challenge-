FROM node:12-slim

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install 

COPY . .

EXPOSE 3000

CMD "./script.sh"
