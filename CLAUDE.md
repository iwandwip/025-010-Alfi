# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Alfi App** is a sophisticated React Native application built with Expo that serves as a "Sistem Pengelolaan Jimpitan Warga" (community savings management system). It integrates mobile app functionality with ESP32 hardware and uses K-Nearest Neighbors algorithms for intelligent payment processing.

## Development Commands

### App Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device  
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run as web application
- `npm run clear` - Clear Expo cache and restart
- `npm run reset` - Same as clear, reset Metro cache

### Testing & Utilities
- `npm test` - Run ESP32 simulator test (testing/esp32-simulator.js)
- `npm run cleanup` - Run Firebase cleanup script

### Maintenance Commands
- `npm run clean` - Remove node_modules and package-lock.json
- `npm run reinstall` - Clean and reinstall all dependencies

### Build Commands (EAS)
- `eas build --platform android --profile preview` - Build preview APK
- `eas build --platform android --profile production` - Build production APK
- `eas build --platform android --profile development` - Build development client

## Tech Stack

### Frontend
- **React Native** (0.79.3) with **Expo SDK 53**
- **React** (19.0.0) - Latest React version
- **Expo Router** (5.1.0) for file-based routing
- **React Navigation** for navigation management
- **React Context** pattern for state management
- **Firebase** (11.9.1) for backend services
- **Native Components** - Custom component library replacing NativeBase

### Key Dependencies
- **@react-native-async-storage/async-storage** (2.1.2) - Persistent storage
- **firebase** (11.9.1) + **firebase-admin** (13.4.0) - Backend services
- **expo-router** (5.1.0) - File-based routing
- **react-native-svg** (15.11.2) - SVG illustrations
- **jspdf** (3.0.1) & **jspdf-autotable** (5.0.2) - PDF export functionality
- **xlsx** (0.18.5) - Excel export capabilities
- **inquirer** (12.6.3) - CLI interactions for utilities
- **react-native-chart-kit** (6.12.0) - Data visualization
- **react-native-vector-icons** (10.2.0) - Icon library
- **react-native-keyboard-aware-scroll-view** (0.9.5) - Enhanced keyboard handling
- **expo-crypto** (14.1.1) - Cryptographic operations for Metro bundler compatibility
- **@react-native-community/datetimepicker** (8.3.0) - Date/time picker components
- **@react-navigation/native** (7.1.6) - Navigation library
- **expo-constants** (17.1.6) - Access to app constants
- **expo-file-system** (18.1.10) - File system operations
- **expo-font** (13.3.1) - Custom font loading (Poppins font family)
- **expo-linear-gradient** (14.1.5) - Gradient components
- **expo-linking** (7.1.5) - Deep linking support
- **expo-sharing** (13.1.5) - Native sharing capabilities
- **expo-splash-screen** (0.30.9) - Splash screen management
- **expo-status-bar** (2.2.3) - Status bar control
- **react-native-reanimated** (3.17.4) - Advanced animations
- **react-native-safe-area-context** (5.4.0) - Safe area handling
- **react-native-screens** (4.11.1) - Native navigation screens
- **react-native-web** (0.20.0) - Web platform support
- **rimraf** (6.0.1) - Cross-platform rm -rf for clean scripts

### Hardware Integration
- **ESP32 firmware** with two versions (R0 and R1)
- **K-Nearest Neighbors (KNN)** algorithm for intelligent recognition
- **WiFi and USB communication** protocols
- **RFID, LCD, RTC, color sensors, servo motors, and relays**

### Configuration
- **Metro bundler** with crypto alias configuration
- **EAS (Expo Application Services)** for builds and deployment
- **Environment variables** for Firebase configuration

## Architecture Overview

### Key Architecture Components

**Authentication & Authorization**
- Firebase Auth with email/password
- Role-based access: `bendahara@gmail.com` gets bendahara role automatically (also supports `admin@gmail.com` for compatibility)
- AuthContext provides global auth state with bendahara detection
- AuthGuard component for route protection
- **NEW**: Dynamic role-based theming with `useRoleTheme` hook

