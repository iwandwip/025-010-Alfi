import React from "react";
import { View, Text } from "react-native";

// This page should never be reached as the tab press is intercepted
export default function LogoutPage() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
}