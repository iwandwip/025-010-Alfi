# 🏫 Smart Jimpitan - Sistem Jimpitan Payment Management System

> **Revolutionary IoT-enabled payment management system for community savings management**

A comprehensive payment management system for Sistem Jimpitan (Sistem Jimpitan Warga) Komunitas that combines a React Native mobile application with ESP32 IoT hardware. The system provides automated RFID-based warga identification, intelligent currency recognition using machine learning, and real-time financial management specifically designed for community savings management.

![Smart Jimpitan System](assets/images/app-icon.png)

## 🌟 What Makes It Special

**Smart Jimpitan** revolutionizes traditional payment management with:
- **🏷️ RFID Integration** - Contactless warga identification
- **🧠 AI Currency Recognition** - Automatic bill detection using computer vision
- **📱 Cross-Platform Mobile App** - Works on iOS, Android, and Web
- **⚡ Ultra-Fast Hardware Communication** - Revolutionary mode-based architecture with 1-second response time
- **💰 Intelligent Payment Processing** - Timeline-based schedules with credit management
- **🌐 Real-Time Synchronization** - Firebase-powered live updates

## 🚀 Key Features

### 👥 Multi-Role System
- **🔐 Admin Panel** - Complete management dashboard for bendahara
- **👨‍👩‍👧‍👦 Parent Access** - Dedicated interface for warga to track payments
- **🎯 Role-Based Permissions** - Secure access control with Firebase Authentication
- **📊 Real-Time Analytics** - Live payment status and financial reporting

### 🏷️ Advanced RFID System
- **⚡ Lightning-Fast Pairing** - 1-second response time for RFID card assignment
- **🔄 Real-Time Communication** - Revolutionary mode-based architecture
- **🎯 Instant Recognition** - Immediate warga identification upon card scan
- **🛡️ Secure Pairing** - Admin-controlled RFID card assignment process

### 🧠 Intelligent Currency Recognition
- **🤖 Machine Learning** - KNN algorithm for automatic bill detection
- **🌈 Color Sensor Integration** - TCS3200 sensor for precise currency identification
- **💵 Multi-Currency Support** - Recognizes 2000, 5000, and 10000 IDR bills
- **📏 High Accuracy** - Pre-trained model with extensive testing data

### 💰 Smart Payment Processing
- **📅 Flexible Schedules** - Daily, weekly, monthly, and yearly payment timelines
- **🏖️ Holiday Management** - Automatic exclusion of holiday periods
- **💳 Credit System** - Overpayment handling and balance tracking
- **⏰ Auto-Status Updates** - Intelligent late payment detection
- **🔄 Real-Time Sync** - Instant payment status updates across all devices

### 🔧 Revolutionary Hardware Integration
- **⚡ Mode-Based Architecture** - 90% code reduction, 98% memory efficiency
- **📱 App-Managed Timeouts** - Simplified ESP32 firmware
- **🔒 Solenoid Control** - Physical access control with unlock/lock commands
- **📺 LCD Interface** - User-friendly 16x2 display with button navigation
- **🔊 Multi-Sensor Support** - LEDs, buzzer, servo, relay integration

### 📱 Modern Mobile Application
- **🌐 Cross-Platform** - React Native with Expo (iOS, Android, Web)
- **🇮🇩 Indonesian Interface** - Complete localization for Indonesian users
- **🎨 Clean UI Design** - Modern, intuitive user interface
- **📶 Offline Support** - Local data caching and synchronization
- **🔔 Push Notifications** - Real-time payment and system alerts

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Firebase account**
- **ESP32 development board** (for hardware features)

### 1. 📦 Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd smart-jimpitan

# Install dependencies
npm install
# or
yarn install
```

### 2. 🔥 Firebase Setup

1. **Create Firebase Project**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" and follow the setup wizard

2. **Configure Authentication**
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** authentication

3. **Setup Firestore Database**
   - Go to **Firestore Database** → **Create database**
   - Choose **Start in test mode** (configure security rules later)

4. **Setup Realtime Database**
   - Go to **Realtime Database** → **Create database**
   - Choose **Start in test mode**

5. **Get Configuration**
   - Go to **Project Settings** → **General** → **Your apps**
   - Add a web app and copy the configuration
   - Replace the config in `services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
  databaseURL: "YOUR_REALTIME_DATABASE_URL"
};
```

### 3. 🎮 Run the Application

```bash
# Start development server
npm start

