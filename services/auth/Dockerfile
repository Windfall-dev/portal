FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Build your TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "dist/index.js"]
