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
let cachedTimelineId = null;
const CACHE_DURATION = 30000;

const isCacheValid = (currentTimelineId) => {
  // Cache is invalid if timeline ID has changed
  if (cachedTimelineId && currentTimelineId && cachedTimelineId !== currentTimelineId) {
    return false;
  }
  return cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION;
};

export const getWargaPaymentHistory = async (wargaId) => {
  try {
    if (!db) {
      return { success: true, payments: [], timeline: null };
    }

    if (!wargaId) {
      return { success: false, error: 'Warga ID tidak ditemukan', payments: [], timeline: null };
    }

    let timeline;
    const cacheKey = wargaId;

    // Get timeline first to check if it changed
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
    
    // Check cache validity with timeline ID
    if (isCacheValid(timeline.id) && cachedTimeline && cachedPayments.has(cacheKey)) {
      return {
        success: true,
        payments: cachedPayments.get(cacheKey),
        timeline: cachedTimeline
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
          'warga_payments'
        );
        
        const q = query(paymentsRef, where('wargaId', '==', wargaId));
        const querySnapshot = await getDocs(q);
        
        const period = timeline.periods[periodKey];
        
        if (querySnapshot.empty) {
          const payment = {
            id: `${wargaId}_${periodKey}`,
            wargaId: wargaId,
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
          id: `${wargaId}_${periodKey}`,
          wargaId: wargaId,
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
    cachedTimelineId = timeline.id;
    cacheTimestamp = Date.now();

    return { success: true, payments: allPayments, timeline };
  } catch (error) {
    console.error('Error getting warga payment history:', error);
    return { success: false, error: error.message, payments: [], timeline: null };
  }
};

export const updateWargaPaymentStatus = async (timelineId, periodKey, wargaId, updateData) => {
  try {
    if (!db) {
      throw new Error('Firestore belum diinisialisasi');
    }

    if (!timelineId || !periodKey || !wargaId) {
      throw new Error('Parameter tidak lengkap untuk update payment');
    }

    const paymentRef = doc(
      db, 
      'payments', 
      timelineId, 
      'periods', 
      periodKey, 
      'warga_payments', 
      wargaId
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
              id: `${wargaId}_${periodKey}`,
              wargaId: wargaId,
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

    cachedPayments.delete(wargaId);
    cacheTimestamp = null;

    return { success: true };
  } catch (error) {
    console.error('Error updating warga payment status:', error);
    return { success: false, error: error.message };
  }
};

export const getPaymentSummary = (payments) => {
  const total = payments.length;
  const lunas = payments.filter(p => p.status === 'lunas').length;
  const belumBayar = payments.filter(p => p.status === 'belum_bayar').length;
  const belumLunas = payments.filter(p => p.status === 'belum_lunas').length;
  const terlambat = payments.filter(p => p.status === 'terlambat').length;
  
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidAmount = payments
    .filter(p => p.status === 'lunas')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Hitung partial payment amount
  const partialAmount = payments
    .filter(p => p.partialPayment && p.totalPaid > 0)
    .reduce((sum, p) => sum + (p.totalPaid || 0), 0);
  
  const unpaidAmount = totalAmount - paidAmount - partialAmount;

  const progressPercentage = total > 0 ? Math.round((lunas / total) * 100) : 0;

  return {
    total,
    lunas,
    belumBayar,
    belumLunas,
    terlambat,
    totalAmount,
    paidAmount,
    partialAmount,
    unpaidAmount,
    progressPercentage
  };
};

export const getCreditBalance = async (wargaId) => {
  try {
    if (!db || !wargaId) {
      return { success: false, creditBalance: 0 };
    }

    const userDoc = await doc(db, 'users', wargaId);
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

export const updateCreditBalance = async (wargaId, newBalance) => {
  try {
    if (!db || !wargaId) {
      throw new Error('Parameter tidak lengkap');
    }

    const userRef = doc(db, 'users', wargaId);
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

export const processPaymentWithCredit = async (timelineId, periodKey, wargaId, paymentAmount, paymentMethod) => {
  try {
    if (!db || !timelineId || !periodKey || !wargaId || !paymentAmount) {
      throw new Error('Parameter tidak lengkap');
    }

    const creditResult = await getCreditBalance(wargaId);
    if (!creditResult.success) {
      throw new Error('Gagal mengambil saldo credit');
    }

    const currentCredit = creditResult.creditBalance;
    const paymentHistory = await getWargaPaymentHistory(wargaId);
    
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

    const paymentResult = await updateWargaPaymentStatus(timelineId, periodKey, wargaId, updateData);
    if (!paymentResult.success) {
      throw new Error('Gagal update status pembayaran');
    }

    const creditUpdateResult = await updateCreditBalance(wargaId, newCreditBalance);
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

export const processCustomPaymentWithAutoAllocation = async (wargaId, paymentAmount, paymentMethod = 'cash') => {
  try {
    if (!db || !wargaId || !paymentAmount || paymentAmount <= 0) {
      throw new Error('Parameter tidak valid');
    }

    // 1. Get credit balance dan payment history
    const [creditResult, paymentHistory] = await Promise.all([
      getCreditBalance(wargaId),
      getWargaPaymentHistory(wargaId)
    ]);

    if (!creditResult.success) {
      throw new Error('Gagal mengambil saldo credit');
    }

    if (!paymentHistory.success) {
      throw new Error('Gagal mengambil riwayat pembayaran');
    }

    const timeline = paymentHistory.timeline;
    if (!timeline) {
      throw new Error('Timeline tidak ditemukan');
    }

    let remainingPayment = paymentAmount;
    let currentCredit = creditResult.creditBalance;
    const paymentResults = [];
    
    // 2. Filter pembayaran yang belum lunas, urutkan berdasarkan periode
    const unpaidPayments = paymentHistory.payments
      .filter(p => p.status === 'belum_bayar' || p.status === 'terlambat')
      .sort((a, b) => {
        const periodA = parseInt(a.periodKey.replace('period_', ''));
        const periodB = parseInt(b.periodKey.replace('period_', ''));
        return periodA - periodB;
      });

    if (unpaidPayments.length === 0) {
      // Tidak ada tagihan yang belum dibayar, semua menjadi credit
      const maxCredit = paymentAmount * 3; // Batas maksimal credit
      const finalCredit = Math.min(paymentAmount, maxCredit - currentCredit);
      
      const creditUpdateResult = await updateCreditBalance(wargaId, currentCredit + finalCredit);
      if (!creditUpdateResult.success) {
        throw new Error('Gagal update saldo credit');
      }

      return {
        success: true,
        totalProcessed: finalCredit,
        remainingAmount: paymentAmount - finalCredit,
        newCreditBalance: currentCredit + finalCredit,
        processedPayments: [],
        message: `Semua tagihan sudah lunas. ${finalCredit > 0 ? `Rp ${finalCredit.toLocaleString()} ditambahkan ke credit.` : 'Pembayaran melebihi batas credit maksimal.'}`
      };
    }

    // 3. Proses pembayaran satu per satu
    for (const payment of unpaidPayments) {
      if (remainingPayment <= 0) break;

      let creditApplied = 0;
      let cashPaid = 0;
      
      // Gunakan credit terlebih dahulu
      if (currentCredit > 0 && payment.amount > 0) {
        creditApplied = Math.min(currentCredit, payment.amount);
        currentCredit -= creditApplied;
      }
      
      const amountAfterCredit = payment.amount - creditApplied;
      
      // Gunakan cash untuk sisa pembayaran
      if (amountAfterCredit > 0 && remainingPayment > 0) {
        cashPaid = Math.min(remainingPayment, amountAfterCredit);
        remainingPayment -= cashPaid;
      }
      
      const totalPaidForThisPayment = creditApplied + cashPaid;
      
      if (totalPaidForThisPayment >= payment.amount) {
        // Pembayaran lunas
        const updateData = {
          status: 'lunas',
          paymentDate: toISOString(),
          paymentMethod: paymentMethod,
          creditApplied,
          remainingAmount: 0,
          paidAmount: cashPaid,
          totalPaid: totalPaidForThisPayment,
          notes: creditApplied > 0 ? `Credit applied: ${creditApplied}` : ''
        };

        const paymentResult = await updateWargaPaymentStatus(timeline.id, payment.periodKey, wargaId, updateData);
        if (paymentResult.success) {
          paymentResults.push({
            periodKey: payment.periodKey,
            periodLabel: payment.periodLabel,
            amount: payment.amount,
            creditApplied,
            cashPaid,
            status: 'lunas'
          });
        }
      } else if (totalPaidForThisPayment > 0) {
        // Pembayaran parsial - status tetap sesuai timeline tapi ada informasi terbayar
        const currentStatus = calculatePaymentStatus(payment, timeline);
        const partialStatus = currentStatus === 'terlambat' ? 'terlambat' : 'belum_lunas';
        
        const updateData = {
          status: partialStatus,
          paymentDate: toISOString(),
          paymentMethod: paymentMethod,
          creditApplied,
          remainingAmount: payment.amount - totalPaidForThisPayment,
          paidAmount: cashPaid,
          totalPaid: totalPaidForThisPayment,
          partialPayment: true, // Flag untuk menandai pembayaran parsial
          notes: `Terbayar parsial: Rp ${totalPaidForThisPayment.toLocaleString()} dari Rp ${payment.amount.toLocaleString()}${creditApplied > 0 ? ` (Credit: Rp ${creditApplied.toLocaleString()})` : ''}`
        };

        const paymentResult = await updateWargaPaymentStatus(timeline.id, payment.periodKey, wargaId, updateData);
        if (paymentResult.success) {
          paymentResults.push({
            periodKey: payment.periodKey,
            periodLabel: payment.periodLabel,
            amount: payment.amount,
            creditApplied,
            cashPaid,
            status: partialStatus,
            isPartial: true
          });
        }
      }
    }

    // 4. Jika masih ada sisa pembayaran, jadikan credit
    if (remainingPayment > 0) {
      const maxTotalCredit = paymentAmount * 3; // Batas maksimal credit berdasarkan pembayaran
      const finalExcessCredit = Math.min(remainingPayment, maxTotalCredit - currentCredit);
      
      if (finalExcessCredit > 0) {
        currentCredit += finalExcessCredit;
        remainingPayment -= finalExcessCredit;
      }
    }

    // 5. Update credit balance
    const creditUpdateResult = await updateCreditBalance(wargaId, currentCredit);
    if (!creditUpdateResult.success) {
      throw new Error('Gagal update saldo credit');
    }

    return {
      success: true,
      totalProcessed: paymentAmount - remainingPayment,
      remainingAmount: remainingPayment,
      newCreditBalance: currentCredit,
      processedPayments: paymentResults,
      message: `Berhasil memproses ${paymentResults.length} pembayaran. ${remainingPayment > 0 ? `Sisa Rp ${remainingPayment.toLocaleString()} tidak dapat diproses (melebihi batas credit maksimal).` : ''}`
    };
  } catch (error) {
    console.error('Error processing custom payment with auto allocation:', error);
    return { success: false, error: error.message };
  }
};

export const clearWargaCache = () => {
  cachedPayments.clear();
  cachedTimeline = null;
  cachedTimelineId = null;
  cacheTimestamp = null;
};