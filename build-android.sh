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

# Build APK with camera permissions
echo "🏗 Building APK with camera permissions..."
npx expo build:android --no-dev --type apk

if [ $? -eq 0 ]; then
    echo "✅ APK built successfully!"
    echo "📦 APK location: dist/"
    
    # Try to install directly
    echo "🚀 Installing on connected device..."
    
    for apk in dist/*.apk; do
        if [ -f "$apk" ]; then
            echo "📱 Installing: $(basename $apk)"
            adb install -r "$apk"
            if [ $? -eq 0 ]; then
                echo "✅ Installed: $(basename $apk)"
                echo ""
                echo "🎯 App deployed successfully!"
                echo "🔍 Camera permissions and QR scanning are now enabled"
                echo "🔍 Test QR scanning with real camera"
                echo "🔍 Look for 'Cabinet Organization' app in your app drawer"
            else
                echo "❌ Failed to install: $(basename $apk)"
            fi
        fi
    done
else
    echo "❌ APK build failed!"
    echo "🔍 Check error messages above for troubleshooting"
    exit 1
fi