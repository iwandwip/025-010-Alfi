import React from "react";
import { Text, ActivityIndicator, View, Alert } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useSettings } from "../../contexts/SettingsContext";
import { getColors } from "../../constants/Colors";
import { signOutUser } from "../../services/authService";

export default function TabsLayout() {
  const { theme, loading } = useSettings();
  const colors = getColors(theme);
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            const result = await signOutUser();
            if (result.success) {
              router.replace("/(auth)/warga-login");
            } else {
              Alert.alert("Error", result.error || "Gagal keluar");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Status Pembayaran",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💳</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👨‍💼</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: "Keluar",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🔓</Text>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
