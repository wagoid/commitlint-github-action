FROM node:10-stretch-slim

COPY package*.json /

RUN npm ci --production

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
