import React from "react";
import { View, Image, StyleSheet } from "react-native";

const LoginIllustration = ({ width = 280, height = 200, style }) => {
  return (
    <View style={[styles.container, style, { width, height }]}>
      <Image
        source={require("../../assets/images/login.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default LoginIllustration;
