import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSettings } from "../../contexts/SettingsContext";
import { getColors } from "../../constants/Colors";
import { getAllWarga } from "../../services/userService";

export default function DaftarWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, loading: settingsLoading } = useSettings();
  const colors = getColors(theme);
  const router = useRouter();

  const loadWarga = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    const result = await getAllWarga();
    if (result.success) {
      setWargaList(result.data);
    } else {
      console.error("Error loading warga:", result.error);
    }

    if (!isRefresh) setLoading(false);
  };

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

  const renderWargaItem = ({ item, index }) => (
    <View>
      <TouchableOpacity style={styles.wargaCard} onPress={() => handleWargaPress(item)}>
        <View style={styles.cardContent}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {item.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={[styles.wargaName, { color: colors.gray900 }]}>
              {item.namaWarga}
            </Text>
            <Text style={[styles.emailText, { color: colors.gray600 }]}>
              {item.email}
            </Text>
            <Text style={[styles.detailText, { color: colors.gray600 }]}>
              Alamat: {item.alamat || 'Belum diisi'}
            </Text>
            <Text style={[styles.detailText, { color: colors.gray600 }]}>
              HP: {item.noHpWarga}
            </Text>
          </View>

          <View style={styles.statusSection}>
            <View style={[
              styles.chip,
              { 
                backgroundColor: item.rfidWarga ? colors.success + '15' : colors.warning + '15',
                marginBottom: 8
              }
            ]}>
              <Text style={styles.statusIcon}>
                {item.rfidWarga ? "✅" : "⚠️"}
              </Text>
              <Text style={[
                styles.chipText,
                { 
                  color: item.rfidWarga ? colors.success : colors.warning,
                }
              ]}>
                {item.rfidWarga ? "RFID OK" : "No RFID"}
              </Text>
            </View>
            <Text style={[styles.arrowText, { color: colors.gray400 }]}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (settingsLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
            Daftar Warga
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.gray600 }]}>
            Memuat data warga...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.gray200 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
          Daftar Warga
        </Text>
      </View>

      <View style={styles.content}>
        {/* Summary Card */}
        <View>
          <View style={[styles.summaryCard, { backgroundColor: colors.white, borderColor: colors.gray200 }]}>
            <View style={styles.summaryHeader}>
              <View style={[styles.summaryIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.summaryIcon, { color: colors.primary }]}>👥</Text>
              </View>
              <View style={styles.summaryInfo}>
                <Text style={[styles.summaryNumber, { color: colors.gray900 }]}>
                  {wargaList.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.gray600 }]}>
                  Total Warga
                </Text>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.gray200 }]} />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {wargaList.filter((w) => w.rfidWarga).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                  RFID Terpasang
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {wargaList.filter((w) => !w.rfidWarga).length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.gray600 }]}>
                  Belum RFID
                </Text>
              </View>
            </View>
          </View>
        </View>

        {wargaList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.gray100 }]}>
              <Text style={[styles.emptyIconText, { color: colors.gray400 }]}>👤</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.gray600 }]}>
              Belum ada warga terdaftar
            </Text>
            <Text style={[styles.emptyText, { color: colors.gray500 }]}>
              Tambah warga baru melalui menu Tambah Data Warga
            </Text>
          </View>
        ) : (
          <FlatList
            data={wargaList}
            renderItem={renderWargaItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(admin)/tambah-warga')}
      >
        <Text style={[styles.fabText, { color: colors.white }]}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  summaryCard: {
    borderRadius: 16,
    marginBottom: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryIcon: {
    fontSize: 32,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconText: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 4,
  },
  wargaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    flex: 1,
  },
  wargaName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  statusSection: {
    alignItems: 'center',
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  arrowText: {
    fontSize: 16,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    fontWeight: "600",
  },
});