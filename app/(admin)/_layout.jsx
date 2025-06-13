import React from "react";
import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tambah-warga" />
      <Stack.Screen name="daftar-warga" />
      <Stack.Screen name="detail-warga" />
      <Stack.Screen name="edit-warga" />
      <Stack.Screen name="timeline-manager" />
      <Stack.Screen name="create-timeline" />
      <Stack.Screen name="payment-manager" />
    </Stack>
  );
}
