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
- Role-based access: `bendahara@gmail.com` gets bendahara role automatically (backward compatible with `admin@gmail.com`)
- AuthContext provides global auth state with bendahara detection
- AuthGuard component for route protection

**Routing Structure (Expo Router)**
- `app/(auth)/` - Authentication screens (bendahara-login, warga-login, bendahara-register)
- `app/(tabs)/` - Main warga interface (status setoran, profile, etc.)
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
  - userService.js: warga profile management (getAllWarga, backward compatible with getAllSantri)
  - adminPaymentService.js/waliPaymentService.js: setoran jimpitan management
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
- RFID card reading for user identification
- LCD display for user interface
- RTC for time tracking
- Color sensor (TCS3200) for object detection
- Servo motor and relay control
- WiFi connectivity for data transmission
- KNN algorithm for intelligent recognition

Testing framework available in `testing/` directory with ESP32 simulator.

## File Structure Changes

Key renamed files:
- `admin-login.jsx` → `bendahara-login.jsx`
- `admin-register.jsx` → `bendahara-register.jsx`
- `wali-login.jsx` → `warga-login.jsx`
- `daftar-santri.jsx` → `daftar-warga.jsx`
- `tambah-santri.jsx` → `tambah-warga.jsx`
- `detail-santri.jsx` → `detail-warga.jsx`
- `edit-santri.jsx` → `edit-warga.jsx`

Backward compatibility maintained in userService.js with `getAllSantri` alias for `getAllWarga`.