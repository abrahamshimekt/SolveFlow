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

