# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev"]
