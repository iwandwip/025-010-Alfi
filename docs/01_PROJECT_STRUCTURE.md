# ALFI APP - PROJECT STRUCTURE & DATABASE SCHEMA

**Alfi App** - React Native mobile application untuk "Sistem Pengelolaan Jimpitan Warga" (community savings management system). Sistem manajemen setoran jimpitan berbasis IoT yang mengintegrasikan mobile app dengan ESP32 hardware, menggunakan algoritma K-Nearest Neighbors untuk deteksi mata uang otomatis dan RFID untuk identifikasi warga.

```
   +=============================================================================+
                        🏛️ ALFI JIMPITAN SYSTEM                              |
                                                                           |
   |  📱 React Native App  <->  ☁️  Firebase  <->  🔌 ESP32  <->  🏪 Jimpitan     |
                                                                           |
   |     Payment Manager    |    Real-time DB    |   RFID     |   Community  |
   |     Timeline System    |    Firestore       |   KNN      |   Savings    |
   |     Credit Management  |    Authentication  |   LCD      |   Management |
   +=============================================================================+
```

---

# 📋 TABLE OF CONTENTS

- [1.1 Application Architecture](#11-application-architecture)
- [1.2 Technology Stack](#12-technology-stack)
- [1.3 Navigation Structure](#13-navigation-structure)
- [1.4 Service Layer Organization](#14-service-layer-organization)
- [1.5 Database Schema](#15-database-schema)
- [1.6 Complete Project File Structure](#16-complete-project-file-structure)
- [1.7 UI Interface Design & Theme System](#17-ui-interface-design-theme-system)

---

## 1.1 Application Architecture

### **Role-Based System Architecture**
Alfi App menggunakan role-based architecture dengan dua role utama: **Bendahara** (admin) dan **Warga** (user). Sistem ini dirancang khusus untuk pengelolaan jimpitan komunitas dengan fitur-fitur enterprise level.

```
  ----------------------------------------------------------------------------+
                        ALFI APP ARCHITECTURE                              |
  ----------------------------------------------------------------------------+
                                                                          |
|    ----------------+      ----------------+      ----------------+        |
|  |  📱 MOBILE APP   |    |  ☁️  FIREBASE    |    |  🔌 ESP32 HW     |        |
|                                     |        |
|  | • React Native  |<-->| • Realtime DB   |<-->| • RFID Reader   |        |
|  | • Expo SDK 53   |    | • Firestore     |    | • KNN Algorithm |        |
|  | • Role-based UI |    | • Authentication|    | • Color Sensor  |        |
|  | • Dynamic Theme |    | • Cloud Storage |    | • LCD Display   |        |
|  | • Payment System|    |                 |    | • Solenoid Lock |        |
|    ----------------+      ----------------+      ----------------+        |
                                                                          |
|    --------------------------------------------------------------------+   |
|                   CORE FEATURES                                          |
|  |  👤 Role-Based Access      💰 Advanced Payment System              |  |
|  |  🏷️  RFID Integration       📊 Timeline Management                  |  |
|  |  🧠 KNN Currency Detection  💳 Credit Balance System               |  |
|  |  📱 Dynamic Role Theming    📈 Data Visualization                  |  |
|  |  🔒 Hardware Integration    📄 PDF/Excel Export                    |  |
|  |  ⚡ Mode-Based Architecture 🔄 Real-time Synchronization           |  |
|    --------------------------------------------------------------------+   |
  ----------------------------------------------------------------------------+
```

### **Key Architectural Principles**
- **Role-Based Access Control**: Bendahara dan Warga memiliki interface dan permission berbeda
- **Revolutionary Mode-Based RTDB**: 90% ESP32 code reduction dengan ultra-simple coordination
- **Service Layer Separation**: Business logic terpisah dari UI components
- **Context-based State Management**: Global state via React Context dengan role-based theming
- **Data Bridge Architecture**: RTDB untuk real-time, Firestore untuk permanent storage

## 1.2 Technology Stack

### **Frontend (React Native)**
```
  ----------------------------------------------------------------------------+
                         TECHNOLOGY STACK                                 |
  ----------------------------------------------------------------------------+
                                                                          |
|  📱 FRONTEND                    ☁️  BACKEND                  🔌 HARDWARE     |
|    ----------------+             ----------------+           ------------+  |
|  | React Native 0.79.3       | Firebase 10.14.0        | ESP32       |  |
|  | React 19.0.0              | • Realtime DB            | • Dual Core |  |
|  | Expo SDK 53               | • Firestore              | • RTOS      |  |
|  | Expo Router 5.1.0         | • Authentication         | • WiFi      |  |
|  |                           | • Cloud Storage          |             |  |
|  | UI Framework:             |                          | Sensors:    |  |
|  | • Custom Components       | Development:             | • MFRC522   |  |
|  | • Role-based Theming      | • Firebase Admin         | • TCS3200   |  |
|  | • React Native SVG        | • Interactive CLI        | • LCD 16x2  |  |
|  | • Chart Kit               | • Testing Framework      | • RTC DS3231|  |
|    ----------------+             ----------------+           ------------+  |
  ----------------------------------------------------------------------------+
```

### **Core Dependencies**
```json
{
  "react-native": "0.79.3",
  "expo": "~53.0.11",
  "react": "19.0.0",
  "firebase": "^10.14.0",
  "firebase-admin": "^13.4.0",
  "expo-router": "~5.1.0",
  "react-native-chart-kit": "^6.12.0",
  "react-native-svg": "15.11.2",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "xlsx": "^0.18.5",
  "inquirer": "^12.6.3"
}
```

### **Development & Testing Tools**
```
  ----------------------------------------------------------------------------+
                      DEVELOPMENT ECOSYSTEM                               |
  ----------------------------------------------------------------------------+
|  🧪 TESTING TOOLS               🛠️  UTILITIES                  📊 ANALYTICS    |
|    ----------------+             ----------------+           ------------+  |
|  | ESP32 Simulator         | Firebase Cleanup      | Export Tools   |  |
|  | • Interactive CLI       | • Database Reset      | • CSV Export   |  |
|  | • Hardware Sim          | • User Management     | • PDF Reports  |  |
|  | • Payment Testing       | • Activity Cleanup    | • Charts       |  |
|  |                         |                       |                |  |
|  | Hardware Tests          | Mode-Based Testing    | Payment System |  |
|  | • RFID Testing          | • RTDB Coordination   | • Credit Mgmt  |  |
|  | • KNN Algorithm         | • Real-time Sync      | • Multi-method |  |
|  | • Component Testing     | • Performance Checks  | • Auto-alloc   |  |
|    ----------------+             ----------------+           ------------+  |
  ----------------------------------------------------------------------------+
```

## 1.3 Navigation Structure

### **File-based Navigation (Expo Router)**
```
  ----------------------------------------------------------------------------+
                          NAVIGATION ARCHITECTURE                          |
  ----------------------------------------------------------------------------+
                                                                          |
|  🧭 EXPO ROUTER STRUCTURE                                                 |
|                                                                           |
|    app/                                                                   |
|      ├── _layout.jsx              ← Root layout dengan providers          |
|      ├── index.jsx                ← Root redirect logic                  |
|      ├── role-selection.jsx       ← Role selection screen               |
|      ├── (auth)/                  ← Authentication group                 |
|      │   ├── _layout.jsx          ← Auth layout wrapper                  |
|      │   ├── admin-login.jsx      ← Admin/Bendahara login                |
|      │   ├── admin-register.jsx   ← Admin registration                   |
|      │   ├── bendahara-login.jsx  ← Bendahara login (legacy support)    |
|      │   ├── bendahara-register.jsx ← Bendahara registration             |
|      │   └── warga-login.jsx      ← Warga login                          |
|      ├── (tabs)/                  ← Main warga interface                 |
|      │   ├── _layout.jsx          ← Tab navigation setup                 |
|      │   ├── index.jsx            ← Warga dashboard (setoran status)     |
|      │   ├── profile.jsx          ← Warga profile management             |
|      │   ├── edit-profile.jsx     ← Profile editing                      |
|      │   └── logout.jsx           ← Logout functionality                 |
|      └── (admin)/                 ← Admin/Bendahara panel                |
|          ├── _layout.jsx          ← Admin layout                         |
|          ├── index.jsx            ← Admin dashboard                      |
|          ├── daftar-warga.jsx     ← Warga list management               |
|          ├── tambah-warga.jsx     ← Add new warga                       |
|          ├── detail-warga.jsx     ← Warga details view                  |
|          ├── edit-warga.jsx       ← Edit warga information              |
|          ├── payment-status.jsx   ← Payment status overview             |
|          ├── payment-manager.jsx  ← Advanced payment management         |
|          ├── timeline-manager.jsx ← Timeline management                 |
|          ├── create-timeline.jsx  ← Create payment timelines            |
|          ├── user-payment-detail.jsx ← Detailed payment view            |
|          ├── cetak-keuangan.jsx   ← Financial reports                   |
|          └── pengeluaran.jsx      ← Expense management                  |
|                                                                           |
|  🔒 ROUTE PROTECTION                                                      |
|    AuthGuard.jsx → Protects authenticated routes                         |
|    Role Groups: (auth) untuk public, (tabs) untuk warga, (admin) untuk bendahara |
  ----------------------------------------------------------------------------+
```

### **Role-Based Navigation System**
```
  ----------------------------------------------------------------------------+
                           ROLE-BASED NAVIGATION                          |
  ----------------------------------------------------------------------------+
                                                                          |
|  👤 WARGA INTERFACE         👨‍💼 BENDAHARA INTERFACE                           |
|    ----------------+         ----------------+                            |
|  | • Setoran Dashboard     | • Complete Admin Panel      |                |
|  | • Payment Status        | • Warga Management          |                |
|  | • Profile Management    | • Timeline Management       |                |
|  | • Credit Balance View   | • Payment Processing        |                |
|  | • Payment History       | • Financial Reports         |                |
|  | • RFID Card Status      | • RFID Pairing System       |                |
|    ----------------+         ----------------+                            |
|                                                                           |
|  🎨 DYNAMIC THEMING                                                       |
|    • Warga: Blue theme (#2563EB) untuk user-friendly interface           |
|    • Bendahara: Red theme (#DC2626) untuk administrative authority       |
|    • useRoleTheme hook untuk automatic color adaptation                   |
  ----------------------------------------------------------------------------+
```

## 1.4 Service Layer Organization

### **Core Business Services**
```
  ----------------------------------------------------------------------------+
                        SERVICE LAYER ARCHITECTURE                        |
  ----------------------------------------------------------------------------+
                                                                          |
|  💼 CORE SERVICES                                                         |
|    ----------------+                                                      |
|  | authService.js           ← Authentication operations                   |
|  | • login, register, logout                                             |
|  | • password reset                                                      |
|  | • role-based authentication                                           |
|  | • bendahara@gmail.com auto-detection                                  |
|  |                                                                       |
|  | userService.js           ← Warga profile management                    |
|  | • CRUD operations dengan getAllWarga function                         |
|  | • RFID management                                                     |
|  | • credit balance tracking                                             |
|  | • soft delete system                                                  |
|  |                                                                       |
|  | firebase.js              ← Firebase configuration                     |
|  | • database initialization                                             |
|  | • realtime DB setup                                                   |
|  | • authentication config                                               |
|    ----------------+                                                      |
|                                                                           |
|  📊 ADVANCED PAYMENT SERVICES                                             |
|    ----------------+                                                      |
|  | adminPaymentService.js   ← COMPREHENSIVE admin payment management     |
|  | • getAllUsersPaymentStatus dengan detailed analytics                  |
|  | • Timeline-based payment processing                                   |
|  | • Bulk payment operations                                             |
|  | • Financial reporting dan export capabilities                         |
|  |                                                                       |
|  | wargaPaymentService.js   ← Warga payment operations                   |
|  | • getWargaPaymentHistory dengan filtering                             |
|  | • processPaymentWithCredit untuk advanced payment logic              |
|  | • Credit balance management dengan automatic allocation               |
|  | • Payment method support (cash, transfer, credit)                     |
|  |                                                                       |
|  | paymentStatusManager.js  ← ENTERPRISE-LEVEL status management        |
|  | • Smart caching system dengan 5-minute user throttling               |
|  | • Background sync capabilities                                        |
|  | • Event-driven notifications                                          |
|  | • Payment deadline monitoring dengan automatic alerts                 |
|  | • Performance optimization dengan intelligent throttling              |
|    ----------------+                                                      |
  ----------------------------------------------------------------------------+
```

### **Revolutionary Hardware Services**
```javascript
// rtdbModeService.js - Ultra-simple mode-based architecture
const rtdbModeService = {
  // Revolutionary RTDB Schema (90% ESP32 code reduction)
  schema: {
    mode: "idle", // "idle" | "pairing" | "payment" | "solenoid"
    pairing_mode: "", // Empty when idle, RFID code when detected
    payment_mode: {
      get: { 
        rfid_code: "", 
        amount_required: "", 
        user_id: "", 
        timeline_id: "", 
        period_key: "" 
      },
      set: { 
        amount_detected: "", 
        status: "" // "completed" | "rfid_salah" | "insufficient"
      }
    },
    solenoid_command: "locked" // "unlock" | "locked"
  },
  
  // Key Benefits:
  benefits: [
    "90% ESP32 code reduction - No JSON parsing needed",
    "5x faster real-time communication - Direct RTDB path access", 
    "Self-cleaning data patterns - Automatic cleanup after operations",
    "App-managed timeouts - ESP32 just reads current state",
    "Priority-based mode system - Prevents race conditions"
  ]
};

// dataBridgeService.js - RTDB to Firestore data bridging
const dataBridgeService = {
  // Bridge successful RFID pairings from RTDB to Firestore
  bridgeRFIDPairing: async (wargaId, rfidCode) => {
    // Permanent storage in Firestore user profiles
  },
  
  // Bridge successful payments from RTDB to Firestore
  bridgeHardwarePayment: async (paymentData) => {
    // Process payment with credit system integration
  },
  
  // Automatic listeners untuk real-time bridging
  autoListeners: [
    'startRFIDPairingBridge()',
    'startHardwarePaymentBridge()'
  ]
};
```

### **Specialized Services**
```
  ----------------------------------------------------------------------------+
                        SPECIALIZED SERVICE MODULES                       |
  ----------------------------------------------------------------------------+
                                                                          |
|  🏷️  HARDWARE INTEGRATION SERVICES                                        |
|    ----------------+                                                      |
|  | pairingService.js        ← RFID pairing management                     |
|  | • Real-time pairing sessions dengan timeout management                |
|  | • ESP32 coordination via mode-based architecture                      |
|  | • Automatic warga-RFID association                                    |
|  | • Session cleanup dan error handling                                  |
|  |                                                                       |
|  | hardwarePaymentService.js ← Hardware payment coordination             |
|  | • Mode-based payment sessions                                         |
|  | • KNN currency detection integration                                  |
|  | • Real-time payment progress tracking                                 |
|  | • Automatic credit conversion untuk partial payments                  |
|  |                                                                       |
|  | solenoidControlService.js ← Physical access control                   |
|  | • Unlock/lock solenoid dengan app-managed timeouts                   |
|  | • Safety mechanisms dan system busy detection                         |
|  | • Emergency override capabilities                                     |
|    ----------------+                                                      |
|                                                                           |
|  📅 TIMELINE & UTILITY SERVICES                                           |
|    ----------------+                                                      |
|  | timelineService.js       ← Payment timeline management                |
|  | • Complex timeline creation dengan flexible schedules                 |
|  | • Daily, weekly, monthly, yearly payment periods                     |
|  | • Holiday exclusion dan automatic period generation                   |
|  | • Timeline activation dan deactivation                                |
|  |                                                                       |
|  | seederService.js         ← Data seeding utilities                     |
|  | • Development data generation                                         |
|  | • Test user creation dengan sample payment data                       |
|  | • Database initialization untuk development                           |
|    ----------------+                                                      |
  ----------------------------------------------------------------------------+
```

## 1.5 Database Schema

### **Firebase Firestore Collections**

#### **Collection: `users`** (Enhanced Structure)
```javascript
{
  id: string,              // User UID
  email: string,           // User email
  role: 'user' | 'bendahara' | 'admin', // Role-based access control
  namaWarga: string,       // Full name (Indonesian naming convention)
  alamat: string,          // Complete address
  noHpWarga: string,       // Phone number (WhatsApp compatible)
  rfidWarga: string,       // RFID card identifier (unique)
  creditBalance: number,   // Credit balance in IDR (default: 0)
  deleted: boolean,        // Soft delete flag (default: false)
  createdAt: timestamp,    // Account creation time
  updatedAt: timestamp,    // Last profile update
  metadata: {
    lastLogin: timestamp,     // Last login tracking
    registeredBy: string,     // Admin who registered this user
    rfidPairedAt: timestamp,  // RFID pairing timestamp
    totalPayments: number,    // Total payments made
    totalCredit: number       // Total credit earned
  }
}
```

#### **Collection: `active_timeline`** (Payment Timeline Structure)
```javascript
{
  id: string,              // Auto-generated timeline ID
  timelineName: string,    // "Jimpitan Bulanan 2024", "Setoran Harian"
  description: string,     // Timeline description
  paymentAmount: number,   // Amount per period (e.g., 5000 IDR)
  frequency: string,       // "daily" | "weekly" | "monthly" | "yearly"
  startDate: string,       // ISO date string
  endDate: string,         // ISO date string
  isActive: boolean,       // Currently active timeline
  excludeHolidays: boolean, // Skip holiday periods
  metadata: {
    totalPeriods: number,      // Total payment periods
    completedPeriods: number,  // Periods with payments
    totalWarga: number,        // Enrolled warga count
    createdBy: string,         // Admin who created timeline
    activatedAt: timestamp,    // Timeline activation time
    lastUpdated: timestamp
  },
  periods: {                // Generated periods
    period_1: {
      periodKey: "period_1",
      periodLabel: "Minggu 1",
      dueDate: "2024-01-01T00:00:00.000Z",
      amount: 5000,
      status: "active"
    }
    // ... more periods
  }
}
```

#### **Collection: `payments/{timelineId}/periods/{periodKey}/warga_payments`** (Nested Payment Structure)
```javascript
{
  id: string,              // "wargaId_periodKey"
  wargaId: string,         // User reference
  wargaName: string,       // Cached warga name
  timelineId: string,      // Parent timeline reference
  period: string,          // "period_1", "period_2", etc.
  periodLabel: string,     // "Minggu 1", "Bulan Januari"
  amount: number,          // Required payment amount
  dueDate: string,         // ISO date string
  status: string,          // "belum_bayar" | "lunas" | "terlambat"
  paymentDate: timestamp | null, // Actual payment time
  paymentMethod: string,   // "cash" | "transfer" | "credit" | "hardware"
  amountPaid: number,      // Actual amount paid (may differ from required)
  creditUsed: number,      // Credit amount used for this payment
  excess: number,          // Excess amount (converted to credit)
  notes: string,           // Payment notes
  processedBy: string,     // Admin who processed payment
  metadata: {
    source: string,           // "manual" | "hardware" | "auto_credit"
    rfidUsed: string,         // RFID card used for payment
    hardwareSessionId: string, // Hardware session reference
    retryCount: number,       // Payment retry attempts
    lastStatusUpdate: timestamp
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **Collection: `rfid_pairing`** (RFID Session Management)
```javascript
// Document: "current_session"
{
  isActive: boolean,       // Pairing session active
  wargaId: string,         // Target warga for pairing
  wargaName: string,       // Cached warga name
  startTime: timestamp,    // Session start time
  rfidCode: string,        // Detected RFID code
  status: string,          // "waiting" | "received" | "completed" | "cancelled"
  sessionId: string,       // Unique session identifier
  initiatedBy: string,     // Admin who started pairing
  completedAt: timestamp,  // Session completion time
  cancelledAt: timestamp,  // Session cancellation time
  metadata: {
    timeoutDuration: number,  // Session timeout (seconds)
    retryCount: number,       // RFID detection retries
    lastActivity: timestamp   // Last session activity
  }
}
```

### **Firebase Realtime Database Structure (Mode-Based Architecture)**
```
root/
├── mode: string                    // "idle" | "pairing" | "payment" | "solenoid"
│
├── pairing_mode: string           // Empty when idle, RFID code when detected
│
├── payment_mode/
│   ├── get/                       // App → ESP32 data
│   │   ├── rfid_code: string      // Expected RFID for payment validation
│   │   ├── amount_required: string // Required payment amount
│   │   ├── user_id: string        // User ID for payment context
│   │   ├── timeline_id: string    // Timeline ID for payment context
│   │   └── period_key: string     // Period key for payment context
│   └── set/                       // ESP32 → App data
│       ├── amount_detected: string // Amount detected by KNN algorithm
│       └── status: string         // "completed" | "rfid_salah" | "insufficient"
│
└── solenoid_command: string       // "unlock" | "locked"
```

### **Database Relationships & Indexes**
```
  ----------------------------------------------------------------------------+
                        DATABASE RELATIONSHIPS                            |
  ----------------------------------------------------------------------------+
                                                                          |
|  📊 FIRESTORE INDEXES                                                     |
|                                                                           |
|    users/                                                                 |
|      ├── Composite: [deleted, role, createdAt]                          |
|      ├── Single: [email, rfidWarga, deleted]                            |
|      └── Single: [creditBalance] for credit queries                      |
|                                                                           |
|    active_timeline/                                                       |
|      ├── Single: [isActive, startDate, endDate]                         |
|      └── Composite: [isActive, frequency, createdAt]                     |
|                                                                           |
|    payments/{timelineId}/periods/{periodKey}/warga_payments/             |
|      ├── Composite: [status, dueDate, updatedAt]                        |
|      ├── Composite: [wargaId, status, dueDate]                          |
|      └── Single: [paymentMethod, processedBy]                            |
|                                                                           |
|  🔄 RTDB PERFORMANCE                                                       |
|    • Single mode field prevents race conditions                          |
|    • Direct path access (no JSON parsing needed)                         |
|    • Self-cleaning data patterns                                         |
|    • App-managed timeouts reduce ESP32 complexity                        |
  ----------------------------------------------------------------------------+
```

## 1.6 Complete Project File Structure

```
025-010-Alfi/

📱 MOBILE APPLICATION (React Native + Expo)
├── app/                                    # 🧭 Expo Router Navigation
│   ├── index.jsx                          # Root redirect logic
│   ├── _layout.jsx                        # Main app layout with providers
│   ├── role-selection.jsx                 # Role selection screen
│   ├── (auth)/                            # Authentication screens
│   │   ├── _layout.jsx                    # Auth layout wrapper
│   │   ├── admin-login.jsx                # Admin/Bendahara login
│   │   ├── admin-register.jsx             # Admin registration
│   │   ├── bendahara-login.jsx            # Bendahara login (legacy)
│   │   ├── bendahara-register.jsx         # Bendahara registration (legacy)
│   │   └── warga-login.jsx                # Warga login interface
│   ├── (tabs)/                            # Main warga interface
│   │   ├── _layout.jsx                    # Tab navigation setup
│   │   ├── index.jsx                      # Warga dashboard (setoran status)
│   │   ├── profile.jsx                    # Warga profile & settings
│   │   ├── edit-profile.jsx               # Profile editing screen
│   │   └── logout.jsx                     # Logout functionality
│   └── (admin)/                           # Admin/Bendahara panel
│       ├── _layout.jsx                    # Admin layout
│       ├── index.jsx                      # Admin dashboard
│       ├── daftar-warga.jsx               # Warga list management
│       ├── daftar-warga-COMPLETED.jsx     # Archived warga listing
│       ├── tambah-warga.jsx               # Add new warga
│       ├── detail-warga.jsx               # Warga details view
│       ├── edit-warga.jsx                 # Edit warga information
│       ├── payment-status.jsx             # Payment status overview
│       ├── payment-manager.jsx            # Advanced payment management
│       ├── timeline-manager.jsx           # Timeline management
│       ├── create-timeline.jsx            # Create payment timelines
│       ├── user-payment-detail.jsx        # Detailed payment view
│       ├── cetak-keuangan.jsx             # Financial reports
│       └── pengeluaran.jsx                # Expense management

├── components/                             # 🧩 Reusable UI Components
│   ├── AuthGuard.jsx                      # Route protection
│   ├── ErrorBoundary.jsx                  # Global error handling
│   ├── auth/
│   │   └── AuthForm.jsx                   # Reusable authentication form
│   ├── illustrations/                     # SVG illustration components
│   │   ├── index.js                       # Export index
│   │   ├── LoginIllustration.jsx          # Login screen illustration
│   │   ├── RegisterIllustration.jsx       # Register screen illustration
│   │   └── ForgotPasswordIllustration.jsx # Password recovery illustration
│   └── ui/                                # Core UI components
│       ├── CoreComponents.jsx             # 🆕 Complete NativeBase replacement
│       ├── PaymentModal.jsx               # 🆕 Advanced payment interface
│       ├── Button.jsx                     # Themed button component
│       ├── Input.jsx                      # Custom text input with validation
│       ├── LoadingSpinner.jsx             # Loading states with ActivityIndicator
│       ├── DataTable.jsx                  # Sophisticated table with pagination
│       ├── DatePicker.jsx                 # Date selection component
│       ├── TimelinePicker.jsx             # Timeline selection component
│       ├── CreditBalance.jsx              # Credit balance display
│       ├── ToastNotification.jsx          # Alert messages & notifications
│       ├── IllustrationContainer.jsx      # SVG illustration wrapper
│       ├── NativeButton.jsx               # Native-styled button
│       ├── NativeCard.jsx                 # Native-styled card
│       ├── NativeChip.jsx                 # Native-styled chip
│       ├── NBButton.jsx                   # Legacy NativeBase button
│       ├── NBCard.jsx                     # Legacy NativeBase card
│       ├── NBDataTable.jsx                # Legacy NativeBase data table
│       ├── NBInput.jsx                    # Legacy NativeBase input
│       └── NBLoadingSpinner.jsx           # Legacy NativeBase spinner

├── contexts/                               # 🌐 Global State Management
│   ├── AuthContext.jsx                    # User authentication & session
│   ├── SettingsContext.jsx                # App settings with Firebase sync
│   ├── NotificationContext.jsx            # Toast notifications & alerts
│   └── ThemeContext.jsx                   # Theme management with role-based colors

├── services/                               # 💼 Business Logic Layer
│   ├── firebase.js                        # Firebase initialization & config
│   ├── authService.js                     # Authentication operations
│   ├── userService.js                     # Warga profile management
│   ├── adminPaymentService.js             # Admin payment operations
│   ├── wargaPaymentService.js             # Warga payment operations
│   ├── timelineService.js                 # Payment timeline management
│   ├── pairingService.js                  # RFID pairing operations
│   ├── paymentStatusManager.js            # 🆕 Advanced status management
│   ├── rtdbModeService.js                 # 🆕 Revolutionary mode-based RTDB
│   ├── dataBridgeService.js               # 🆕 RTDB to Firestore data bridging
│   ├── hardwarePaymentService.js          # Hardware payment coordination
│   ├── solenoidControlService.js          # Solenoid control operations
│   └── seederService.js                   # Test data generation

├── hooks/                                  # 🎣 Custom React Hooks
│   └── useRoleTheme.js                    # 🆕 Dynamic role-based theming hook

├── utils/                                  # 🛠️ Utility Functions
│   ├── dateUtils.js                       # Date formatting & manipulation
│   ├── validation.js                      # Input validation helpers
│   └── paymentStatusUtils.js              # Payment status calculation logic

├── constants/                              # 📐 App Constants
│   ├── Colors.js                          # Color scheme & theme definitions
│   ├── theme.js                           # 🆕 Advanced theme with role-based colors
│   ├── ButtonStyles.js                    # 🆕 Button styling system
│   ├── CardStyles.js                      # 🆕 Card component styling
│   └── fonts.js                           # Font definitions

├── assets/                                 # 🖼️ Static Assets
│   ├── icon-money.png                     # Main money-themed app icon
│   ├── icon.png                           # Standard app icon
│   ├── adaptive-icon.png                  # Android adaptive icon
│   ├── favicon.png                        # Web favicon
│   ├── splash.png                         # Splash screen
│   ├── splash-icon.png                    # Splash screen icon
│   ├── fonts/                             # Custom Poppins font family
│   │   ├── Poppins-Bold.ttf               # Bold weight
│   │   ├── Poppins-Light.ttf              # Light weight
│   │   ├── Poppins-Medium.ttf             # Medium weight
│   │   ├── Poppins-Regular.ttf            # Regular weight
│   │   ├── Poppins-SemiBold.ttf           # SemiBold weight
│   │   └── README.md                      # Font documentation
│   └── images/                            # App images & illustrations
│       ├── app-icon.png                   # App icon variant
│       ├── login.png                      # Login illustration
│       ├── register.png                   # Register illustration
│       ├── forgot-password.png            # Password recovery illustration
│       └── splash.png                     # Splash screen image

├── types/                                  # 📝 Type Definitions
│   └── svg.d.ts                           # SVG TypeScript declarations

├── 🔌 HARDWARE INTEGRATION (ESP32 Firmware)
├── firmware/                              # ESP32 hardware firmware
│   ├── README.md                          # Firmware documentation
│   ├── AlfiFirmwareR0/                    # Basic firmware version
│   │   ├── AlfiFirmwareR0.ino             # Main Arduino sketch
│   │   ├── Header.h                       # Configuration headers
│   │   ├── Menu.ino                       # LCD menu system
│   │   ├── USBComs.ino                    # USB communication
│   │   └── WiFi.ino                       # WiFi connectivity
│   ├── AlfiFirmwareR1/                    # Advanced firmware with KNN
│   │   ├── AlfiFirmwareR1.ino             # Main Arduino sketch
│   │   ├── Header.h                       # Configuration headers
│   │   ├── KNN.ino                        # K-Nearest Neighbors algorithm
│   │   ├── Menu.ino                       # LCD menu system
│   │   ├── USBComs.ino                    # USB communication
│   │   └── WiFi.ino                       # WiFi connectivity
│   ├── Testing/                           # 🆕 Individual component tests
│   │   ├── TestLCD16x2/                   # LCD display testing
│   │   ├── TestRFID/                      # RFID reader testing
│   │   ├── TestRTC_DS3231/                # Real-time clock testing
│   │   ├── TestRelay/                     # Relay control testing
│   │   ├── TestServo/                     # Servo motor testing
│   │   └── TestTCS3200/                   # Color sensor testing
│   └── main/                              # Alternative firmware version
│       ├── main.ino                       # Main sketch
│       ├── library.h                      # Library headers
│       ├── Network.ino                    # Network functions
│       ├── RTOS.ino                       # Real-time OS functions
│       └── SensorActuator.ino             # Sensor & actuator control

├── 🧪 TESTING & DEVELOPMENT TOOLS
├── testing/                               # Testing utilities
│   ├── esp32-simulator.js                # Interactive ESP32 hardware simulator
│   ├── esp32-framework.cpp               # C++ testing framework
│   └── payment-allocation-test.js         # 🆕 Payment allocation testing
├── firebase-cleanup/
│   ├── cleanup.js                         # Interactive database cleanup tool
│   └── serviceAccountKey.json             # Firebase admin service account

├── 📚 DOCUMENTATION
├── README.md                              # Main project documentation
├── CLAUDE.md                              # Claude Code development guide
├── SYSTEM_FLOWS.md                        # System documentation & flows
├── AUTHENTICATION_TROUBLESHOOTING.md     # Auth troubleshooting guide
├── BUILD_APK.md                           # APK build instructions
├── SETUPGUIDE.md                          # Setup and installation guide
└── replacement-guide.md                   # Legacy component replacement guide

└── 📋 Configuration Files
    ├── package.json                           # Dependencies & scripts
    ├── app.json                               # Expo configuration
    ├── eas.json                               # EAS Build configuration
    ├── metro.config.js                        # Metro bundler configuration
    ├── eslint.config.js                       # ESLint configuration
    └── node_modules/                          # Installed dependencies
```

## 1.7 UI Interface Design & Theme System

### **Advanced Role-Based Theme System**
```
  ----------------------------------------------------------------------------+
                            ROLE-BASED DESIGN SYSTEM                      |
  ----------------------------------------------------------------------------+
                                                                          |
|  🎨 DYNAMIC COLOR SCHEMES                                                 |
|    ----------------+                                                      |
|  | 👨‍💼 BENDAHARA THEME (Administrative Authority)                          |
|  | Primary: #DC2626      ← Red-600 untuk admin functions                |
|  | Secondary: #EF4444    ← Red-500 untuk highlights                     |
|  | Accent: #F87171       ← Red-400 untuk accents                        |
|  | Background: #FEF2F2   ← Red-50 untuk backgrounds                     |
|  |                                                                       |
|  | 👤 WARGA THEME (User-Friendly Interface)                              |
|  | Primary: #2563EB      ← Blue-600 untuk user functions                |
|  | Secondary: #3B82F6    ← Blue-500 untuk highlights                    |
|  | Accent: #60A5FA       ← Blue-400 untuk accents                       |
|  | Background: #EFF6FF   ← Blue-50 untuk backgrounds                    |
|    ----------------+                                                      |
|                                                                           |
|  📱 RESPONSIVE LAYOUT                                                     |
|    ----------------+                                                      |
|  | Mobile-First Design   ← Optimized untuk mobile screens                |
|  | Adaptive Typography   ← Scalable text sizes dengan Poppins           |
|  | Touch-Friendly UI     ← 44px minimum touch targets                    |
|  | Role-Based Navigation ← Different layouts untuk different roles       |
|  | Dynamic Theming       ← useRoleTheme hook untuk automatic adaptation |
|    ----------------+                                                      |
  ----------------------------------------------------------------------------+
```

### **Component Architecture System**
```javascript
// CoreComponents.jsx - Complete NativeBase replacement
const CoreComponents = {
  // Layout Components
  Container: ({ children, ...props }) => <View style={containerStyles} {...props}>{children}</View>,
  Box: ({ children, ...props }) => <View style={boxStyles} {...props}>{children}</View>,
  VStack: ({ children, spacing, ...props }) => <View style={vStackStyles} {...props}>{children}</View>,
  HStack: ({ children, spacing, ...props }) => <View style={hStackStyles} {...props}>{children}</View>,
  Center: ({ children, ...props }) => <View style={centerStyles} {...props}>{children}</View>,
  
  // Typography Components
  Text: ({ children, variant, ...props }) => <RNText style={getTextStyle(variant)} {...props}>{children}</RNText>,
  Heading: ({ children, size, ...props }) => <RNText style={getHeadingStyle(size)} {...props}>{children}</RNText>,
  
  // Form Components
  Button: ({ variant, size, children, ...props }) => (
    <TouchableOpacity style={getButtonStyle(variant, size)} {...props}>
      <Text variant="button">{children}</Text>
    </TouchableOpacity>
  ),
  Input: ({ variant, ...props }) => <TextInput style={getInputStyle(variant)} {...props} />,
  
  // Utility Components
  LoadingSpinner: ({ size, color }) => <ActivityIndicator size={size} color={color} />,
  SafeArea: ({ children }) => <SafeAreaView style={safeAreaStyles}>{children}</SafeAreaView>,
  CustomModal: ({ isOpen, children, ...props }) => (
    <Modal visible={isOpen} {...props}>{children}</Modal>
  )
};

// useRoleTheme.js - Dynamic role-based theming
const useRoleTheme = () => {
  const { user } = useAuth();
  const isBendahara = user?.role === 'bendahara' || user?.role === 'admin';
  
  return {
    colors: isBendahara ? BendaharaColors : WargaColors,
    theme: isBendahara ? 'bendahara' : 'warga',
    isDark: false, // Could be extended untuk dark mode
    getColor: (colorKey) => isBendahara ? BendaharaColors[colorKey] : WargaColors[colorKey]
  };
};
```

### **Screen Layout Mockups**

#### **Warga Dashboard (Tab Interface)**
```
┌─────────────────────────────────────────────┐
│  💰 Jimpitan Dashboard - Warga              │
├─────────────────────────────────────────────┤
│  👤 Selamat datang, Nama Warga              │
│  💳 Saldo Credit: Rp 15.000                 │
├─────────────────────────────────────────────┤
│  📅 Status Setoran Minggu Ini              │
│  ┌───────────────────────────────────────┐  │
│  │ Minggu 1    │ ✅ Lunas    │ Rp 5.000  │  │
│  │ Minggu 2    │ ⏳ Belum    │ Rp 5.000  │  │
│  │ Minggu 3    │ ⏳ Belum    │ Rp 5.000  │  │
│  │ Minggu 4    │ ⏳ Belum    │ Rp 5.000  │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  📊 Riwayat Pembayaran │ 🏷️ RFID: Active    │
└─────────────────────────────────────────────┘
```

#### **Bendahara Admin Panel**
```
┌─────────────────────────────────────────────┐
│  🏛️ Panel Bendahara - Sistem Jimpitan      │
├─────────────────────────────────────────────┤
│  📊 Overview                                │
│  Total Warga: 45 │ Setoran Bulan: Rp 2.5M  │
│  Active: 42       │ Kredit Tertunda: Rp 150K│
├─────────────────────────────────────────────┤
│  🚀 Quick Actions                           │
│  ┌─────────────┐   ┌─────────────┐        │
│  │ 👥 Kelola   │   │ 🏷️ Pairing  │        │
│  │    Warga    │   │    RFID     │        │
│  └─────────────┘   └─────────────┘        │
│  ┌─────────────┐   ┌─────────────┐        │
│  │ 💰 Proses   │   │ 📊 Laporan  │        │
│  │   Payment   │   │  Keuangan   │        │
│  └─────────────┘   └─────────────┘        │
├─────────────────────────────────────────────┤
│  📈 Status Pembayaran Terkini               │
│  • 15 warga sudah bayar minggu ini          │
│  • 3 pembayaran terlambat                   │
│  • 5 pending approval                       │
└─────────────────────────────────────────────┘
```

#### **Hardware Payment Interface**
```
┌─────────────────────────────────────────────┐
│  🔌 Hardware Payment - Mode Active          │
├─────────────────────────────────────────────┤
│  Step 1: RFID Detection                     │
│  ┌───────────────────────────────────────┐  │
│  │  🏷️ Tap your RFID card...             │  │
│  │      [●○○] Waiting...                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Step 2: Currency Detection                 │
│  ┌───────────────────────────────────────┐  │
│  │  💵 Insert money into device...        │  │
│  │      KNN Algorithm Ready               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  📊 Session Info:                           │
│  Expected: Rp 5.000 | RFID: ****1234       │
│  Status: Waiting for payment                │
│                                             │
│  [Cancel Session] [Reset]                   │
└─────────────────────────────────────────────┘
```

### **Visual Design System**

#### **Component Hierarchy**
```
🎨 COMPONENT DESIGN HIERARCHY

Level 1: CoreComponents (Foundation)
├── Layout: Container, Box, VStack, HStack, Center
├── Typography: Text, Heading dengan Poppins font
├── Forms: Button, Input dengan role-based styling
└── Utilities: LoadingSpinner, SafeArea, CustomModal

Level 2: Specialized Components  
├── PaymentModal: Advanced payment interface
├── CreditBalance: Credit display dengan formatting
├── DataTable: Sophisticated table dengan pagination
└── TimelinePicker: Timeline selection interface

Level 3: Business Components
├── AuthForm: Authentication dengan role detection
├── WargaCard: Warga information display
├── PaymentStatusCard: Payment status dengan color coding
└── HardwareStatusIndicator: Real-time hardware status

Level 4: Screen-Specific Components
├── AdminDashboard: Complete admin interface
├── WargaDashboard: User-friendly warga interface
├── PaymentManagerInterface: Advanced payment management
└── TimelineManagerInterface: Timeline creation & management
```

#### **Interactive Elements & States**
```
🔵 PRIMARY ACTIONS (Role-based colors)
- Warga: Blue buttons untuk user actions
- Bendahara: Red buttons untuk admin actions
- Success: Green untuk completed actions
- Warning: Orange untuk pending actions

📱 TOUCH FEEDBACK
- Haptic feedback pada important interactions
- Visual feedback dengan scale animations
- Loading states dengan role-themed spinners
- Toast notifications dengan contextual colors

🔄 REAL-TIME UPDATES
- Payment status dengan live sync indicators
- Hardware connection status dengan pulsing icons
- Credit balance updates dengan smooth transitions
- Timeline progress dengan animated progress bars
```

---

**📋 Next Documents:**
- **[02_SYSTEM_FLOWS.md](./02_SYSTEM_FLOWS.md)** - Data flows dan sistem processing
- **[03_VERSION_HISTORY.md](./03_VERSION_HISTORY.md)** - Changelog dan development history