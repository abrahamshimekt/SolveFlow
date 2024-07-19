FROM node:alpine
WORKDIR /app
COPY package.json ./
COPY ./ ./
ENV REACT_APP_PROD_BASE_URL=https://autobamvp-backend-production.up.railway.app
RUN npm i
RUN npm install -g serve
RUN npm run build
CMD serve -s build