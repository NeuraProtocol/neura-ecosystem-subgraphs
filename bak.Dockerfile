# Stage 1: Build stage
FROM node:22-bullseye-slim AS build

# Install system dependencies
RUN apt-get update && \
    apt-get install -y git python3 build-essential curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy package.json and yarn.lock (if exists)
COPY package.json ./
COPY yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PATH="/app/node_modules/.bin:${PATH}"

# Install global graph-cli (optional, as it's already in dependencies)
RUN yarn global add @graphprotocol/graph-cli

# Verify installation
RUN graph --version

# Stage 2: Final image using graph-node
FROM graphprotocol/graph-node:v0.37.0

# Set the working directory
WORKDIR /app

# Copy build results from the build stage
COPY --from=build /app /app

# Set environment variables if needed (optional)
# ENV PATH="/app/node_modules/.bin:${PATH}"

# Set default command
#CMD ["bash"]

