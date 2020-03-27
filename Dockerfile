
FROM node
WORKDIR /app
ADD package.json .
RUN npm install --production
ADD . /app/
CMD node server.js