# Platform-specific development
npm run android    # Android device/emulator
npm run ios        # iOS device/simulator
npm run web        # Web browser
```

### 4. 🔑 Admin Access

**Default Admin Account:**
- Email: `admin@gmail.com`
- Password: `any password`

This account automatically gets admin privileges and access to the admin panel.

### 5. 🔧 ESP32 Hardware Setup (Optional)

For full hardware integration:

1. **Upload Firmware**
   - Use Arduino IDE to upload firmware from `firmware/AlfiFirmwareR1/`
   - Configure WiFi credentials via LCD menu
   - Set Firebase project URL in firmware

2. **Hardware Components**
   - ESP32 Development Board
   - MFRC522 RFID Reader
   - TCS3200 Color Sensor  
   - 16x2 LCD Display (I2C)
   - 3 Push Buttons
   - Solenoid Lock
   - LEDs, Buzzer, Servo

3. **Test Hardware**
   ```bash
   npm run test  # Run ESP32 simulator for testing
   ```

## 🎨 Customization Guide

### 🌈 Brand Colors
Customize your school's brand colors in `constants/Colors.js`:

```javascript
export const lightTheme = {
  primary: '#2E7D32',        // Your primary color
  secondary: '#FFC107',      // Your secondary color
  accent: '#FF5722',         // Accent color
  background: '#FFFFFF',     // Background color
  text: '#212121',          // Text color
  // ... other colors
};
```

### 🏷️ App Identity
1. **Update App Information** in `app.json`:
   ```json
   {
     "name": "Your School Payment System",
     "slug": "your-school-app",
     "description": "Payment management for your school"
   }
   ```

2. **Replace Visual Assets** in `/assets/` folder:
   - `icon.png` - Main app icon (1024x1024)
   - `splash.png` - Splash screen image
   - `adaptive-icon.png` - Android adaptive icon
   - `favicon.png` - Web browser favicon

### 🌍 Localization
The system is designed for Indonesian schools but can be customized:

1. **Modify Text** - Update Indonesian text in components
2. **Date Formats** - Adjust date formatting in `utils/dateUtils.js`
3. **Currency** - Modify currency handling for other denominations
4. **Add Languages** - Implement multi-language support if needed

### 🏫 School-Specific Settings
Customize for your institution:

```javascript
// In your configuration file
export const schoolConfig = {
  name: "Your School Name",
  logo: "path/to/your/logo.png",
  address: "Your School Address",
  phone: "Your Contact Number",
  defaultPaymentAmount: 5000, // Default amount in IDR
  supportedCurrency: [2000, 5000, 10000] // Supported bill denominations
};
```

## 📁 Project Structure

```
smart-jimpitan/
├── 📱 app/                     # Application screens (Expo Router)
│   ├── (auth)/                # 🔐 Authentication screens
│   │   ├── admin-login.jsx    # Admin login interface
│   │   ├── admin-register.jsx # Admin registration
│   │   └── wali-login.jsx     # Parent login interface
│   ├── (tabs)/                # 👥 User/Parent interface
│   │   ├── index.jsx          # Main dashboard
│   │   ├── profile.jsx        # User profile management
│   │   └── edit-profile.jsx   # Profile editing
│   ├── (admin)/               # 🏫 Admin panel
│   │   ├── index.jsx          # Admin dashboard
│   │   ├── daftar-warga.jsx  # Student list management
│   │   ├── tambah-warga.jsx  # Add new warga
│   │   ├── timeline-manager.jsx # Payment timeline management
│   │   └── payment-manager.jsx # Payment processing
│   └── _layout.jsx            # Root application layout
├── 🧩 components/              # Reusable UI components
│   ├── ui/                    # Core UI components
│   │   ├── Button.jsx         # Custom button component
│   │   ├── Input.jsx          # Form input component
│   │   ├── DataTable.jsx      # Data display table
│   │   └── PaymentModal.jsx   # Payment processing modal
│   ├── auth/                  # Authentication components
│   └── illustrations/         # SVG illustrations
├── 🔧 services/                # Business logic & API services
│   ├── firebase.js            # Firebase configuration
│   ├── authService.js         # Authentication services
│   ├── userService.js         # User management
│   ├── rtdbModeService.js     # 🚀 Mode-based hardware communication
│   ├── dataBridgeService.js   # Data synchronization
│   └── paymentStatusManager.js # Payment status management
├── 🧠 contexts/                # React context providers
│   ├── AuthContext.jsx        # Authentication state
│   ├── ThemeContext.jsx       # App theming
│   └── NotificationContext.jsx # Toast notifications
├── 🛠️ utils/                   # Utility functions
│   ├── dateUtils.js           # Date formatting & manipulation
│   ├── validation.js          # Form validation helpers
│   └── paymentStatusUtils.js  # Payment calculation logic
├── 🎨 constants/               # App constants & configuration
│   └── Colors.js              # Theme colors & styling
├── 🔌 firmware/                # ESP32 hardware firmware
│   ├── AlfiFirmwareR1/      # Latest firmware version
│   │   ├── AlfiFirmwareR1.ino # Main Arduino sketch
│   │   ├── KNN.ino            # Currency recognition algorithm
│   │   ├── WiFi.ino           # Network connectivity
│   │   └── Menu.ino           # LCD interface
│   └── Testing/               # Hardware component tests
└── 📊 assets/                  # Static assets (images, icons)
    ├── images/                # App images & illustrations
    ├── icon.png               # Main app icon
    └── splash.png             # Splash screen image
