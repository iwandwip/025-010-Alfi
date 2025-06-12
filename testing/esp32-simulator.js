const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDXKj-ZsNWqkwxvB7iYMgSzXKY1WmUkutw",
  authDomain: "haikal-ef006.firebaseapp.com",
  projectId: "haikal-ef006",
  storageBucket: "haikal-ef006.firebasestorage.app",
  messagingSenderId: "11927917023",
  appId: "1:11927917023:web:11135a87b63106fe56346a",
  measurementId: "G-8B1KZ5DLJ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const generateRandomRFID = () => {
  const characters = 'ABCDEF0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getRandomDelay = () => {
  return Math.floor(Math.random() * (3000 - 1000) + 1000);
};

class ESP32RFIDSimulator {
  constructor() {
    this.pairingRef = doc(db, 'rfid_pairing', 'current_session');
    this.currentSession = null;
    this.timeoutTimer = null;
    this.processingTimer = null;
    this.isProcessing = false;
    this.isAuthenticated = false;
  }

  async initialize() {
    try {
      console.log('🔐 Authenticating...');
      await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
      
      this.startListening();
      
      console.log('🤖 ESP32 RFID Simulator Started');
      console.log('📡 Listening for RFID pairing sessions...');
      console.log('💡 Simulator will generate random RFID codes when pairing is active\n');
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      process.exit(1);
    }
  }

  startListening() {
    onSnapshot(this.pairingRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.handlePairingChange(data);
      } else {
        console.log('📄 No active pairing session');
        this.stopCurrentSession();
      }
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });
  }

  handlePairingChange(pairingData) {
    console.log('📊 Pairing data received:', {
      isActive: pairingData.isActive,
      santriId: pairingData.santriId,
      startTime: pairingData.startTime?.toDate?.()?.toLocaleString(),
      hasRfidCode: !!pairingData.rfidCode
    });

    if (!pairingData.isActive) {
      console.log('🔴 Pairing session inactive');
      this.stopCurrentSession();
      return;
    }

    if (this.isProcessing) {
      console.log('⏳ Already processing a pairing request');
      return;
    }

    if (pairingData.rfidCode) {
      console.log('✅ RFID already paired for this session');
      return;
    }

    this.startRFIDPairing(pairingData);
  }

  startRFIDPairing(pairingData) {
    console.log(`🔧 RFID Pairing Session Started`);
    console.log(`👤 Santri ID: ${pairingData.santriId}`);
    console.log(`⏰ Started at: ${pairingData.startTime?.toDate?.()?.toLocaleString()}`);
    
    this.currentSession = pairingData;
    this.isProcessing = true;
    
    // Start timeout timer (30 seconds)
    this.startTimeoutTimer();
    
    const delay = getRandomDelay();
    console.log(`⏳ Simulating RFID card scan... (waiting ${delay}ms)`);
    
    this.processingTimer = setTimeout(async () => {
      await this.completeRFIDPairing();
    }, delay);
  }

  async completeRFIDPairing() {
    if (!this.currentSession) return;

    const rfidCode = generateRandomRFID();
    console.log(`✅ RFID Card Detected: ${rfidCode}`);
    
    try {
      await updateDoc(this.pairingRef, {
        rfidCode: rfidCode,
        santriId: this.currentSession.santriId,
        lastActivity: new Date()
      });
      
      console.log(`📤 RFID data sent to Firestore`);
      console.log(`🎉 RFID Pairing Complete!`);
      console.log(`📱 App should receive: { success: true, rfidCode: "${rfidCode}", santriId: "${this.currentSession.santriId}" }\n`);
      
    } catch (error) {
      console.error('❌ Failed to update RFID:', error.message);
    }
    
    this.isProcessing = false;
    this.stopCurrentSession();
  }

  startTimeoutTimer() {
    // 30 second timeout
    const timeoutMs = 30 * 1000;
    
    this.timeoutTimer = setTimeout(async () => {
      console.log(`⏰ Pairing session timeout (30 seconds)`);
      await this.handleTimeout();
    }, timeoutMs);
  }

  async handleTimeout() {
    console.log('🚨 Pairing session timed out');
    
    try {
      await updateDoc(this.pairingRef, {
        isActive: false,
        timeout: true,
        lastActivity: new Date()
      });
      
      console.log('✅ Pairing session marked as timed out\n');
      
    } catch (error) {
      console.error('❌ Failed to handle timeout:', error.message);
    }
    
    this.stopCurrentSession();
  }

  stopCurrentSession() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
    
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
      this.processingTimer = null;
    }
    
    this.currentSession = null;
    this.isProcessing = false;
    
    console.log('🔄 Session stopped, waiting for next pairing request...\n');
  }

  shutdown() {
    console.log('🛑 Shutting down ESP32 RFID Simulator...');
    this.stopCurrentSession();
    process.exit(0);
  }
}

// Create and start simulator
const simulator = new ESP32RFIDSimulator();

// Handle graceful shutdown
process.on('SIGINT', () => {
  simulator.shutdown();
});

process.on('SIGTERM', () => {
  simulator.shutdown();
});

// Start the simulator
simulator.initialize().catch((error) => {
  console.error('❌ Simulator failed to start:', error);
  process.exit(1);
});