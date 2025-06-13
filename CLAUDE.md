# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Architecture Overview

### Project Type
React Native app with Expo Router using Firebase backend, designed for "Sistem Pengelolaan Jimpitan Warga" (community savings management) with ESP32 hardware integration and K-Nearest Neighbors algorithm.

### Key Architecture Components

**Authentication & Authorization**
- Firebase Auth with email/password
- Role-based access: `bendahara@gmail.com` gets bendahara role automatically (also supports `admin@gmail.com` for compatibility)
- AuthContext provides global auth state with bendahara detection
- AuthGuard component for route protection

**Routing Structure (Expo Router)**
- `app/(auth)/` - Authentication screens (bendahara-login, warga-login, bendahara-register)
- `app/(tabs)/` - Main warga interface (status setoran jimpitan, profile, etc.)
- `app/(admin)/` - Bendahara panel for warga/setoran management
- File-based routing with layout components

**State Management**
- React Context pattern for global state
- AuthContext: authentication and user profiles
- SettingsContext: app settings (theme, language)
- NotificationContext: toast notifications

**Data Layer**
- Firebase Firestore as primary database
- Services pattern: separate service files for different domains
  - authService.js: authentication operations
  - userService.js: warga profile management with getAllWarga function
  - adminPaymentService.js/wargaPaymentService.js: setoran jimpitan management
  - timelineService.js: timeline/schedule management
  - pairingService.js: ESP32 device pairing operations

**Hardware Integration**
- ESP32 firmware in `firmware/` directory with two versions (R0, R1)
- KNN algorithm implementation for device recognition
- USB and WiFi communication protocols
- RFID, LCD, RTC, color sensor, servo, and relay integration

**Setoran Jimpitan System**
- Credit-based setoran system with real-time status tracking
- paymentStatusManager.js handles automatic status updates
- Bendahara can manage setoran and view detailed setoran history
- Warga interface for setoran operations

### Key Patterns

**Component Structure**
- `components/ui/` - Reusable UI components (Button, Input, DataTable)
- `components/auth/` - Authentication-specific components
- `components/illustrations/` - SVG illustrations for auth screens

**Error Handling**
- ErrorBoundary component wraps entire app
- ToastNotification system for user feedback
- Comprehensive error handling in Firebase operations

**Multi-language Support**
- Built-in Indonesian/English support
- SettingsContext manages language preferences

**Theme System**
- Dark/light theme support with persistent storage
- Primary color scheme uses pink (#F50057)

## Firebase Configuration

The app uses Firebase project "haikal-ef006" with:
- Authentication (email/password)
- Firestore database for user profiles and app data
- Real-time listeners for data synchronization

Bendahara access: Use `bendahara@gmail.com` or `admin@gmail.com` with any password to get bendahara privileges automatically.

## Hardware Integration Notes

ESP32 firmware supports:
- RFID card reading for warga identification
- LCD display for user interface
- RTC for time tracking
- Color sensor (TCS3200) for object detection
- Servo motor and relay control
- WiFi connectivity for data transmission
- KNN algorithm for intelligent recognition

Testing framework available in `testing/` directory with ESP32 simulator.

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
- `app/(admin)/daftar-warga.jsx` - List all warga
- `app/(admin)/tambah-warga.jsx` - Add new warga
- `app/(admin)/detail-warga.jsx` - View/edit warga details
- `app/(admin)/edit-warga.jsx` - Edit warga information
- `app/(admin)/payment-manager.jsx` - Manage setoran payments
- `app/(admin)/payment-status.jsx` - View payment statuses
- `app/(admin)/timeline-manager.jsx` - Manage payment timelines

### Warga Interface Files
- `app/(tabs)/index.jsx` - Main warga dashboard with setoran status
- `app/(tabs)/profile.jsx` - Warga profile view
- `app/(tabs)/edit-profile.jsx` - Edit warga profile

### Service Files
- `services/userService.js` - Warga management (CRUD operations)
- `services/adminPaymentService.js` - Admin payment operations
- `services/wargaPaymentService.js` - Warga payment operations
- `services/pairingService.js` - RFID pairing management
- `services/timelineService.js` - Payment timeline management

### Utility and Testing Files
- `firebase-cleanup/cleanup.js` - Firebase data cleanup utility
- `testing/esp32-simulator.js` - ESP32 device simulator
- `testing/esp32-framework.cpp` - ESP32 hardware testing framework

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