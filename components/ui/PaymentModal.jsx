import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";
import { lightTheme } from "../../constants/Colors";
import Button from "./Button";
import { 
  startHardwarePaymentWithTimeout,
  subscribeToPaymentProgress,
  subscribeToPaymentResults,
  completePaymentSession,
  clearModeTimeout,
  getMode,
  clearPaymentStatus
} from "../../services/rtdbModeService";
import { processPaymentWithCredit } from "../../services/wargaPaymentService";
import { getActiveTimeline } from "../../services/timelineService";

const PaymentModal = ({ visible, payment, onClose, onPaymentSuccess, creditBalance = 0, userProfile = null }) => {
  const { theme, loading: settingsLoading } = useSettings();
  const colors = lightTheme;
  
  // Main payment flow states
  const [paymentSource, setPaymentSource] = useState(null); // 'hardware' | 'app'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState('exact'); // Only for app payments
  const [customAmount, setCustomAmount] = useState('');
  
  // Hardware payment states
  const [hardwarePayment, setHardwarePayment] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState('waiting');
  const [paymentTimeoutId, setPaymentTimeoutId] = useState(null);
  const [paymentProgressListener, setPaymentProgressListener] = useState(null);
  const [paymentResultsListener, setPaymentResultsListener] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePaymentAmount = () => {
    if (!payment) return {
      originalAmount: 0,
      baseAmount: 0,
      creditApplied: 0,
      amountAfterCredit: 0,
      payableToBePaid: 0,
      excessAmount: 0,
      willBecomeCredit: 0
    };
    
    const baseAmount = payment.remainingAmount || payment.amount;
    const creditApplied = Math.min(creditBalance, baseAmount);
    const amountAfterCredit = Math.max(0, baseAmount - creditApplied);
    
    let payableToBePaid = amountAfterCredit;
    let excessAmount = 0;
    let willBecomeCredit = 0;
    
    if (paymentMode === 'custom' && customAmount) {
      const customAmountNum = parseInt(customAmount) || 0;
      payableToBePaid = customAmountNum;
      
      if (customAmountNum > amountAfterCredit) {
        excessAmount = customAmountNum - amountAfterCredit;
        const maxCredit = payment.amount * 3;
        willBecomeCredit = Math.min(excessAmount, maxCredit - creditBalance);
      }
    }
    
    return {
      originalAmount: payment.amount,
      baseAmount,
      creditApplied,
      amountAfterCredit,
      payableToBePaid,
      excessAmount,
      willBecomeCredit
    };
  };

  const { 
    originalAmount, 
    baseAmount, 
    creditApplied, 
    amountAfterCredit, 
    payableToBePaid, 
    excessAmount, 
    willBecomeCredit 
  } = calculatePaymentAmount();

  if (!payment) return null;

  const paymentMethods = [
    {
      id: "bca",
      name: "Transfer BCA",
      icon: "🏦",
      description: "Transfer ke rekening BCA Jimpitan",
      details: "Rek: 1234567890 a.n. Bendahara Jimpitan",
    },
    {
      id: "mandiri",
      name: "Transfer Mandiri",
      icon: "🏦",
      description: "Transfer ke rekening Mandiri Jimpitan",
      details: "Rek: 0987654321 a.n. Bendahara Jimpitan",
    },
    {
      id: "qris",
      name: "QRIS",
      icon: "📱",
      description: "Scan QRIS untuk pembayaran",
      details: "Scan QR Code dengan aplikasi mobile banking",
    },
    {
      id: "gopay",
      name: "GoPay",
      icon: "💚",
      description: "Bayar dengan GoPay",
      details: "Transfer ke 081234567890",
    },
    {
      id: "ovo",
      name: "OVO",
      icon: "💜",
      description: "Bayar dengan OVO",
      details: "Transfer ke 081234567890",
    },
    {
      id: "dana",
      name: "DANA",
      icon: "💙",
      description: "Bayar dengan DANA",
      details: "Transfer ke 081234567890",
    },
  ];

  const handlePaymentSourceSelect = (source) => {
    // Validate state before proceeding
    if (processing || hardwarePayment) {
      Alert.alert("Tunggu", "Pembayaran sedang diproses. Mohon tunggu hingga selesai.");
      return;
    }
    
    setPaymentSource(source);
    if (source === 'hardware') {
      // Hardware payment doesn't need method/mode selection
      handleHardwarePayment();
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handlePayNow = async () => {
    // Validate payment state
    if (processing) {
      Alert.alert("Tunggu", "Pembayaran sedang diproses. Mohon tunggu hingga selesai.");
      return;
    }
    
    if ((amountAfterCredit || 0) > 0 && !selectedMethod) {
      Alert.alert(
        "Pilih Metode",
        "Silakan pilih metode pembayaran terlebih dahulu"
      );
      return;
    }
    
    // Validate payment data
    if (!payment || !userProfile) {
      Alert.alert("Error", "Data pembayaran tidak lengkap. Silakan coba lagi.");
      return;
    }

    // Validate custom amount
    if (paymentMode === 'custom' && customAmount) {
      const customAmountNum = parseInt(customAmount) || 0;
      if (customAmountNum < (amountAfterCredit || 0)) {
        Alert.alert(
          "Jumlah Tidak Valid",
          `Minimum pembayaran adalah ${formatCurrency(amountAfterCredit || 0)}`
        );
        return;
      }
    }

    setProcessing(true);

    const finalAmount = paymentMode === 'custom' && customAmount 
      ? parseInt(customAmount) 
      : (amountAfterCredit || 0);

    // Real payment processing instead of simulation
    try {
      // Get active timeline
      const timelineResult = await getActiveTimeline();
      if (!timelineResult.success) {
        throw new Error('Timeline aktif tidak ditemukan');
      }
      
      // Process payment with credit logic
      const result = await processPaymentWithCredit(
        timelineResult.timeline.id,
        payment.periodKey,
        userProfile?.id || payment.wargaId,
        finalAmount,
        selectedMethod?.id || 'digital_payment'
      );
      
      if (result.success) {
        const successMessage = result.excessCredit > 0 
          ? `Pembayaran ${payment.periodData?.label} berhasil! Kelebihan ${formatCurrency(result.excessCredit)} menjadi credit.`
          : `Pembayaran ${payment.periodData?.label} sebesar ${formatCurrency(finalAmount)} berhasil diproses.`;

        Alert.alert(
          "Pembayaran Berhasil! 🎉",
          successMessage,
          [
            {
              text: "OK",
              onPress: () => {
                setProcessing(false);
                setSelectedMethod(null);
                setPaymentMode('exact');
                setCustomAmount('');
                onPaymentSuccess(payment, selectedMethod?.id || 'digital_payment', finalAmount);
                onClose();
              },
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Gagal memproses pembayaran');
      }
    } catch (error) {
      setProcessing(false);
      console.error('Payment processing error:', error);
      Alert.alert(
        "Gagal Memproses Pembayaran",
        error.message || 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.',
        [{ text: "OK" }]
      );
    }
  };

  const handleHardwarePayment = async () => {
    setHardwarePayment(true);
    setHardwareStatus('waiting');
    
    Alert.alert(
      "🔥 Mode-based Hardware Payment",
      "Revolutionary RTDB mode akan mengatur ESP32 untuk pembayaran:\n\n🚀 ESP32 akan switch ke payment mode\n⚡ Real-time RFID detection aktif\n💰 Currency recognition siap\n\nSesi timeout: 5 menit (app-managed)",
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => {
            setHardwarePayment(false);
            setHardwareStatus('waiting');
          }
        },
        {
          text: "Mulai Mode Payment",
          onPress: async () => {
            await startModeBasedPaymentSession();
          }
        }
      ]
    );
  };

  const startModeBasedPaymentSession = async () => {
    try {
      setHardwareStatus('scanning');
      
      // Revolutionary mode-based payment with RFID code (not user_id!)
      const rfidCode = userProfile?.rfidWarga || payment.rfidCode || '';
      
      if (!rfidCode) {
        setHardwareStatus('error');
        Alert.alert("Error", "RFID warga tidak ditemukan. Silakan hubungi bendahara untuk pairing RFID.");
        return;
      }
      
      const result = await startHardwarePaymentWithTimeout(
        rfidCode,
        amountAfterCredit,
        userProfile?.id || payment.wargaId || '',  // userId
        payment.timelineId || '',                   // timelineId
        payment.periodKey || payment.period || '',  // periodKey
        300 // 5 minutes timeout
      );

      if (result.success) {
        setPaymentTimeoutId(result.timeoutId);
        
        // Subscribe to real-time payment progress
        const progressUnsubscribe = subscribeToPaymentProgress((progressData) => {
          handleModeBasedPaymentProgress(progressData);
        });
        setPaymentProgressListener(() => progressUnsubscribe);
        
        // Subscribe to final payment results
        const resultsUnsubscribe = subscribeToPaymentResults((resultData) => {
          console.log('💰 Raw payment data:', resultData);
          handleModeBasedPaymentResults(resultData);
        });
        setPaymentResultsListener(() => resultsUnsubscribe);
        
      } else {
        setHardwareStatus('error');
        Alert.alert("Error", "Gagal memulai mode-based payment session");
      }
    } catch (error) {
      setHardwareStatus('error');
      Alert.alert("Error", "Terjadi kesalahan saat memulai mode-based payment");
    }
  };

  const handleModeBasedPaymentProgress = (progressData) => {
    if (!progressData) return;
    
    // Handle real-time progress updates from ESP32
    if (progressData.amount_detected && progressData.amount_detected !== '') {
      setHardwareStatus('processing');
    }
    
    // Show immediate feedback for different statuses
    if (progressData.status) {
      console.log('💰 Payment progress:', progressData.status);
      if (progressData.status === 'rfid_salah') {
        // Don't wait for results listener, show error immediately
        handleModeBasedPaymentResults(progressData);
      }
    }
  };

  const handleModeBasedPaymentResults = (resultData) => {
    console.log('🔥 Payment result received:', resultData);
    if (!resultData || !resultData.status) return;
    
    // Handle different status responses
    if (resultData.status === 'completed') {
      // Cleanup listeners and timeout
      cleanupModeBasedPayment();
      
      setHardwareStatus('success');
      
      const detectedAmount = parseInt(resultData.amount_detected) || 0;
      const requiredAmount = amountAfterCredit || 0;
      
      // Check if payment is partial (kurang bayar)
      if (detectedAmount < requiredAmount) {
        const remaining = requiredAmount - detectedAmount;
        
        Alert.alert(
          "Pembayaran Sebagian Diterima 💰",
          `Pembayaran diterima: ${formatCurrency(detectedAmount)}\n` +
          `Jumlah yang dibutuhkan: ${formatCurrency(requiredAmount)}\n\n` +
          `✅ Pembayaran sebagian berhasil diproses\n` +
          `💡 Sisa pembayaran: ${formatCurrency(remaining)}`,
          [
            {
              text: "OK",
              onPress: () => {
                setHardwarePayment(false);
                setHardwareStatus('waiting');
                // Pass detected amount for partial payment processing
                onPaymentSuccess(payment, 'hardware_cash_partial', detectedAmount);
                onClose();
              }
            }
          ]
        );
      } else {
        // Normal full payment or overpayment
        const overpayment = detectedAmount - requiredAmount;
        let message = `Pembayaran ${payment.periodData?.label} berhasil!\n\nJumlah: ${formatCurrency(detectedAmount)}`;
        
        if (overpayment > 0) {
          message += `\n\n✨ Kelebihan ${formatCurrency(overpayment)} ditambahkan ke credit`;
        }
        
        Alert.alert(
          "Pembayaran Berhasil! 🎉",
          message,
          [
            {
              text: "OK",
              onPress: () => {
                setHardwarePayment(false);
                setHardwareStatus('waiting');
                onPaymentSuccess(payment, 'hardware_cash', detectedAmount);
                onClose();
              }
            }
          ]
        );
      }
    } else if (resultData.status === 'rfid_salah') {
      setHardwareStatus('error');
      Alert.alert(
        "RFID Salah! ⚠️",
        "Kartu RFID yang Anda gunakan tidak sesuai. Silakan gunakan kartu RFID Anda yang benar.",
        [
          {
            text: "Coba Lagi",
            onPress: async () => {
              setHardwareStatus('scanning');
              // Clear status in RTDB for ESP32 to set new status
              await clearPaymentStatus();
              console.log('🔄 Status cleared - ESP32 can set new status');
            }
          },
          {
            text: "Batal",
            style: "cancel",
            onPress: () => {
              cleanupModeBasedPayment();
              setHardwarePayment(false);
              setHardwareStatus('waiting');
            }
          }
        ]
      );
    } else if (resultData.status === 'failed') {
      setHardwareStatus('error');
      Alert.alert(
        "Pembayaran Gagal",
        "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.",
        [
          {
            text: "Coba Lagi",
            onPress: async () => {
              setHardwareStatus('scanning');
              // Clear status in RTDB for retry
              await clearPaymentStatus();
              console.log('🔄 Status cleared for retry');
            }
          },
          {
            text: "Batal",
            style: "cancel",
            onPress: () => {
              cleanupModeBasedPayment();
              setHardwarePayment(false);
              setHardwareStatus('waiting');
            }
          }
        ]
      );
    }
  };

  const cleanupModeBasedPayment = () => {
    try {
      // Clear timeout
      if (paymentTimeoutId) {
        clearModeTimeout(paymentTimeoutId);
        setPaymentTimeoutId(null);
      }
      
      // Unsubscribe from listeners
      if (paymentProgressListener) {
        paymentProgressListener();
        setPaymentProgressListener(null);
      }
      
      if (paymentResultsListener) {
        paymentResultsListener();
        setPaymentResultsListener(null);
      }
      
      // Complete payment session and reset RTDB to idle
      completePaymentSession();
    } catch (error) {
      console.error('Error during payment cleanup:', error);
      // Force reset state even if cleanup fails
      setPaymentTimeoutId(null);
      setPaymentProgressListener(null);
      setPaymentResultsListener(null);
    }
  };

  const simulateHardwarePayment = () => {
    // Simulate hardware payment process for demo
    setTimeout(() => {
      setHardwareStatus('processing');
    }, 3000);
    
    setTimeout(() => {
      setHardwareStatus('success');
      Alert.alert(
        "Pembayaran Berhasil! 🎉",
        `Pembayaran ${payment.periodData?.label} melalui alat Jimpitan berhasil diproses.`,
        [
          {
            text: "OK",
            onPress: () => {
              setHardwarePayment(false);
              setHardwareStatus('waiting');
              onPaymentSuccess(payment, 'hardware_cash', amountAfterCredit);
              onClose();
            }
          }
        ]
      );
    }, 6000);
  };

  const handleClose = async () => {
    if (!processing && !hardwarePayment) {
      // Cleanup mode-based payment session
      cleanupModeBasedPayment();
      
      setPaymentSource(null);
      setSelectedMethod(null);
      setPaymentMode('exact');
      setCustomAmount('');
      setHardwarePayment(false);
      setHardwareStatus('waiting');
      onClose();
    } else if (hardwarePayment) {
      // Ask user if they want to cancel the active mode-based session
      Alert.alert(
        "Cancel Mode-based Payment?",
        "Ada sesi mode-based payment yang sedang aktif. Batalkan sesi ini?",
        [
          { text: "Tidak", style: "cancel" },
          {
            text: "Ya, Batalkan",
            style: "destructive",
            onPress: () => {
              cleanupModeBasedPayment();
              setHardwarePayment(false);
              setHardwareStatus('waiting');
              setPaymentSource(null);
              setSelectedMethod(null);
              setPaymentMode('exact');
              setCustomAmount('');
              onClose();
            }
          }
        ]
      );
    }
  };

  if (settingsLoading) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContainer, { backgroundColor: colors.white }]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.gray200 }]}
          >
            <Text style={[styles.modalTitle, { color: colors.gray900 }]}>
              {!paymentSource ? "Pilih Sumber Pembayaran" : paymentSource === 'hardware' ? "Pembayaran Hardware" : "Pilih Metode Pembayaran"}
            </Text>
            {!processing && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.gray100 },
                ]}
                onPress={handleClose}
              >
                <Text
                  style={[styles.closeButtonText, { color: colors.gray600 }]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.paymentInfo,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Text style={[styles.periodTitle, { color: colors.gray900 }]}>
                💳 {payment.periodData?.label || `Periode ${payment.periodData?.number}`}
              </Text>
              <Text style={[styles.originalAmountText, { color: colors.gray600 }]}>
                Nominal: {formatCurrency(originalAmount || 0)}
              </Text>
              
              {creditApplied > 0 && (
                <View style={styles.creditSection}>
                  <Text style={[styles.creditText, { color: colors.green }]}>
                    💰 Credit: -{formatCurrency(creditApplied || 0)}
                  </Text>
                  <View style={[styles.divider, { backgroundColor: colors.gray300 }]} />
                </View>
              )}
              
              <Text style={[styles.finalAmountText, { color: colors.primary }]}>
                Yang harus dibayar: {formatCurrency(amountAfterCredit || 0)}
              </Text>
              
              {(amountAfterCredit || 0) === 0 && (
                <Text style={[styles.paidWithCreditText, { color: colors.green }]}>
                  ✅ Lunas dengan Credit
                </Text>
              )}
            </View>

            {/* Payment Source Selection */}
            {!paymentSource && (amountAfterCredit || 0) > 0 && (
              <View style={styles.paymentSourceSection}>
                <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
                  Pilih Sumber Pembayaran:
                </Text>
                
                {/* Hardware Payment Option */}
                <TouchableOpacity
                  style={[
                    styles.paymentSourceCard,
                    { backgroundColor: colors.primary + "15", borderColor: colors.primary }
                  ]}
                  onPress={() => handlePaymentSourceSelect('hardware')}
                  disabled={processing}
                >
                  <View style={[styles.sourceIcon, { backgroundColor: colors.primary }]}>
                    <Text style={styles.sourceIconText}>🔥</Text>
                  </View>
                  <View style={styles.sourceInfo}>
                    <Text style={[styles.sourceName, { color: colors.primary }]}>
                      🚀 Pembayaran dari Alat
                    </Text>
                    <Text style={[styles.sourceDescription, { color: colors.gray700 }]}>
                      Mode-based hardware payment dengan RFID + Currency detection
                    </Text>
                    <Text style={[styles.sourceDetails, { color: colors.gray600 }]}>
                      ⚡ Tap kartu RFID → Masukkan uang → Otomatis selesai
                    </Text>
                  </View>
                  <View style={[styles.sourceArrow, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.sourceArrowText, { color: colors.white }]}>→</Text>
                  </View>
                </TouchableOpacity>

                {/* App Payment Option */}
                <TouchableOpacity
                  style={[
                    styles.paymentSourceCard,
                    { backgroundColor: colors.gray50, borderColor: colors.gray300 }
                  ]}
                  onPress={() => handlePaymentSourceSelect('app')}
                  disabled={processing}
                >
                  <View style={[styles.sourceIcon, { backgroundColor: colors.gray200 }]}>
                    <Text style={styles.sourceIconText}>💳</Text>
                  </View>
                  <View style={styles.sourceInfo}>
                    <Text style={[styles.sourceName, { color: colors.gray900 }]}>
                      📱 Pembayaran dari Aplikasi
                    </Text>
                    <Text style={[styles.sourceDescription, { color: colors.gray700 }]}>
                      Transfer bank, e-wallet, atau metode digital lainnya
                    </Text>
                    <Text style={[styles.sourceDetails, { color: colors.gray600 }]}>
                      💰 Bisa bayar pas atau custom amount sesuai kebutuhan
                    </Text>
                  </View>
                  <View style={[styles.sourceArrow, { backgroundColor: colors.gray400 }]}>
                    <Text style={[styles.sourceArrowText, { color: colors.white }]}>→</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Payment Mode Selection - Only for App payments */}
            {paymentSource === 'app' && (amountAfterCredit || 0) > 0 && (
              <View style={styles.paymentModeSection}>
                <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
                  Mode Pembayaran:
                </Text>
                <View style={styles.paymentModeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      {
                        backgroundColor: paymentMode === 'exact' ? colors.primary : colors.gray100,
                        borderColor: paymentMode === 'exact' ? colors.primary : colors.gray300,
                      },
                    ]}
                    onPress={() => setPaymentMode('exact')}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        { color: paymentMode === 'exact' ? colors.white : colors.gray700 },
                      ]}
                    >
                      Bayar Pas
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      {
                        backgroundColor: paymentMode === 'custom' ? colors.primary : colors.gray100,
                        borderColor: paymentMode === 'custom' ? colors.primary : colors.gray300,
                      },
                    ]}
                    onPress={() => setPaymentMode('custom')}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        { color: paymentMode === 'custom' ? colors.white : colors.gray700 },
                      ]}
                    >
                      Bayar Custom
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {paymentMode === 'custom' && (
                  <View style={styles.customAmountSection}>
                    <Text style={[styles.customAmountLabel, { color: colors.gray700 }]}>
                      Jumlah Pembayaran:
                    </Text>
                    <TextInput
                      style={[
                        styles.customAmountInput,
                        {
                          backgroundColor: colors.white,
                          borderColor: colors.gray300,
                          color: colors.gray900,
                        },
                      ]}
                      placeholder={`Min: ${formatCurrency(amountAfterCredit || 0)}`}
                      value={customAmount}
                      onChangeText={setCustomAmount}
                      keyboardType="numeric"
                    />
                    
                    {(excessAmount || 0) > 0 && (
                      <View style={[styles.excessPreview, { backgroundColor: colors.primary + '10' }]}>
                        <Text style={[styles.excessText, { color: colors.primary }]}>
                          💡 Kelebihan Pembayaran:
                        </Text>
                        <Text style={[styles.excessAmount, { color: colors.gray700 }]}>
                          {formatCurrency(excessAmount || 0)} → Credit {formatCurrency(willBecomeCredit || 0)}
                        </Text>
                        {(willBecomeCredit || 0) < (excessAmount || 0) && (
                          <Text style={[styles.excessWarning, { color: colors.warning }]}>
                            ⚠️ Credit dibatasi maksimal 3x nominal periode
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Payment Methods - Only for App payments */}
            {paymentSource === 'app' && amountAfterCredit > 0 && !hardwarePayment && (
              <View style={styles.methodsSection}>
                <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
                  Pilih Metode Pembayaran Digital:
                </Text>

              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: colors.white,
                      borderColor:
                        selectedMethod?.id === method.id
                          ? colors.primary
                          : colors.gray200,
                    },
                    selectedMethod?.id === method.id && {
                      backgroundColor: colors.primary + "08",
                    },
                  ]}
                  onPress={() => handleMethodSelect(method)}
                  disabled={processing}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: colors.gray100 },
                    ]}
                  >
                    <Text style={styles.methodIconText}>{method.icon}</Text>
                  </View>

                  <View style={styles.methodInfo}>
                    <Text
                      style={[styles.methodName, { color: colors.gray900 }]}
                    >
                      {method.name}
                    </Text>
                    <Text
                      style={[
                        styles.methodDescription,
                        { color: colors.gray600 },
                      ]}
                    >
                      {method.description}
                    </Text>
                    <Text
                      style={[styles.methodDetails, { color: colors.gray500 }]}
                    >
                      {method.details}
                    </Text>
                  </View>

                  {selectedMethod?.id === method.id && (
                    <View
                      style={[
                        styles.selectedIcon,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectedIconText,
                          { color: colors.white },
                        ]}
                      >
                        ✓
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              </View>
            )}

            {processing && paymentSource === 'app' && (
              <View style={styles.processingSection}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[styles.processingText, { color: colors.gray900 }]}
                >
                  Memproses pembayaran melalui {selectedMethod?.name}...
                </Text>
                <Text
                  style={[styles.processingSubtext, { color: colors.gray600 }]}
                >
                  Mohon tunggu sebentar
                </Text>
              </View>
            )}

            {hardwarePayment && (
              <View style={styles.hardwareProcessingSection}>
                <View style={[styles.hardwareStatusCard, { backgroundColor: colors.primary + "10" }]}>
                  {hardwareStatus === 'waiting' && (
                    <>
                      <Text style={styles.hardwareStatusIcon}>⏳</Text>
                      <Text style={[styles.hardwareStatusTitle, { color: colors.primary }]}>
                        Menunggu Konfirmasi
                      </Text>
                      <Text style={[styles.hardwareStatusText, { color: colors.gray700 }]}>
                        Klik &quot;Mulai&quot; untuk memulai sesi pembayaran
                      </Text>
                    </>
                  )}
                  
                  {hardwareStatus === 'scanning' && (
                    <>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={[styles.hardwareStatusTitle, { color: colors.primary }]}>
                        🔥 Mode Payment Aktif di ESP32
                      </Text>
                      <Text style={[styles.hardwareStatusText, { color: colors.gray700 }]}>
                        ⚡ ESP32 switched to payment mode via RTDB
                      </Text>
                      <Text style={[styles.hardwareStatusSubtext, { color: colors.gray600 }]}>
                        🚀 Real-time RFID detection aktif • Auto-timeout 5 menit
                      </Text>
                    </>
                  )}
                  
                  {hardwareStatus === 'processing' && (
                    <>
                      <ActivityIndicator size="large" color={colors.success} />
                      <Text style={[styles.hardwareStatusTitle, { color: colors.success }]}>
                        💰 Mode-based Processing
                      </Text>
                      <Text style={[styles.hardwareStatusText, { color: colors.gray700 }]}>
                        ⚡ RFID detected via RTDB • KNN currency detection active
                      </Text>
                    </>
                  )}
                  
                  {hardwareStatus === 'success' && (
                    <>
                      <Text style={styles.hardwareStatusIcon}>🔥</Text>
                      <Text style={[styles.hardwareStatusTitle, { color: colors.success }]}>
                        Mode-based Payment Success!
                      </Text>
                      <Text style={[styles.hardwareStatusText, { color: colors.gray700 }]}>
                        🚀 Revolutionary RTDB architecture worked perfectly!
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View
            style={[styles.modalFooter, { borderTopColor: colors.gray200 }]}
          >
            <Button
              title="Batal"
              onPress={handleClose}
              variant="outline"
              style={[styles.cancelButton, { borderColor: colors.gray400 }]}
              disabled={processing || hardwarePayment}
            />
            
            {(amountAfterCredit || 0) === 0 ? (
              <Button
                title="Gunakan Credit"
                onPress={handlePayNow}
                style={[styles.payButton, { backgroundColor: colors.green }]}
                disabled={processing || hardwarePayment}
              />
            ) : hardwarePayment ? (
              <Button
                title={
                  hardwareStatus === 'scanning' ? "🔥 Mode Payment Aktif..." : 
                  hardwareStatus === 'processing' ? "⚡ Processing via RTDB..." :
                  "🚀 Mode-based Payment"
                }
                onPress={() => {}}
                style={[
                  styles.payButton,
                  {
                    backgroundColor: hardwareStatus === 'processing' ? colors.success : colors.primary,
                  },
                ]}
                disabled={true}
              />
            ) : !paymentSource ? (
              <Button
                title="Pilih Sumber Pembayaran"
                onPress={() => {}}
                style={[
                  styles.payButton,
                  { backgroundColor: colors.gray400 },
                ]}
                disabled={true}
              />
            ) : paymentSource === 'app' ? (
              <Button
                title={processing ? "Memproses..." : "Bayar Sekarang"}
                onPress={handlePayNow}
                style={[
                  styles.payButton,
                  {
                    backgroundColor: selectedMethod
                      ? colors.primary
                      : colors.gray400,
                  },
                ]}
                disabled={!selectedMethod || processing}
              />
            ) : (
              <Button
                title="🔥 Hardware Payment Active"
                onPress={() => {}}
                style={[
                  styles.payButton,
                  { backgroundColor: colors.primary },
                ]}
                disabled={true}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    minHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  paymentInfo: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },
  periodTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  originalAmountText: {
    fontSize: 16,
    marginBottom: 8,
  },
  creditSection: {
    marginVertical: 8,
    alignItems: 'center',
  },
  creditText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  finalAmountText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  paidWithCreditText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentSourceSection: {
    marginBottom: 20,
  },
  paymentSourceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sourceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  sourceIconText: {
    fontSize: 24,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    marginBottom: 2,
    fontWeight: "500",
  },
  sourceDetails: {
    fontSize: 12,
    fontStyle: "italic",
  },
  sourceArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceArrowText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentModeSection: {
    marginBottom: 20,
  },
  paymentModeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customAmountSection: {
    marginTop: 12,
  },
  customAmountLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  customAmountInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  excessPreview: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  excessText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  excessAmount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  excessWarning: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  methodsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  methodIconText: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    marginBottom: 2,
  },
  methodDetails: {
    fontSize: 12,
  },
  selectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIconText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  processingSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  processingText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  processingSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },
  hardwarePaymentCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  hardwareIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  hardwareIconText: {
    fontSize: 24,
  },
  hardwareInfo: {
    flex: 1,
  },
  hardwareName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  hardwareDescription: {
    fontSize: 14,
    marginBottom: 2,
    fontWeight: "500",
  },
  hardwareDetails: {
    fontSize: 12,
    fontStyle: "italic",
  },
  hardwareArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  hardwareArrowText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dividerSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  dividerText: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
  },
  hardwareProcessingSection: {
    paddingVertical: 20,
  },
  hardwareStatusCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  hardwareStatusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  hardwareStatusTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  hardwareStatusText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  hardwareStatusSubtext: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default PaymentModal;
