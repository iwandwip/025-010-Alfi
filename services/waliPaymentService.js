import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { getActiveTimeline, calculatePaymentStatus } from './timelineService';
import { toISOString } from '../utils/dateUtils';

let cachedPayments = new Map();
let cachedTimeline = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000;

const isCacheValid = () => {
  return cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

export const getWaliPaymentHistory = async (santriId) => {
  try {
    if (!db) {
      return { success: true, payments: [], timeline: null };
    }

    if (!santriId) {
      return { success: false, error: 'Santri ID tidak ditemukan', payments: [], timeline: null };
    }

    let timeline;
    const cacheKey = santriId;

    if (isCacheValid() && cachedTimeline && cachedPayments.has(cacheKey)) {
      return {
        success: true,
        payments: cachedPayments.get(cacheKey),
        timeline: cachedTimeline
      };
    }

    const timelineResult = await getActiveTimeline();
    if (!timelineResult.success) {
      return { 
        success: false, 
        error: 'Timeline aktif tidak ditemukan', 
        payments: [], 
        timeline: null 
      };
    }

    timeline = timelineResult.timeline;
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
        
        const q = query(paymentsRef, where('santriId', '==', santriId));
        const querySnapshot = await getDocs(q);
        
        const period = timeline.periods[periodKey];
        
        if (querySnapshot.empty) {
          const payment = {
            id: `${santriId}_${periodKey}`,
            santriId: santriId,
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
            creditApplied: 0,
            remainingAmount: period.amount,
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
        console.warn(`Error loading period ${periodKey}:`, periodError);
        const period = timeline.periods[periodKey];
        const payment = {
          id: `${santriId}_${periodKey}`,
          santriId: santriId,
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
          creditApplied: 0,
          remainingAmount: period.amount,
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

    cachedPayments.set(cacheKey, allPayments);
    cachedTimeline = timeline;
    cacheTimestamp = Date.now();

    return { success: true, payments: allPayments, timeline };
  } catch (error) {
    console.error('Error getting wali payment history:', error);
    return { success: false, error: error.message, payments: [], timeline: null };
  }
};

export const updateWaliPaymentStatus = async (timelineId, periodKey, santriId, updateData) => {
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

    cachedPayments.delete(santriId);
    cacheTimestamp = null;

    return { success: true };
  } catch (error) {
    console.error('Error updating wali payment status:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentSummary = (payments) => {
  const total = payments.length;
  const lunas = payments.filter(p => p.status === 'lunas').length;
  const belumBayar = payments.filter(p => p.status === 'belum_bayar').length;
  const terlambat = payments.filter(p => p.status === 'terlambat').length;
  
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments
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
    progressPercentage
  };
};

export const getCreditBalance = async (santriId) => {
  try {
    if (!db || !santriId) {
      return { success: false, creditBalance: 0 };
    }

    const userDoc = await doc(db, 'users', santriId);
    const userData = await getDoc(userDoc);
    
    if (userData.exists()) {
      const data = userData.data();
      return {
        success: true,
        creditBalance: data.creditBalance || 0
      };
    }
    
    return { success: true, creditBalance: 0 };
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return { success: false, creditBalance: 0, error: error.message };
  }
};

export const updateCreditBalance = async (santriId, newBalance) => {
  try {
    if (!db || !santriId) {
      throw new Error('Parameter tidak lengkap');
    }

    const userRef = doc(db, 'users', santriId);
    await updateDoc(userRef, {
      creditBalance: newBalance,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating credit balance:', error);
    return { success: false, error: error.message };
  }
};

export const applyCreditToPayments = (payments, creditBalance) => {
  let remainingCredit = creditBalance;
  const updatedPayments = [...payments];

  for (let i = 0; i < updatedPayments.length; i++) {
    const payment = updatedPayments[i];
    
    if (payment.status === 'belum_bayar' && remainingCredit > 0) {
      const creditToApply = Math.min(remainingCredit, payment.amount);
      
      updatedPayments[i] = {
        ...payment,
        creditApplied: creditToApply,
        remainingAmount: payment.amount - creditToApply
      };
      
      remainingCredit -= creditToApply;
      
      if (updatedPayments[i].remainingAmount === 0) {
        updatedPayments[i].status = 'lunas';
        updatedPayments[i].paymentDate = new Date();
        updatedPayments[i].paymentMethod = 'credit';
        updatedPayments[i].notes = 'Dibayar dengan saldo credit';
      }
    }
  }

  return {
    payments: updatedPayments,
    usedCredit: creditBalance - remainingCredit,
    remainingCredit
  };
};

export const processPaymentWithCredit = async (timelineId, periodKey, santriId, paymentAmount, paymentMethod) => {
  try {
    if (!db || !timelineId || !periodKey || !santriId || !paymentAmount) {
      throw new Error('Parameter tidak lengkap');
    }

    const creditResult = await getCreditBalance(santriId);
    if (!creditResult.success) {
      throw new Error('Gagal mengambil saldo credit');
    }

    const currentCredit = creditResult.creditBalance;
    const paymentHistory = await getWaliPaymentHistory(santriId);
    
    if (!paymentHistory.success) {
      throw new Error('Gagal mengambil riwayat pembayaran');
    }

    const targetPayment = paymentHistory.payments.find(p => p.periodKey === periodKey);
    if (!targetPayment) {
      throw new Error('Pembayaran tidak ditemukan');
    }

    let newCreditBalance = currentCredit;
    let creditApplied = 0;
    let excessCredit = 0;
    
    // 1. Hitung berapa credit yang bisa dipakai untuk pembayaran ini
    if (currentCredit > 0) {
      creditApplied = Math.min(currentCredit, targetPayment.amount);
      newCreditBalance = currentCredit - creditApplied;
    }
    
    // 2. Hitung sisa yang harus dibayar setelah credit diterapkan
    const remainingAfterCredit = targetPayment.amount - creditApplied;
    
    // 3. Cek apakah payment amount melebihi yang dibutuhkan
    if (paymentAmount > remainingAfterCredit) {
      // Ada excess payment yang akan jadi credit
      excessCredit = paymentAmount - remainingAfterCredit;
      
      // Validate max credit (3x nominal periode)
      const maxTotalCredit = targetPayment.amount * 3;
      const finalExcessCredit = Math.min(excessCredit, maxTotalCredit - newCreditBalance);
      
      newCreditBalance += finalExcessCredit;
    }
    
    // 4. Update status payment
    const updateData = {
      status: 'lunas',
      paymentDate: toISOString(),
      paymentMethod: paymentMethod,
      creditApplied,
      remainingAmount: 0,
      paidAmount: remainingAfterCredit, // Amount actually paid (excluding credit)
      totalPaid: paymentAmount, // Total amount user paid
      notes: creditApplied > 0 ? `Credit applied: ${creditApplied}` : ''
    };

    const paymentResult = await updateWaliPaymentStatus(timelineId, periodKey, santriId, updateData);
    if (!paymentResult.success) {
      throw new Error('Gagal update status pembayaran');
    }

    const creditUpdateResult = await updateCreditBalance(santriId, newCreditBalance);
    if (!creditUpdateResult.success) {
      throw new Error('Gagal update saldo credit');
    }

    return {
      success: true,
      creditApplied,
      newCreditBalance,
      excessCredit,
      paidAmount: remainingAfterCredit,
      totalPaid: paymentAmount,
      paymentStatus: 'lunas'
    };
  } catch (error) {
    console.error('Error processing payment with credit:', error);
    return { success: false, error: error.message };
  }
};

export const clearWaliCache = () => {
  cachedPayments.clear();
  cachedTimeline = null;
  cacheTimestamp = null;
};