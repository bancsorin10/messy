# Cabinet Organization App

A React Native app for organizing cabinets and items with QR code generation, scanning, and printing capabilities.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- PHP server with MySQL/MariaDB
- API endpoint at `http://localhost:8005/api_sqlite.php`

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd messy.io
   yarn install
   ```

2. **Start PHP API server:**
   ```bash
   cd sql
   php -S localhost:8005 -t php.ini
   ```

3. **Start React Native app:**
   ```bash
   yarn start
   ```

## 📱 Running the App

### Web Development
```bash
yarn start --web
```
Access the app at http://localhost:8081

### Mobile Development
```bash
# Android
yarn start --android

# iOS  
yarn start --ios
```

## 🏗️ App Architecture

### Core Features
- **Cabinet Management**: List, add, view details
- **Item Management**: Add items to cabinets, view items per cabinet
- **QR Code Generation**: Generate QR codes for cabinets and items
- **QR Code Printing**: Print QR codes via API
- **QR Code Scanning**: Batch add items via QR scanning (simulated)
- **Navigation**: Clean stack navigation between screens

### API Integration
- **Single Endpoint**: `http://localhost:8005/api_sqlite.php`
- **Data Format**: Array responses with nested structure
- **Cabinets**: `GET /cabinets` → `[[id, name, description, photo], ...]`
- **Items**: `GET /items?cabinet_id=N` → `[[id, name, description, photo, cabinet_id], ...]`

## 📊 Data Models

### Cabinet
```typescript
interface Cabinet {
  id: number;
  name: string;
  description?: string;
  photo?: string;
}
```

### Item
```typescript
interface Item {
  id: number;
  name: string;
  description?: string;
  photo?: string;
  cabinet_id: number;
}
```

## 🔧 Development Setup

### Environment Variables
- **API_BASE**: `http://192.168.88.21:8005/api_sqlite.php` (configured in `src/services/api.ts`)

### Debug Mode
The app includes comprehensive debug logging:
- API request/response logging
- Data parsing validation
- Error tracking and stack traces
- Manual refresh button for testing

## 📋 Screens Overview

### 1. Cabinets List
- View all cabinets from database
- Navigate to cabinet details
- Pull-to-refresh functionality
- Floating action button to add new cabinet

### 2. Cabinet Details  
- View items in selected cabinet
- Add items to cabinet
- Generate QR codes for cabinet and items
- QR code scanning for batch addition
- Item count and management

### 3. Add Cabinet
- Form with name (required) and description (optional)
- Photo upload capability
- Form validation and error handling
- Navigation back to cabinet list

### 4. Add Item
- Form with name (required) and description (optional)
- Cabinet selection (when adding from list)
- Photo upload capability
- Form validation and error handling

### 5. QR Code Display
- Display QR codes for cabinets and items
- Print functionality via API
- Share QR codes
- QR code information display

### 6. Bulk Add Items
- QR code scanning simulation
- Batch item collection
- Validate QR formats (`cabinet:<id>`, `item:<id>`)
- Add multiple items to cabinet

## 🎯 QR Code System

### Generation
- **Format**: `cabinet:<id>` and `item:<id>`
- **Client-side**: Using `react-native-qrcode-svg`
- **Instant**: No network latency for generation

### Printing
- **API Endpoint**: `POST /print` via `api_sqlite.php`
- **Base64**: QR codes converted to base64 for API
- **Integration**: Direct print functionality

### Scanning (Simulated)
- **Batch Mode**: Continuous scanning
- **Validation**: Proper QR format parsing
- **Collection**: Multiple items before submission

## 🛠️ Troubleshooting

### Common Issues

#### CORS Error (Web Development)
If you see CORS errors in browser console:
1. Check that PHP server is running: `php -S localhost:8005 -t php.ini`
2. Verify API endpoint: `http://localhost:8005/api_sqlite.php`
3. Check CORS headers in `sql/api_sqlite.php`

#### Data Not Displaying
If cabinets/items don't appear:
1. Check browser console for debug logs
2. Verify API response format
3. Check network requests in dev tools
4. Test API manually: `curl http://localhost:8005/api_sqlite.php/cabinets`

#### Navigation Issues
If navigation doesn't work:
1. Check React Navigation dependencies
2. Verify TypeScript types in `src/types/index.ts`
3. Check route parameter names

### Debug Mode
The app includes extensive debug logging:
- API calls and responses
- Data parsing steps
- Error details and stack traces
- Manual refresh button for testing

## 🚀 Deployment

### Web Build
```bash
yarn build --web
```

### Mobile Build
```bash
# Android
yarn build:android

# iOS
yarn build:ios
```

### Production API
1. Deploy PHP API server to web host
2. Update `API_BASE` in `src/services/api.ts`
3. Configure CORS for production domain
4. Ensure database connectivity

