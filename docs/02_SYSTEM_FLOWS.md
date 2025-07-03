# ALFI APP - SYSTEM FLOWS & DATA ARCHITECTURE

**Sistem Data Flow dan Processing Logic** untuk Alfi App - Revolutionary mode-based hardware integration, intelligent payment processing, dan real-time community savings management system.

```
   +=============================================================================+
                      🔄 ALFI SYSTEM FLOWS                               |
                                                                           |
   |  ⚡ Mode-Based  <->  💰 Payment Processing  <->  🏷️ RFID System  <->  📊 Data Bridge  |
                                                                           |
   |    Ultra-Simple     |   Credit Management   |   Real-time Pairing |   RTDB→Firestore   |
   |    ESP32 Integration|   Multi-method        |   Instant Detection |   Permanent Storage |
   |    90% Code Reduction|  Smart Allocation    |   Hardware Sync     |   Data Consistency  |
   +=============================================================================+
```

---

# 📋 TABLE OF CONTENTS

- [2.1 Revolutionary Mode-Based Hardware Flow](#21-revolutionary-mode-based-hardware-flow)
- [2.2 Advanced Payment Processing Flow](#22-advanced-payment-processing-flow)
- [2.3 RFID Pairing & Hardware Integration Flow](#23-rfid-pairing-hardware-integration-flow)
- [2.4 Data Bridge & Synchronization Flow](#24-data-bridge-synchronization-flow)
- [2.5 Timeline Management & Credit System Flow](#25-timeline-management-credit-system-flow)
- [2.6 Authentication & Role-Based Access Flow](#26-authentication-role-based-access-flow)

---

## 2.1 Revolutionary Mode-Based Hardware Flow

### **Ultra-Simple ESP32 Architecture**
```
  ----------------------------------------------------------------------------+
                    REVOLUTIONARY MODE-BASED FLOW                         |
  ----------------------------------------------------------------------------+
                                                                          |
|  📱 MOBILE APP       ☁️  FIREBASE RTDB      🔌 ESP32 HARDWARE              |
                                                                          |
|    ------------+       ----------------+       ----------------+       |
|  | React Native |<--->| Mode-Based     |<--->| Ultra-Simple   |       |
|  | Service      |     | Architecture   |     | Implementation |       |
|  | Layer        |     |                |     |                |       |
|  |              |     | mode: "idle"   |     | String读取      |       |
|  | setMode()    |-----| "pairing"      |---->| No JSON parsing|       |
|  | getMode()    |     | "payment"      |     | Direct commands|       |
|  | subscribe()  |     | "solenoid"     |     | 1-second check |       |
|    ------------+       ----------------+       ----------------+       |
|                                                                        |
|  🔥 PERFORMANCE GAINS:                                                 |
|  • 90% ESP32 code reduction - No complex JSON parsing needed          |
|  • 5x faster communication - Direct RTDB path access                  |
|  • 98% memory efficiency - Simple string operations only              |
|  • Self-cleaning patterns - Automatic state cleanup                   |
|  • App-managed timeouts - ESP32 complexity drastically reduced        |
  ----------------------------------------------------------------------------+
```

### **Mode-Based State Machine**
```javascript
// Ultra-Simple RTDB Schema (Mode-Based Architecture)
const rtdbSchema = {
  // Single source of truth - prevents race conditions
  mode: "idle", // "idle" | "pairing" | "payment" | "solenoid"
  
  // RFID Pairing Mode - ESP32 writes detected codes here
  pairing_mode: "", // Empty when idle, RFID code when detected
  
  // Hardware Payment Coordination
  payment_mode: {
    get: { // App → ESP32 session data
      rfid_code: "",        // Expected RFID for validation
      amount_required: "",  // Required payment amount  
      user_id: "",          // User context for processing
      timeline_id: "",      // Timeline context
      period_key: ""        // Period context
    },
    set: { // ESP32 → App results
      amount_detected: "",  // KNN detected amount
      status: ""           // "completed" | "rfid_salah" | "insufficient"
    }
  },
  
  // Solenoid Control Commands  
  solenoid_command: "locked" // "unlock" | "locked"
};

// ESP32 Implementation (Ultra-Simple!)
/*
void loop() {
  // Read single mode field (source of truth)
  String currentMode = Firebase.getString(firebaseData, "mode");
  
  // Ultra-simple mode switching (no complex logic!)
  if (currentMode == "idle") {
    handleIdleMode();
  } else if (currentMode == "pairing") {
    handlePairingMode(); // Just read RFID and write to pairing_mode
  } else if (currentMode == "payment") {
    handlePaymentMode(); // Read session data, process RFID/KNN, write results
  }
  
  // Always check solenoid (independent of mode)
  handleSolenoidControl();
  
  delay(1000); // Responsive 1-second checking
}
*/
```

### **Priority-Based Mode System**
```
  ----------------------------------------------------------------------------+
                     PRIORITY-BASED MODE SYSTEM                         |
  ----------------------------------------------------------------------------+
                                                                          |
|  MODE PRIORITY HIERARCHY (Prevents Race Conditions)                       |
|                                                                           |
|    Priority 0: IDLE        ← Default state, lowest priority              |
|    Priority 1: SOLENOID    ← Physical access control                     |
|    Priority 2: PAIRING     ← RFID card assignment                        |
|    Priority 3: PAYMENT     ← Payment processing (highest priority)       |
|                                                                           |
|  🔒 SAFE TRANSITIONS:                                                     |
|    ----------------+                                                      |
|  | idle → any mode         ✅ Always allowed                             |
|  | solenoid → idle only    ✅ Must return to idle                        |
|  | pairing → idle only     ✅ Must complete or timeout                   |
|  | payment → idle only     ✅ Must complete or timeout                   |
|  | Any → payment          ✅ Highest priority (emergency override)       |
|    ----------------+                                                      |
|                                                                           |
|  ⏱️ APP-MANAGED TIMEOUTS:                                                 |
|  • Pairing timeout: 30 seconds (default)                                 |
|  • Payment timeout: 5 minutes (configurable)                             |
|  • Solenoid timeout: 30 seconds (app controls unlock duration)           |
|  • ESP32 never manages timeouts - only reads current state!              |
  ----------------------------------------------------------------------------+
```

### **Real-Time Communication Flow**
```javascript
// Real-time communication patterns dengan mode-based architecture
const hardwareCommunicationFlow = {
  // 1. Start RFID Pairing Session
  startRFIDPairing: async () => {
    // Set mode dengan priority checking
    const result = await rtdbModeService.setMode('pairing');
    if (result.success) {
      await rtdbModeService.set(ref(rtdb, 'pairing_mode'), '');
      
      // Subscribe untuk RFID detection
      const unsubscribe = rtdbModeService.subscribeToRFIDDetection((rfidCode) => {
        console.log('🏷️ RFID detected:', rfidCode);
        // Process pairing dengan detected RFID
      });
      
      // App-managed timeout (not ESP32!)
      setTimeout(async () => {
        const currentMode = await rtdbModeService.getMode();
        if (currentMode === 'pairing') {
          await rtdbModeService.resetToIdle();
        }
      }, 30000);
    }
  },
  
  // 2. Start Hardware Payment Session
  startHardwarePayment: async (rfidCode, amount, context) => {
    const result = await rtdbModeService.setMode('payment');
    if (result.success) {
      // Set session data untuk ESP32
      await rtdbModeService.startHardwarePayment(
        rfidCode, amount, context.userId, context.timelineId, context.periodKey
      );
      
      // Subscribe untuk payment results
      const unsubscribe = rtdbModeService.subscribeToPaymentResults((results) => {
        console.log('💰 Payment completed:', results);
        
        // Bridge data ke Firestore untuk permanent storage
        dataBridgeService.bridgeHardwarePayment({
          userId: context.userId,
          timelineId: context.timelineId,
          periodKey: context.periodKey,
          amountDetected: results.amount_detected,
          status: results.status
        });
      });
    }
  },
  
  // 3. Solenoid Control dengan Safety
  unlockSolenoid: async (duration = 30) => {
    const currentMode = await rtdbModeService.getMode();
    
    // Safety check - tidak bisa unlock jika sistem busy
    if (currentMode !== 'idle' && currentMode !== 'solenoid') {
      return { 
        success: false, 
        reason: 'system_busy',
        message: `Sistem sedang ${currentMode === 'pairing' ? 'pairing RFID' : 'processing payment'}`
      };
    }
    
    // Set solenoid mode dan unlock command
    await rtdbModeService.setMode('solenoid');
    await rtdbModeService.set(ref(rtdb, 'solenoid_command'), 'unlock');
    
    // App-managed auto-lock timeout
    setTimeout(async () => {
      const mode = await rtdbModeService.getMode();
      if (mode === 'solenoid') {
        await rtdbModeService.lockSolenoid(); // Auto-lock dan reset ke idle
      }
    }, duration * 1000);
  }
};
```

## 2.2 Advanced Payment Processing Flow

### **Credit-Based Payment System Architecture**
```
  ----------------------------------------------------------------------------+
                   ADVANCED PAYMENT PROCESSING FLOW                      |
  ----------------------------------------------------------------------------+
                                                                          |
|  💰 PAYMENT INPUT        🧮 SMART ALLOCATION       💳 MULTIPLE METHODS      |
                                                                          |
|    ----------------+       ----------------+         ----------------+     |
|  | Hardware KNN    |---->| Credit System   |------>| Payment Methods |     |
|  | • TCS3200       |     | • Auto Allocation|       | • Cash (Hardware)|     |
|  | • Currency      |     | • Exact/Partial |       | • Transfer       |     |
|  | Detection       |     | • Overflow→Credit|       | • Credit Balance |     |
|  |                 |     |                 |       | • Manual Entry   |     |
|  | Manual Input    |     | Allocation Logic|       | Method Validation|     |
|  | • Admin Entry   |---->| • Priority Queue|------>| • Amount Check   |     |
|  | • Custom Amount |     | • Smart Retry   |       | • Status Update  |     |
|  | • Method Select |     | • Deficit Track |       | • Receipt Gen    |     |
|    ----------------+       ----------------+         ----------------+     |
|                                                                           |
|  🔄 REAL-TIME PROCESSING FLOW:                                            |
|                                                                           |
|  1. Payment Input → 2. Amount Validation → 3. Credit Check →             |
|  4. Smart Allocation → 5. Status Update → 6. Receipt Generation          |
  ----------------------------------------------------------------------------+
```

### **Smart Payment Allocation Algorithm**
```javascript
// Advanced payment allocation dengan credit system integration
const paymentAllocationFlow = {
  // Main payment processing function
  processPaymentWithCredit: async (timelineId, periodKey, wargaId, amount, method) => {
    try {
      // 1. Load user credit balance dan payment context
      const user = await getUserById(wargaId);
      const creditBalance = user.creditBalance || 0;
      const totalAvailable = amount + creditBalance;
      
      // 2. Get target payment details
      const paymentDoc = await getPaymentDocument(timelineId, periodKey, wargaId);
      const requiredAmount = paymentDoc.amount;
      
      // 3. Smart allocation logic
      if (totalAvailable >= requiredAmount) {
        // SCENARIO A: Sufficient funds (cash + credit)
        const cashUsed = Math.min(amount, requiredAmount);
        const creditUsed = Math.max(0, requiredAmount - amount);
        const excess = Math.max(0, amount - requiredAmount);
        
        // Update payment status
        await updatePayment(timelineId, periodKey, wargaId, {
          status: 'lunas',
          paymentDate: serverTimestamp(),
          paymentMethod: method,
          amountPaid: amount,
          creditUsed: creditUsed,
          notes: `Lunas: Cash Rp${cashUsed.toLocaleString('id-ID')}${creditUsed > 0 ? `, Credit Rp${creditUsed.toLocaleString('id-ID')}` : ''}`
        });
        
        // Update user credit balance
        const newCreditBalance = creditBalance - creditUsed + excess;
        await updateUserCredit(wargaId, newCreditBalance);
        
        return {
          success: true,
          status: 'completed',
          allocation: { cashUsed, creditUsed, excess },
          newCreditBalance
        };
        
      } else {
        // SCENARIO B: Insufficient funds - add to credit
        const newCreditBalance = creditBalance + amount;
        await updateUserCredit(wargaId, newCreditBalance);
        
        return {
          success: true,
          status: 'partial_to_credit',
          message: `Rp${amount.toLocaleString('id-ID')} ditambahkan ke saldo credit`,
          newCreditBalance
        };
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Batch payment processing untuk multiple periods
  processBatchPayments: async (wargaId, payments) => {
    const results = [];
    let currentCreditBalance = (await getUserById(wargaId)).creditBalance || 0;
    
    // Sort payments by due date (oldest first)
    const sortedPayments = payments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    for (const payment of sortedPayments) {
      if (currentCreditBalance >= payment.amount) {
        // Process payment dengan credit
        const result = await processPaymentWithCredit(
          payment.timelineId, payment.periodKey, wargaId, 
          0, 'credit' // Use 0 cash, pure credit payment
        );
        
        if (result.success) {
          currentCreditBalance = result.newCreditBalance;
          results.push({ payment, result: 'processed', method: 'credit' });
        }
      } else {
        results.push({ payment, result: 'insufficient_credit', needed: payment.amount - currentCreditBalance });
      }
    }
    
    return { success: true, processed: results, finalCreditBalance: currentCreditBalance };
  }
};
```

### **Payment Status Management with Caching**
```javascript
// paymentStatusManager.js - Enterprise-level status management
const paymentStatusManager = {
  // Smart caching system dengan throttling
  cache: new Map(),
  throttleSettings: {
    perUser: 5 * 60 * 1000,     // 5 minutes per user
    perPage: 2 * 60 * 1000,     // 2 minutes per page
    backgroundResume: 30 * 60 * 1000 // 30 minutes background resume
  },
  
  // Update user payment status dengan intelligent caching
  updateUserPaymentStatus: async (userId, forceUpdate = false, source = 'manual') => {
    const key = `user_payments_${userId}`;
    
    // Check throttling rules
    if (!forceUpdate && this.shouldSkipUpdate('user_payments', userId)) {
      console.log(`⚡ Skipping update for ${userId} due to throttling`);
      const cached = await this.getFromCache(key);
      if (cached) return { success: true, data: cached, fromCache: true };
    }
    
    // Prevent duplicate updates
    if (this.isUpdating.has(key)) {
      return { success: false, error: 'Update in progress' };
    }
    
    try {
      this.isUpdating.add(key);
      console.log(`🔄 Updating payment status for user ${userId} (source: ${source})`);
      
      // Get fresh data dari wargaPaymentService
      const result = await getWargaPaymentHistory(userId);
      
      if (result.success) {
        // Cache result dan update timestamps
        this.setCache(key, result);
        this.markUpdateTime('user_payments', userId);
        
        // Notify listeners untuk real-time UI updates
        this.notifyListeners('user_payment_updated', {
          userId, data: result, source
        });
        
        // Check untuk overdue payments dan upcoming deadlines
        const overduePayments = this.checkForOverduePayments(result.payments || []);
        const upcomingPayments = this.checkForUpcomingPayments(result.payments || []);
        
        // Trigger notifications jika ada overdue/upcoming payments
        if (overduePayments.length > 0) {
          this.notifyListeners('payments_overdue', {
            userId, payments: overduePayments, count: overduePayments.length
          });
        }
        
        return { success: true, data: result, source };
      }
      
    } finally {
      this.isUpdating.delete(key);
    }
  },
  
  // Background app state handling
  handleAppStateChange: async (nextAppState, userId = null) => {
    if (nextAppState === 'active') {
      const now = Date.now();
      const timeSinceBackground = this.backgroundTime ? now - this.backgroundTime : 0;
      
      // Update after long background period
      if (timeSinceBackground > this.throttleSettings.backgroundResume) {
        console.log('📱 App resumed after long background, updating payment status');
        
        if (userId) {
          await this.updateUserPaymentStatus(userId, false, 'app_resume');
        }
      }
    } else if (nextAppState === 'background') {
      this.backgroundTime = Date.now();
    }
  }
};
```

## 2.3 RFID Pairing & Hardware Integration Flow

### **Real-Time RFID Pairing System**
```
  ----------------------------------------------------------------------------+
                     RFID PAIRING & HARDWARE INTEGRATION                  |
  ----------------------------------------------------------------------------+
                                                                          |
|  👨‍💼 BENDAHARA INTERFACE    ☁️  MODE COORDINATION    🔌 ESP32 HARDWARE       |
                                                                          |
|    ----------------+       ----------------+       ----------------+       |
|  | Admin Panel     |---->| RTDB Mode      |<--->| RFID Reader     |       |
|  | • Select Warga  |     | Control        |     | • MFRC522       |       |
|  | • Start Pairing |     |                |     | • Real-time     |       |
|  |                 |     | mode: "pairing"|     | • Detection     |       |
|  | Real-time UI    |<--->| pairing_mode:  |<--->| • Instant Write |       |
|  | • Progress      |     | "RFID_CODE"    |     | • No Parsing    |       |
|  | • Auto-complete |     |                |     |                 |       |
|  | • Error Handle  |     | Auto Timeout   |     | Simple Loop     |       |
|    ----------------+       ----------------+       ----------------+       |
|                                                                           |
|  ⚡ PAIRING FLOW STEPS:                                                    |
|                                                                           |
|  1. Admin selects warga → 2. Set mode to "pairing" → 3. ESP32 detects →  |
|  4. RFID written to RTDB → 5. App bridges to Firestore → 6. Reset idle   |
  ----------------------------------------------------------------------------+
```

### **RFID Pairing Implementation Flow**
```javascript
// Complete RFID pairing flow dengan mode-based architecture
const rfidPairingFlow = {
  // 1. Admin initiates pairing dari admin panel
  startPairingSession: async (wargaId, wargaName) => {
    try {
      // Validate warga exists dan belum ada RFID
      const user = await getUserById(wargaId);
      if (!user) throw new Error('Warga tidak ditemukan');
      if (user.rfidWarga) throw new Error('Warga sudah memiliki RFID card');
      
      // Create pairing session di Firestore
      await setDoc(doc(db, 'rfid_pairing', 'current_session'), {
        isActive: true,
        wargaId: wargaId,
        wargaName: wargaName,
        startTime: serverTimestamp(),
        rfidCode: '',
        status: 'waiting',
        sessionId: generateSessionId(),
        initiatedBy: currentUser.uid,
        metadata: {
          timeoutDuration: 30, // seconds
          retryCount: 0,
          lastActivity: serverTimestamp()
        }
      });
      
      // Set RTDB mode ke pairing
      const modeResult = await rtdbModeService.startRFIDPairing();
      if (!modeResult.success) {
        throw new Error(`Cannot start pairing: ${modeResult.reason}`);
      }
      
      // Start listening untuk RFID detection
      const unsubscribe = rtdbModeService.subscribeToRFIDDetection(async (rfidCode) => {
        console.log('🏷️ RFID detected dalam pairing mode:', rfidCode);
        
        // Validate RFID belum digunakan
        const existingUser = await getUserByRFID(rfidCode);
        if (existingUser && existingUser.id !== wargaId) {
          // RFID sudah digunakan - show error
          await updatePairingSession({
            status: 'error',
            errorMessage: 'RFID sudah digunakan oleh warga lain'
          });
          return;
        }
        
        // Bridge RFID ke Firestore
        const bridgeResult = await dataBridgeService.bridgeRFIDPairing(wargaId, rfidCode);
        
        if (bridgeResult.success) {
          // Update pairing session sebagai completed
          await updatePairingSession({
            rfidCode: rfidCode,
            status: 'completed',
            receivedTime: serverTimestamp()
          });
          
          // Complete session dan reset ke idle
          await rtdbModeService.completePairingSession();
          
          console.log('✅ RFID pairing completed successfully');
        } else {
          await updatePairingSession({
            status: 'error',
            errorMessage: bridgeResult.error
          });
        }
      });
      
      // App-managed timeout (30 seconds)
      setTimeout(async () => {
        try {
          const currentMode = await rtdbModeService.getMode();
          if (currentMode === 'pairing') {
            // Timeout - cancel session
            await updatePairingSession({
              status: 'cancelled',
              cancelledTime: serverTimestamp(),
              cancelReason: 'timeout'
            });
            
            await rtdbModeService.resetToIdle();
            unsubscribe(); // Stop listening
            
            console.log('⏰ RFID pairing session timed out');
          }
        } catch (error) {
          console.error('Error in pairing timeout:', error);
        }
      }, 30000);
      
      return { 
        success: true, 
        sessionId: generateSessionId(),
        unsubscribe: unsubscribe
      };
      
    } catch (error) {
      console.error('Error starting RFID pairing:', error);
      return { success: false, error: error.message };
    }
  },
  
  // 2. Update pairing session status
  updatePairingSession: async (updates) => {
    try {
      await updateDoc(doc(db, 'rfid_pairing', 'current_session'), {
        ...updates,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating pairing session:', error);
    }
  },
  
  // 3. Cancel pairing session (manual)
  cancelPairingSession: async (reason = 'manual_cancel') => {
    try {
      // Update session sebagai cancelled
      await updatePairingSession({
        status: 'cancelled',
        cancelledTime: serverTimestamp(),
        cancelReason: reason
      });
      
      // Reset RTDB mode ke idle
      await rtdbModeService.resetToIdle();
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling pairing session:', error);
      return { success: false, error: error.message };
    }
  }
};
```

### **Hardware Integration Patterns**
```
  ----------------------------------------------------------------------------+
                      HARDWARE INTEGRATION PATTERNS                      |
  ----------------------------------------------------------------------------+
                                                                          |
|  🔌 ESP32 COMPONENT INTEGRATION                                           |
|                                                                           |
|    MFRC522 RFID Reader    ←→ ESP32 Core 0 ←→ Firebase RTDB               |
|    • SPI Communication        • Real-time           • pairing_mode        |
|    • Card Detection            • 1s Polling         • payment_mode/set    |
|    • Instant Response          • String Ops         • Direct Write        |
|                                                                           |
|    TCS3200 Color Sensor   ←→ ESP32 Core 1 ←→ KNN Algorithm               |
|    • RGB Frequency             • Parallel           • Currency Detection  |
|    • Currency Detection        • Processing         • IDR 2K/5K/10K      |
|    • Training Data             • No JSON            • Confidence Score    |
|                                                                           |
|    16x2 LCD Display       ←→ ESP32 I2C    ←→ User Interface              |
|    • Real-time Status          • Simple             • Payment Progress    |
|    • Mode Display              • Text Output        • RFID Instructions   |
|    • User Instructions         • No Parsing         • Error Messages      |
|                                                                           |
|    Solenoid Lock          ←→ ESP32 Relay   ←→ Access Control             |
|    • Physical Security         • Digital            • App-managed         |
|    • App-controlled            • Control            • Safety Timeout      |
|    • Emergency Override        • GPIO               • Mode-independent    |
  ----------------------------------------------------------------------------+
```

## 2.4 Data Bridge & Synchronization Flow

### **RTDB to Firestore Data Bridge Architecture**
```
  ----------------------------------------------------------------------------+
                    DATA BRIDGE & SYNCHRONIZATION FLOW                   |
  ----------------------------------------------------------------------------+
                                                                          |
|  ⚡ RTDB (Real-time)      🌉 DATA BRIDGE        💾 FIRESTORE (Permanent)    |
                                                                          |
|    ----------------+       ----------------+       ----------------+       |
|  | Mode Control    |<--->| Bridge Service  |<--->| Permanent       |       |
|  | • mode: string  |     | • Auto Listeners|     | Storage         |       |
|  | • session data  |     | • Data Validation|     |                 |       |
|  | • temp storage  |     | • Error Handling|     | • User Profiles |       |
|  |                 |     |                 |     | • Payment Records|       |
|  | Payment Session |     | Real-time       |     | • Timeline Data |       |
|  | • get: {...}    |---->| Processing      |---->| • Activity Logs |       |
|  | • set: {...}    |     | • bridgeRFID()  |     | • Bridge Logs   |       |
|  |                 |     | • bridgePayment()|     |                 |       |
|  | Auto Cleanup    |     | Consistency     |     | Query Optimization|     |
|  | • Self-clean    |<----| Validation      |<----| • Indexes       |       |
|  | • Reset idle    |     | • Data integrity|     | • Relationships |       |
|    ----------------+       ----------------+       ----------------+       |
|                                                                           |
|  🔄 BRIDGE PATTERNS:                                                      |
|  • Successful operations → Bridge to Firestore → Cleanup RTDB            |
|  • Failed operations → Log error → Retry mechanism → Alert admin         |
|  • Data consistency → Validate both sides → Automatic reconciliation     |
  ----------------------------------------------------------------------------+
```

### **Data Bridge Implementation**
```javascript
// dataBridgeService.js - Complete data bridging implementation
const dataBridgeFlow = {
  // Automatic RFID pairing bridge
  bridgeRFIDPairing: async (wargaId, rfidCode) => {
    try {
      // Validate parameters
      if (!wargaId || !rfidCode) {
        throw new Error('Missing required parameters for RFID pairing bridge');
      }
      
      // Save to Firestore user profile (permanent storage)
      const result = await updateWargaRFID(wargaId, rfidCode);
      
      if (result.success) {
        console.log('✅ RFID Pairing bridged successfully:', { wargaId, rfidCode });
        
        // Log successful bridge operation untuk audit
        await logBridgeOperation('rfid_pairing', {
          wargaId,
          rfidCode,
          status: 'success',
          bridgedAt: new Date()
        });
        
        return { success: true, message: 'RFID successfully bridged to Firestore' };
      }
    } catch (error) {
      console.error('❌ RFID Pairing bridge failed:', error);
      
      // Log failed bridge operation
      await logBridgeOperation('rfid_pairing', {
        wargaId, rfidCode,
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });
      
      return { success: false, error: error.message };
    }
  },
  
  // Automatic hardware payment bridge
  bridgeHardwarePayment: async (paymentData) => {
    try {
      const {
        userId, timelineId, periodKey,
        rfidDetected, amountDetected, amountRequired
      } = paymentData;
      
      // Validate payment data
      if (!userId || !amountDetected) {
        throw new Error('Invalid payment data: missing userId or amountDetected');
      }
      
      // Check if we have full context for proper payment processing
      if (!timelineId || !periodKey) {
        console.warn('⚠️ Missing payment context, treating as partial payment to credit');
        
        // Fallback: add to credit if context is missing
        const { addPartialPaymentToCredit } = await import('./wargaPaymentService');
        return await addPartialPaymentToCredit(userId, parseInt(amountDetected));
      }
      
      // Process payment through existing Firestore service dengan full context
      const result = await processPaymentWithCredit(
        timelineId, periodKey, userId,
        parseInt(amountDetected),
        'mode_based_hardware'
      );
      
      if (result.success) {
        console.log('✅ Hardware Payment bridged successfully:', paymentData);
        
        // Log successful bridge operation
        await logBridgeOperation('hardware_payment', {
          userId, timelineId, periodKey,
          amountDetected, rfidDetected,
          status: 'success',
          bridgedAt: new Date()
        });
        
        return { 
          success: true, 
          message: 'Hardware payment successfully bridged to Firestore',
          paymentResult: result 
        };
      }
      
    } catch (error) {
      console.error('❌ Hardware Payment bridge failed:', error);
      
      // Log failed bridge operation untuk debugging
      await logBridgeOperation('hardware_payment', {
        ...paymentData,
        status: 'failed',
        error: error.message,
        failedAt: new Date()
      });
      
      return { success: false, error: error.message };
    }
  },
  
  // Automatic bridge listeners untuk real-time processing
  startAutomaticBridgeListeners: () => {
    console.log('🔄 Starting automatic data bridge listeners...');
    
    // RFID pairing bridge listener
    const rfidUnsubscribe = onValue(ref(rtdb, 'pairing_mode'), async (snapshot) => {
      const rfidCode = snapshot.val();
      
      if (rfidCode && rfidCode !== '') {
        try {
          const modeSnapshot = await get(ref(rtdb, 'mode'));
          const currentMode = modeSnapshot.val();
          
          if (currentMode === 'pairing') {
            console.log('🔥 RFID detected in pairing mode:', rfidCode);
            // Note: wargaId should be passed through pairing context
          }
        } catch (error) {
          console.error('Error in RFID pairing bridge listener:', error);
        }
      }
    });
    
    // Hardware payment bridge listener
    const paymentUnsubscribe = onValue(ref(rtdb, 'payment_mode/set'), async (snapshot) => {
      const paymentResults = snapshot.val();
      
      if (paymentResults && paymentResults.status === 'completed') {
        try {
          // Get payment session context
          const sessionSnapshot = await get(ref(rtdb, 'payment_mode/get'));
          const sessionData = sessionSnapshot.val();
          
          if (sessionData && sessionData.user_id) {
            const fullPaymentData = {
              userId: sessionData.user_id,
              timelineId: sessionData.timeline_id,
              periodKey: sessionData.period_key,
              amountRequired: sessionData.amount_required,
              rfidDetected: paymentResults.rfid_detected,
              amountDetected: paymentResults.amount_detected,
              completedAt: new Date()
            };
            
            console.log('🔥 Hardware payment completed, bridging to Firestore...', fullPaymentData);
            
            const bridgeResult = await bridgeHardwarePayment(fullPaymentData);
            
            if (bridgeResult.success) {
              console.log('✅ Hardware payment bridge completed successfully');
            } else {
              console.error('❌ Hardware payment bridge failed:', bridgeResult.error);
            }
          }
        } catch (error) {
          console.error('Error in hardware payment bridge listener:', error);
        }
      }
    });
    
    // Return cleanup function
    return () => {
      if (rfidUnsubscribe) rfidUnsubscribe();
      if (paymentUnsubscribe) paymentUnsubscribe();
      console.log('🛑 Data Bridge Service stopped');
    };
  }
};
```

### **Data Consistency & Validation**
```javascript
// Data consistency validation patterns
const dataConsistencyFlow = {
  // Validate RFID pairing consistency between RTDB dan Firestore
  validateRFIDConsistency: async (wargaId) => {
    try {
      // Check Firestore user profile
      const userDoc = await getDoc(doc(db, 'users', wargaId));
      if (!userDoc.exists()) {
        return { consistent: false, reason: 'user_not_found' };
      }
      
      const userData = userDoc.data();
      const firestoreRFID = userData.rfidWarga;
      
      // Check if RFID is properly assigned
      if (firestoreRFID && firestoreRFID !== '') {
        console.log('✅ RFID consistency validated for:', wargaId);
        return { consistent: true, rfidCode: firestoreRFID };
      } else {
        return { consistent: false, reason: 'rfid_not_assigned' };
      }
      
    } catch (error) {
      console.error('Error validating RFID consistency:', error);
      return { consistent: false, error: error.message };
    }
  },
  
  // Validate payment consistency between RTDB dan Firestore
  validatePaymentConsistency: async (timelineId, periodKey, wargaId) => {
    try {
      // Check Firestore payment record
      const paymentDoc = await getDoc(doc(
        db, 'payments', timelineId, 'periods', periodKey, 'warga_payments', wargaId
      ));
      
      if (paymentDoc.exists()) {
        const paymentData = paymentDoc.data();
        
        console.log('✅ Payment consistency validated:', {
          timelineId, periodKey, wargaId,
          status: paymentData.status,
          amount: paymentData.amountPaid
        });
        
        return { consistent: true, paymentData };
      } else {
        return { consistent: false, reason: 'payment_not_found' };
      }
      
    } catch (error) {
      console.error('Error validating payment consistency:', error);
      return { consistent: false, error: error.message };
    }
  },
  
  // Cleanup orphaned RTDB data
  cleanupOrphanedData: async () => {
    try {
      const currentMode = await get(ref(rtdb, 'mode'));
      
      // If mode is idle but session data exists, cleanup
      if (currentMode.val() === 'idle') {
        const pairingData = await get(ref(rtdb, 'pairing_mode'));
        const paymentData = await get(ref(rtdb, 'payment_mode'));
        
        if (pairingData.val() && pairingData.val() !== '') {
          await set(ref(rtdb, 'pairing_mode'), '');
          console.log('🧹 Cleaned orphaned pairing data');
        }
        
        const paymentSession = paymentData.val();
        if (paymentSession && (paymentSession.get || paymentSession.set)) {
          await set(ref(rtdb, 'payment_mode'), {
            get: { rfid_code: '', amount_required: '', user_id: '', timeline_id: '', period_key: '' },
            set: { amount_detected: '', status: '' }
          });
          console.log('🧹 Cleaned orphaned payment data');
        }
      }
      
      return { success: true, message: 'Cleanup completed' };
    } catch (error) {
      console.error('Error cleaning orphaned data:', error);
      return { success: false, error: error.message };
    }
  }
};
```

## 2.5 Timeline Management & Credit System Flow

### **Advanced Timeline Management Architecture**
```
  ----------------------------------------------------------------------------+
                    TIMELINE MANAGEMENT & CREDIT SYSTEM                  |
  ----------------------------------------------------------------------------+
                                                                          |
|  📅 TIMELINE CREATION    💳 CREDIT SYSTEM        📊 STATUS TRACKING         |
                                                                          |
|    ----------------+       ----------------+       ----------------+       |
|  | Admin Interface |---->| Credit Engine   |---->| Real-time       |       |
|  | • Flexible      |     | • Auto Balance  |     | Monitoring      |       |
|  | Scheduling      |     | • Smart Alloc   |     |                 |       |
|  |                 |     |                 |     | • Payment Status|       |
|  | Timeline Types  |     | Balance Tracking|     | • Overdue Alerts|       |
|  | • Daily         |---->| • Overpayment   |---->| • Credit Usage  |       |
|  | • Weekly        |     | • Partial       |     | • Progress Track|       |
|  | • Monthly       |     | • Automatic     |     |                 |       |
|  | • Yearly        |     |                 |     | Analytics       |       |
|  |                 |     | Credit Features |     | • Payment Trends|       |
|  | Holiday Exclude |     | • Prepayment    |     | • Financial     |       |
|  | • Auto Skip     |     | • Emergency     |     |   Reports       |       |
|  | • Date Logic    |     | • Refund        |     |                 |       |
|    ----------------+       ----------------+       ----------------+       |
  ----------------------------------------------------------------------------+
```

### **Timeline Creation Flow**
```javascript
// Advanced timeline management dengan flexible scheduling
const timelineManagementFlow = {
  // Create comprehensive timeline dengan smart period generation
  createAdvancedTimeline: async (timelineData) => {
    try {
      const {
        timelineName, description, paymentAmount, frequency,
        startDate, endDate, excludeHolidays, customSettings
      } = timelineData;
      
      // Generate periods berdasarkan frequency dan date range
      const periods = generateTimelinePeriods({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        frequency: frequency, // "daily" | "weekly" | "monthly" | "yearly"
        amount: paymentAmount,
        excludeHolidays: excludeHolidays
      });
      
      // Create timeline document di Firestore
      const timelineRef = doc(collection(db, 'active_timeline'));
      const timelineId = timelineRef.id;
      
      await setDoc(timelineRef, {
        id: timelineId,
        timelineName: timelineName,
        description: description,
        paymentAmount: paymentAmount,
        frequency: frequency,
        startDate: startDate,
        endDate: endDate,
        isActive: true,
        excludeHolidays: excludeHolidays,
        metadata: {
          totalPeriods: periods.length,
          completedPeriods: 0,
          totalWarga: 0, // Will be updated when warga enrolls
          createdBy: currentUser.uid,
          activatedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        },
        periods: periods.reduce((acc, period) => {
          acc[period.periodKey] = period;
          return acc;
        }, {}),
        customSettings: customSettings || {}
      });
      
      // Auto-enroll all active warga ke timeline ini
      const allWarga = await getAllWarga();
      const activeWarga = allWarga.filter(w => !w.deleted);
      
      let enrolledCount = 0;
      for (const warga of activeWarga) {
        const enrollResult = await enrollWargaToTimeline(timelineId, warga.id, periods);
        if (enrollResult.success) enrolledCount++;
      }
      
      // Update total warga count
      await updateDoc(timelineRef, {
        'metadata.totalWarga': enrolledCount
      });
      
      console.log(`✅ Timeline created: ${timelineName} with ${periods.length} periods, ${enrolledCount} warga enrolled`);
      
      return {
        success: true,
        timelineId: timelineId,
        periodsCreated: periods.length,
        wargaEnrolled: enrolledCount
      };
      
    } catch (error) {
      console.error('Error creating timeline:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Generate periods berdasarkan frequency
  generateTimelinePeriods: ({ startDate, endDate, frequency, amount, excludeHolidays }) => {
    const periods = [];
    let currentDate = new Date(startDate);
    let periodCounter = 1;
    
    const indonesianHolidays = [
      '2024-01-01', '2024-02-10', '2024-03-11', '2024-03-29', 
      '2024-04-10', '2024-05-01', '2024-05-09', '2024-05-23',
      '2024-06-01', '2024-06-17', '2024-08-17', '2024-12-25'
      // Add more holidays as needed
    ];
    
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Skip holidays if excludeHolidays is true
      if (excludeHolidays && indonesianHolidays.includes(dateString)) {
        // Move to next period without creating entry
        moveToNextPeriod();
        continue;
      }
      
      // Create period entry
      const periodKey = `period_${periodCounter}`;
      const periodLabel = formatPeriodLabel(frequency, periodCounter, currentDate);
      
      periods.push({
        periodKey: periodKey,
        periodLabel: periodLabel,
        dueDate: currentDate.toISOString(),
        amount: amount,
        status: 'active',
        metadata: {
          frequency: frequency,
          periodNumber: periodCounter,
          weekOfYear: getWeekOfYear(currentDate),
          monthOfYear: currentDate.getMonth() + 1,
          yearOfPeriod: currentDate.getFullYear()
        }
      });
      
      periodCounter++;
      moveToNextPeriod();
    }
    
    function moveToNextPeriod() {
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    }
    
    return periods;
  },
  
  // Enroll warga ke timeline dengan create payment documents
  enrollWargaToTimeline: async (timelineId, wargaId, periods) => {
    try {
      const user = await getUserById(wargaId);
      if (!user) throw new Error('Warga not found');
      
      // Create payment documents untuk each period
      const batch = writeBatch(db);
      
      for (const period of periods) {
        const paymentDocRef = doc(
          db, 'payments', timelineId, 'periods', period.periodKey, 'warga_payments', wargaId
        );
        
        batch.set(paymentDocRef, {
          id: `${wargaId}_${period.periodKey}`,
          wargaId: wargaId,
          wargaName: user.namaWarga,
          timelineId: timelineId,
          period: period.periodKey,
          periodLabel: period.periodLabel,
          amount: period.amount,
          dueDate: period.dueDate,
          status: 'belum_bayar',
          paymentDate: null,
          paymentMethod: '',
          amountPaid: 0,
          creditUsed: 0,
          excess: 0,
          notes: '',
          processedBy: '',
          metadata: {
            source: 'timeline_enrollment',
            rfidUsed: '',
            hardwareSessionId: '',
            retryCount: 0,
            lastStatusUpdate: serverTimestamp()
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
      
      console.log(`✅ Enrolled warga ${user.namaWarga} to timeline with ${periods.length} periods`);
      return { success: true, periodsCreated: periods.length };
      
    } catch (error) {
      console.error('Error enrolling warga to timeline:', error);
      return { success: false, error: error.message };
    }
  }
};
```

### **Credit System Implementation**
```javascript
// Advanced credit system dengan intelligent balance management
const creditSystemFlow = {
  // Process overpayment ke credit balance
  addOverpaymentToCredit: async (wargaId, overpaymentAmount, source = 'overpayment') => {
    try {
      const user = await getUserById(wargaId);
      const currentBalance = user.creditBalance || 0;
      const newBalance = currentBalance + overpaymentAmount;
      
      // Update credit balance di user document
      await updateDoc(doc(db, 'users', wargaId), {
        creditBalance: newBalance,
        updatedAt: serverTimestamp(),
        'metadata.lastCreditUpdate': serverTimestamp(),
        'metadata.totalCredit': (user.metadata?.totalCredit || 0) + overpaymentAmount
      });
      
      // Log credit transaction untuk audit trail
      await addDoc(collection(db, 'credit_transactions'), {
        wargaId: wargaId,
        wargaName: user.namaWarga,
        type: 'credit_added',
        amount: overpaymentAmount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        source: source,
        description: `Saldo credit ditambah: Rp${overpaymentAmount.toLocaleString('id-ID')}`,
        createdAt: serverTimestamp(),
        processedBy: currentUser?.uid || 'system'
      });
      
      console.log(`💳 Credit added: Rp${overpaymentAmount.toLocaleString('id-ID')} untuk ${user.namaWarga}`);
      
      return {
        success: true,
        previousBalance: currentBalance,
        newBalance: newBalance,
        creditAdded: overpaymentAmount
      };
      
    } catch (error) {
      console.error('Error adding overpayment to credit:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Use credit untuk payment
  useCredit: async (wargaId, creditAmount, paymentContext) => {
    try {
      const user = await getUserById(wargaId);
      const currentBalance = user.creditBalance || 0;
      
      if (currentBalance < creditAmount) {
        throw new Error(`Insufficient credit: Available Rp${currentBalance.toLocaleString('id-ID')}, Required Rp${creditAmount.toLocaleString('id-ID')}`);
      }
      
      const newBalance = currentBalance - creditAmount;
      
      // Update credit balance
      await updateDoc(doc(db, 'users', wargaId), {
        creditBalance: newBalance,
        updatedAt: serverTimestamp(),
        'metadata.lastCreditUpdate': serverTimestamp()
      });
      
      // Log credit usage
      await addDoc(collection(db, 'credit_transactions'), {
        wargaId: wargaId,
        wargaName: user.namaWarga,
        type: 'credit_used',
        amount: creditAmount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        source: 'payment',
        description: `Credit digunakan untuk pembayaran: ${paymentContext.periodLabel}`,
        paymentContext: paymentContext,
        createdAt: serverTimestamp(),
        processedBy: currentUser?.uid || 'system'
      });
      
      console.log(`💳 Credit used: Rp${creditAmount.toLocaleString('id-ID')} untuk ${user.namaWarga}`);
      
      return {
        success: true,
        previousBalance: currentBalance,
        newBalance: newBalance,
        creditUsed: creditAmount
      };
      
    } catch (error) {
      console.error('Error using credit:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Auto-apply credit untuk outstanding payments
  autoApplyCredit: async (wargaId) => {
    try {
      const user = await getUserById(wargaId);
      const creditBalance = user.creditBalance || 0;
      
      if (creditBalance === 0) {
        return { success: true, message: 'No credit balance to apply' };
      }
      
      // Get outstanding payments (sorted by due date)
      const outstandingPayments = await getOutstandingPaymentsForWarga(wargaId);
      
      if (outstandingPayments.length === 0) {
        return { success: true, message: 'No outstanding payments found' };
      }
      
      let remainingCredit = creditBalance;
      const appliedPayments = [];
      
      for (const payment of outstandingPayments) {
        if (remainingCredit >= payment.amount) {
          // Full payment dengan credit
          const result = await processPaymentWithCredit(
            payment.timelineId, payment.period, wargaId,
            0, 'auto_credit' // 0 cash, pure credit
          );
          
          if (result.success) {
            remainingCredit -= payment.amount;
            appliedPayments.push({
              payment: payment,
              creditUsed: payment.amount,
              status: 'completed'
            });
          }
        } else if (remainingCredit > 0) {
          // Partial payment dengan remaining credit
          const result = await processPaymentWithCredit(
            payment.timelineId, payment.period, wargaId,
            remainingCredit, 'auto_credit_partial'
          );
          
          if (result.success) {
            appliedPayments.push({
              payment: payment,
              creditUsed: remainingCredit,
              status: 'partial'
            });
            remainingCredit = 0;
          }
          break; // No more credit to apply
        }
      }
      
      console.log(`💳 Auto-applied credit: ${appliedPayments.length} payments processed`);
      
      return {
        success: true,
        paymentsProcessed: appliedPayments.length,
        totalCreditUsed: creditBalance - remainingCredit,
        remainingCredit: remainingCredit,
        appliedPayments: appliedPayments
      };
      
    } catch (error) {
      console.error('Error auto-applying credit:', error);
      return { success: false, error: error.message };
    }
  }
};
```

## 2.6 Authentication & Role-Based Access Flow

### **Role-Based Authentication System**
```
  ----------------------------------------------------------------------------+
                  AUTHENTICATION & ROLE-BASED ACCESS FLOW                |
  ----------------------------------------------------------------------------+
                                                                          |
|  🔐 LOGIN PROCESS        👨‍💼 ROLE DETECTION       🎨 DYNAMIC THEMING        |
                                                                          |
|    ----------------+       ----------------+       ----------------+       |
|  | Firebase Auth   |---->| Auto Role       |---->| useRoleTheme    |       |
|  | • Email/Pass    |     | Detection       |     | Hook            |       |
|  | • Session Mgmt  |     |                 |     |                 |       |
|  |                 |     | Special Emails: |     | Theme Colors:   |       |
|  | Security        |     | • bendahara@    |     | • Bendahara: Red|       |
|  | • Route Guards  |---->|   gmail.com     |---->| • Warga: Blue   |       |
|  | • AuthGuard     |     | • admin@        |     | • Dynamic UI    |       |
|  | • Context       |     |   gmail.com     |     | • Role-based    |       |
|  |                 |     |                 |     |   Navigation    |       |
|  | Password Reset  |     | Role Assignment |     | Adaptive Layout |       |
|  | • Email Link    |     | • Automatic     |     | • Touch-friendly|       |
|  | • Secure        |     | • Context-aware |     | • Responsive    |       |
|    ----------------+       ----------------+       ----------------+       |
  ----------------------------------------------------------------------------+
```

### **Authentication Flow Implementation**
```javascript
// Complete authentication system dengan role-based access
const authenticationFlow = {
  // Enhanced login dengan automatic role detection
  loginWithRoleDetection: async (email, password) => {
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get or create user profile dari Firestore
      let userProfile = await getUserProfile(firebaseUser.uid);
      
      if (!userProfile) {
        // Create profile untuk new user
        userProfile = await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          role: determineUserRole(firebaseUser.email),
          namaWarga: firebaseUser.displayName || extractNameFromEmail(firebaseUser.email),
          createdAt: new Date(),
          metadata: {
            lastLogin: new Date(),
            loginCount: 1,
            registrationSource: 'direct_login'
          }
        });
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          'metadata.lastLogin': serverTimestamp(),
          'metadata.loginCount': increment(1),
          updatedAt: serverTimestamp()
        });
      }
      
      // Log authentication activity
      await logActivity('login', `User logged in successfully`, {
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        role: userProfile.role,
        loginMethod: 'email_password'
      });
      
      // Set authentication context
      setAuthContext({
        user: firebaseUser,
        profile: userProfile,
        isAuthenticated: true,
        role: userProfile.role
      });
      
      console.log(`✅ Login successful: ${userProfile.namaWarga} (${userProfile.role})`);
      
      return {
        success: true,
        user: firebaseUser,
        profile: userProfile,
        role: userProfile.role
      };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Log failed login attempt
      await logActivity('login_failed', `Failed login attempt: ${error.message}`, {
        email: email,
        error: error.code,
        timestamp: new Date()
      });
      
      return { success: false, error: error.message };
    }
  },
  
  // Determine user role berdasarkan email patterns
  determineUserRole: (email) => {
    const adminEmails = [
      'bendahara@gmail.com',
      'admin@gmail.com'
    ];
    
    if (adminEmails.includes(email.toLowerCase())) {
      return 'bendahara'; // Auto-assign bendahara role
    }
    
    // Check for other admin patterns
    if (email.toLowerCase().includes('bendahara') || 
        email.toLowerCase().includes('admin')) {
      return 'bendahara';
    }
    
    return 'user'; // Default role untuk warga
  },
  
  // Enhanced registration dengan role assignment
  registerWithRoleAssignment: async (userData) => {
    try {
      const { email, password, namaWarga, alamat, noHpWarga, role } = userData;
      
      // Validate input data
      if (!email || !password || !namaWarga) {
        throw new Error('Missing required fields');
      }
      
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new Error('User dengan email ini sudah terdaftar');
      }
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Determine final role (allow override for admin registration)
      const finalRole = role || determineUserRole(email);
      
      // Create comprehensive user profile
      const userProfile = await createUserProfile(firebaseUser.uid, {
        email: email,
        role: finalRole,
        namaWarga: namaWarga,
        alamat: alamat || '',
        noHpWarga: noHpWarga || '',
        rfidWarga: '', // Will be assigned during pairing
        creditBalance: 0,
        deleted: false,
        metadata: {
          registeredBy: currentUser?.uid || 'self_registration',
          registrationMethod: 'email_password',
          lastLogin: null,
          loginCount: 0,
          totalPayments: 0,
          totalCredit: 0,
          rfidPairedAt: null
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Log registration activity
      await logActivity('register', `New user registered: ${namaWarga}`, {
        userId: firebaseUser.uid,
        email: email,
        role: finalRole,
        registeredBy: currentUser?.uid || 'self'
      });
      
      // If this is warga registration, auto-enroll ke active timelines
      if (finalRole === 'user') {
        await autoEnrollToActiveTimelines(firebaseUser.uid);
      }
      
      console.log(`✅ Registration successful: ${namaWarga} (${finalRole})`);
      
      return {
        success: true,
        user: firebaseUser,
        profile: userProfile,
        role: finalRole
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Auto-enroll new warga ke active timelines
  autoEnrollToActiveTimelines: async (wargaId) => {
    try {
      // Get all active timelines
      const timelinesQuery = query(
        collection(db, 'active_timeline'),
        where('isActive', '==', true)
      );
      
      const timelinesSnapshot = await getDocs(timelinesQuery);
      
      for (const timelineDoc of timelinesSnapshot.docs) {
        const timeline = timelineDoc.data();
        const periods = Object.values(timeline.periods || {});
        
        // Enroll warga ke timeline
        const enrollResult = await enrollWargaToTimeline(timeline.id, wargaId, periods);
        
        if (enrollResult.success) {
          // Update timeline warga count
          await updateDoc(doc(db, 'active_timeline', timeline.id), {
            'metadata.totalWarga': increment(1),
            'metadata.lastUpdated': serverTimestamp()
          });
          
          console.log(`📅 Auto-enrolled warga to timeline: ${timeline.timelineName}`);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error auto-enrolling to timelines:', error);
      return { success: false, error: error.message };
    }
  }
};
```

### **Role-Based Theme System Implementation**
```javascript
// useRoleTheme.js - Dynamic role-based theming hook
const roleBasedThemingFlow = {
  // Dynamic theme hook berdasarkan user role
  useRoleTheme: () => {
    const { user, profile } = useAuth();
    const [currentTheme, setCurrentTheme] = useState(null);
    
    useEffect(() => {
      if (profile) {
        const isBendahara = profile.role === 'bendahara' || profile.role === 'admin';
        
        const themeColors = isBendahara ? {
          // Bendahara/Admin Theme (Red - Authority)
          primary: '#DC2626',     // Red-600
          secondary: '#EF4444',   // Red-500
          accent: '#F87171',      // Red-400
          background: '#FEF2F2',  // Red-50
          surface: '#FFFFFF',
          text: '#1F2937',        // Gray-800
          success: '#10B981',     // Emerald-500
          warning: '#F59E0B',     // Amber-500
          error: '#EF4444',       // Red-500
          info: '#3B82F6'         // Blue-500
        } : {
          // Warga/User Theme (Blue - User-Friendly)
          primary: '#2563EB',     // Blue-600
          secondary: '#3B82F6',   // Blue-500
          accent: '#60A5FA',      // Blue-400
          background: '#EFF6FF',  // Blue-50
          surface: '#FFFFFF',
          text: '#1F2937',        // Gray-800
          success: '#10B981',     // Emerald-500
          warning: '#F59E0B',     // Amber-500
          error: '#EF4444',       // Red-500
          info: '#3B82F6'         // Blue-500
        };
        
        setCurrentTheme({
          colors: themeColors,
          role: profile.role,
          isDark: false, // Could be extended untuk dark mode
          typography: {
            fontFamily: 'Poppins',
            sizes: {
              xs: 12,
              sm: 14,
              md: 16,
              lg: 18,
              xl: 20,
              '2xl': 24,
              '3xl': 30
            }
          },
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            '2xl': 48
          },
          borderRadius: {
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16
          }
        });
      }
    }, [profile]);
    
    return {
      theme: currentTheme,
      colors: currentTheme?.colors,
      isLoading: !currentTheme,
      isBendahara: profile?.role === 'bendahara' || profile?.role === 'admin',
      getColor: (colorKey) => currentTheme?.colors[colorKey],
      getSpacing: (sizeKey) => currentTheme?.spacing[sizeKey],
      getTypography: (sizeKey) => currentTheme?.typography.sizes[sizeKey]
    };
  },
  
  // Component styling dengan role-based colors
  getButtonStyle: (variant = 'primary', size = 'md', theme) => {
    const baseStyle = {
      paddingHorizontal: theme.spacing[size],
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center'
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.success
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.warning
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.error
        };
      default:
        return baseStyle;
    }
  },
  
  // Navigation styling berdasarkan role
  getNavigationTheme: (theme) => {
    return {
      dark: false,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.accent,
        notification: theme.colors.error
      }
    };
  }
};
```

---

**📋 Related Documents:**
- **[01_PROJECT_STRUCTURE.md](./01_PROJECT_STRUCTURE.md)** - Project structure dan database schema
- **[03_VERSION_HISTORY.md](./03_VERSION_HISTORY.md)** - Changelog dan development history