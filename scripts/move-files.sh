#!/bin/bash

# Script to move CSS, JS, and Image files to public folder

echo "Moving files to public folder..."

# Move CSS files
echo "Moving CSS files..."
cp *.css public/css/ 2>/dev/null || true

# Move JS files (excluding node_modules and server files)
echo "Moving JS files..."
find . -maxdepth 1 -name "*.js" ! -name "server.js" ! -name "*.config.js" -exec cp {} public/js/ \; 2>/dev/null || true

# Move Images folder
echo "Moving Images folder..."
cp -r Images public/ 2>/dev/null || true

echo "Files moved successfully!"
echo "Note: Make sure to check public/css, public/js, and public/Images directories"

