# Alfi App - Sistem Pengelolaan Jimpitan Warga

A sophisticated React Native application integrated with ESP32 hardware for managing community savings (jimpitan) with intelligent payment processing using K-Nearest Neighbors algorithm.

## 🌟 Features

### Core Features
- 📱 **Mobile App** - Cross-platform React Native app with Expo
- 🔐 **Authentication** - Firebase Auth with role-based access control
- 💰 **Credit System** - Prepaid balance management for payments
- 📊 **Payment Tracking** - Real-time status updates and history
- 🌍 **Multi-language** - Indonesian and English support
- 🌙 **Dark/Light Theme** - Automatic theme switching
- 📈 **Data Visualization** - Charts and analytics for payments
- 📄 **Export Capabilities** - PDF and Excel export functionality

### Hardware Integration
- 🔌 **ESP32 Integration** - Seamless hardware-software connection
- 🏷️ **RFID Support** - Card-based warga identification
- 🧠 **KNN Algorithm** - Intelligent object/currency recognition
- 📡 **WiFi & USB** - Multiple communication protocols
- 🖥️ **LCD Display** - Hardware UI for transactions
- ⏰ **RTC Support** - Real-time clock for accurate timestamps

### Advanced Payment Features
- 💳 **Multiple Payment Methods** - BCA, Mandiri, QRIS, GoPay, OVO, DANA
- 💵 **Credit Balance** - Automatic deduction from prepaid balance
- 📊 **Payment Allocation** - Smart excess payment handling
- 🔄 **Status Management** - Automatic payment status updates

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- ESP32 DevKit (for hardware integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/alfi-app.git
cd alfi-app
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Setup Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password
   - Create a Firestore Database
   - Create `.env` file from `.env.example` and add your Firebase config:
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Run the app**
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## 📱 App Architecture

### Project Structure
```
alfi-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main warga interface
│   ├── (admin)/           # Bendahara admin panel
│   └── _layout.jsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components (CoreComponents, PaymentModal, etc.)
│   ├── auth/             # Auth components
│   └── illustrations/    # SVG illustrations
├── services/             # Business logic layer
│   ├── firebase.js       # Firebase configuration
│   ├── authService.js    # Authentication
│   ├── userService.js    # Warga management
│   └── ...              # Other services
├── contexts/            # React Context providers
├── constants/           # Theme, styles, colors
├── utils/              # Utility functions
├── firmware/           # ESP32 firmware code
└── testing/            # Test files and simulators
```

### Authentication Flow

1. **Warga (Resident) Login**
   - Email/password authentication
   - Access to payment status and profile

2. **Bendahara (Treasurer) Login**
   - Use `bendahara@gmail.com` or `admin@gmail.com`
   - Automatic admin privileges
   - Access to full admin panel

### Key Components

#### UI Components
- **CoreComponents.jsx** - Native React Native components replacing NativeBase
- **PaymentModal.jsx** - Advanced payment interface with credit system
- **ButtonStyles.js** - Comprehensive button styling system
- **CardStyles.js** - Card component styling with status helpers

#### Services
- **authService** - User authentication and registration
- **userService** - Warga CRUD operations
- **adminPaymentService** - Admin payment management
- **wargaPaymentService** - Warga payment operations
- **timelineService** - Payment timeline management
- **paymentStatusManager** - Automatic status updates

## 🔧 Hardware Setup

### ESP32 Configuration

1. **Install Arduino IDE** with ESP32 board support
2. **Choose firmware version**:
   - `AlfiFirmwareR0` - Basic functionality
   - `AlfiFirmwareR1` - Advanced with KNN algorithm
3. **Upload firmware** to ESP32 DevKit
4. **Connect hardware components**:
   - RFID-RC522 module
   - 16x2 LCD with I2C
   - DS3231 RTC module
   - TCS3200 color sensor
   - Servo motor
   - Relay module

### Hardware Testing
```bash
# Run ESP32 simulator
npm test

# Test individual components
# See firmware/Testing/ directory
```

## 🛠️ Development Commands

### App Development
```bash
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run as web app
npm run clear         # Clear cache and restart
```

### Testing & Utilities
```bash
npm test              # Run ESP32 simulator
npm run cleanup       # Firebase data cleanup
```

### Build & Deployment
```bash
# EAS Build commands
eas build --platform android --profile preview     # Preview APK
eas build --platform android --profile production  # Production APK
eas build --platform android --profile development # Dev client
```

### Maintenance
```bash
npm run clean         # Remove node_modules
npm run reinstall     # Clean install dependencies
```

## 📊 Database Schema

### Users Collection
```javascript
{
  id: "user_id",
  email: "warga@email.com",
  role: "user" | "bendahara" | "admin",
  namaWarga: "Nama Lengkap",
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
  dueDate: timestamp,
  status: "belum_bayar" | "lunas" | "terlambat",
  paymentDate: timestamp | null,
  paymentMethod: "cash" | "transfer" | "credit",
  notes: "",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 Customization

### Theme Configuration
Edit `constants/theme.js`:
```javascript
export const Colors = {
  primary: '#F50057',      // Pink theme
  primaryDark: '#C51162',
  primaryLight: '#FF5983',
  // ... customize colors
};
```

### App Metadata
Update `app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "icon": "./assets/your-icon.png"
  }
}
```

### Language Support
Add translations in language files:
- Indonesian (default)
- English
- Add more languages as needed

## 🔒 Security

- Firebase Authentication for secure user management
- Role-based access control (RBAC)
- Environment variables for sensitive configuration
- Secure RFID pairing with session management
- No hardcoded credentials or API keys

## 📱 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Authentication
- Login screen with illustrations
- Role selection (Warga/Bendahara)
- Registration with profile setup

### Warga Interface
- Payment status dashboard
- Credit balance display
- Profile management

### Bendahara Panel
- Warga list management
- Payment status overview
- Timeline configuration
- Export functionality

### Hardware Integration
- RFID pairing interface
- ESP32 status display
- Real-time payment processing

</details>

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React Native and Expo
- Firebase for backend services
- ESP32 community for hardware support
- Icons by react-native-vector-icons
- UI components inspired by Material Design

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check the [documentation](./docs)

---

Made with ❤️ for Indonesian communities