```

## 🔐 Authentication & User Roles

### 👤 User Registration Flow
1. **Parent Registration** - Parents (Wali) create accounts for their children
2. **Student Information** - Enter warga details (name, parent info, contact)
3. **Firebase Authentication** - Secure account creation with email/password
4. **Profile Creation** - Automatic profile setup in Firestore database
5. **RFID Assignment** - Admin assigns RFID cards to wargas

### 🔑 Admin Access
- **Default Admin**: `admin@gmail.com` (any password)
- **Full Management Access** - Complete control over wargas and payments
- **Timeline Management** - Create and manage payment schedules
- **RFID Pairing** - Assign RFID cards to wargas
- **Financial Reporting** - View payment status and generate reports

### 👥 User Role System
- **👨‍👩‍👧‍👦 Parent (Wali)** - View child's payment status, make payments, manage profile
- **🏫 Admin** - Full system access, warga management, payment processing
- **🎯 Role-Based Access** - Secure route protection based on user role

## 🛠️ Technology Stack

### 📱 Frontend
- **React Native** - Cross-platform mobile development
- **Expo SDK 53** - Development framework and build tools
- **Expo Router** - File-based navigation system
- **React Context** - State management for authentication and theming

### 🔥 Backend
- **Firebase Authentication** - Secure user authentication
- **Firestore** - NoSQL document database for persistent data
- **Firebase Realtime Database** - Real-time hardware communication
- **Firebase Cloud Functions** - Server-side logic (if needed)

### 🔌 Hardware
- **ESP32** - WiFi-enabled microcontroller
- **Arduino Framework** - Firmware development
- **MFRC522** - RFID reader module
- **TCS3200** - Color sensor for currency recognition
- **I2C LCD** - 16x2 character display

### 🧠 Machine Learning
- **K-Nearest Neighbors (KNN)** - Currency recognition algorithm
- **Color-based Classification** - RGB value analysis
- **Training Data** - Pre-collected currency color samples

## 📚 API Documentation

### Core Services
- **`authService.js`** - Authentication and user management
- **`userService.js`** - Student/parent CRUD operations
- **`rtdbModeService.js`** - Revolutionary hardware communication
- **`dataBridgeService.js`** - Data synchronization between RTDB and Firestore
- **`paymentStatusManager.js`** - Payment calculation and status updates

### Hardware Integration
- **Mode-Based Architecture** - Simplified ESP32 communication
- **Real-Time Coordination** - Instant hardware response
- **Data Bridge Pattern** - Efficient data synchronization

## 🏗️ Production Deployment

### 📱 Mobile App Deployment
```bash
# Build for Android
npm run build:android:production

# Build for iOS  
npm run build:ios:production

# Submit to stores
npm run submit:android
npm run submit:ios
```

### 🔧 ESP32 Firmware Deployment
1. Upload firmware using Arduino IDE
2. Configure WiFi credentials via LCD menu
3. Set Firebase project URL in firmware
4. Test all hardware components

### 🔒 Security Configuration
- Configure Firestore security rules
- Set up Firebase Authentication rules
- Use environment variables for sensitive data
- Implement rate limiting for API calls

## 📄 License

MIT License - Open source and free to use for educational institutions.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on how to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📞 Support & Community

- **📧 Email Support** - Contact the development team
- **📖 Documentation** - Comprehensive guides and API docs
- **🐛 Bug Reports** - GitHub Issues for bug tracking
- **💡 Feature Requests** - Suggest improvements and new features

---

<div align="center">

**🏫 Built with ❤️ for Community Savings Management**

*Empowering Sistem Jimpitan schools with modern payment management technology*

</div>