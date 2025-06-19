import React from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
// import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../constants/theme';

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Using custom theme from constants

  const handleBendaharaPress = () => {
    router.push("/(auth)/bendahara-login");
  };

  const handleWargaPress = () => {
    router.push("/(auth)/warga-login");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: Colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100)}
          style={styles.header}
        >
          <View style={[styles.logoSurface, Shadows.lg]}>
            <View style={[styles.logoIcon, { backgroundColor: Colors.primary }]}>
              <MaterialIcons 
                name="savings" 
                size={50} 
                color={Colors.textInverse}
              />
            </View>
          </View>
          
          <Text style={[styles.title, { color: Colors.primary }]}>
            Smart Jimpitan
          </Text>
          
          <Text style={[styles.subtitle, { color: Colors.textSecondary }]}>
            Sistem Digital Pengelolaan{'\n'}Jimpitan Warga RT
          </Text>

          <View style={styles.badgeContainer}>
            <View style={[styles.locationChip, { backgroundColor: Colors.success + '20' }]}>
              <MaterialIcons name="place" size={16} color={Colors.success} />
              <Text style={[styles.locationText, { color: Colors.success }]}>
                RT 01 RW 02 Sukajadi
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Role Selection */}
        <View style={styles.rolesContainer}>
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={[styles.rolesTitle, { color: Colors.text }]}>
              Pilih Akses Anda
            </Text>
          </Animated.View>

          {/* Bendahara Card */}
          <Animated.View entering={SlideInLeft.delay(300).springify()}>
            <TouchableOpacity 
              style={[styles.roleCard, Shadows.lg]}
              onPress={handleBendaharaPress}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: Colors.primary + '20' }]}>
                    <MaterialIcons 
                      name="business" 
                      size={24} 
                      color={Colors.primary}
                    />
                  </View>
                </View>
                
                <View style={styles.cardMiddle}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: Colors.text }]}>
                      Bendahara
                    </Text>
                    <View style={[styles.adminChip, { backgroundColor: Colors.error + '20' }]}>
                      <Text style={[styles.adminChipText, { color: Colors.error }]}>
                        ADMIN
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.cardDescription, { color: Colors.textSecondary }]}>
                    Kelola data warga, setoran jimpitan, dan laporan keuangan RT
                  </Text>

                  <View style={styles.featureChips}>
                    <View style={[styles.featureChip, { backgroundColor: Colors.success + '20', marginRight: 8 }]}>
                      <MaterialIcons name="group" size={12} color={Colors.success} />
                      <Text style={[styles.featureChipText, { color: Colors.success }]}>
                        Data Warga
                      </Text>
                    </View>
                    <View style={[styles.featureChip, { backgroundColor: Colors.info + '20' }]}>
                      <MaterialIcons name="bar-chart" size={12} color={Colors.info} />
                      <Text style={[styles.featureChipText, { color: Colors.info }]}>
                        Laporan
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.chevronButton}>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={28}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Warga Card */}
          <Animated.View entering={SlideInRight.delay(400).springify()}>
            <TouchableOpacity 
              style={[styles.roleCard, Shadows.lg]}
              onPress={handleWargaPress}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: Colors.secondary + '20' }]}>
                    <MaterialIcons 
                      name="home" 
                      size={24} 
                      color={Colors.secondary}
                    />
                  </View>
                </View>
                
                <View style={styles.cardMiddle}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: Colors.text }]}>
                      Warga
                    </Text>
                    <View style={[styles.userChip, { backgroundColor: Colors.secondary + '20' }]}>
                      <Text style={[styles.userChipText, { color: Colors.secondary }]}>
                        USER
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.cardDescription, { color: Colors.textSecondary }]}>
                    Pantau status setoran, riwayat pembayaran, dan kelola profil Anda
                  </Text>

                  <View style={styles.featureChips}>
                    <View style={[styles.featureChip, { backgroundColor: Colors.warning + '20', marginRight: 8 }]}>
                      <MaterialIcons name="credit-card" size={12} color={Colors.warning} />
                      <Text style={[styles.featureChipText, { color: Colors.warning }]}>
                        Status
                      </Text>
                    </View>
                    <View style={[styles.featureChip, { backgroundColor: Colors.info + '20' }]}>
                      <MaterialIcons name="history" size={12} color={Colors.info} />
                      <Text style={[styles.featureChipText, { color: Colors.info }]}>
                        Riwayat
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.chevronButton}>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={28}
                    color={Colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.delay(500)}
          style={styles.footer}
        >
          <View style={[styles.footerCard, Shadows.sm]}>
            <View style={styles.footerContent}>
              <View style={[styles.infoIcon, { backgroundColor: Colors.info + '20' }]}>
                <MaterialIcons 
                  name="info" 
                  size={20} 
                  color={Colors.info}
                />
              </View>
              <View style={styles.footerText}>
                <Text style={[styles.helpTitle, { color: Colors.text }]}>
                  Butuh Bantuan?
                </Text>
                <Text style={[styles.helpSubtitle, { color: Colors.textSecondary }]}>
                  Hubungi pengurus RT untuk informasi lebih lanjut
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.copyright, { color: Colors.textSecondary }]}>
            © 2024 Smart Jimpitan System
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  badgeContainer: {
    marginTop: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 40,
  },
  rolesTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  roleCard: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: Colors.surface,
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
    borderRadius: 16,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  adminChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  userChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  featureChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featureChipText: {
    fontSize: 10,
    fontWeight: '500',
  },
  chevronButton: {
    padding: 4,
  },
  footer: {
    alignItems: 'center',
  },
  footerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    backgroundColor: Colors.surface,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpSubtitle: {
    fontSize: 12,
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
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});