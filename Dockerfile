FROM node:20.9.0-alpine3.17 as build

COPY package*.json /

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM node:20.9.0-alpine3.17

RUN apk --no-cache add git

COPY --from=build dist/run.mjs /run.mjs

COPY package*.json /

RUN npm ci --production --ignore-scripts

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
