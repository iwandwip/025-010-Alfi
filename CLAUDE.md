# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Expo/React Native Commands
```bash
npm start           # Start development server with options menu
npm run android     # Run on Android device/emulator  
npm run ios         # Run on iOS device/simulator
npm run web         # Run in web browser
npm run clear       # Clear cache and restart
npm run lint        # Run ESLint for code quality
```

### Testing
```bash
npm test           # Run ESP32 hardware simulator tests
npm run cleanup    # Run Firebase cleanup utility
```

### Build & Deployment
```bash
npm run build:android:production    # Production Android build
npm run build:ios:production        # Production iOS build  
npm run build:development          # Development build
npm run submit:android             # Submit to Google Play
npm run submit:ios                 # Submit to App Store
```

## Project Architecture

This is a Smart Jimpitan payment management system with React Native mobile app and ESP32 IoT hardware integration.

### Core Technology Stack
- **Frontend**: React Native with Expo SDK 53, Expo Router for navigation
- **Backend**: Firebase (Authentication, Firestore, Realtime Database)
- **Hardware**: ESP32 with RFID, currency detection, solenoid control
- **State Management**: React Context (AuthContext, SettingsContext, NotificationContext, ThemeContext)

### Key Architecture Patterns

#### Mode-Based Hardware Communication
The system uses a revolutionary mode-based architecture in `rtdbModeService.js` for ESP32 integration:
- Single source of truth through 'mode' field
- Ultra-simple string operations (no JSON parsing)
- App-managed timeouts instead of ESP32 timing
- 90% code reduction, 98% memory efficiency

#### Multi-Role System
- **Admin**: Full management access (`admin@gmail.com` default account)
- **Wali (Parent)**: View child payment status, make payments
- Role-based route protection with AuthGuard component

#### File-Based Routing (Expo Router)
```
app/
├── (auth)/           # Authentication screens
├── (tabs)/           # Parent/user interface  
├── (admin)/          # Admin panel screens
└── _layout.jsx       # Root layout with providers
```

### Key Service Files

#### Core Services
- `services/rtdbModeService.js` - Revolutionary mode-based ESP32 communication
- `services/authService.js` - Firebase authentication management
- `services/dataBridgeService.js` - Data synchronization between RTDB and Firestore
- `services/paymentStatusManager.js` - Payment calculation and status updates
- `services/timelineService.js` - Payment schedule management

#### Hardware Integration
- `services/pairingService.js` - RFID card assignment to users
- `services/hardwarePaymentService.js` - Hardware payment processing
- `services/solenoidControlService.js` - Physical access control

### Firebase Configuration

The app requires Firebase setup with:
- **Authentication**: Email/password enabled
- **Firestore**: Document database for persistent data
- **Realtime Database**: Hardware communication via mode-based architecture

Configure in `services/firebase.js` with your Firebase project credentials.

### Hardware Components (ESP32)
- MFRC522 RFID Reader
- TCS3200 Color Sensor (currency detection with KNN algorithm)  
- 16x2 LCD Display (I2C)
- Solenoid lock control
- Push buttons, LEDs, buzzer

Firmware located in `firmware/AlfiFirmwareR1/` directory.

### Development Guidelines

#### State Management
Use React Context providers defined in `app/_layout.jsx`:
- AuthContext for user authentication state
- SettingsContext for app configuration  
- NotificationContext for toast messages
- ThemeContext for UI theming

#### Error Handling
- ErrorBoundary component wraps the entire app
- ToastNotification system for user feedback
- Comprehensive error handling in all service files

#### Indonesian Localization
The entire system is designed for Indonesian schools with:
- Indonesian language interface
- IDR currency handling (2000, 5000, 10000 denominations)
- Indonesian date/time formatting

#### Firebase Security
- Admin account: `admin@gmail.com` (any password)
- Role-based access control
- Secure route protection with AuthGuard

### Common Development Tasks

When adding new features:
1. Follow existing file structure patterns
2. Use established React Context for state management
3. Implement proper error handling with ErrorBoundary
4. Add appropriate role-based access control
5. Follow Indonesian localization patterns
6. Test hardware integration if relevant

When working with hardware:
1. Use `rtdbModeService.js` for all ESP32 communication
2. Follow mode-based architecture patterns
3. Implement proper timeout handling
4. Test with ESP32 simulator (`npm test`)

The codebase follows modern React Native patterns with Expo, comprehensive Firebase integration, and innovative IoT hardware communication architecture.