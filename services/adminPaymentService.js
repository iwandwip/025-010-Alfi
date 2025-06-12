import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { getActiveTimeline, getCurrentDate, calculatePaymentStatus } from './timelineService';

let cachedUsers = null;
let cachedTimeline = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000;

const isCacheValid = () => {
  return cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

export const getAllUsersPaymentStatus = async () => {
  try {
    if (!db) {
      return { success: true, users: [], timeline: null };
    }

    let timeline, users;

    if (isCacheValid() && cachedUsers && cachedTimeline) {
      timeline = cachedTimeline;
      users = cachedUsers;
    } else {
      const [timelineResult, usersResult] = await Promise.all([
        getActiveTimeline(),
        getAllUsers()
      ]);

      if (!timelineResult.success) {
        return { 
          success: false, 
          error: 'Timeline aktif tidak ditemukan', 
          users: [], 
          timeline: null 
        };
      }

      timeline = timelineResult.timeline;
      users = usersResult.success ? usersResult.users.filter(user => user.role === 'user') : [];
      
      cachedTimeline = timeline;
      cachedUsers = users;
      cacheTimestamp = Date.now();
    }

    const userPaymentPromises = users.map(user => 
      getUserPaymentSummaryOptimized(user.id, timeline)
        .then(paymentSummary => ({
          id: user.id,
          ...user,
          paymentSummary
        }))
    );

    const usersWithPaymentStatus = await Promise.all(userPaymentPromises);

    usersWithPaymentStatus.sort((a, b) => {
      if (a.namaSantri && b.namaSantri) {
        return a.namaSantri.localeCompare(b.namaSantri);
      }
      return 0;
    });

    return { success: true, users: usersWithPaymentStatus, timeline };
  } catch (error) {
    console.error('Error getting all users payment status:', error);
    return { success: false, error: error.message, users: [], timeline: null };
  }
};

export const getUserPaymentSummaryOptimized = async (userId, timeline) => {
  try {
    const activePeriods = Object.keys(timeline.periods).filter(
      periodKey => timeline.periods[periodKey].active
    );

    const paymentPromises = activePeriods.map(async (periodKey) => {
      try {
        const paymentsRef = collection(
          db, 
          'payments', 
          timeline.id, 
          'periods', 
          periodKey, 
          'santri_payments'
        );
        
        const q = query(paymentsRef, where('santriId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const period = timeline.periods[periodKey];
        
        if (querySnapshot.empty) {
          const payment = {
            id: `${userId}_${periodKey}`,
            santriId: userId,
            period: periodKey,
            amount: period.amount,
            dueDate: period.dueDate,
            status: 'belum_bayar',
            paymentDate: null,
            periodData: period
          };
          
          payment.status = calculatePaymentStatus(payment, timeline);
          return payment;
        } else {
          const paymentData = querySnapshot.docs[0].data();
          const payment = {
            id: querySnapshot.docs[0].id,
            ...paymentData,
            periodData: period
          };
          
          payment.status = calculatePaymentStatus(payment, timeline);
          return payment;
        }
      } catch (periodError) {
        const period = timeline.periods[periodKey];
        const payment = {
          id: `${userId}_${periodKey}`,
          santriId: userId,
          period: periodKey,
          amount: period.amount,
          dueDate: period.dueDate,
          status: 'belum_bayar',
          paymentDate: null,
          periodData: period
        };
        
        payment.status = calculatePaymentStatus(payment, timeline);
        return payment;
      }
    });

    const allPayments = await Promise.all(paymentPromises);

    const total = allPayments.length;
    const lunas = allPayments.filter(p => p.status === 'lunas').length;
    const belumBayar = allPayments.filter(p => p.status === 'belum_bayar').length;
    const terlambat = allPayments.filter(p => p.status === 'terlambat').length;
    
    const totalAmount = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidAmount = allPayments
      .filter(p => p.status === 'lunas')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    const progressPercentage = total > 0 ? Math.round((lunas / total) * 100) : 0;

    return {
      total,
      lunas,
      belumBayar,
      terlambat,
      totalAmount,
      paidAmount,
      unpaidAmount,
      progressPercentage,
      lastPaymentDate: getLastPaymentDate(allPayments)
    };
  } catch (error) {
    console.error('Error getting user payment summary:', error);
    return {
      total: 0,
      lunas: 0,
      belumBayar: 0,
      terlambat: 0,
      totalAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      progressPercentage: 0,
      lastPaymentDate: null
    };
  }
};

export const getUserDetailedPayments = async (userId) => {
  try {
    if (!db) {
      return { success: true, payments: [], timeline: null };
    }

    if (!userId) {
      return { success: false, error: 'User ID tidak ditemukan', payments: [], timeline: null };
    }

    const timeline = cachedTimeline || (await getActiveTimeline()).timeline;
    if (!timeline) {
      return { 
        success: false, 
        error: 'Timeline aktif tidak ditemukan', 
        payments: [], 
        timeline: null 
      };
    }

    const activePeriods = Object.keys(timeline.periods).filter(
      periodKey => timeline.periods[periodKey].active
    );

    const paymentPromises = activePeriods.map(async (periodKey) => {
      try {
        const paymentsRef = collection(
          db, 
          'payments', 
          timeline.id, 
          'periods', 
          periodKey, 
          'santri_payments'
        );
        
        const q = query(paymentsRef, where('santriId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const period = timeline.periods[periodKey];
        
        if (querySnapshot.empty) {
          const payment = {
            id: `${userId}_${periodKey}`,
            santriId: userId,
            period: periodKey,
            periodLabel: period.label,
            amount: period.amount,
            dueDate: period.dueDate,
            status: 'belum_bayar',
            paymentDate: null,
            paymentMethod: null,
            notes: '',
            periodData: period,
            periodKey: periodKey,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          payment.status = calculatePaymentStatus(payment, timeline);
          return payment;
        } else {
          const paymentData = querySnapshot.docs[0].data();
          const payment = {
            id: querySnapshot.docs[0].id,
            ...paymentData,
            periodData: period,
            periodKey: periodKey
          };
          
          payment.status = calculatePaymentStatus(payment, timeline);
          return payment;
        }
      } catch (periodError) {
        const period = timeline.periods[periodKey];
        const payment = {
          id: `${userId}_${periodKey}`,
          santriId: userId,
          period: periodKey,
          periodLabel: period.label,
          amount: period.amount,
          dueDate: period.dueDate,
          status: 'belum_bayar',
          paymentDate: null,
          paymentMethod: null,
          notes: '',
          periodData: period,
          periodKey: periodKey,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        payment.status = calculatePaymentStatus(payment, timeline);
        return payment;
      }
    });

    const allPayments = await Promise.all(paymentPromises);

    allPayments.sort((a, b) => {
      const periodA = parseInt(a.periodKey.replace('period_', ''));
      const periodB = parseInt(b.periodKey.replace('period_', ''));
      return periodA - periodB;
    });

    return { success: true, payments: allPayments, timeline };
  } catch (error) {
    console.error('Error getting user detailed payments:', error);
    return { success: false, error: error.message, payments: [], timeline: null };
  }
};

export const updateUserPaymentStatus = async (timelineId, periodKey, santriId, updateData) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    if (!timelineId || !periodKey || !santriId) {
      throw new Error('Parameter tidak lengkap untuk update payment');
    }

    const paymentRef = doc(
      db, 
      'payments', 
      timelineId, 
      'periods', 
      periodKey, 
      'santri_payments', 
      santriId
    );

    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };

    try {
      await updateDoc(paymentRef, updatePayload);
    } catch (updateError) {
      if (updateError.code === 'not-found') {
        const timeline = cachedTimeline || (await getActiveTimeline()).timeline;
        if (timeline) {
          const period = timeline.periods[periodKey];
          
          if (period) {
            const newPaymentData = {
              id: `${santriId}_${periodKey}`,
              santriId: santriId,
              period: periodKey,
              periodLabel: period.label,
              amount: period.amount,
              dueDate: period.dueDate,
              ...updatePayload,
              createdAt: new Date()
            };

            await setDoc(paymentRef, newPaymentData);
          } else {
            throw new Error('Period tidak ditemukan dalam timeline');
          }
        } else {
          throw new Error('Timeline aktif tidak ditemukan');
        }
      } else {
        throw updateError;
      }
    }

    cachedUsers = null;
    cacheTimestamp = null;

    return { success: true };
  } catch (error) {
    console.error('Error updating user payment status:', error);
    return { success: false, error: error.message };
  }
};

export const bulkUpdatePaymentStatus = async () => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    const timelineResult = await getActiveTimeline();
    if (!timelineResult.success) {
      throw new Error('Timeline aktif tidak ditemukan');
    }

    const timeline = timelineResult.timeline;
    const activePeriods = Object.keys(timeline.periods).filter(
      periodKey => timeline.periods[periodKey].active
    );

    const batch = writeBatch(db);
    let updateCount = 0;

    for (const periodKey of activePeriods) {
      const paymentsRef = collection(
        db, 
        'payments', 
        timeline.id, 
        'periods', 
        periodKey, 
        'santri_payments'
      );
      
      const querySnapshot = await getDocs(paymentsRef);
      
      querySnapshot.forEach((doc) => {
        const payment = doc.data();
        const newStatus = calculatePaymentStatus(payment, timeline);
        
        if (payment.status !== newStatus) {
          const paymentRef = doc.ref;
          batch.update(paymentRef, {
            status: newStatus,
            updatedAt: new Date()
          });
          updateCount++;
        }
      });
    }

    if (updateCount > 0) {
      await batch.commit();
    }

    cachedUsers = null;
    cachedTimeline = null;
    cacheTimestamp = null;

    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error bulk updating payment status:', error);
    return { success: false, error: error.message };
  }
};

const getAllUsers = async () => {
  try {
    if (!db) {
      return { success: true, users: [] };
    }

    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, users };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { success: false, error: error.message, users: [] };
  }
};

const getLastPaymentDate = (payments) => {
  const paidPayments = payments.filter(p => p.status === 'lunas' && p.paymentDate);
  if (paidPayments.length === 0) return null;
  
  const sortedPayments = paidPayments.sort((a, b) => {
    const dateA = new Date(a.paymentDate);
    const dateB = new Date(b.paymentDate);
    return dateB - dateA;
  });
  
  return sortedPayments[0].paymentDate;
};

export const clearCache = () => {
  cachedUsers = null;
  cachedTimeline = null;
  cacheTimestamp = null;
};