**Routing Structure (Expo Router)**
- `app/(auth)/` - Authentication screens (bendahara-login, warga-login, bendahara-register)
- `app/(tabs)/` - Main warga interface (status setoran jimpitan, profile, etc.)
- `app/(admin)/` - Bendahara panel for warga/setoran management
  - **NEW**: `payment-manager.jsx` - Advanced payment management interface
- `app/role-selection.jsx` - Role selection screen
- File-based routing with layout components

**State Management**
- React Context pattern for global state
- AuthContext: authentication and user profiles
- SettingsContext: app settings (theme, language)
- NotificationContext: toast notifications
- **NEW**: Role-based theming context integration

**Data Layer**
- Firebase Firestore as primary database
- Services pattern: separate service files for different domains
  - authService.js: authentication operations
  - userService.js: warga profile management with getAllWarga function
  - adminPaymentService.js/wargaPaymentService.js: setoran jimpitan management
  - timelineService.js: timeline/schedule management
  - pairingService.js: ESP32 device pairing operations
  - **NEW**: paymentStatusManager.js - Advanced status management with caching and throttling
  - **NEW**: rtdbModeService.js - Revolutionary mode-based RTDB service with 90% ESP32 code reduction
  - **NEW**: dataBridgeService.js - RTDB to Firestore data bridging for permanent storage

**Hardware Integration**
- ESP32 firmware in `firmware/` directory with two versions (R0, R1)
- KNN algorithm implementation for device recognition
- USB and WiFi communication protocols
- RFID, LCD, RTC, color sensor, servo, and relay integration
- **NEW**: Comprehensive hardware testing framework in `firmware/Testing/`

**Advanced Payment System**
- Credit-based setoran system with real-time status tracking
- **NEW**: Smart payment status manager with caching and throttling
- **NEW**: Advanced PaymentModal with multiple payment methods
- Bendahara can manage setoran and view detailed setoran history
- Warga interface for setoran operations
- **Enhanced** payment features:
  - Credit balance integration with automatic deduction
  - Multiple payment methods (BCA, Mandiri, QRIS, GoPay, OVO, DANA)
  - Custom payment amounts with automatic allocation
  - Excess payment handling and credit conversion
  - **NEW**: Payment mode selection (exact/custom amounts)
  - **NEW**: Smart allocation algorithms with comprehensive testing

### Key Patterns

**Component Structure**
- `components/ui/` - Reusable UI components:
  - **Core components**: `CoreComponents.jsx` - Complete NativeBase replacement with:
    - Container, Box, VStack, HStack, Center layout components
    - Custom Text, Heading, Button, Input form components
    - LoadingSpinner, CustomModal, SafeArea utility components
    - Complete styling system integrated with theme
  - **Advanced components**: `PaymentModal.jsx` - Sophisticated payment interface
  - **Native components**: `NativeButton.jsx`, `NativeCard.jsx`, `NativeChip.jsx`
  - **UI components**: `Button.jsx`, `Input.jsx`, `DataTable.jsx`, `LoadingSpinner.jsx`
  - **Specialized**: `CreditBalance.jsx`, `DatePicker.jsx`, `TimelinePicker.jsx`
  - **Legacy NB components**: `NBButton.jsx`, `NBCard.jsx`, `NBDataTable.jsx`, etc.
- `components/auth/` - Authentication-specific components
- `components/illustrations/` - SVG illustrations for auth screens
- `hooks/` - Custom React hooks:
  - `useRoleTheme.js` - Dynamic role-based theming hook

**Error Handling**
- ErrorBoundary component wraps entire app
- ToastNotification system for user feedback
- Comprehensive error handling in Firebase operations

**Multi-language Support**
- Built-in Indonesian/English support
- SettingsContext manages language preferences

**Advanced Theme System**
- Dark/light theme support with persistent storage
- **Dynamic role-based theming system**:
  - **Bendahara/Admin**: Red theme (`#DC2626`) for administrative functions
  - **Warga/User**: Blue theme (`#2563EB`) for user interface
