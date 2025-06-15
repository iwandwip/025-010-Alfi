import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { 
  Surface, 
  Text, 
  useTheme,
  Avatar,
  Card,
  Chip,
  IconButton,
  TouchableRipple
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, SlideInLeft, SlideInRight } from 'react-native-reanimated';

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleBendaharaPress = () => {
    router.push("/(auth)/bendahara-login");
  };

  const handleWargaPress = () => {
    router.push("/(auth)/warga-login");
  };

  return (
    <LinearGradient
      colors={[theme.colors.primaryContainer, theme.colors.background]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={styles.header}
        >
          <Surface style={styles.logoSurface} elevation={5}>
            <Avatar.Icon 
              size={100} 
              icon="piggy-bank" 
              style={{ backgroundColor: theme.colors.primary }}
              color={theme.colors.onPrimary}
            />
          </Surface>
          
          <Text variant="displayMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Smart Jimpitan
          </Text>
          
          <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sistem Digital Pengelolaan{'\n'}Jimpitan Warga RT
          </Text>

          <View style={styles.badgeContainer}>
            <Chip 
              icon="map-marker" 
              style={{ backgroundColor: theme.colors.tertiaryContainer }}
              textStyle={{ color: theme.colors.onTertiaryContainer }}
            >
              RT 01 RW 02 Sukajadi
            </Chip>
          </View>
        </Animated.View>

        {/* Role Selection */}
        <View style={styles.rolesContainer}>
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text variant="titleLarge" style={[styles.rolesTitle, { color: theme.colors.onSurface }]}>
              Pilih Akses Anda
            </Text>
          </Animated.View>

          {/* Bendahara Card */}
          <Animated.View entering={SlideInLeft.delay(300).springify()}>
            <Card style={styles.roleCard} mode="elevated">
              <TouchableRipple 
                onPress={handleBendaharaPress}
                borderless
                style={{ borderRadius: 20 }}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Surface 
                      style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]} 
                      elevation={3}
                    >
                      <Avatar.Icon 
                        size={64} 
                        icon="account-tie" 
                        style={{ backgroundColor: 'transparent' }}
                        color={theme.colors.onPrimaryContainer}
                      />
                    </Surface>
                  </View>
                  
                  <View style={styles.cardMiddle}>
                    <View style={styles.cardHeader}>
                      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                        Bendahara
                      </Text>
                      <Chip 
                        compact 
                        mode="outlined"
                        style={{ backgroundColor: theme.colors.errorContainer }}
                        textStyle={{ color: theme.colors.onErrorContainer, fontSize: 10 }}
                      >
                        ADMIN
                      </Chip>
                    </View>
                    
                    <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
                      Kelola data warga, setoran jimpitan, dan laporan keuangan RT
                    </Text>

                    <View style={styles.featureChips}>
                      <Chip 
                        compact 
                        icon="account-group"
                        style={{ backgroundColor: theme.colors.successContainer, marginRight: 8 }}
                        textStyle={{ color: theme.colors.onSuccessContainer }}
                      >
                        Data Warga
                      </Chip>
                      <Chip 
                        compact 
                        icon="chart-line"
                        style={{ backgroundColor: theme.colors.infoContainer }}
                        textStyle={{ color: theme.colors.onInfoContainer }}
                      >
                        Laporan
                      </Chip>
                    </View>
                  </View>
                  
                  <IconButton 
                    icon="chevron-right" 
                    size={28}
                    iconColor={theme.colors.primary}
                  />
                </Card.Content>
              </TouchableRipple>
            </Card>
          </Animated.View>

          {/* Warga Card */}
          <Animated.View entering={SlideInRight.delay(400).springify()}>
            <Card style={styles.roleCard} mode="elevated">
              <TouchableRipple 
                onPress={handleWargaPress}
                borderless
                style={{ borderRadius: 20 }}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Surface 
                      style={[styles.iconContainer, { backgroundColor: theme.colors.secondaryContainer }]} 
                      elevation={3}
                    >
                      <Avatar.Icon 
                        size={64} 
                        icon="home-account" 
                        style={{ backgroundColor: 'transparent' }}
                        color={theme.colors.onSecondaryContainer}
                      />
                    </Surface>
                  </View>
                  
                  <View style={styles.cardMiddle}>
                    <View style={styles.cardHeader}>
                      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                        Warga
                      </Text>
                      <Chip 
                        compact 
                        mode="outlined"
                        style={{ backgroundColor: theme.colors.secondaryContainer }}
                        textStyle={{ color: theme.colors.onSecondaryContainer, fontSize: 10 }}
                      >
                        USER
                      </Chip>
                    </View>
                    
                    <Text variant="bodyMedium" style={[styles.cardDescription, { color: theme.colors.onSurfaceVariant }]}>
                      Pantau status setoran, riwayat pembayaran, dan kelola profil Anda
                    </Text>

                    <View style={styles.featureChips}>
                      <Chip 
                        compact 
                        icon="credit-card-check"
                        style={{ backgroundColor: theme.colors.tertiaryContainer, marginRight: 8 }}
                        textStyle={{ color: theme.colors.onTertiaryContainer }}
                      >
                        Status
                      </Chip>
                      <Chip 
                        compact 
                        icon="history"
                        style={{ backgroundColor: theme.colors.warningContainer }}
                        textStyle={{ color: theme.colors.onWarningContainer }}
                      >
                        Riwayat
                      </Chip>
                    </View>
                  </View>
                  
                  <IconButton 
                    icon="chevron-right" 
                    size={28}
                    iconColor={theme.colors.secondary}
                  />
                </Card.Content>
              </TouchableRipple>
            </Card>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.delay(500)}
          style={styles.footer}
        >
          <Surface style={styles.footerCard} elevation={1}>
            <View style={styles.footerContent}>
              <Avatar.Icon 
                size={32} 
                icon="information" 
                style={{ backgroundColor: theme.colors.infoContainer }}
                color={theme.colors.onInfoContainer}
              />
              <View style={styles.footerText}>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
                  Butuh Bantuan?
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Hubungi pengurus RT untuk informasi lebih lanjut
                </Text>
              </View>
            </View>
          </Surface>

          <Text variant="bodySmall" style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>
            © 2024 Smart Jimpitan System
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoSurface: {
    borderRadius: 60,
    marginBottom: 24,
    padding: 10,
  },
  title: {
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  badgeContainer: {
    marginTop: 8,
  },
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 40,
  },
  rolesTitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  roleCard: {
    marginBottom: 20,
    borderRadius: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  cardLeft: {
    marginRight: 16,
  },
  iconContainer: {
    borderRadius: 20,
    padding: 8,
  },
  cardMiddle: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  cardDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  featureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    alignItems: 'center',
  },
  footerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    flex: 1,
  },
  copyright: {
    textAlign: 'center',
    opacity: 0.7,
  },
});