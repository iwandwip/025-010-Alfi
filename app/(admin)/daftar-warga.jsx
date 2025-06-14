import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import {
  Surface,
  Text,
  Card,
  Avatar,
  Chip,
  IconButton,
  ActivityIndicator,
  useTheme,
  FAB,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllWarga } from "../../services/userService";
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

export default function DaftarWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paperTheme = useTheme();

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
      <Card style={styles.wargaCard} mode="outlined" onPress={() => handleWargaPress(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.avatarSection}>
            <Avatar.Text 
              size={48} 
              label={item.namaWarga?.charAt(0)?.toUpperCase() || 'W'}
              style={{ backgroundColor: paperTheme.colors.primaryContainer }}
              color={paperTheme.colors.onPrimaryContainer}
            />
          </View>
          
          <View style={styles.infoSection}>
            <Text variant="titleMedium" style={styles.wargaName}>
              {item.namaWarga}
            </Text>
            <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant, fontStyle: 'italic' }}>
              {item.email}
            </Text>
            <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
              Alamat: {item.alamat || 'Belum diisi'}
            </Text>
            <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
              HP: {item.noHpWarga}
            </Text>
          </View>

          <View style={styles.statusSection}>
            <Chip 
              icon={item.rfidWarga ? "check-circle" : "alert-circle"}
              mode="flat"
              style={{ 
                backgroundColor: item.rfidWarga ? paperTheme.colors.successContainer : paperTheme.colors.warningContainer,
                marginBottom: 8
              }}
              textStyle={{ 
                color: item.rfidWarga ? paperTheme.colors.onSuccessContainer : paperTheme.colors.onWarningContainer,
                fontSize: 11
              }}
            >
              {item.rfidWarga ? "RFID OK" : "No RFID"}
            </Chip>
            <IconButton 
              icon="chevron-right" 
              size={20}
              iconColor={paperTheme.colors.onSurfaceVariant}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <Surface style={styles.header} elevation={2}>
          <IconButton
            icon="arrow-left"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Daftar Warga
          </Text>
          <View style={styles.placeholder} />
        </Surface>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" animating />
          <Text variant="bodyLarge" style={{ marginTop: 16 }}>
            Memuat data warga...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[paperTheme.colors.primaryContainer, paperTheme.colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Surface style={styles.header} elevation={2}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Daftar Warga
        </Text>
        <View style={styles.placeholder} />
      </Surface>

      <View style={styles.content}>
        {/* Summary Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.summaryCard} mode="elevated">
            <Card.Content>
              <View style={styles.summaryHeader}>
                <Avatar.Icon 
                  size={48} 
                  icon="account-group" 
                  style={{ backgroundColor: paperTheme.colors.primary }}
                  color={paperTheme.colors.onPrimary}
                />
                <View style={styles.summaryInfo}>
                  <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    {wargaList.length}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Total Warga
                  </Text>
                </View>
              </View>
              
              <Divider style={{ marginVertical: 16 }} />
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={{ color: paperTheme.colors.success, fontWeight: 'bold' }}>
                    {wargaList.filter((w) => w.rfidWarga).length}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    RFID Terpasang
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text variant="titleMedium" style={{ color: paperTheme.colors.warning, fontWeight: 'bold' }}>
                    {wargaList.filter((w) => !w.rfidWarga).length}
                  </Text>
                  <Text variant="bodySmall" style={{ color: paperTheme.colors.onSurfaceVariant }}>
                    Belum RFID
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>

        {wargaList.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyContainer}>
            <Avatar.Icon 
              size={80} 
              icon="account-off" 
              style={{ backgroundColor: paperTheme.colors.surfaceVariant }}
              color={paperTheme.colors.onSurfaceVariant}
            />
            <Text variant="headlineSmall" style={[styles.emptyTitle, { color: paperTheme.colors.onSurfaceVariant }]}>
              Belum ada warga terdaftar
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: paperTheme.colors.onSurfaceVariant }]}>
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
                colors={[paperTheme.colors.primary]}
                tintColor={paperTheme.colors.primary}
              />
            }
          />
        )}
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: paperTheme.colors.primary }]}
        onPress={() => router.push('/(admin)/tambah-warga')}
      />
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
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryInfo: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 4,
  },
  wargaCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatarSection: {
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
  },
  wargaName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSection: {
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});