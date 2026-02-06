#!/bin/bash

# Build script for Android APK with camera permissions
echo "🔧 Building Android APK for deployment..."

# Check if API server is running
if ! curl -s http://192.168.88.21:8005/api_sqlite.php/cabinets > /dev/null 2>&1; then
    echo "❌ API server is not running on http://192.168.88.21:8005"
    echo "💡 Start the server first: cd sql && php -S 192.168.88.21:8005 -t php.ini"
    echo "📋 Or update API_BASE in src/services/api.ts to correct IP"
    exit 1
fi

echo "✅ API server is running"

# Check if Android device is connected
if ! adb devices | grep -q "device"; then
    echo "⚠️  No Android device connected via ADB"
    echo "💡 Connection options:"
    echo "   1. USB debugging: Enable USB debugging on phone"
    echo "   2. Same WiFi: Ensure phone and computer are on same network"
    echo "   3. Build APK: ./build-android.sh"
    echo "   4. Install: adb install <apk-file>"
    echo ""
    echo "📱 For wireless debugging:"
    echo "   1. Connect phone to same WiFi as computer (192.168.88.21)"
    echo "   2. Build with: npx expo build:android --no-dev"
    echo "   3. Install via: npx expo install:android"
    echo "   4. Or use Expo Go: npx expo install:android"
    exit 1
fi

echo "📱 Android device connected: $(adb devices | grep 'device' | cut -f1 -d' ')"

# Check if user is logged into Expo
if ! npx eas whoami > /dev/null 2>&1; then
    echo "❌ Not logged into Expo account. Please run: npx eas login"
    exit 1
fi

echo "✅ Expo login verified"

# Build APK with camera permissions using EAS
echo "🏗 Building APK with camera permissions using EAS..."
npx eas build --platform android --profile production --non-interactive

if [ $? -eq 0 ]; then
    echo "✅ APK build completed successfully!"
    echo ""
    echo "📦 Your APK is being built on Expo's servers"
    echo "📧 You'll receive an email when the build is ready"
    echo "🔗 Download link will be available in your Expo dashboard"
    echo "🌐 Expo dashboard: https://expo.dev/accounts/[username]/projects/messy/builds"
    echo ""
    echo "📱 To install when ready:"
    echo "   1. Download APK from Expo dashboard"
    echo "   2. Install: adb install <path-to-apk>"
    echo "   3. Or transfer to phone and install manually"
    echo ""
    echo "🎯 Camera permissions and QR scanning are included"
    echo "🔍 Look for 'messy' app in your app drawer"
else
    echo "❌ Build failed!"
    echo "🔍 Check error messages above for troubleshooting"
    echo "🔍 Make sure you have proper Expo account setup"
    exit 1
fi