import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export const createTimelineTemplate = async (templateData) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const templateId = `template_${Date.now()}`;
    const template = {
      id: templateId,
      name: templateData.name,
      type: templateData.type,
      duration: templateData.duration,
      baseAmount: templateData.baseAmount,
      holidays: templateData.holidays || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'timeline_templates', templateId), template);
    return { success: true, template };
  } catch (error) {
    console.error('Error creating timeline template:', error);
    return { success: false, error: error.message };
  }
};

export const getTimelineTemplates = async () => {
  try {
    if (!db) {
      return { success: true, templates: [] };
    }

    const templatesRef = collection(db, 'timeline_templates');
    const querySnapshot = await getDocs(templatesRef);
    
    const templates = [];
    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, templates };
  } catch (error) {
    console.error('Error getting timeline templates:', error);
    return { success: false, error: error.message, templates: [] };
  }
};

export const createActiveTimeline = async (timelineData) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const periods = generatePeriods(timelineData);
    const activeTimeline = {
      id: timelineData.id,
      name: timelineData.name,
      type: timelineData.type,
      duration: timelineData.duration,
      baseAmount: timelineData.baseAmount,
      totalAmount: timelineData.totalAmount,
      amountPerPeriod: timelineData.amountPerPeriod,
      startDate: timelineData.startDate,
      mode: timelineData.mode,
      simulationDate: timelineData.mode === 'manual' ? timelineData.simulationDate : null,
      holidays: timelineData.holidays || [],
      periods: periods,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'active_timeline', 'current'), activeTimeline);
    return { success: true, timeline: activeTimeline };
  } catch (error) {
    console.error('Error creating active timeline:', error);
    return { success: false, error: error.message };
  }
};

export const getActiveTimeline = async () => {
  try {
    if (!db) {
      return { success: false, error: 'Firestore tidak tersedia' };
    }

    const docRef = doc(db, 'active_timeline', 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, timeline: docSnap.data() };
    } else {
      return { success: false, error: 'Timeline aktif tidak ditemukan' };
    }
  } catch (error) {
    console.error('Error getting active timeline:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentDate = (timeline) => {
  if (timeline && timeline.mode === 'manual' && timeline.simulationDate) {
    return new Date(timeline.simulationDate);
  }
  return new Date();
};

export const updateTimelineSimulationDate = async (simulationDateTime) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const timelineRef = doc(db, 'active_timeline', 'current');
    
    let simulationDate;
    if (typeof simulationDateTime === 'string') {
      if (simulationDateTime.includes('T')) {
        simulationDate = simulationDateTime;
      } else {
        simulationDate = simulationDateTime;
      }
    } else {
      simulationDate = new Date(simulationDateTime).toISOString();
    }

    await updateDoc(timelineRef, {
      simulationDate: simulationDate,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating simulation date:', error);
    return { success: false, error: error.message };
  }
};

export const deleteActiveTimeline = async (deletePaymentData = false) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const timelineResult = await getActiveTimeline();
    if (!timelineResult.success) {
      throw new Error('Timeline aktif tidak ditemukan');
    }

    const timeline = timelineResult.timeline;
    const batch = writeBatch(db);

    if (deletePaymentData) {
      // Delete all payment data for this timeline including santri payments
      for (const periodKey of Object.keys(timeline.periods)) {
        // Get all santri payments for this period
        const santriPaymentsRef = collection(db, 'payments', timeline.id, 'periods', periodKey, 'santri_payments');
        const santriSnapshot = await getDocs(santriPaymentsRef);
        
        // Delete each santri payment
        santriSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Delete the period document
        const periodRef = doc(db, 'payments', timeline.id, 'periods', periodKey);
        batch.delete(periodRef);
      }

      // Delete the main payments collection document
      const paymentsRef = doc(db, 'payments', timeline.id);
      batch.delete(paymentsRef);

      // Optional: Reset credit balance for all users
      // Get all users to reset their credit balance
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      usersSnapshot.docs.forEach(userDoc => {
        const userData = userDoc.data();
        if (userData.creditBalance && userData.creditBalance > 0) {
          // Reset credit balance to 0
          batch.update(userDoc.ref, { 
            creditBalance: 0,
            updatedAt: new Date()
          });
        }
      });
    }

    // Always delete the timeline itself
    const timelineRef = doc(db, 'active_timeline', 'current');
    batch.delete(timelineRef);

    await batch.commit();
    
    return { 
      success: true, 
      message: deletePaymentData 
        ? 'Timeline dan data pembayaran berhasil dihapus'
        : 'Timeline berhasil dihapus, data pembayaran dipertahankan'
    };
  } catch (error) {
    console.error('Error deleting active timeline:', error);
    return { success: false, error: error.message };
  }
};

