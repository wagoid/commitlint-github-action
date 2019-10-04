FROM node:10

COPY package*.json /

RUN npm ci --production

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
