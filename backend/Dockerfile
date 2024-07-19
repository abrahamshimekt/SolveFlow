# Use the official Node.js image with Debian Buster as a base
FROM node:16-buster

# Install Java
RUN apt-get update && \
  apt-get install -y openjdk-11-jdk && \
  apt-get clean

# Install Graphviz
RUN apt-get update && apt-get install -y graphviz

# Set JAVA_HOME and update PATH
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV PATH $JAVA_HOME/bin:$PATH

# Set GRAPHVIZ_DOT environment variable (assuming default installation location)
ENV GRAPHVIZ_DOT /usr/bin/dot

# Verify Java installation
RUN java -version

# Test Graphviz installation (optional)
RUN dot -v  # This will pr
# Create app directory
WORKDIR /app
COPY package.json ./
COPY ./ ./
ENV MONGO_URI=mongodb://mongo:ZwfMLhpmDIblywIJKwLxeVhBBJPBPdSi@roundhouse.proxy.rlwy.net:23413
ENV CLIENT_ID=754753154937-i1gtrbnq1ppbvtcnn38qgqn2egsvg0v1.apps.googleusercontent.com
ENV CLIENT_SECRET=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
ENV SERVER_URL=https://autobamvp-backend-production.up.railway.app
ENV JWT_SECRET=22a945e2291ffecfe3e53e85d9ee82299d96555ad7dc881e741d703fde128e73
ENV PORT=8000
ENV CLIENT_URL=https://autobamvp-frontend-production.up.railway.app
ENV OPEN_AI_API_KEY=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
RUN npm i
CMD npm run start
