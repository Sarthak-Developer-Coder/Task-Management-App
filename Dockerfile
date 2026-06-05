FROM node:18-slim
WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci --only=production

# copy source
COPY . .

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE ${PORT}

CMD [ "node", "backend/server.js" ]
