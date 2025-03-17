#!/bin/bash

# Exit on any error
set -e

# Ensure we're in the right directory
PROJECT_DIR=$(dirname "$0")
cd "$PROJECT_DIR"

# Install core React and Three.js dependencies
echo "Installing core dependencies..."
npm install react react-dom three @types/react @types/react-dom

# Install development dependencies
echo "Installing development dependencies..."
npm install -D typescript \
              vite \
              @vitejs/plugin-react \
              vitest \
              @vitest/ui \
              jsdom \
              @testing-library/react \
              @testing-library/jest-dom \
              @types/three \
              eslint \
              i18next \
              react-i18next \
              i18next-http-backend \
              i18next-browser-languagedetector \
              @google/generative-ai

echo "Project setup complete! Run 'npm run dev' to start the development server."
