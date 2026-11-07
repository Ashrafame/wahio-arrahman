#!/bin/bash
cd /path/to/wahio-arrahman
echo "🔄 جاري التحديث..."
git pull origin claude/wizardly-bohr-r7r4gx
echo "🗑️ جاري مسح الكاش..."
rm -rf node_modules/.cache .expo ~/Library/Developer/Xcode/DerivedData
echo "📦 جاري إعادة التثبيت..."
npm install
echo "🚀 جاري التشغيل..."
npx expo start --clear