export const generatePaymentsForTimeline = async (timelineId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const timelineResult = await getActiveTimeline();
    if (!timelineResult.success) {
      throw new Error('Timeline aktif tidak ditemukan');
    }

    const timeline = timelineResult.timeline;
    const santriResult = await getAllSantri();
    if (!santriResult.success) {
      throw new Error('Gagal mengambil data santri');
    }

    const batch = writeBatch(db);
    const santriList = santriResult.data;

    Object.keys(timeline.periods).forEach(periodKey => {
      const period = timeline.periods[periodKey];
      if (period.active) {
        santriList.forEach(santri => {
          const paymentId = `${santri.id}_${periodKey}`;
          const paymentRef = doc(db, 'payments', timelineId, 'periods', periodKey, 'santri_payments', santri.id);
          
          const paymentData = {
            id: paymentId,
            santriId: santri.id,
            santriName: santri.namaSantri,
            waliName: santri.namaWali,
            period: periodKey,
            periodLabel: period.label,
            amount: period.amount,
            dueDate: period.dueDate,
            status: 'belum_bayar',
            paymentDate: null,
            paymentMethod: null,
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          batch.set(paymentRef, paymentData);
        });
      }
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error generating payments:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentsByPeriod = async (timelineId, periodKey) => {
  try {
    if (!db) {
      return { success: true, payments: [] };
    }

    const paymentsRef = collection(db, 'payments', timelineId, 'periods', periodKey, 'santri_payments');
    const querySnapshot = await getDocs(paymentsRef);
    
    const payments = [];
    querySnapshot.forEach((doc) => {
      payments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, payments };
  } catch (error) {
    console.error('Error getting payments by period:', error);
    return { success: false, error: error.message, payments: [] };
  }
};

export const updatePaymentStatus = async (timelineId, periodKey, santriId, updateData) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const paymentRef = doc(db, 'payments', timelineId, 'periods', periodKey, 'santri_payments', santriId);
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };

    await updateDoc(paymentRef, updatePayload);
    return { success: true };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error: error.message };
  }
};

export const resetTimelinePayments = async (timelineId) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const timelineResult = await getActiveTimeline();
    if (!timelineResult.success) {
      throw new Error('Timeline aktif tidak ditemukan');
    }

    const timeline = timelineResult.timeline;
    const batch = writeBatch(db);

    Object.keys(timeline.periods).forEach(periodKey => {
      const periodRef = doc(db, 'payments', timelineId, 'periods', periodKey);
      batch.delete(periodRef);
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error resetting timeline payments:', error);
    return { success: false, error: error.message };
  }
};

export const calculatePaymentStatus = (payment, timeline) => {
  if (!payment || !timeline) return payment?.status || 'belum_bayar';
  
  if (payment.status === 'lunas') return 'lunas';
  
  const currentDate = getCurrentDate(timeline);
  const dueDate = new Date(payment.dueDate);
  
  if (currentDate > dueDate) {
    return 'terlambat';
  }
  
  return 'belum_bayar';
};

const generatePeriods = (timelineData) => {
  const periods = {};
  const activePeriods = timelineData.duration - (timelineData.holidays?.length || 0);
  const amountPerPeriod = Math.ceil(timelineData.totalAmount / activePeriods);

  for (let i = 1; i <= timelineData.duration; i++) {
    const isHoliday = timelineData.holidays?.includes(i) || false;
    const periodKey = `period_${i}`;
    
    periods[periodKey] = {
      number: i,
      label: getPeriodLabel(timelineData.type, i, timelineData.startDate),
      dueDate: calculateDueDate(timelineData.type, i, timelineData.startDate),
      active: !isHoliday,
      amount: isHoliday ? 0 : amountPerPeriod,
      isHoliday: isHoliday
    };
  }

  return periods;
};

const getPeriodLabel = (type, number, startDate) => {
  const typeLabels = {
    yearly: 'Tahun',
    monthly: 'Bulan', 
    weekly: 'Minggu',
    daily: 'Hari',
    hourly: 'Jam',
    minute: 'Menit'
  };
  
  return `${typeLabels[type]} ${number}`;
};

const calculateDueDate = (type, periodNumber, startDate) => {
  const start = new Date(startDate);
  let dueDate = new Date(start);

  switch (type) {
    case 'yearly':
      dueDate.setFullYear(start.getFullYear() + periodNumber);
      break;
    case 'monthly':
      dueDate.setMonth(start.getMonth() + periodNumber);
      break;
    case 'weekly':
      dueDate.setDate(start.getDate() + (periodNumber * 7));
      break;
    case 'daily':
      dueDate.setDate(start.getDate() + periodNumber);
      break;
    case 'hourly':
      dueDate.setHours(start.getHours() + periodNumber);
      break;
    case 'minute':
      dueDate.setMinutes(start.getMinutes() + periodNumber);
      break;
    default:
      dueDate.setDate(start.getDate() + periodNumber);
  }

  return dueDate.toISOString();
};

const getAllSantri = async () => {
  try {
    if (!db) {
      return { success: true, data: [] };
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'user'));
    const querySnapshot = await getDocs(q);
    
    const santriList = [];
    querySnapshot.forEach((doc) => {
      santriList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: santriList };
  } catch (error) {
    console.error('Error getting santri data:', error);
    return { success: false, error: error.message, data: [] };
  }
};