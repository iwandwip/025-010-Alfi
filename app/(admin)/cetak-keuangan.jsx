import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lightTheme } from "../../constants/Colors";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNotification } from "../../contexts/NotificationContext";
import { getAllUsersPaymentStatus } from "../../services/adminPaymentService";
import { getActiveTimeline } from "../../services/timelineService";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../../services/firebase";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import jsPDF from 'jspdf';

const { width } = Dimensions.get('window');

export default function CetakKeuangan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = lightTheme;
  const { showGeneralNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Data states
  const [timeline, setTimeline] = useState(null);
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [saldoTersisa, setSaldoTersisa] = useState(0);
  const [pemasukanList, setPemasukanList] = useState([]);
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalUsers: 0,
    lunas: 0,
    belumBayar: 0,
    terlambat: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    
    try {
      // Load timeline data
      const timelineResult = await getActiveTimeline();
      if (timelineResult.success) {
        setTimeline(timelineResult.timeline);
      }

      // Load pemasukan data
      const pemasukanResult = await getAllUsersPaymentStatus();
      let totalPaid = 0;
      let pemasukanData = [];
      let stats = { totalUsers: 0, lunas: 0, belumBayar: 0, terlambat: 0 };
      
      if (pemasukanResult.success && pemasukanResult.users) {
        stats.totalUsers = pemasukanResult.users.length;
        
        pemasukanResult.users.forEach(user => {
          const paidAmount = user.paymentSummary?.paidAmount || 0;
          totalPaid += paidAmount;
          
          // Count payment status
          stats.lunas += user.paymentSummary?.lunas || 0;
          stats.belumBayar += user.paymentSummary?.belumBayar || 0;
          stats.terlambat += user.paymentSummary?.terlambat || 0;
          
          // Add to pemasukan list if user has paid
          if (paidAmount > 0) {
            pemasukanData.push({
              namaWarga: user.namaWarga,
              totalBayar: paidAmount,
              lunas: user.paymentSummary?.lunas || 0,
              belumBayar: user.paymentSummary?.belumBayar || 0,
              terlambat: user.paymentSummary?.terlambat || 0,
              progressPercentage: user.paymentSummary?.progressPercentage || 0
            });
          }
        });
      }
      
      setTotalPemasukan(totalPaid);
      setPemasukanList(pemasukanData);
      setPaymentStats(stats);
      
      // Load pengeluaran data
      const pengeluaranQuery = query(
        collection(db, "pengeluaran"),
        orderBy("tanggal", "desc")
      );
      const pengeluaranSnapshot = await getDocs(pengeluaranQuery);
      const pengeluaranData = [];
      let totalExpense = 0;
      
      pengeluaranSnapshot.forEach(doc => {
        const data = { id: doc.id, ...doc.data() };
        pengeluaranData.push(data);
        totalExpense += data.jumlah || 0;
      });
      
      setPengeluaranList(pengeluaranData);
      setTotalPengeluaran(totalExpense);
      setSaldoTersisa(totalPaid - totalExpense);
      
    } catch (error) {
      console.error("Error loading data:", error);
      showGeneralNotification(
        "Error",
        "Gagal memuat data keuangan",
        "error"
      );
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generatePDF = async () => {
    if (!timeline) {
      Alert.alert("Error", "Timeline aktif tidak ditemukan");
      return;
    }

    setGenerating(true);

    try {
      // Create new PDF document
      const pdf = new jsPDF();
      
      // Set font (we'll use default fonts for compatibility)
      pdf.setFont("helvetica");
      
      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("LAPORAN KEUANGAN JIMPITAN WARGA", 105, 20, { align: "center" });
      
      // Timeline info
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Timeline: ${timeline.name}`, 20, 35);
      pdf.text(`Periode: ${formatDate(timeline.startDate)} - ${formatDate(timeline.endDate || new Date().toISOString())}`, 20, 45);
      pdf.text(`Tanggal Cetak: ${formatDateTime(new Date().toISOString())}`, 20, 55);
      
      // Summary Section
      let yPos = 75;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("RINGKASAN KEUANGAN", 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Pemasukan: ${formatCurrency(totalPemasukan)}`, 20, yPos);
      yPos += 10;
      pdf.text(`Total Pengeluaran: ${formatCurrency(totalPengeluaran)}`, 20, yPos);
      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.text(`Saldo Tersisa: ${formatCurrency(saldoTersisa)}`, 20, yPos);
      
      // Payment Stats
      yPos += 20;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("STATISTIK PEMBAYARAN", 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Warga: ${paymentStats.totalUsers}`, 20, yPos);
      yPos += 10;
      pdf.text(`Pembayaran Lunas: ${paymentStats.lunas}`, 20, yPos);
      yPos += 10;
      pdf.text(`Belum Bayar: ${paymentStats.belumBayar}`, 20, yPos);
      yPos += 10;
      pdf.text(`Terlambat: ${paymentStats.terlambat}`, 20, yPos);
      
      // Pemasukan Section
      yPos += 20;
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("DETAIL PEMASUKAN", 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("No.", 20, yPos);
      pdf.text("Nama Warga", 35, yPos);
      pdf.text("Total Bayar", 120, yPos);
      pdf.text("Progress", 170, yPos);
      
      yPos += 5;
      pdf.line(20, yPos, 190, yPos); // Header line
      yPos += 10;
      
      pdf.setFont("helvetica", "normal");
      pemasukanList.forEach((item, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`${index + 1}.`, 20, yPos);
        pdf.text(item.namaWarga, 35, yPos);
        pdf.text(formatCurrency(item.totalBayar), 120, yPos);
        pdf.text(`${item.progressPercentage}%`, 170, yPos);
        yPos += 10;
      });
      
      // Pengeluaran Section
      yPos += 20;
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("DETAIL PENGELUARAN", 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("No.", 20, yPos);
      pdf.text("Tanggal", 35, yPos);
      pdf.text("Judul", 85, yPos);
      pdf.text("Jumlah", 150, yPos);
      
      yPos += 5;
      pdf.line(20, yPos, 190, yPos); // Header line
      yPos += 10;
      
      pdf.setFont("helvetica", "normal");
      pengeluaranList.forEach((item, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`${index + 1}.`, 20, yPos);
        pdf.text(formatDate(item.tanggal), 35, yPos);
        
        // Truncate long titles
        const title = item.judul.length > 25 ? item.judul.substring(0, 25) + "..." : item.judul;
        pdf.text(title, 85, yPos);
        pdf.text(formatCurrency(item.jumlah), 150, yPos);
        yPos += 10;
      });
      
      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 290, { align: "center" });
        pdf.text("Generated by Alfi App - Sistem Jimpitan Warga", 105, 295, { align: "center" });
      }
      
      // Save PDF
      const pdfBase64 = pdf.output('datauristring');
      const base64Data = pdfBase64.split(',')[1];
      
      const fileName = `Laporan-Keuangan-${timeline.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Share PDF
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Bagikan Laporan Keuangan',
        });
        
        showGeneralNotification(
          "PDF Berhasil Dibuat",
          `Laporan keuangan telah disimpan sebagai ${fileName}`,
          "success",
          { duration: 4000 }
        );
      } else {
        Alert.alert(
          "PDF Berhasil Dibuat",
          `Laporan keuangan telah disimpan di:\n${fileUri}`,
          [{ text: "OK" }]
        );
      }
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      showGeneralNotification(
        "Error",
        "Gagal membuat PDF laporan keuangan",
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
      <Text style={[styles.summaryTitle, { color: colors.gray900 }]}>
        📊 Preview Laporan Keuangan
      </Text>
      
      {timeline && (
        <View style={styles.timelineInfo}>
          <Text style={[styles.timelineLabel, { color: colors.gray600 }]}>Timeline Aktif:</Text>
          <Text style={[styles.timelineValue, { color: colors.primary }]}>{timeline.name}</Text>
          <Text style={[styles.timelinePeriod, { color: colors.gray500 }]}>
            {formatDate(timeline.startDate)} - {formatDate(timeline.endDate || new Date().toISOString())}
          </Text>
        </View>
      )}
      
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryItem, { backgroundColor: colors.success + '15' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.success }]}>
            <Text style={styles.summaryIconText}>📈</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>Total Pemasukan</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(totalPemasukan)}
          </Text>
          <Text style={[styles.summaryCount, { color: colors.gray500 }]}>
            {pemasukanList.length} warga bayar
          </Text>
        </View>

        <View style={[styles.summaryItem, { backgroundColor: colors.error + '15' }]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.error }]}>
            <Text style={styles.summaryIconText}>📉</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>Total Pengeluaran</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {formatCurrency(totalPengeluaran)}
          </Text>
          <Text style={[styles.summaryCount, { color: colors.gray500 }]}>
            {pengeluaranList.length} transaksi
          </Text>
        </View>
      </View>

      <View style={[styles.saldoSection, { backgroundColor: saldoTersisa >= 0 ? colors.primary + '15' : colors.error + '15' }]}>
        <View style={[styles.saldoIcon, { backgroundColor: saldoTersisa >= 0 ? colors.primary : colors.error }]}>
          <Text style={styles.saldoIconText}>💳</Text>
        </View>
        <Text style={[styles.saldoLabel, { color: colors.gray700 }]}>Saldo Tersisa</Text>
        <Text style={[styles.saldoValue, { color: saldoTersisa >= 0 ? colors.primary : colors.error }]}>
          {formatCurrency(saldoTersisa)}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{paymentStats.totalUsers}</Text>
          <Text style={[styles.statLabel, { color: colors.gray600 }]}>Total Warga</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{paymentStats.lunas}</Text>
          <Text style={[styles.statLabel, { color: colors.gray600 }]}>Lunas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{paymentStats.belumBayar}</Text>
          <Text style={[styles.statLabel, { color: colors.gray600 }]}>Belum Bayar</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.error }]}>{paymentStats.terlambat}</Text>
          <Text style={[styles.statLabel, { color: colors.gray600 }]}>Terlambat</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={[styles.backButtonText, { color: colors.secondary }]}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Cetak Laporan Keuangan</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data laporan..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.secondary }]}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Cetak Laporan Keuangan</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {renderSummaryCard()}

        <View style={styles.actionSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.infoTitle, { color: colors.gray900 }]}>
              📄 Tentang Laporan PDF
            </Text>
            <View style={styles.infoList}>
              <Text style={[styles.infoItem, { color: colors.gray600 }]}>
                • Ringkasan keuangan lengkap untuk timeline aktif
              </Text>
              <Text style={[styles.infoItem, { color: colors.gray600 }]}>
                • Detail pemasukan dari setiap warga
              </Text>
              <Text style={[styles.infoItem, { color: colors.gray600 }]}>
                • Detail pengeluaran dengan tanggal dan deskripsi
              </Text>
              <Text style={[styles.infoItem, { color: colors.gray600 }]}>
                • Statistik pembayaran dan analisis keuangan
              </Text>
              <Text style={[styles.infoItem, { color: colors.gray600 }]}>
                • Format PDF siap cetak dan bagikan
              </Text>
            </View>
          </View>

          <Button
            title={generating ? "🔄 Membuat PDF..." : "🖨️ Generate PDF Laporan"}
            onPress={generatePDF}
            disabled={generating || !timeline}
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
          />
          
          {!timeline && (
            <Text style={[styles.warningText, { color: colors.error }]}>
              ⚠️ Timeline aktif tidak ditemukan. Pastikan ada timeline yang aktif untuk membuat laporan.
            </Text>
          )}
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Summary Card Styles
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  timelineInfo: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    alignItems: "center",
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  timelinePeriod: {
    fontSize: 12,
    fontWeight: "500",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  summaryIconText: {
    fontSize: 18,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  saldoSection: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  saldoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  saldoIconText: {
    fontSize: 20,
  },
  saldoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  saldoValue: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },

  // Action Section Styles
  actionSection: {
    gap: 20,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  generateButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
});