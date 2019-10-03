FROM node:10-alpine

COPY package*.json /

RUN npm ci --production

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
