import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import ErrorBoundary from "../components/ErrorBoundary";
import ToastNotification from "../components/ui/ToastNotification";
import { wargaTheme, bendaharaTheme } from "../constants/Theme";

function AppContent() {
  const { user } = useAuth();
  const theme = user?.role === 'bendahara' || user?.role === 'admin' ? bendaharaTheme : wargaTheme;
  
  return (
    <NativeBaseProvider theme={theme}>
      <NotificationProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
        </Stack>
        <ToastNotification />
      </NotificationProvider>
    </NativeBaseProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
