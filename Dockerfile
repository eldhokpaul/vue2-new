FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add python3 make g++
RUN yarn install

CMD ["yarn", "serve"]
