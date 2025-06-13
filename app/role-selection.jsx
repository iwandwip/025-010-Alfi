import React from "react";
import { useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SafeArea,
  Container,
  VStack,
  HStack,
  CustomText as Text,
  Heading,
  Box,
  Center,
  Colors,
} from "../components/ui/CoreComponents";

export default function RoleSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBendaharaPress = () => {
    router.push("/(auth)/bendahara-login");
  };

  const handleWargaPress = () => {
    router.push("/(auth)/warga-login");
  };

  return (
    <SafeArea style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VStack style={styles.content}>
          {/* Header Section */}
          <VStack style={styles.header}>
            <Heading size="2xl" style={styles.title}>
              Smart Jimpitan
            </Heading>
            <Text style={styles.subtitle}>
              Sistem Pengelolaan Jimpitan Warga{"\n"}RT 01 RW 02
            </Text>
          </VStack>

          {/* Logo Container */}
          <Center style={styles.logoContainer}>
            <Box style={styles.logo}>
              <Text style={styles.logoIcon}>💰</Text>
            </Box>
          </Center>

          {/* Role Selection */}
          <VStack style={styles.rolesContainer}>
            <Heading size="md" style={styles.rolesTitle}>
              Pilih Peran Anda
            </Heading>

            {/* Bendahara Card */}
            <TouchableOpacity 
              style={styles.roleCard}
              onPress={handleBendaharaPress}
              activeOpacity={0.8}
            >
              <Box style={[styles.card, styles.bendaharaCard]}>
                <HStack style={styles.cardContent}>
                  <Box style={[styles.iconContainer, styles.bendaharaIcon]}>
                    <Text style={styles.cardIcon}>👨‍💼</Text>
                  </Box>
                  
                  <VStack style={styles.cardText}>
                    <HStack style={styles.cardHeader}>
                      <Heading size="sm" style={styles.cardTitle}>
                        Bendahara
                      </Heading>
                      <Box style={[styles.badge, styles.adminBadge]}>
                        <Text style={styles.badgeText}>ADMIN</Text>
                      </Box>
                    </HStack>
                    <Text style={styles.cardDescription}>
                      Kelola data warga dan setoran jimpitan
                    </Text>
                  </VStack>
                  
                  <Text style={styles.chevron}>›</Text>
                </HStack>
              </Box>
            </TouchableOpacity>

            {/* Warga Card */}
            <TouchableOpacity 
              style={styles.roleCard}
              onPress={handleWargaPress}
              activeOpacity={0.8}
            >
              <Box style={[styles.card, styles.wargaCard]}>
                <HStack style={styles.cardContent}>
                  <Box style={[styles.iconContainer, styles.wargaIcon]}>
                    <Text style={styles.cardIcon}>👥</Text>
                  </Box>
                  
                  <VStack style={styles.cardText}>
                    <HStack style={styles.cardHeader}>
                      <Heading size="sm" style={styles.cardTitle}>
                        Warga
                      </Heading>
                      <Box style={[styles.badge, styles.userBadge]}>
                        <Text style={styles.badgeText}>USER</Text>
                      </Box>
                    </HStack>
                    <Text style={styles.cardDescription}>
                      Pantau dan setor jimpitan Anda
                    </Text>
                  </VStack>
                  
                  <Text style={styles.chevron}>›</Text>
                </HStack>
              </Box>
            </TouchableOpacity>
          </VStack>

          {/* Footer */}
          <Center style={styles.footer}>
            <VStack style={styles.footerContent}>
              <HStack style={styles.locationRow}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>RT 01 RW 02</Text>
              </HStack>
              <Text style={styles.kelurahanText}>
                Kelurahan Sukajadi
              </Text>
            </VStack>
          </Center>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    color: Colors.gray800,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  
  // Logo
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    backgroundColor: Colors.primary,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: Colors.pink + '20',
  },
  logoIcon: {
    fontSize: 48,
  },
  
  // Roles
  rolesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rolesTitle: {
    textAlign: 'center',
    color: Colors.gray700,
    marginBottom: 24,
  },
  roleCard: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  bendaharaCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.green + '40',
  },
  wargaCard: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.teal + '40',
  },
  cardContent: {
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bendaharaIcon: {
    backgroundColor: Colors.green + '20',
  },
  wargaIcon: {
    backgroundColor: Colors.teal + '20',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardText: {
    flex: 1,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    color: Colors.gray800,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: Colors.green + '20',
  },
  userBadge: {
    backgroundColor: Colors.teal + '20',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.gray700,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray600,
  },
  chevron: {
    fontSize: 24,
    color: Colors.gray400,
    marginLeft: 8,
  },
  
  // Footer
  footer: {
    paddingTop: 32,
  },
  footerContent: {
    alignItems: 'center',
  },
  locationRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray600,
  },
  kelurahanText: {
    fontSize: 12,
    color: Colors.gray500,
  },
});