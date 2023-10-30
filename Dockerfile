FROM node:16.15.0-alpine

WORKDIR /usr/src/app

ADD package.json yarn.lock ./
RUN apk add --no-cache git && yarn install

ADD . .

EXPOSE 3000
EXPOSE 9229
CMD ["yarn", "start:dev"]