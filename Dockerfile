# Use the official Node.js image as the base image
FROM node:23-slim

# Set the working directory
WORKDIR /usr/src/app
COPY ./ /usr/src/app

# Ensure Puppeteer downloads its own Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Install required dependencies for Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libxcomposite1 \
    libxrandr2 \
    libxdamage1 \
    libxfixes3 \
    libgbm-dev \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libappindicator3-1 \
    xdg-utils && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Remove any pre-existing node_modules or package-lock.json
RUN rm -rf node_modules package-lock.json

# Clean npm cache and install dependencies
RUN npm cache clean --force && npm install --omit=dev

# Verify Puppeteer's bundled Chromium
RUN node -e "const puppeteer = require('puppeteer'); (async () => { const browser = await puppeteer.launch({ args: ['--no-sandbox'] }); console.log('Chromium version:', await browser.version()); await browser.close(); })();"

# Copy the rest of the application source code
COPY . .

# Expose the port on which your app will run
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
