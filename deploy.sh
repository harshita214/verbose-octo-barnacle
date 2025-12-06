#!/bin/bash

# HauntHub Deployment Script
# Supports: Vercel, Netlify, Docker

set -e

echo "🎃 HauntHub Deployment Script"
echo "================================"
echo ""

# Check if build exists
if [ ! -d "dist" ]; then
    echo "📦 Building production bundle..."
    npm run build
    echo "✅ Build complete!"
else
    echo "✅ Build already exists"
fi

echo ""
echo "Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Docker"
echo "4) Manual (just build)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        echo "✅ Deployed to Vercel!"
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=dist
        echo "✅ Deployed to Netlify!"
        ;;
    3)
        echo "🐳 Building Docker image..."
        docker build -t haunthub:latest .
        echo "✅ Docker image built!"
        echo ""
        echo "To run locally:"
        echo "  docker run -p 3000:3000 haunthub:latest"
        echo ""
        echo "To push to registry:"
        echo "  docker tag haunthub:latest your-registry/haunthub:latest"
        echo "  docker push your-registry/haunthub:latest"
        ;;
    4)
        echo "✅ Build ready in ./dist/"
        echo ""
        echo "Next steps:"
        echo "1. Upload dist/ to your hosting provider"
        echo "2. Configure backend server"
        echo "3. Set up environment variables"
        echo "4. Test all features"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
