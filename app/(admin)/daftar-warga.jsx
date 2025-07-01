import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getAllWarga } from "../../services/userService";
import { getThemeByRole } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2 - 8;

export default function DaftarWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [filteredWarga, setFilteredWarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua'); // 'semua', 'rfid', 'belum_rfid'
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useAuth();
  const colors = getThemeByRole(true); // Admin theme

  const loadWarga = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    const result = await getAllWarga();
    if (result.success) {
      setWargaList(result.data);
      setFilteredWarga(result.data);
    } else {
      console.error("Error loading warga:", result.error);
    }

    if (!isRefresh) setLoading(false);
  };

  // Filter function
  const applyFilters = () => {
    let filtered = wargaList;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(warga => 
        warga.namaWarga.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warga.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (warga.noHpWarga && warga.noHpWarga.includes(searchQuery))
      );
    }

    // Apply status filter
    if (filterStatus === 'rfid') {
      filtered = filtered.filter(warga => warga.rfidWarga);
    } else if (filterStatus === 'belum_rfid') {
      filtered = filtered.filter(warga => !warga.rfidWarga);
    }

    setFilteredWarga(filtered);
  };

  // Apply filters when search query or filter status changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterStatus, wargaList]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWarga(true);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWarga();
    }, [])
  );

  useEffect(() => {
    loadWarga();
  }, []);

  const handleWargaPress = (warga) => {
    router.push({
      pathname: "/(admin)/detail-warga",
      params: { wargaId: warga.id },
    });
  };

  const renderWargaCard = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.wargaCard, { marginRight: index % 2 === 0 ? 8 : 0, marginLeft: index % 2 === 1 ? 8 : 0 }]}
      onPress={() => handleWargaPress(item)}
      activeOpacity={0.8}
    >
      {/* Profile Photo Placeholder */}
      <View style={styles.profilePhoto}>
        <Text style={styles.profileInitial}>
          {item.namaWarga.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.namaWarga}
        </Text>
        <Text style={styles.cardEmail} numberOfLines={1}>
          {item.email}
        </Text>
        <Text style={styles.cardPhone} numberOfLines={1}>
          {item.noHpWarga || 'No HP belum diisi'}
        </Text>

        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          item.rfidWarga ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={[
            styles.statusText,
            item.rfidWarga ? styles.statusActiveText : styles.statusInactiveText
          ]}>
            {item.rfidWarga ? '✓ RFID Aktif' : '⚠ Belum RFID'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleWargaPress(item)}
          >
            <Text style={styles.actionText}>Detail</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push({
              pathname: "/(admin)/edit-warga",
              params: { wargaId: item.id }
            })}
          >
            <Text style={[styles.actionText, styles.actionTextSecondary]}>Edit</Text>
          </TouchableOpacity>
        </View>
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
          <Text style={styles.headerTitle}>Daftar Warga</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Memuat data warga..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Warga</Text>
      </View>

      {/* Horizontal Toolbar with Search and Filters */}
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama, email, atau HP..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'semua' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('semua')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'semua' && styles.filterButtonTextActive]}>
              Semua ({wargaList.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'rfid' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('rfid')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'rfid' && styles.filterButtonTextActive]}>
              RFID Aktif ({wargaList.filter(w => w.rfidWarga).length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'belum_rfid' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('belum_rfid')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'belum_rfid' && styles.filterButtonTextActive]}>
              Belum RFID ({wargaList.filter(w => !w.rfidWarga).length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {filteredWarga.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Tidak ada warga yang sesuai pencarian' : 'Belum ada warga terdaftar'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Coba gunakan kata kunci lain' : 'Tambah warga baru dengan tombol + di bawah'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredWarga}
            renderItem={renderWargaCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.gridContent,
              { paddingBottom: insets.bottom + 80 },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#002245']}
                tintColor="#002245"
              />
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => router.push('/(admin)/tambah-warga')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    backgroundColor: "#fff",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#002245",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#002245",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Horizontal Toolbar Styles
  toolbar: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#1e293b",
  },
  filterContainer: {
    flexGrow: 0,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterButtonActive: {
    backgroundColor: "#002245",
    borderColor: "#002245",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  filterButtonTextActive: {
    color: "#fff",
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  gridContent: {
    paddingBottom: 24,
  },

  // Card Grid Styles
  wargaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: cardWidth,
    minHeight: 220,
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#002245",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  cardEmail: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
  },
  cardPhone: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 12,
  },

  // Status Badge Styles
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusInactive: {
    backgroundColor: "#fef3c7",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusActiveText: {
    color: "#166534",
  },
  statusInactiveText: {
    color: "#92400e",
  },

  // Card Actions Styles
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#002245",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#002245",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  actionTextSecondary: {
    color: "#002245",
  },

  // Floating Action Button
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#002245",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  // Empty State Styles
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
