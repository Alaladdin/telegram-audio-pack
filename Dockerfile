FROM node:16-slim as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile --link-duplicates --network-timeout 1000000 --production

COPY . .

RUN yarn build

FROM node:16-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

ENV TZ Europe/Moscow

CMD [ "npm", "run", "start:prod" ]
