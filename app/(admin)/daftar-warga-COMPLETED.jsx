import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllWarga } from "../../services/userService";
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';

export default function DaftarWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    <Animated.View entering={SlideInRight.delay(index * 100)}>
      <TouchableOpacity style={styles.wargaCard} onPress={() => handleWargaPress(item)}>
        <View style={styles.cardContent}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: Colors.primary }]}>
                {item.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.wargaName}>
              {item.namaWarga}
            </Text>
            <Text style={styles.emailText}>
              {item.email}
            </Text>
            <Text style={styles.detailText}>
              Alamat: {item.alamat || 'Belum diisi'}
            </Text>
            <Text style={styles.detailText}>
              HP: {item.noHpWarga}
            </Text>
          </View>

          <View style={styles.statusSection}>
            <View style={[
              styles.chip,
              { 
                backgroundColor: item.rfidWarga ? Colors.success + '20' : Colors.warning + '20',
                marginBottom: 8
              }
            ]}>
              <MaterialIcons 
                name={item.rfidWarga ? "check-circle" : "warning"} 
                size={16} 
                color={item.rfidWarga ? Colors.success : Colors.warning} 
              />
              <Text style={[
                styles.chipText,
                { 
                  color: item.rfidWarga ? Colors.success : Colors.warning,
                }
              ]}>
                {item.rfidWarga ? "RFID OK" : "No RFID"}
              </Text>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24}
              color={Colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[Colors.primary + '20', Colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={[styles.header, Shadows.md]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Daftar Warga
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Memuat data warga...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.primary + '20', Colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={[styles.header, Shadows.md]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Daftar Warga
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Summary Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={[styles.summaryCard, Shadows.md]}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconContainer}>
                <MaterialIcons 
                  name="group" 
                  size={32} 
                  color={Colors.primary}
                />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryNumber}>
                  {wargaList.length}
                </Text>
                <Text style={styles.summaryLabel}>
                  Total Warga
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.success }]}>
                  {wargaList.filter((w) => w.rfidWarga).length}
                </Text>
                <Text style={styles.statLabel}>
                  RFID Terpasang
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>
                  {wargaList.filter((w) => !w.rfidWarga).length}
                </Text>
                <Text style={styles.statLabel}>
                  Belum RFID
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {wargaList.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialIcons 
                name="person-off" 
                size={60} 
                color={Colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              Belum ada warga terdaftar
            </Text>
            <Text style={styles.emptyText}>
              Tambah warga baru melalui menu Tambah Data Warga
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            data={wargaList}
            renderItem={renderWargaItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(admin)/tambah-warga')}
      >
        <MaterialIcons name="add" size={24} color={Colors.textInverse} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: Colors.text,
  },
  placeholder: {
    width: 48,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
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
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 4,
  },
  wargaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    ...Shadows.md,
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
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  emailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statusSection: {
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});