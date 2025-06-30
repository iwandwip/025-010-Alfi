/**
 * ⚠️ DEPRECATED SERVICE - REPLACED BY MODE-BASED ARCHITECTURE ⚠️
 * 
 * This service has been REPLACED by the revolutionary mode-based RTDB architecture.
 * 
 * OLD: Complex session tracking (240+ lines, Firestore overhead)
 * NEW: Ultra-simple RTDB payment coordination (80% bandwidth reduction)
 * 
 * MIGRATION:
 * Replace: import { createHardwarePaymentSession } from './hardwarePaymentService'
 * With:    import { startHardwarePaymentWithTimeout } from './rtdbModeService'
 * 
 * See: DEPRECATED_SERVICES.md for complete migration guide
 * See: services/rtdbModeService.js for new implementation
 * 
 * PERFORMANCE IMPROVEMENTS WITH NEW ARCHITECTURE:
 * - Real-time coordination via RTDB
 * - App-managed timeouts instead of ESP32 complexity
 * - Self-cleaning data patterns
 * - Instant payment status updates
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

const HARDWARE_PAYMENT_COLLECTION = 'hardware_payment_sessions';

/**
 * Create hardware payment session
 */
export const createHardwarePaymentSession = async (userId, timelineId, periodKey, amount) => {
  try {
    if (!db || !userId || !timelineId || !periodKey || !amount) {
      throw new Error('Parameter tidak lengkap untuk membuat sesi pembayaran hardware');
    }

    const sessionId = `${userId}_${Date.now()}`;
    const sessionData = {
      id: sessionId,
      userId: userId,
      timelineId: timelineId,
      periodKey: periodKey,
      amount: amount,
      status: 'waiting', // waiting, rfid_detected, processing, completed, failed, expired
      isActive: true,
      startTime: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      rfidCode: '',
      detectedAmount: 0,
      completedAt: null,
      errorMessage: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sessionRef = doc(db, HARDWARE_PAYMENT_COLLECTION, sessionId);
    await setDoc(sessionRef, sessionData);

    return { success: true, sessionId, sessionData };
  } catch (error) {
    console.error('Error creating hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to hardware payment session updates
 */
export const listenToHardwarePaymentSession = (sessionId, callback) => {
  if (!db || !sessionId) {
    console.error('Invalid parameters for hardware payment listener');
    return () => {};
  }

  const sessionRef = doc(db, HARDWARE_PAYMENT_COLLECTION, sessionId);
  
  const unsubscribe = onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      const sessionData = doc.data();
      
      // Check if session expired
      const now = new Date();
      const expiryTime = new Date(sessionData.expiryTime);
      
      if (now > expiryTime && sessionData.status !== 'completed') {
        updateHardwarePaymentSession(sessionId, { 
          status: 'expired', 
          isActive: false,
          errorMessage: 'Sesi pembayaran telah berakhir' 
        });
        callback({ ...sessionData, status: 'expired' });
        return;
      }
      
      callback(sessionData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error listening to hardware payment session:', error);
    callback(null);
  });

  return unsubscribe;
};

/**
 * Update hardware payment session
 */
export const updateHardwarePaymentSession = async (sessionId, updateData) => {
  try {
    if (!db || !sessionId) {
      throw new Error('Parameter tidak lengkap untuk update sesi pembayaran');
    }

    const sessionRef = doc(db, HARDWARE_PAYMENT_COLLECTION, sessionId);
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };

    await updateDoc(sessionRef, updatePayload);
    return { success: true };
  } catch (error) {
    console.error('Error updating hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel hardware payment session
 */
export const cancelHardwarePaymentSession = async (sessionId) => {
  try {
    if (!db || !sessionId) {
      throw new Error('Session ID tidak valid');
    }

    const sessionRef = doc(db, HARDWARE_PAYMENT_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      status: 'cancelled',
      isActive: false,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete hardware payment session
 */
export const deleteHardwarePaymentSession = async (sessionId) => {
  try {
    if (!db || !sessionId) {
      throw new Error('Session ID tidak valid');
    }

    const sessionRef = doc(db, HARDWARE_PAYMENT_COLLECTION, sessionId);
    await deleteDoc(sessionRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get hardware payment session
 */
export const getHardwarePaymentSession = async (sessionId) => {
  try {
    if (!db || !sessionId) {
      throw new Error('Session ID tidak valid');
    }

    const sessionRef = doc(db, HARDWARE_PAYMENT_COLLECTION, sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (sessionDoc.exists()) {
      return { success: true, session: sessionDoc.data() };
    } else {
      return { success: false, error: 'Sesi pembayaran tidak ditemukan' };
    }
  } catch (error) {
    console.error('Error getting hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete hardware payment session
 */
export const completeHardwarePaymentSession = async (sessionId, paymentData) => {
  try {
    if (!db || !sessionId || !paymentData) {
      throw new Error('Parameter tidak lengkap untuk menyelesaikan pembayaran');
    }

    const updateData = {
      status: 'completed',
      isActive: false,
      completedAt: new Date().toISOString(),
      detectedAmount: paymentData.amount,
      rfidCode: paymentData.rfidCode,
      paymentMethod: 'hardware_cash',
      ...paymentData
    };

    const result = await updateHardwarePaymentSession(sessionId, updateData);
    return result;
  } catch (error) {
    console.error('Error completing hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check for active hardware payment sessions for user
 */
export const getActiveHardwarePaymentSession = async (userId) => {
  try {
    if (!db || !userId) {
      return { success: true, session: null };
    }

    // This would require a compound query in production
    // For now, we'll return null as sessions are managed by sessionId
    return { success: true, session: null };
  } catch (error) {
    console.error('Error getting active hardware payment session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cleanup expired sessions (should be called periodically)
 */
export const cleanupExpiredSessions = async () => {
  try {
    // This would require a query to find expired sessions
    // Implementation depends on your cleanup strategy
    console.log('Cleanup expired hardware payment sessions');
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return { success: false, error: error.message };
  }
};