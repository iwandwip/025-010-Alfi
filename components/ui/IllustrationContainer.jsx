import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Shadows } from "../../constants/theme";

const IllustrationContainer = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationWrapper}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  illustrationWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default IllustrationContainer;