## 📱 Platform-Specific Notes

### Web
- Uses CORS headers for API calls
- Share functionality includes fallback
- Keyboard navigation optimized

### Mobile
- Camera permissions required for QR scanning
- File system access for photo uploads
- Native sharing capabilities

## 🔄 Development Workflow

### Web Development
```bash
# 1. Start PHP API server
cd sql
php -S localhost:8005 -t php.ini

# 2. Start React Native app (in new terminal)
yarn start --web
```
Access at: http://localhost:8081

### Mobile Development
```bash
# 1. Start PHP API server
cd sql
php -S localhost:8005 -t php.ini

# 2. Start React Native app for Android
yarn start --android

# 3. Start React Native app for iOS
yarn start --ios
```

## 🚀 Deployment

### Production API Setup
1. Deploy PHP files to web server
2. Update `API_BASE` in `src/services/api.ts` to production URL
3. Configure CORS headers for production domain
4. Ensure database connectivity and security

### Mobile App Build & Deploy
```bash
# Android APK
yarn build:android

# iOS IPA
yarn build:ios

# Expo EAS Build (recommended)
npx eas build --platform android
npx eas build --platform ios

# Production bundle
yarn build:web
```

## 📱 Android Device Testing

### Prerequisites
- Android phone/tablet connected to same WiFi
- USB debugging enabled (optional)

### Build and Run
```bash
# Build APK
yarn build:android

# Install on device
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Or use Expo Go
npx expo install:android
```

## 🍎 iOS Device Testing

### Prerequisites
- iOS device connected to same WiFi
- Apple Developer account (for production)
- Xcode (optional)

### Build and Run
```bash
# Build with Expo
npx eas build --platform ios

# Install with Expo Go
npx expo install:ios
```

1. **Start API Server**: `php -S localhost:8005 -t php.ini`
2. **Start Dev Server**: `yarn start --web`
3. **Open Browser**: Navigate to http://localhost:8081
4. **Debug**: Check console logs for API calls
5. **Test**: Navigate through all screens
6. **Iterate**: Make changes and see live updates

## 🎯 Future Enhancements

- Real QR code scanning with camera integration
- Photo upload implementation
- Offline data caching
- Search and filtering capabilities
- User authentication and permissions
- Export/import functionality

## 🛠️ Troubleshooting

### Common Issues

#### CORS Errors (Web Development)
```
Error: Access to fetch at 'http://localhost:8005/api_sqlite.php/cabinets' from origin 'http://localhost:8081' has been blocked by CORS policy
```
**Solutions:**
1. Ensure PHP server is running: `php -S localhost:8005 -t php.ini`
2. Check CORS headers in `sql/api_sqlite.php`
3. Verify port is accessible: `curl -s http://localhost:8005/api_sqlite.php/cabinets`

#### Data Not Displaying
```
Issue: API responses received but cabinets/items not showing
```
**Debug Steps:**
1. Open browser dev tools (F12)
2. Check console logs in app
3. Look for "Parsed data:" logs
4. Verify "Final cabinets array:" shows data
5. Check API response format: `curl -s http://localhost:8005/api_sqlite.php/cabinets`

#### Navigation Issues
```
Issue: Screen navigation not working
```
**Solutions:**
1. Check TypeScript types in `src/types/index.ts`
2. Verify route names match screen names
3. Check import paths in `src/navigation/AppNavigator.tsx`
4. Restart Metro bundler: `yarn start --web --clear`

#### API Connection Issues
```
Issue: Cannot connect to API
```
**Solutions:**
1. Start PHP server first: `cd sql && php -S localhost:8005 -t php.ini`
2. Check MySQL/MariaDB service: `systemctl status mysql`
3. Verify database exists: `ls -la sql/messy.db`
4. Test API directly: `curl -s http://localhost:8005/api_sqlite.php/cabinets`

#### Mobile Build Issues
```
Issue: Build fails for mobile
```
**Solutions:**
1. Install platform-specific tools: `npx expo install:android`
2. Clear cache: `yarn start --clear`
3. Check dependencies: `npx expo doctor`
4. Reset Metro: `npx expo start --reset-cache`

## 📞 Support

### Development Commands
```bash
# Start development server with web support
yarn start --web

# Start development server for mobile
yarn start --android
yarn start --ios

# Build for production
yarn build:web
yarn build:android
yarn build:ios

# Clear cache and restart
yarn start --clear
```

### Getting Help
For issues not covered here:
1. Check browser console for detailed error messages
2. Review API response format in network tab
3. Test API endpoints directly with curl
4. Consult Expo documentation: https://docs.expo.dev
5. Check GitHub issues for library-specific problems

For issues or questions:
1. Check browser console for errors
2. Verify API server is running
3. Test API endpoints manually
4. Review debug logs in the app

## 📄 License

MIT License - feel free to use and modify.