#!/bin/bash
# Quick deployment script for Railway

echo "🚀 SuchaPain - Railway Deployment Helper"
echo "========================================"
echo ""
echo "This script will help you deploy to Railway."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found."
    echo "📦 Install it with: npm install -g @railway/cli"
    echo "   or: brew install railway"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Login check
echo "🔐 Checking Railway login status..."
if ! railway whoami &> /dev/null; then
    echo "📝 Please login to Railway:"
    railway login
else
    echo "✅ Already logged in to Railway"
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "1. ✅ Code is committed to Git"
echo "2. ⚠️  Environment variables configured in Railway dashboard"
echo "3. ⚠️  Firebase service account JSON added as FIREBASE_SERVICE_ACCOUNT_JSON"
echo "4. ⚠️  Google Maps API key added as GOOGLE_MAPS_API_KEY"
echo ""

read -p "Have you configured all environment variables? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Please configure environment variables first:"
    echo "   1. Go to https://railway.app/"
    echo "   2. Open your project"
    echo "   3. Go to Variables tab"
    echo "   4. Add all required variables (see DEPLOYMENT.md)"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Check deployment status: railway status"
echo "2. View logs: railway logs"
echo "3. Open in browser: railway open"
echo ""
echo "📖 For custom domain setup, see DEPLOYMENT.md"
