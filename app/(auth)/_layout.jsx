import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="admin-login" />
      <Stack.Screen name="admin-register" />
      <Stack.Screen name="bendahara-login" />
      <Stack.Screen name="bendahara-register" />
      <Stack.Screen name="warga-login" />
    </Stack>
  );
}
