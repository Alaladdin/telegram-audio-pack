FROM node:16-alpine as builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN npm config rm proxy
RUN npm config rm https-proxy
RUN yarn config delete https-proxy
RUN yarn config delete proxy

RUN yarn install --frozen-lockfile --link-duplicates

COPY . .

RUN yarn build

FROM node:16-alpine as production-builder

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

RUN yarn install --frozen-lockfile --link-duplicates --production

FROM node:16-alpine

WORKDIR /usr/src/app

COPY --from=production-builder /usr/src/app/ ./

CMD [ "npm", "run", "start:prod" ]
