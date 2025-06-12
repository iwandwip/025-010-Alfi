import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getAllSantri } from "../../services/userService";

export default function DaftarSantri() {
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadSantri = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    const result = await getAllSantri();
    if (result.success) {
      setSantriList(result.data);
    } else {
      console.error("Error loading santri:", result.error);
    }

    if (!isRefresh) setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSantri(true);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSantri();
    }, [])
  );

  useEffect(() => {
    loadSantri();
  }, []);

  const handleSantriPress = (santri) => {
    router.push({
      pathname: "/(admin)/detail-santri",
      params: { santriId: santri.id },
    });
  };

  const renderSantriItem = ({ item }) => (
    <TouchableOpacity
      style={styles.santriCard}
      onPress={() => handleSantriPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.santriInfo}>
        <Text style={styles.namaSantri}>{item.namaSantri}</Text>
        <Text style={styles.emailSantri}>{item.email}</Text>
        <Text style={styles.namaWali}>Wali: {item.namaWali}</Text>
        <Text style={styles.noHp}>HP: {item.noHpWali}</Text>
      </View>

      <View style={styles.rfidSection}>
        {item.rfidSantri ? (
          <View style={styles.rfidActive}>
            <Text style={styles.rfidLabel}>RFID</Text>
            <Text style={styles.rfidValue}>✓ Terpasang</Text>
          </View>
        ) : (
          <View style={styles.rfidInactive}>
            <Text style={styles.rfidLabel}>RFID</Text>
            <Text style={styles.rfidValue}>⚠ Belum</Text>
          </View>
        )}
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daftar Santri</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data santri..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Santri</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsSection}>
          <Text style={styles.statsText}>
            Total Santri: {santriList.length}
          </Text>
          <Text style={styles.statsSubtext}>
            RFID Terpasang: {santriList.filter((s) => s.rfidSantri).length} |
            Belum: {santriList.filter((s) => !s.rfidSantri).length}
          </Text>
        </View>

        {santriList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada santri terdaftar</Text>
            <Text style={styles.emptySubtext}>
              Tambah santri baru melalui menu Tambah Data Santri
            </Text>
          </View>
        ) : (
          <FlatList
            data={santriList}
            renderItem={renderSantriItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3b82f6"]}
                tintColor="#3b82f6"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  statsSection: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  statsSubtext: {
    fontSize: 14,
    color: "#64748b",
  },
  listContent: {
    paddingBottom: 24,
  },
  santriCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 90,
  },
  santriInfo: {
    flex: 1,
  },
  namaSantri: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  emailSantri: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 6,
  },
  namaWali: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  noHp: {
    fontSize: 14,
    color: "#64748b",
  },
  rfidSection: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  rfidActive: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rfidInactive: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rfidLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#374151",
  },
  rfidValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
  arrowText: {
    fontSize: 16,
    color: "#94a3b8",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
});
