FROM node:16-alpine3.13

RUN apk --no-cache add git

COPY package*.json /

RUN npm ci --production --ignore-scripts

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
