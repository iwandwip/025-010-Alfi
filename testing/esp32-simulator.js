const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc, collection, getDocs, query, where, getDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const inquirer = require('inquirer').default;

const firebaseConfig = {
  apiKey: "AIzaSyD4URsW4aiFRDgn72VvF_KwTwAImzscacc",
  authDomain: "alfi-c6f58.firebaseapp.com",
  projectId: "alfi-c6f58",
  storageBucket: "alfi-c6f58.firebasestorage.app",
  messagingSenderId: "839280828747",
  appId: "1:839280828747:web:861a79a41c70ab6445c8ce",
  measurementId: "G-FE00Y2NMJF"
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

class ESP32PaymentSimulator {
  constructor() {
    this.pairingRef = doc(db, 'rfid_pairing', 'current_session');
    this.currentSession = null;
    this.timeoutTimer = null;
    this.processingTimer = null;
    this.isProcessing = false;
    this.isAuthenticated = false;
    this.wargaList = [];
    this.pairingMode = false;
  }
  
  clearConsole() {
    console.clear();
    // Also try platform-specific clear commands
    process.stdout.write('\x1Bc');
  }

  async initialize() {
    try {
      console.log('🔐 Authenticating...');
      await signInWithEmailAndPassword(auth, 'bendahara@gmail.com', 'admin123');
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
      
      await this.loadWargaList();
      
      console.log('🤖 ESP32 Payment Simulator Started');
      console.log('💰 Payment simulation with RFID integration');
      console.log('📡 Listening for RFID pairing sessions...');
      console.log('💡 Interactive menu available for payment simulation\n');
      
      this.startListening();
      this.showMainMenu();
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
        if (this.pairingMode) {
          console.log('📄 No active pairing session');
        }
        this.stopCurrentSession();
      }
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });
  }

  handlePairingChange(pairingData) {
    // Only show logs if in pairing mode
    if (this.pairingMode) {
      console.log('📊 Pairing data received:', {
        isActive: pairingData.isActive,
        wargaId: pairingData.wargaId,
        startTime: pairingData.startTime?.toDate?.()?.toLocaleString(),
        hasRfidCode: !!pairingData.rfidCode
      });
    }

    if (!pairingData.isActive) {
      if (this.pairingMode) {
        console.log('🔴 Pairing session inactive');
      }
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
    console.log(`👤 Warga ID: ${pairingData.wargaId}`);
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
        wargaId: this.currentSession.wargaId,
        lastActivity: new Date()
      });
      
      console.log(`📤 RFID data sent to Firestore`);
      console.log(`🎉 RFID Pairing Complete!`);
      console.log(`📱 App should receive: { success: true, rfidCode: "${rfidCode}", wargaId: "${this.currentSession.wargaId}" }\n`);
      
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
    
    if (this.pairingMode) {
      console.log('🔄 Session stopped, waiting for next pairing request...\n');
    }
  }

  async loadWargaList() {
    try {
      const usersRef = collection(db, 'users');
      // Simplified query to avoid index requirement
      const q = query(
        usersRef, 
        where('role', '==', 'user'),
        where('deleted', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      this.wargaList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for RFID in memory to avoid composite index
        if (data.rfidWarga && data.rfidWarga.trim() !== '') {
          this.wargaList.push({
            id: doc.id,
            namaWarga: data.namaWarga,
            rfidWarga: data.rfidWarga,
            creditBalance: data.creditBalance || 0
          });
        }
      });
      
      console.log(`📋 Loaded ${this.wargaList.length} warga with RFID`);
    } catch (error) {
      console.error('❌ Failed to load warga list:', error.message);
      this.wargaList = [];
    }
  }

  async showMainMenu() {
    try {
      this.clearConsole();
      console.log('🤖 ESP32 Payment Simulator');
      console.log('💰 Payment simulation with RFID integration\n');
      
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '🤖 ESP32 Simulator - Pilih aksi:',
          choices: [
            { name: '🔗 Simulasi Pairing RFID', value: 'pairing' },
            { name: '💰 Simulasi Pembayaran', value: 'payment' },
            { name: '🔄 Reload Warga List', value: 'reload' },
            { name: '❌ Exit', value: 'exit' }
          ]
        }
      ]);

      switch (answers.action) {
        case 'pairing':
          this.pairingMode = true;
          console.log('\n📡 Entering pairing mode - waiting for pairing requests from app...');
          console.log('💡 Use the mobile app to initiate RFID pairing\n');
          // Stay in pairing mode, don't show menu again
          return;
        case 'payment':
          this.pairingMode = false;
          await this.simulatePayment();
          break;
        case 'reload':
          this.pairingMode = false;
          console.log('\n🔄 Reloading warga list...');
          await this.loadWargaList();
          console.log('✅ Reload complete!');
          setTimeout(() => this.showMainMenu(), 1500);
          break;
        case 'exit':
          this.pairingMode = false;
          this.shutdown();
          break;
      }
    } catch (error) {
      console.error('❌ Menu error:', error.message);
      this.showMainMenu();
    }
  }

  async simulatePayment() {
    try {
      this.clearConsole();
      console.log('💰 Simulasi Pembayaran ESP32\n');
      
      if (this.wargaList.length === 0) {
        console.log('❌ Tidak ada warga dengan RFID yang terdaftar');
        console.log('💡 Lakukan pairing RFID terlebih dahulu\n');
        this.showMainMenu();
        return;
      }

      const wargaChoices = this.wargaList.map(warga => ({
        name: `${warga.namaWarga} (RFID: ${warga.rfidWarga}) - Credit: Rp${warga.creditBalance.toLocaleString()}`,
        value: warga.id
      }));
      
      wargaChoices.push({ name: '← Back to Main Menu', value: 'back' });

      const { selectedWarga } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedWarga',
          message: '👤 Pilih warga untuk simulasi pembayaran:',
          choices: wargaChoices
        }
      ]);
      
      if (selectedWarga === 'back') {
        this.showMainMenu();
        return;
      }

      const warga = this.wargaList.find(w => w.id === selectedWarga);
      
      // Clear console before showing payment flow
      this.clearConsole();
      console.log(`\n🔍 RFID Detected: ${warga.rfidWarga}`);
      console.log(`👤 Warga: ${warga.namaWarga}`);
      console.log(`💳 Current Credit: Rp${warga.creditBalance.toLocaleString()}`);

      await this.processPaymentFlow(warga);
      
    } catch (error) {
      console.error('❌ Payment simulation error:', error.message);
    }
    
    setTimeout(() => {
      console.log('\n🔙 Kembali ke menu utama...');
      setTimeout(() => this.showMainMenu(), 1000);
    }, 2000);
  }

  async processPaymentFlow(warga) {
    try {
      console.log('💰 Payment Flow\n');
      
      // Get payment history
      const paymentHistory = await this.getWargaPaymentHistory(warga.id);
      
      if (!paymentHistory.success) {
        console.log('❌ Gagal mengambil data pembayaran');
        return;
      }

      const unpaidPayments = paymentHistory.payments.filter(p => p.status !== 'lunas');
      
      if (unpaidPayments.length === 0) {
        console.log('✅ Semua pembayaran sudah lunas!');
        return;
      }

      // Show current bills
      console.log('\n📋 Tagihan yang belum dibayar:');
      unpaidPayments.forEach((payment, index) => {
        const statusIcon = payment.status === 'terlambat' ? '🔴' : '🟡';
        console.log(`${statusIcon} ${payment.periodLabel}: Rp${payment.amount.toLocaleString()} (${payment.status})`);
      });

      // Sort payments by period number (extract number from periodKey)
      const sortedUnpaidPayments = unpaidPayments.sort((a, b) => {
        const numA = parseInt(a.periodKey.replace('period_', ''));
        const numB = parseInt(b.periodKey.replace('period_', ''));
        return numA - numB;
      });

      // Select payment to process
      const paymentChoices = [
        { name: '← Back to Warga Selection', value: 'back' }
      ];
      
      // Add sorted payment options
      sortedUnpaidPayments.forEach(payment => {
        paymentChoices.push({
          name: `${payment.periodLabel} - Rp${payment.amount.toLocaleString()} (${payment.status})`,
          value: payment.periodKey
        });
      });
      
      // Add custom payment option
      paymentChoices.push({ name: '💰 Pembayaran dengan Nominal Custom', value: 'custom' });

      const { selectedPayment } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedPayment',
          message: '💰 Pilih pembayaran yang akan diproses:',
          choices: paymentChoices
        }
      ]);
      
      if (selectedPayment === 'back') {
        await this.simulatePayment();
        return;
      }

      if (selectedPayment === 'custom') {
        await this.processCustomPayment(warga, sortedUnpaidPayments, paymentHistory.timeline);
        return;
      }

      const targetPayment = sortedUnpaidPayments.find(p => p.periodKey === selectedPayment);
      
      // Clear console for payment method selection
      this.clearConsole();
      
      console.log(`\n💰 Processing payment for: ${targetPayment.periodLabel}`);
      console.log(`💵 Amount required: Rp${targetPayment.amount.toLocaleString()}`);
      console.log(`💳 Available credit: Rp${warga.creditBalance.toLocaleString()}`);
      
      const creditCanCover = warga.creditBalance >= targetPayment.amount;
      
      if (creditCanCover) {
        const { paymentMethod } = await inquirer.prompt([
          {
            type: 'list',
            name: 'paymentMethod',
            message: '💳 Pilih metode pembayaran:',
            choices: [
              { name: '💳 Gunakan Credit (Otomatis)', value: 'credit' },
              { name: '💵 Bayar Tunai', value: 'cash' },
              { name: '← Back to Payment Selection', value: 'back' }
            ]
          }
        ]);
        
        if (paymentMethod === 'back') {
          this.clearConsole();
          await this.processPaymentFlow(warga);
          return;
        }
        
        if (paymentMethod === 'credit') {
          await this.processCreditPayment(warga, targetPayment, paymentHistory.timeline);
          return;
        }
      }

      // Cash payment
      const cashAnswers = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '💵 Pilihan pembayaran tunai:',
          choices: [
            { name: '💵 Input Nominal Tunai', value: 'input' },
            { name: '← Back to Payment Method', value: 'back' }
          ]
        }
      ]);
      
      if (cashAnswers.action === 'back') {
        this.clearConsole();
        await this.processPaymentFlow(warga);
        return;
      }
      
      const { cashAmount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'cashAmount',
          message: `💵 Masukkan nominal uang (Rp):`,
          validate: (value) => {
            if (value === null || value === undefined) return 'Masukkan nominal yang valid';
            if (value <= 0) return 'Nominal harus lebih dari 0';
            return true;
          }
        }
      ]);

      if (cashAmount === null || cashAmount === undefined) {
        console.log('⚠️ Pembayaran dibatalkan');
        await this.processPaymentFlow(warga);
        return;
      }
      
      await this.processCashPayment(warga, targetPayment, cashAmount, paymentHistory.timeline);
      
    } catch (error) {
      console.error('❌ Payment flow error:', error.message);
    }
  }

  async processCreditPayment(warga, payment, timeline) {
    try {
      console.log('\n🔄 Processing credit payment...');
      
      const result = await this.processPaymentWithCredit(
        timeline.id, 
        payment.periodKey, 
        warga.id, 
        0, // No cash amount
        'credit'
      );
      
      if (result.success) {
        console.log('✅ Pembayaran berhasil dengan credit!');
        console.log(`💳 Credit used: Rp${result.creditApplied.toLocaleString()}`);
        console.log(`💰 Remaining credit: Rp${result.newCreditBalance.toLocaleString()}`);
      } else {
        console.log('❌ Pembayaran gagal:', result.error);
      }
    } catch (error) {
      console.error('❌ Credit payment error:', error.message);
    }
  }

  async processCashPayment(warga, payment, cashAmount, timeline) {
    try {
      console.log('\n🔄 Processing cash payment...');
      console.log(`💵 Cash received: Rp${cashAmount.toLocaleString()}`);
      console.log(`💰 Amount needed: Rp${payment.amount.toLocaleString()}`);
      
      if (cashAmount < payment.amount - warga.creditBalance) {
        const shortage = payment.amount - warga.creditBalance - cashAmount;
        console.log(`❌ Uang kurang: Rp${shortage.toLocaleString()}`);
        console.log(`💡 Status: Pembayaran sebagian (${((cashAmount + warga.creditBalance) / payment.amount * 100).toFixed(1)}%)`);
        
        // Partial payment logic could be implemented here
        console.log('⚠️ Fitur pembayaran sebagian belum diimplementasi');
        return;
      }
      
      const result = await this.processPaymentWithCredit(
        timeline.id, 
        payment.periodKey, 
        warga.id, 
        cashAmount, 
        'cash'
      );
      
      if (result.success) {
        console.log('✅ Pembayaran berhasil!');
        console.log(`💵 Cash paid: Rp${result.paidAmount.toLocaleString()}`);
        
        if (result.creditApplied > 0) {
          console.log(`💳 Credit applied: Rp${result.creditApplied.toLocaleString()}`);
        }
        
        if (result.excessCredit > 0) {
          console.log(`💰 Excess added to credit: Rp${result.excessCredit.toLocaleString()}`);
        }
        
        console.log(`💳 New credit balance: Rp${result.newCreditBalance.toLocaleString()}`);
      } else {
        console.log('❌ Pembayaran gagal:', result.error);
      }
    } catch (error) {
      console.error('❌ Cash payment error:', error.message);
    }
  }

  async processCustomPayment(warga, unpaidPayments, timeline) {
    try {
      this.clearConsole();
      console.log('💰 Pembayaran dengan Nominal Custom\n');
      console.log(`👤 Warga: ${warga.namaWarga}`);
      console.log(`💳 Current Credit: Rp${warga.creditBalance.toLocaleString()}`);
      
      // Show available unpaid bills
      console.log('\n📋 Tagihan yang tersedia:');
      let totalUnpaid = 0;
      unpaidPayments.forEach((payment, index) => {
        const statusIcon = payment.status === 'terlambat' ? '🔴' : '🟡';
        console.log(`${statusIcon} ${payment.periodLabel}: Rp${payment.amount.toLocaleString()} (${payment.status})`);
        totalUnpaid += payment.amount;
      });
      
      console.log(`\n💰 Total tagihan belum bayar: Rp${totalUnpaid.toLocaleString()}`);
      console.log(`💳 Credit tersedia: Rp${warga.creditBalance.toLocaleString()}`);
      console.log(`📊 Total yang bisa dibayar: Rp${(totalUnpaid + warga.creditBalance).toLocaleString()}`);

      const { customAmount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'customAmount',
          message: '💵 Masukkan nominal pembayaran (Rp):',
          validate: (value) => {
            if (value === null || value === undefined) return 'Masukkan nominal yang valid';
            if (value <= 0) return 'Nominal harus lebih dari 0';
            if (value > totalUnpaid * 2) return `Nominal terlalu besar (maksimal: Rp${(totalUnpaid * 2).toLocaleString()})`;
            return true;
          }
        }
      ]);

      if (customAmount === null || customAmount === undefined) {
        console.log('⚠️ Pembayaran dibatalkan');
        await this.processPaymentFlow(warga);
        return;
      }

      console.log(`\n💵 Nominal yang akan dibayar: Rp${customAmount.toLocaleString()}`);
      
      // Auto-allocate payment to unpaid bills (oldest first)
      let remainingAmount = customAmount;
      let availableCredit = warga.creditBalance;
      const paymentAllocations = [];
      
      for (const payment of unpaidPayments) {
        if (remainingAmount <= 0) break;
        
        const paymentAmount = Math.min(remainingAmount, payment.amount);
        let creditUsed = 0;
        let cashUsed = paymentAmount;
        
        // Use credit first if available
        if (availableCredit > 0) {
          creditUsed = Math.min(availableCredit, paymentAmount);
          cashUsed = paymentAmount - creditUsed;
          availableCredit -= creditUsed;
        }
        
        paymentAllocations.push({
          payment: payment,
          amount: paymentAmount,
          creditUsed: creditUsed,
          cashUsed: cashUsed,
          fullyPaid: paymentAmount >= payment.amount
        });
        
        remainingAmount -= paymentAmount;
      }
      
      // Calculate excess for credit top-up
      let excessForCredit = remainingAmount;
      const maxCreditTopUp = totalUnpaid; // Limit credit top-up
      excessForCredit = Math.min(excessForCredit, maxCreditTopUp);
      
      // Show payment breakdown
      console.log('\n📋 Rincian pembayaran:');
      let totalCreditUsed = 0;
      let totalCashUsed = 0;
      
      paymentAllocations.forEach((allocation, index) => {
        const { payment, amount, creditUsed, cashUsed, fullyPaid } = allocation;
        const status = fullyPaid ? '✅ LUNAS' : `⏳ SEBAGIAN (${((amount / payment.amount) * 100).toFixed(1)}%)`;
        
        console.log(`${index + 1}. ${payment.periodLabel}: Rp${amount.toLocaleString()} - ${status}`);
        if (creditUsed > 0) console.log(`   💳 Credit: Rp${creditUsed.toLocaleString()}`);
        if (cashUsed > 0) console.log(`   💵 Cash: Rp${cashUsed.toLocaleString()}`);
        
        totalCreditUsed += creditUsed;
        totalCashUsed += cashUsed;
      });
      
      if (excessForCredit > 0) {
        console.log(`\n💰 Kelebihan ditambahkan ke credit: Rp${excessForCredit.toLocaleString()}`);
      }
      
      const newCreditBalance = warga.creditBalance - totalCreditUsed + excessForCredit;
      console.log(`\n💳 Credit balance baru: Rp${newCreditBalance.toLocaleString()}`);
      
      // Confirm payment
      const { confirmPayment } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmPayment',
          message: '✅ Konfirmasi pembayaran ini?',
          default: true
        }
      ]);
      
      if (!confirmPayment) {
        console.log('⚠️ Pembayaran dibatalkan');
        await this.processPaymentFlow(warga);
        return;
      }
      
      // Process each payment allocation
      console.log('\n🔄 Memproses pembayaran...');
      let allSuccess = true;
      
      for (const allocation of paymentAllocations) {
        const { payment, amount, fullyPaid } = allocation;
        
        try {
          if (fullyPaid) {
            // Full payment
            const result = await this.processPaymentWithCredit(
              timeline.id,
              payment.periodKey,
              warga.id,
              amount,
              'cash'
            );
            
            if (!result.success) {
              console.log(`❌ Gagal memproses ${payment.periodLabel}: ${result.error}`);
              allSuccess = false;
            } else {
              console.log(`✅ ${payment.periodLabel} berhasil dibayar penuh`);
            }
          } else {
            // Partial payment - for now, we'll add to credit instead
            console.log(`⏳ ${payment.periodLabel} - pembayaran sebagian (akan diimplementasi)`);
          }
        } catch (error) {
          console.log(`❌ Error processing ${payment.periodLabel}: ${error.message}`);
          allSuccess = false;
        }
      }
      
      // Handle excess credit top-up
      if (excessForCredit > 0) {
        try {
          const userRef = doc(db, 'users', warga.id);
          const userDoc = await getDoc(userRef);
          const currentBalance = userDoc.data().creditBalance || 0;
          
          await updateDoc(userRef, {
            creditBalance: currentBalance + excessForCredit,
            updatedAt: new Date()
          });
          
          console.log(`✅ Credit top-up berhasil: Rp${excessForCredit.toLocaleString()}`);
        } catch (error) {
          console.log(`❌ Gagal menambah credit: ${error.message}`);
          allSuccess = false;
        }
      }
      
      if (allSuccess) {
        console.log('\n🎉 Semua pembayaran berhasil diproses!');
      } else {
        console.log('\n⚠️ Beberapa pembayaran mengalami masalah');
      }
      
    } catch (error) {
      console.error('❌ Custom payment error:', error.message);
    }
  }

  async getWargaPaymentHistory(wargaId) {
    try {
      // Get active timeline
      const timelinesRef = collection(db, 'active_timeline');
      const timelineSnapshot = await getDocs(timelinesRef);
      
      if (timelineSnapshot.empty) {
        return { success: false, error: 'No active timeline found' };
      }
      
      const timelineDoc = timelineSnapshot.docs[0];
      const timeline = { id: timelineDoc.id, ...timelineDoc.data() };
      
      // Get payments for active periods
      const activePeriods = Object.keys(timeline.periods).filter(
        periodKey => timeline.periods[periodKey].active
      );
      
      const paymentPromises = activePeriods.map(async (periodKey) => {
        try {
          const paymentRef = doc(
            db, 
            'payments', 
            timeline.id, 
            'periods', 
            periodKey, 
            'warga_payments', 
            wargaId
          );
          
          const paymentDoc = await getDoc(paymentRef);
          const period = timeline.periods[periodKey];
          
          if (paymentDoc.exists()) {
            return {
              id: paymentDoc.id,
              ...paymentDoc.data(),
              periodKey,
              periodData: period
            };
          } else {
            // Create default payment record
            return {
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
              periodKey,
              periodData: period
            };
          }
        } catch (error) {
          console.warn(`Error loading period ${periodKey}:`, error);
          return null;
        }
      });
      
      const allPayments = (await Promise.all(paymentPromises)).filter(p => p !== null);
      
      return { success: true, payments: allPayments, timeline };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return { success: false, error: error.message };
    }
  }

  async processPaymentWithCredit(timelineId, periodKey, wargaId, paymentAmount, paymentMethod) {
    try {
      // Get current credit balance
      const userRef = doc(db, 'users', wargaId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const currentCredit = userData.creditBalance || 0;
      
      // Get payment details
      const paymentRef = doc(
        db, 
        'payments', 
        timelineId, 
        'periods', 
        periodKey, 
        'warga_payments', 
        wargaId
      );
      
      const paymentDoc = await getDoc(paymentRef);
      let paymentAmount_required;
      
      if (paymentDoc.exists()) {
        paymentAmount_required = paymentDoc.data().amount;
      } else {
        // Get from timeline
        const timelineRef = doc(db, 'active_timeline', timelineId);
        const timelineDoc = await getDoc(timelineRef);
        if (timelineDoc.exists()) {
          const timeline = timelineDoc.data();
          paymentAmount_required = timeline.periods[periodKey].amount;
        } else {
          throw new Error('Timeline not found');
        }
      }
      
      let newCreditBalance = currentCredit;
      let creditApplied = 0;
      let excessCredit = 0;
      
      // Calculate credit application
      if (currentCredit > 0) {
        creditApplied = Math.min(currentCredit, paymentAmount_required);
        newCreditBalance = currentCredit - creditApplied;
      }
      
      // Calculate remaining after credit
      const remainingAfterCredit = paymentAmount_required - creditApplied;
      
      // Handle excess payment
      if (paymentAmount > remainingAfterCredit) {
        excessCredit = paymentAmount - remainingAfterCredit;
        const maxTotalCredit = paymentAmount_required * 3;
        const finalExcessCredit = Math.min(excessCredit, maxTotalCredit - newCreditBalance);
        newCreditBalance += finalExcessCredit;
      }
      
      // Update payment status
      const updateData = {
        status: 'lunas',
        paymentDate: new Date(),
        paymentMethod: paymentMethod,
        creditApplied,
        remainingAmount: 0,
        paidAmount: remainingAfterCredit,
        totalPaid: paymentAmount,
        notes: creditApplied > 0 ? `Credit applied: ${creditApplied}` : '',
        updatedAt: new Date()
      };
      
      // Create payment record if it doesn't exist
      if (!paymentDoc.exists()) {
        const timelineRef = doc(db, 'active_timeline', timelineId);
        const timelineDoc = await getDoc(timelineRef);
        const timeline = timelineDoc.data();
        const period = timeline.periods[periodKey];
        
        updateData.id = `${wargaId}_${periodKey}`;
        updateData.wargaId = wargaId;
        updateData.period = periodKey;
        updateData.periodLabel = period.label;
        updateData.amount = period.amount;
        updateData.dueDate = period.dueDate;
        updateData.createdAt = new Date();
      }
      
      await updateDoc(paymentRef, updateData);
      
      // Update credit balance
      await updateDoc(userRef, {
        creditBalance: newCreditBalance,
        updatedAt: new Date()
      });
      
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
      console.error('Error processing payment:', error);
      return { success: false, error: error.message };
    }
  }

  shutdown() {
    console.log('🛑 Shutting down ESP32 Payment Simulator...');
    this.stopCurrentSession();
    process.exit(0);
  }
}

// Create and start simulator
const simulator = new ESP32PaymentSimulator();

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