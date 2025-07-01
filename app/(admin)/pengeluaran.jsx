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
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lightTheme } from "../../constants/Colors";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useNotification } from "../../contexts/NotificationContext";
import { getAllUsersPaymentStatus } from "../../services/adminPaymentService";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc 
} from "firebase/firestore";
import { db } from "../../services/firebase";

const { width } = Dimensions.get('window');

export default function Pengeluaran() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = lightTheme;
  const { showGeneralNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  
  // Data states
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [saldoTersisa, setSaldoTersisa] = useState(0);
  const [pengeluaranList, setPengeluaranList] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    jumlah: "",
  });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    
    try {
      // Load pemasukan data
      const pemasukanResult = await getAllUsersPaymentStatus();
      let totalPaid = 0;
      
      if (pemasukanResult.success && pemasukanResult.users) {
        pemasukanResult.users.forEach(user => {
          totalPaid += user.paymentSummary?.paidAmount || 0;
        });
      }
      
      setTotalPemasukan(totalPaid);
      
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

  const resetForm = () => {
    setFormData({
      judul: "",
      deskripsi: "",
      jumlah: "",
    });
    setEditingItem(null);
  };

  const handleAddExpense = async () => {
    if (!formData.judul.trim() || !formData.jumlah.trim()) {
      Alert.alert("Error", "Judul dan jumlah wajib diisi");
      return;
    }

    const jumlah = parseFloat(formData.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      Alert.alert("Error", "Jumlah harus berupa angka positif");
      return;
    }

    if (jumlah > saldoTersisa) {
      Alert.alert(
        "Saldo Tidak Mencukupi", 
        `Saldo tersisa: ${formatCurrency(saldoTersisa)}\nJumlah pengeluaran: ${formatCurrency(jumlah)}\n\nTidak bisa mengeluarkan dana lebih dari saldo yang tersedia.`
      );
      return;
    }

    setAddingExpense(true);

    try {
      const expenseData = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        jumlah: jumlah,
        tanggal: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "pengeluaran"), expenseData);
      
      showGeneralNotification(
        "Berhasil",
        "Pengeluaran berhasil ditambahkan",
        "success"
      );
      
      setAddModalVisible(false);
      resetForm();
      await loadData();

    } catch (error) {
      console.error("Error adding expense:", error);
      showGeneralNotification(
        "Error",
        "Gagal menambahkan pengeluaran",
        "error"
      );
    } finally {
      setAddingExpense(false);
    }
  };

  const handleEditExpense = async () => {
    if (!formData.judul.trim() || !formData.jumlah.trim()) {
      Alert.alert("Error", "Judul dan jumlah wajib diisi");
      return;
    }

    const jumlah = parseFloat(formData.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      Alert.alert("Error", "Jumlah harus berupa angka positif");
      return;
    }

    // Calculate available balance (excluding current item)
    const currentItemAmount = editingItem?.jumlah || 0;
    const availableBalance = saldoTersisa + currentItemAmount;
    
    if (jumlah > availableBalance) {
      Alert.alert(
        "Saldo Tidak Mencukupi", 
        `Saldo tersedia: ${formatCurrency(availableBalance)}\nJumlah pengeluaran: ${formatCurrency(jumlah)}\n\nTidak bisa mengeluarkan dana lebih dari saldo yang tersedia.`
      );
      return;
    }

    setAddingExpense(true);

    try {
      const expenseData = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim(),
        jumlah: jumlah,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, "pengeluaran", editingItem.id), expenseData);
      
      showGeneralNotification(
        "Berhasil",
        "Pengeluaran berhasil diperbarui",
        "success"
      );
      
      setEditModalVisible(false);
      resetForm();
      await loadData();

    } catch (error) {
      console.error("Error updating expense:", error);
      showGeneralNotification(
        "Error",
        "Gagal memperbarui pengeluaran",
        "error"
      );
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = (item) => {
    Alert.alert(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus pengeluaran "${item.judul}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "pengeluaran", item.id));
              showGeneralNotification(
                "Berhasil",
                "Pengeluaran berhasil dihapus",
                "success"
              );
              await loadData();
            } catch (error) {
              console.error("Error deleting expense:", error);
              showGeneralNotification(
                "Error",
                "Gagal menghapus pengeluaran",
                "error"
              );
            }
          },
        },
      ]
    );
  };

  const handleEditPress = (item) => {
    setEditingItem(item);
    setFormData({
      judul: item.judul,
      deskripsi: item.deskripsi || "",
      jumlah: item.jumlah.toString(),
    });
    setEditModalVisible(true);
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

  const renderSummaryCard = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.white }]}>
      <Text style={[styles.summaryTitle, { color: colors.gray900 }]}>
        💰 Ringkasan Keuangan
      </Text>
      
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryItem, styles.pemasukanCard]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.success }]}>
            <Text style={styles.summaryIconText}>📈</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
            Total Pemasukan
          </Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(totalPemasukan)}
          </Text>
        </View>

        <View style={[styles.summaryItem, styles.pengeluaranCard]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.error }]}>
            <Text style={styles.summaryIconText}>📉</Text>
          </View>
          <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
            Total Pengeluaran
          </Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {formatCurrency(totalPengeluaran)}
          </Text>
        </View>
      </View>

      <View style={[styles.saldoSection, { backgroundColor: saldoTersisa >= 0 ? colors.primary + '15' : colors.error + '15' }]}>
        <View style={[styles.saldoIcon, { backgroundColor: saldoTersisa >= 0 ? colors.primary : colors.error }]}>
          <Text style={styles.saldoIconText}>💳</Text>
        </View>
        <Text style={[styles.saldoLabel, { color: colors.gray700 }]}>
          Saldo Tersisa
        </Text>
        <Text style={[styles.saldoValue, { color: saldoTersisa >= 0 ? colors.primary : colors.error }]}>
          {formatCurrency(saldoTersisa)}
        </Text>
        {saldoTersisa < 0 && (
          <Text style={[styles.saldoWarning, { color: colors.error }]}>
            ⚠️ Saldo minus! Perlu menambah pemasukan
          </Text>
        )}
      </View>
    </View>
  );

  const renderExpenseItem = ({ item }) => (
    <View style={[styles.expenseCard, { backgroundColor: colors.white }]}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseTitle, { color: colors.gray900 }]}>
            {item.judul}
          </Text>
          <Text style={[styles.expenseDate, { color: colors.gray500 }]}>
            📅 {formatDate(item.tanggal)}
          </Text>
        </View>
        <Text style={[styles.expenseAmount, { color: colors.error }]}>
          -{formatCurrency(item.jumlah)}
        </Text>
      </View>

      {item.deskripsi && (
        <Text style={[styles.expenseDesc, { color: colors.gray600 }]}>
          {item.deskripsi}
        </Text>
      )}

      <View style={styles.expenseActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => handleEditPress(item)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            ✏️ Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteExpense(item)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.white }]}>
            🗑️ Hapus
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFormModal = (isEdit = false) => (
    <Modal
      visible={isEdit ? editModalVisible : addModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        if (!addingExpense) {
          isEdit ? setEditModalVisible(false) : setAddModalVisible(false);
          resetForm();
        }
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEdit ? "✏️ Edit Pengeluaran" : "➕ Tambah Pengeluaran"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                isEdit ? setEditModalVisible(false) : setAddModalVisible(false);
                resetForm();
              }}
              disabled={addingExpense}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Judul Pengeluaran *"
              placeholder="Contoh: Pembelian Alat Tulis"
              value={formData.judul}
              onChangeText={(value) => setFormData(prev => ({ ...prev, judul: value }))}
              editable={!addingExpense}
            />

            <Input
              label="Deskripsi (Opsional)"
              placeholder="Deskripsi detail pengeluaran..."
              value={formData.deskripsi}
              onChangeText={(value) => setFormData(prev => ({ ...prev, deskripsi: value }))}
              multiline
              numberOfLines={3}
              editable={!addingExpense}
            />

            <Input
              label="Jumlah Pengeluaran *"
              placeholder="500000"
              value={formData.jumlah}
              onChangeText={(value) => setFormData(prev => ({ ...prev, jumlah: value }))}
              keyboardType="numeric"
              editable={!addingExpense}
            />

            <View style={styles.balanceInfo}>
              <Text style={[styles.balanceLabel, { color: colors.gray600 }]}>
                Saldo Tersedia:
              </Text>
              <Text style={[styles.balanceValue, { color: colors.primary }]}>
                {formatCurrency(isEdit ? saldoTersisa + (editingItem?.jumlah || 0) : saldoTersisa)}
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <Button
              title="Batal"
              onPress={() => {
                isEdit ? setEditModalVisible(false) : setAddModalVisible(false);
                resetForm();
              }}
              variant="outline"
              style={styles.modalButton}
              disabled={addingExpense}
            />
            <Button
              title={addingExpense ? "Menyimpan..." : (isEdit ? "Perbarui" : "Tambah")}
              onPress={isEdit ? handleEditExpense : handleAddExpense}
              style={styles.modalButton}
              disabled={addingExpense}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { backgroundColor: colors.white }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.secondary }]}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Pengeluaran Dana</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data keuangan..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.secondary }]}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Pengeluaran Dana</Text>
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

        <View style={styles.expenseSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.gray900 }]}>
              📋 Daftar Pengeluaran
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.addButtonText, { color: colors.white }]}>
                ➕ Tambah
              </Text>
            </TouchableOpacity>
          </View>

          {pengeluaranList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.gray600 }]}>
                Belum ada pengeluaran tercatat
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.gray500 }]}>
                Tekan tombol "Tambah" untuk mencatat pengeluaran pertama
              </Text>
            </View>
          ) : (
            <View style={styles.expenseList}>
              {pengeluaranList.map((item, index) => (
                <View key={item.id}>
                  {renderExpenseItem({ item })}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>

      {renderFormModal(false)}
      {renderFormModal(true)}
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
    marginBottom: 20,
    textAlign: "center",
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
    backgroundColor: "#f8fafc",
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
  },
  saldoSection: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
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
  saldoWarning: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },

  // Expense Section Styles
  expenseSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  expenseList: {
    gap: 12,
  },
  expenseCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 16,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
    fontWeight: "500",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  expenseDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  expenseActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Empty State Styles
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});