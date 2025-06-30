/**
 * ⚠️ DEPRECATED SERVICE - REPLACED BY MODE-BASED ARCHITECTURE ⚠️
 * 
 * This service has been REPLACED by the revolutionary mode-based RTDB architecture.
 * 
 * OLD: Complex command queue system (310+ lines, device status polling)
 * NEW: Ultra-simple RTDB command state (instant execution, app-managed timeouts)
 * 
 * MIGRATION:
 * Replace: import { unlockSolenoid, lockSolenoid } from './solenoidControlService'
 * With:    import { unlockSolenoid, lockSolenoid } from './rtdbModeService'
 * 
 * See: DEPRECATED_SERVICES.md for complete migration guide
 * See: services/rtdbModeService.js for new implementation
 * 
 * PERFORMANCE IMPROVEMENTS WITH NEW ARCHITECTURE:
 * - Instant command execution (1-second response)
 * - App-managed timeouts eliminate ESP32 complexity
 * - Simple string commands vs complex JSON documents
 * - No device status polling overhead
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

const SOLENOID_CONTROL_COLLECTION = 'solenoid_control';
const SOLENOID_STATUS_DOC = 'device_status';

/**
 * Send solenoid unlock command to ESP32
 */
export const unlockSolenoid = async (duration = 30) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const commandData = {
      command: 'unlock',
      duration: duration, // Duration in seconds
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, executed, failed
      adminId: 'admin', // Could be dynamic based on current admin
      deviceResponse: '',
      executedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const commandRef = doc(db, SOLENOID_CONTROL_COLLECTION, `unlock_${Date.now()}`);
    await setDoc(commandRef, commandData);

    return { success: true, commandId: commandRef.id };
  } catch (error) {
    console.error('Error sending unlock command:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send solenoid lock command to ESP32
 */
export const lockSolenoid = async () => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const commandData = {
      command: 'lock',
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, executed, failed
      adminId: 'admin',
      deviceResponse: '',
      executedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const commandRef = doc(db, SOLENOID_CONTROL_COLLECTION, `lock_${Date.now()}`);
    await setDoc(commandRef, commandData);

    return { success: true, commandId: commandRef.id };
  } catch (error) {
    console.error('Error sending lock command:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current solenoid status from ESP32
 */
export const getSolenoidStatus = async () => {
  try {
    if (!db) {
      return { success: true, status: 'unknown', lastUpdate: null };
    }

    const statusRef = doc(db, SOLENOID_CONTROL_COLLECTION, SOLENOID_STATUS_DOC);
    const statusDoc = await getDoc(statusRef);

    if (statusDoc.exists()) {
      const data = statusDoc.data();
      return { 
        success: true, 
        status: data.solenoidStatus || 'unknown', // locked, unlocked, unknown
        lastUpdate: data.lastUpdate,
        deviceOnline: data.deviceOnline || false,
        batteryLevel: data.batteryLevel || 0
      };
    } else {
      return { 
        success: true, 
        status: 'unknown', 
        lastUpdate: null,
        deviceOnline: false,
        batteryLevel: 0
      };
    }
  } catch (error) {
    console.error('Error getting solenoid status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listen to solenoid status changes
 */
export const listenToSolenoidStatus = (callback) => {
  if (!db) {
    console.error('Firestore not initialized for solenoid status listener');
    return () => {};
  }

  const statusRef = doc(db, SOLENOID_CONTROL_COLLECTION, SOLENOID_STATUS_DOC);
  
  const unsubscribe = onSnapshot(statusRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        status: data.solenoidStatus || 'unknown',
        lastUpdate: data.lastUpdate,
        deviceOnline: data.deviceOnline || false,
        batteryLevel: data.batteryLevel || 0,
        temperature: data.temperature || 0,
        humidity: data.humidity || 0
      });
    } else {
      callback({
        status: 'unknown',
        lastUpdate: null,
        deviceOnline: false,
        batteryLevel: 0,
        temperature: 0,
        humidity: 0
      });
    }
  }, (error) => {
    console.error('Error listening to solenoid status:', error);
    callback({
      status: 'error',
      lastUpdate: null,
      deviceOnline: false,
      batteryLevel: 0,
      temperature: 0,
      humidity: 0
    });
  });

  return unsubscribe;
};

/**
 * Update solenoid status (called by ESP32)
 */
export const updateSolenoidStatus = async (statusData) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const statusRef = doc(db, SOLENOID_CONTROL_COLLECTION, SOLENOID_STATUS_DOC);
    const updateData = {
      ...statusData,
      lastUpdate: new Date().toISOString(),
      updatedAt: new Date()
    };

    await setDoc(statusRef, updateData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating solenoid status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Emergency unlock (for emergencies)
 */
export const emergencyUnlock = async () => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const commandData = {
      command: 'emergency_unlock',
      timestamp: new Date().toISOString(),
      status: 'pending',
      adminId: 'admin',
      priority: 'high',
      deviceResponse: '',
      executedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const commandRef = doc(db, SOLENOID_CONTROL_COLLECTION, `emergency_${Date.now()}`);
    await setDoc(commandRef, commandData);

    return { success: true, commandId: commandRef.id };
  } catch (error) {
    console.error('Error sending emergency unlock command:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get device health status
 */
export const getDeviceHealth = async () => {
  try {
    const statusResult = await getSolenoidStatus();
    
    if (!statusResult.success) {
      return { success: false, error: statusResult.error };
    }

    const { deviceOnline, lastUpdate, batteryLevel, temperature, humidity } = statusResult;
    
    // Check if device is online (last update within 5 minutes)
    const isOnline = deviceOnline && lastUpdate && 
      (new Date() - new Date(lastUpdate)) < 5 * 60 * 1000;
    
    // Battery status
    let batteryStatus = 'good';
    if (batteryLevel < 20) batteryStatus = 'low';
    else if (batteryLevel < 50) batteryStatus = 'medium';
    
    // Temperature status (assuming normal range 15-35°C)
    let temperatureStatus = 'normal';
    if (temperature < 15 || temperature > 35) temperatureStatus = 'warning';
    
    return {
      success: true,
      health: {
        isOnline,
        batteryLevel,
        batteryStatus,
        temperature,
        temperatureStatus,
        humidity,
        lastUpdate,
        overallStatus: isOnline && batteryStatus !== 'low' ? 'healthy' : 'warning'
      }
    };
  } catch (error) {
    console.error('Error getting device health:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Schedule automatic lock (for security)
 */
export const scheduleAutoLock = async (delayMinutes = 60) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const scheduleTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    
    const commandData = {
      command: 'scheduled_lock',
      scheduleTime: scheduleTime.toISOString(),
      timestamp: new Date().toISOString(),
      status: 'scheduled',
      adminId: 'admin',
      delayMinutes,
      deviceResponse: '',
      executedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const commandRef = doc(db, SOLENOID_CONTROL_COLLECTION, `scheduled_${Date.now()}`);
    await setDoc(commandRef, commandData);

    return { success: true, commandId: commandRef.id, scheduleTime };
  } catch (error) {
    console.error('Error scheduling auto lock:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancel scheduled lock
 */
export const cancelScheduledLock = async (commandId) => {
  try {
    if (!db || !commandId) {
      throw new Error('Parameter tidak lengkap');
    }

    const commandRef = doc(db, SOLENOID_CONTROL_COLLECTION, commandId);
    await updateDoc(commandRef, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling scheduled lock:', error);
    return { success: false, error: error.message };
  }
};