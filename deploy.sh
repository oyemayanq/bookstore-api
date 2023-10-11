#!/bin/bash

# Set the working directory
cd $(dirname $0)

# Install dependencies
# Replace `npm install` with your custom command
npm install --production

# Start the API
npm start