- `hooks/useRoleTheme.js` - Custom hook for dynamic role-based theming
- **Comprehensive styling system**:
  - `constants/theme.js` - Advanced theme with role-based color schemes:
    - RoleColors system with getColorsForRole function
    - BaseColors with comprehensive color palette
    - Advanced Typography with multiple text styles
    - Platform-specific shadow systems
    - Spacing and layout constants
  - `constants/Colors.js` - Dedicated color definitions
  - `constants/ButtonStyles.js` - Button styling system with variants and sizes
  - `constants/CardStyles.js` - Card component styling with status-based helpers
- **Assets**:
  - Money-themed icons and splash screens
  - Custom Poppins font family (Bold, Light, Medium, Regular, SemiBold)
  - Comprehensive image assets in `assets/images/`

**Metro Configuration**
- Custom crypto alias using expo-crypto for Node.js crypto compatibility
- Disabled package exports for React Native compatibility
- Cache reset enabled for development
- Handles Firebase and crypto dependencies properly

## Firebase Configuration

The app uses Firebase project "alfi-c6f58" with:
- Authentication (email/password)
- Firestore database for user profiles and app data
- **NEW**: Realtime Database (RTDB) for revolutionary mode-based ESP32 coordination
- Real-time listeners for data synchronization
- Firebase Admin SDK for server-side operations

Bendahara access: Use `bendahara@gmail.com` or `admin@gmail.com` with any password to get bendahara privileges automatically.

### Environment Variables
Firebase configuration is managed through environment variables:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Revolutionary Mode-Based Architecture

### RTDB Schema (Ultra-Simple ESP32 Integration)
```javascript
{
  // Global system mode - single source of truth
  "mode": "idle", // "idle" | "pairing" | "payment" | "solenoid"
  
  // RFID pairing mode - ESP32 writes detected RFID codes here
  "pairing_mode": "", // Empty when idle, RFID code when detected
  
  // Hardware payment coordination
  "payment_mode": {
    "get": { 
      "rfid_code": "",        // Expected RFID for payment
      "amount_required": ""   // Required payment amount
    },
    "set": { 
      "amount_detected": "",  // Amount detected by KNN algorithm
      "status": ""           // "completed" | "rfid_salah" | "insufficient"
    }
  },
  
  // Solenoid control commands
  "solenoid_command": "locked" // "unlock" | "locked"
}
```

### Key Benefits
- **90% ESP32 code reduction** - No JSON parsing, only simple string operations
- **5x faster real-time communication** - Direct RTDB path access
- **Self-cleaning data patterns** - Automatic cleanup after operations
- **App-managed timeouts** - ESP32 just reads current state
- **Priority-based mode system** - Prevents race conditions

## Hardware Integration Notes

ESP32 firmware supports:
- RFID card reading for warga identification
- LCD display for user interface
- RTC for time tracking
- Color sensor (TCS3200) for object detection with KNN algorithm
- Servo motor and relay control
- WiFi connectivity for RTDB communication
- **NEW**: Ultra-simple mode-based coordination (see SYSTEM_FLOWS.md)

### Firmware Versions
- **AlfiFirmwareR0**: Basic firmware version with core functionality
- **AlfiFirmwareR1**: Advanced firmware with KNN algorithm implementation

### Hardware Testing
- **EXPANDED**: Individual component tests available in `firmware/Testing/`:
  - `TestLCD16x2/` - LCD display testing
  - `TestRFID/` - RFID reader testing
  - `TestRTC_DS3231/` - Real-time clock testing
  - `TestRelay/` - Relay control testing
  - `TestServo/` - Servo motor testing
  - `TestTCS3200/` - Color sensor testing
- ESP32 simulator in `testing/esp32-simulator.js`
- Hardware testing framework in `testing/esp32-framework.cpp`
- **NEW**: Payment allocation testing in `testing/payment-allocation-test.js`

## Database Schema

