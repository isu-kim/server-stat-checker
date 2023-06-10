FROM ubuntu

RUN apt-get update
RUN apt-get install -y npm

WORKDIR /app
COPY package.json ./
COPY public ./public
COPY src ./src

RUN npm install

EXPOSE 3000
CMD npm start
