#!/bin/bash

# Render build script for Vegetable Selling Platform

echo "🚀 Starting build process for Vegetable Selling Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building the application..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Build successful! dist directory created."
    ls -la dist/
else
    echo "❌ Build failed! dist directory not found."
    exit 1
fi

echo "🎉 Build process completed successfully!"