### Users Collection
```javascript
{
  id: "user_id",
  email: "warga@email.com",
  role: "user" | "bendahara" | "admin",
  namaWarga: "Nama Lengkap Warga",
  alamat: "Alamat Lengkap",
  noHpWarga: "081234567890",
  rfidWarga: "RFID123ABC",
  creditBalance: 0,
  deleted: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Payment Collections
```javascript
// payments/{timelineId}/periods/{periodKey}/warga_payments/{wargaId}
{
  id: "wargaId_periodKey",
  wargaId: "user_id",
  wargaName: "Nama Warga",
  period: "period_1",
  periodLabel: "Minggu 1",
  amount: 5000,
  dueDate: "2024-01-01T00:00:00.000Z",
  status: "belum_bayar" | "lunas" | "terlambat",
  paymentDate: timestamp | null,
  paymentMethod: "cash" | "transfer" | "credit",
  notes: "",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### RFID Pairing Collection
```javascript
// rfid_pairing/current_session
{
  isActive: boolean,
  wargaId: "user_id",
  startTime: timestamp,
  rfidCode: "",
  status: "waiting" | "received",
  cancelledTime: "",
  receivedTime: ""
}
```

## Key Files and Their Purpose

### Authentication Files
- `app/(auth)/bendahara-login.jsx` - Bendahara login interface
- `app/(auth)/warga-login.jsx` - Warga login interface
- `app/(auth)/bendahara-register.jsx` - Bendahara registration

### Admin/Bendahara Files
- `app/(admin)/index.jsx` - Admin dashboard
- `app/(admin)/daftar-warga.jsx` - List all warga (active version)
- `app/(admin)/daftar-warga-COMPLETED.jsx` - Completed/archived warga listing
- `app/(admin)/tambah-warga.jsx` - Add new warga
- `app/(admin)/detail-warga.jsx` - View/edit warga details
- `app/(admin)/edit-warga.jsx` - Edit warga information
- `app/(admin)/payment-status.jsx` - View payment statuses
- `app/(admin)/payment-manager.jsx` - Advanced payment management interface
- `app/(admin)/timeline-manager.jsx` - Manage payment timelines
- `app/(admin)/create-timeline.jsx` - Create new payment timelines
- `app/(admin)/user-payment-detail.jsx` - Detailed payment view for specific warga

### Warga Interface Files
- `app/(tabs)/index.jsx` - Main warga dashboard with setoran status
- `app/(tabs)/profile.jsx` - Warga profile view
- `app/(tabs)/edit-profile.jsx` - Edit warga profile
- `app/(tabs)/logout.jsx` - Logout functionality

### Service Files
- `services/firebase.js` - Firebase configuration and initialization
- `services/authService.js` - Authentication operations
- `services/userService.js` - Warga management (CRUD operations)
- `services/adminPaymentService.js` - Admin payment operations
- `services/wargaPaymentService.js` - Warga payment operations
- `services/pairingService.js` - RFID pairing management
- `services/timelineService.js` - Payment timeline management
- **ENHANCED**: `services/paymentStatusManager.js` - Advanced status management with:
  - Smart caching system with 5-minute user throttling
  - Background sync capabilities
  - Event-driven notifications
  - Payment deadline monitoring
  - Real-time status updates
- `services/seederService.js` - Data seeding utilities

### Custom Hooks
- **NEW**: `hooks/useRoleTheme.js` - Dynamic role-based theming hook that adapts UI colors based on user roles

### Utility and Testing Files
- `firebase-cleanup/cleanup.js` - Firebase data cleanup utility
- `testing/esp32-simulator.js` - ESP32 device simulator
- `testing/esp32-framework.cpp` - ESP32 hardware testing framework
- `testing/payment-allocation-test.js` - Payment allocation testing
- `utils/dateUtils.js` - Date formatting and manipulation
- `utils/paymentStatusUtils.js` - Payment status helpers
- `utils/validation.js` - Input validation functions

### Configuration Files
- `package.json` - Dependencies and npm scripts with expo.doctor configuration
- `app.json` - Expo configuration with app metadata
- `eas.json` - Expo Application Services build configuration
- `metro.config.js` - Metro bundler configuration with crypto alias
- `.env.example` - Firebase environment variables template

### Additional Documentation Files
- `README.md` - Main project documentation
- `SETUPGUIDE.md` - Setup and installation guide
- `BUILD_APK.md` - APK building instructions
- `AUTHENTICATION_TROUBLESHOOTING.md` - Auth troubleshooting guide
- `replacement-guide.md` - Legacy component replacement guide

### TypeScript Support
- `types/svg.d.ts` - TypeScript definitions for SVG files

### Asset Structure
- `assets/fonts/` - Poppins font family (Bold, Light, Medium, Regular, SemiBold)
- `assets/images/` - App icons, illustrations, and images:
  - Multiple icon variants (adaptive-icon.png, favicon.png, icon.png)
  - Splash screen assets (splash.png, splash-icon.png)
  - TPQ-themed icons (icon-tpq-nobg.png, icon-tpq.jpg)

## Important Notes

- All references to old terminology (santri, wali, TPQ, bisyaroh) have been completely removed
- The system now uses consistent "warga" (resident) and "bendahara" (treasurer) terminology
- Database collections use "warga_payments" instead of legacy naming
- RFID system is designed for warga identification and setoran processing
- Credit balance system allows prepaid setoran management
- Real-time status updates keep payment information synchronized

## Development Guidelines

1. **Naming Conventions**: Always use "warga" for residents, "bendahara" for administrators
2. **Database Fields**: Use consistent field names (namaWarga, noHpWarga, rfidWarga, etc.)
3. **Collection Names**: Use "warga_payments", "users", "active_timeline", etc.
4. **Function Names**: Follow pattern like getAllWarga, updateWargaRFID, deleteWarga
5. **UI Text**: All user-facing text should use "Jimpitan Warga" terminology
6. **Error Handling**: Always include comprehensive error handling for Firebase operations
7. **Authentication**: Support both bendahara@gmail.com and admin@gmail.com for admin access
8. **Testing**: Use the ESP32 simulator for hardware integration testing
9. **Dependencies**: Always check existing package.json before adding new dependencies
10. **Exports**: Use PDF (jsPDF) and Excel (xlsx) for data export functionality
11. **Charts**: Use react-native-chart-kit for data visualization components
12. **Component Migration**: Use CoreComponents.jsx instead of NativeBase components
13. **Styling**: Use ButtonStyles.js and CardStyles.js for consistent component styling
14. **Payment System**: Implement credit balance and multiple payment methods
15. **NEW**: **Role-Based Theming**: Use `useRoleTheme` hook for dynamic theming based on user roles
16. **NEW**: **Performance**: Implement caching and throttling for payment status operations
17. **NEW**: **Advanced Payments**: Use PaymentModal component for complex payment flows
18. **NEW**: **Hardware Testing**: Use comprehensive testing framework for ESP32 components

## Deployment & Build

### EAS Configuration
- **Development builds**: Internal distribution with development client
- **Preview builds**: Internal APK distribution for Android
- **Production builds**: Auto-increment versioning enabled
- **Project ID**: fe0bef48-816b-4494-8380-edc0f7a2c0b9

### App Package Details
- **App Name**: Alfi App
- **Slug**: alfi-app
- **Android Package**: com.alfi.alfiapp
- **Scheme**: firebase-auth-template
- **Icons**: Money-themed icon throughout (./assets/icon-money.png)

## What Makes This Project Unique

1. **Hardware-Software Integration**: Seamless connection between React Native app and ESP32 firmware
2. **Advanced Algorithm Integration**: KNN algorithm for intelligent object/currency recognition
3. **Community-Focused Design**: Specifically built for Indonesian community savings management
4. **Multi-layer Authentication**: Role-based access with automatic bendahara detection
5. **Real-time Payment Processing**: Live status updates and credit balance management
6. **Comprehensive Testing Framework**: Both software simulation and hardware testing capabilities
7. **Export Capabilities**: PDF and Excel export for financial data and reports
8. **Data Visualization**: Built-in charting for payment analytics and trends
9. **NEW**: **Dynamic Role-Based Theming**: Adaptive UI colors based on user roles (red for admin, blue for users)
10. **NEW**: **Advanced Payment System**: Smart allocation algorithms with multiple payment methods and credit system
11. **NEW**: **Performance Optimization**: Intelligent caching and throttling for improved app performance
12. **NEW**: **Comprehensive Hardware Testing**: Individual component testing for all ESP32 peripherals
13. **NEW**: **Custom Component Library**: Complete NativeBase replacement with CoreComponents system
14. **NEW**: **Latest React Native**: Built with React 19 and latest Expo SDK for modern development
15. **NEW**: **Production-Ready Architecture**: Enterprise-level error handling, caching, and state management