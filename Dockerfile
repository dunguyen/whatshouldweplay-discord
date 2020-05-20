FROM node:14-alpine

# Create directory
WORKDIR /usr/src/app

COPY package.json .
RUN npm install

# Copy source to bot
COPY . .

# Delete .env
RUN rm .env -f

# Build
RUN npm run build

# Start Node
CMD ["node", "./dist/index.js"]