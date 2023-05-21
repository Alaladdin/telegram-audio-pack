FROM node:18-slim as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --link-duplicates --network-timeout 1000000

COPY . .

RUN yarn build

FROM node:18-slim as production-builder

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/yarn.lock ./
COPY --from=builder /usr/src/app/node_modules ./node_modules

RUN #yarn --production --ignore-scripts --prefer-offline --network-timeout 1000000

FROM node:18-slim

WORKDIR /usr/src/app

COPY --from=production-builder /usr/src/app/ ./

CMD ["npm", "run", "start:prod"]
