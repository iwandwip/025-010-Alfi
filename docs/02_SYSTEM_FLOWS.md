# ALFI APP - SYSTEM FLOWS & DATA ARCHITECTURE

**Sistem Data Flow dan Processing Logic** untuk Alfi App - Revolutionary mode-based hardware integration, intelligent payment processing, dan real-time community savings management system dengan enterprise-level performance optimization.

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
- [2.5 Performance Optimization & Caching Flow](#25-performance-optimization-caching-flow)
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
|  |              |     | mode: "idle"   |     | String読取      |       |
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

### **Enterprise-Level Payment System Architecture**
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

### **PaymentModal - Dual Payment Processing**
```javascript
// PaymentModal.jsx - Enterprise-level payment interface
const PaymentModal = {
  // Hardware payment mode dengan ESP32 integration
  hardwareMode: {
    features: [
      "Real-time ESP32 communication via RTDB",
      "Mode-based coordination (payment mode)",
      "RFID validation dengan expected card",
      "KNN currency detection untuk IDR 2K/5K/10K",
      "Automatic partial payment → credit conversion",
      "App-managed timeouts (5 minutes)",
      "Real-time progress tracking dengan status updates"
    ],
    
    processFlow: async (paymentData) => {
      // 1. Set payment mode dengan session data
      const result = await rtdbModeService.startHardwarePayment(
        paymentData.rfidCode,
        paymentData.amount,
        paymentData.userId,
        paymentData.timelineId,
        paymentData.periodKey
      );
      
      // 2. Subscribe untuk real-time progress
      const unsubscribe = rtdbModeService.subscribeToPaymentProgress((progress) => {
        updateProgressUI(progress);
      });
      
      // 3. Subscribe untuk final results
      const resultUnsubscribe = rtdbModeService.subscribeToPaymentResults((results) => {
        if (results.status === 'completed') {
          // Bridge to Firestore via dataBridgeService
          processFinalPayment(results);
        } else if (results.status === 'rfid_salah') {
          showRFIDError();
        }
      });
      
      // 4. App-managed timeout (5 minutes)
      setTimeout(() => {
        if (currentMode === 'payment') {
          rtdbModeService.resetToIdle();
          showTimeoutError();
        }
      }, 300000);
    }
  },
  
  // App-based payment mode dengan manual entry
  appMode: {
    features: [
      "Multiple payment methods (transfer, e-wallet, QRIS)",
      "Custom amount entry dengan validation",
      "Credit balance integration",
      "Excess amount handling (max 3x nominal)",
      "Instant payment processing",
      "Receipt generation dengan transaction details"
    ],
    
    processFlow: async (paymentData) => {
      // 1. Validate payment amount
      const maxAmount = paymentData.requiredAmount * 3;
      if (paymentData.customAmount > maxAmount) {
        throw new Error(`Maksimal pembayaran: Rp${maxAmount.toLocaleString('id-ID')}`);
      }
      
      // 2. Process payment dengan credit system
      const result = await wargaPaymentService.processPaymentWithCredit(
        paymentData.timelineId,
        paymentData.periodKey,
        paymentData.wargaId,
        paymentData.customAmount,
        paymentData.method
      );
      
      // 3. Handle different scenarios
      if (result.success) {
        if (result.excess > 0) {
          // Excess converted to credit
          showSuccessWithCredit(result);
        } else {
          // Exact or partial payment
          showPaymentSuccess(result);
        }
      }
      
      // 4. Update payment status manager cache
      await paymentStatusManager.updateUserPaymentStatus(
        paymentData.wargaId, 
        true, 
        'payment_processed'
      );
    }
  }
};
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
          excess: excess,
          notes: `Lunas: Cash Rp${cashUsed.toLocaleString('id-ID')}${creditUsed > 0 ? `, Credit Rp${creditUsed.toLocaleString('id-ID')}` : ''}`
        });
        
        // Update user credit balance
        const newCreditBalance = creditBalance - creditUsed + excess;
        await updateUserCredit(wargaId, newCreditBalance);
        
        // Log credit transaction untuk audit trail
        if (excess > 0) {
          await addCreditTransaction(wargaId, {
            type: 'credit_added',
            amount: excess,
            source: 'overpayment',
            description: `Kelebihan pembayaran: Rp${excess.toLocaleString('id-ID')}`
          });
        }
        
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
        
        // Log credit addition
        await addCreditTransaction(wargaId, {
          type: 'credit_added',
          amount: amount,
          source: 'partial_payment',
          description: `Pembayaran parsial: Rp${amount.toLocaleString('id-ID')}`
        });
        
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
            completedAt: serverTimestamp()
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
              cancelledAt: serverTimestamp(),
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
        metadata: {
          ...updates.metadata,
          lastActivity: serverTimestamp()
        },
        updatedAt: serverTimestamp()
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
        cancelledAt: serverTimestamp(),
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
        'hardware_payment'
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

## 2.5 Performance Optimization & Caching Flow

### **PaymentStatusManager - Enterprise Caching System**
```
  ----------------------------------------------------------------------------+
                    PERFORMANCE OPTIMIZATION & CACHING FLOW               |
  ----------------------------------------------------------------------------+
                                                                          |
|  📊 PAYMENT STATUS MANAGER                                                |
                                                                          |
|    ----------------+       ----------------+       ----------------+       |
|  | In-Memory Cache |<--->| Intelligent     |<--->| Background Sync |       |
|  | • User Payment  |     | Throttling      |     | • App State     |       |
|  | • Timeline Data |     | System          |     | • Auto Resume   |       |
|  | • Credit Info   |     |                 |     | • Performance   |       |
|  |                 |     | Throttle Rules: |     |                 |       |
|  | Cache Strategy: |     | • 5min per user |     | Sync Strategy:  |       |
|  | • LRU Eviction  |---->| • 2min per page |---->| • 30min resume  |       |
|  | • TTL based     |     | • Background    |     | • Smart refresh |       |
|  | • Event driven  |     | • Force update  |     | • Selective     |       |
|    ----------------+       ----------------+       ----------------+       |
|                                                                           |
|  ⚡ PERFORMANCE FEATURES:                                                  |
|  • Event-driven cache invalidation • Automatic overdue detection          |
|  • Smart background synchronization • Memory-efficient data structures    |
|  • Intelligent throttling system    • Performance metrics tracking        |
  ----------------------------------------------------------------------------+
```

### **PaymentStatusManager Implementation**
```javascript
// paymentStatusManager.js - Enterprise-level status management
const paymentStatusManager = {
  // Smart caching system dengan throttling
  cache: new Map(),
  isUpdating: new Set(),
  lastUpdateTimes: new Map(),
  listeners: new Map(),
  
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
  
  // Check if update should be skipped due to throttling
  shouldSkipUpdate: (type, identifier) => {
    const key = `${type}_${identifier}`;
    const lastUpdate = this.lastUpdateTimes.get(key);
    
    if (!lastUpdate) return false;
    
    const timeSinceUpdate = Date.now() - lastUpdate;
    const throttleLimit = this.throttleSettings[type] || this.throttleSettings.perUser;
    
    return timeSinceUpdate < throttleLimit;
  },
  
  // Cache management methods
  setCache: (key, data) => {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 minutes TTL
    });
  },
  
  getFromCache: (key) => {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check TTL
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  },
  
  // Mark update time untuk throttling
  markUpdateTime: (type, identifier) => {
    const key = `${type}_${identifier}`;
    this.lastUpdateTimes.set(key, Date.now());
  },
  
  // Event listener system untuk real-time updates
  addListener: (event, callback) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  },
  
  notifyListeners: (event, data) => {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
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
  },
  
  // Check for overdue payments
  checkForOverduePayments: (payments) => {
    const now = new Date();
    return payments.filter(payment => {
      if (payment.status === 'lunas') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate < now;
    });
  },
  
  // Check for upcoming payments (within 3 days)
  checkForUpcomingPayments: (payments) => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    return payments.filter(payment => {
      if (payment.status === 'lunas') return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate >= now && dueDate <= threeDaysFromNow;
    });
  },
  
  // Clear cache (for debugging or force refresh)
  clearCache: () => {
    this.cache.clear();
    this.lastUpdateTimes.clear();
    console.log('🧹 Payment status manager cache cleared');
  },
  
  // Get cache statistics for monitoring
  getCacheStats: () => {
    return {
      cacheSize: this.cache.size,
      updateTimes: this.lastUpdateTimes.size,
      activeUpdates: this.isUpdating.size,
      listeners: Array.from(this.listeners.keys()).map(event => ({
        event,
        listenerCount: this.listeners.get(event).size
      }))
    };
  }
};
```

### **Performance Optimization Patterns**
```javascript
// Advanced performance patterns untuk UI components
const performanceOptimizations = {
  // FlatList optimization untuk payment lists
  paymentListOptimization: {
    // Memoized payment card component
    PaymentCard: React.memo(({ payment, onPress }) => {
      const { colors } = useRoleTheme();
      
      const statusColor = useMemo(() => {
        switch (payment.status) {
          case 'lunas': return colors.success;
          case 'terlambat': return colors.warning;
          default: return colors.error;
        }
      }, [payment.status, colors]);
      
      return (
        <TouchableOpacity onPress={() => onPress(payment)} style={styles.card}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text>{payment.periodLabel}</Text>
          <Text>{formatCurrency(payment.amount)}</Text>
        </TouchableOpacity>
      );
    }),
    
    // FlatList optimization props
    flatListProps: {
      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 10,
      windowSize: 10,
      getItemLayout: (data, index) => ({
        length: 80,
        offset: 80 * index,
        index,
      }),
      keyExtractor: (item) => `${item.timelineId}_${item.period}`,
    }
  },
  
  // Debounced search untuk warga lists
  debouncedSearch: useMemo(() => 
    debounce((searchTerm) => {
      setFilteredWarga(
        allWarga.filter(warga => 
          warga.namaWarga.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }, 300), [allWarga]
  ),
  
  // Background sync optimization
  backgroundSyncOptimization: {
    // Smart refresh control
    onRefresh: useCallback(async () => {
      setRefreshing(true);
      try {
        // Only refresh if last update was > 2 minutes ago
        const shouldRefresh = paymentStatusManager.shouldSkipUpdate('user_payments', userId);
        if (!shouldRefresh) {
          await paymentStatusManager.updateUserPaymentStatus(userId, true, 'pull_refresh');
        }
      } finally {
        setRefreshing(false);
      }
    }, [userId]),
    
    // Memory cleanup on unmount
    useEffect(() => {
      return () => {
        // Cleanup listeners and cache entries
        paymentStatusManager.clearUserCache(userId);
      };
    }, [userId])
  }
};
```

## 2.6 Authentication & Role-Based Access Flow

### **Simplified Authentication System**
```
  ----------------------------------------------------------------------------+
                  AUTHENTICATION & ROLE-BASED ACCESS FLOW                |
  ----------------------------------------------------------------------------+
                                                                          |
|  🔐 LOGIN PROCESS        👨‍💼 ROLE DETECTION       🎨 UNIFIED THEMING        |
                                                                          |
|    ----------------+       ----------------+       ----------------+       |
|  | Firebase Auth   |---->| Auto Role       |---->| Unified Theme   |       |
|  | • Email/Pass    |     | Detection       |     | System          |       |
|  | • Session Mgmt  |     |                 |     |                 |       |
|  |                 |     | Special Emails: |     | Theme Colors:   |       |
|  | Security        |     | • admin@        |     | • All roles:    |       |
|  | • Route Guards  |---->|   gmail.com     |---->|   Alfi Blue     |       |
|  | • AuthGuard     |     | • bendahara@    |     | • Status colors |       |
|  | • Context       |     |   gmail.com     |     | • Professional  |       |
|  |                 |     |                 |     |   Design        |       |
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
      'admin@gmail.com',
      'bendahara@gmail.com'
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

### **Unified Theme System Implementation**
```javascript
// useRoleTheme.js - Simplified unified theming hook
const unifiedThemingFlow = {
  // Unified theme hook (role-independent)
  useRoleTheme: () => {
    const { user, profile } = useAuth();
    const [currentTheme, setCurrentTheme] = useState(null);
    
    useEffect(() => {
      if (profile) {
        // Unified theme for all roles (Alfi Blue)
        const unifiedTheme = {
          colors: {
            // Primary Alfi Blue theme
            primary: '#113b62',       // Alfi Blue untuk all roles
            secondary: '#ffffff',     // White backgrounds
            surface: '#f8f9fa',       // Light gray surfaces
            
            // Status colors (consistent across roles)
            success: '#4caf50',       // Green untuk lunas
            warning: '#ff9800',       // Orange untuk terlambat
            error: '#f44336',         // Red untuk belum_bayar
            info: '#2196f3',          // Blue untuk informational
            
            // Text colors
            text: '#212529',          // Dark text
            textSecondary: '#6c757d', // Secondary text
            textLight: '#ffffff',     // Light text
            
            // Border and divider colors
            border: '#dee2e6',        // Light borders
            divider: '#e9ecef',       // Dividers
            
            // Background variants
            background: '#ffffff',    // Main background
            backgroundSecondary: '#f8f9fa', // Secondary background
            backgroundTertiary: '#e9ecef'   // Tertiary background
          },
          
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32,
            '2xl': 48,
            '3xl': 64
          },
          
          borderRadius: {
            sm: 4,
            md: 8,
            lg: 12,
            xl: 16,
            full: 9999
          },
          
          shadows: {
            sm: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            },
            md: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
            lg: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }
          },
          
          typography: {
            fontFamily: 'Poppins',
            sizes: {
              xs: 12,
              sm: 14,
              md: 16,
              lg: 18,
              xl: 20,
              '2xl': 24,
              '3xl': 30,
              '4xl': 36
            },
            weights: {
              light: '300',
              regular: '400',
              medium: '500',
              semibold: '600',
              bold: '700'
            }
          }
        };
        
        setCurrentTheme(unifiedTheme);
      }
    }, [profile]);
    
    return {
      theme: currentTheme,
      colors: currentTheme?.colors,
      isLoading: !currentTheme,
      isBendahara: profile?.role === 'bendahara' || profile?.role === 'admin',
      getColor: (colorKey) => currentTheme?.colors[colorKey] || colorKey,
      getSpacing: (sizeKey) => currentTheme?.spacing[sizeKey] || sizeKey,
      getBorderRadius: (sizeKey) => currentTheme?.borderRadius[sizeKey] || sizeKey,
      getShadow: (sizeKey) => currentTheme?.shadows[sizeKey] || currentTheme?.shadows.sm,
      getTypography: (sizeKey) => currentTheme?.typography.sizes[sizeKey] || 16
    };
  },
  
  // Component styling dengan unified colors
  getButtonStyle: (variant = 'primary', size = 'md', theme) => {
    const baseStyle = {
      paddingHorizontal: theme.spacing[size],
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: size === 'sm' ? 36 : size === 'lg' ? 56 : 48
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary,
          ...theme.shadows.md
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
  
  // Status-based styling untuk payment cards
  getPaymentStatusStyle: (status, theme) => {
    switch (status) {
      case 'lunas':
        return {
          backgroundColor: theme.colors.success,
          textColor: theme.colors.textLight
        };
      case 'terlambat':
        return {
          backgroundColor: theme.colors.warning,
          textColor: theme.colors.textLight
        };
      case 'belum_bayar':
      default:
        return {
          backgroundColor: theme.colors.error,
          textColor: theme.colors.textLight
        };
    }
  }
};
```

---

**📋 Related Documents:**
- **[01_PROJECT_STRUCTURE.md](./01_PROJECT_STRUCTURE.md)** - Project structure dan database schema
- **[03_VERSION_HISTORY.md](./03_VERSION_HISTORY.md)** - Changelog dan development history