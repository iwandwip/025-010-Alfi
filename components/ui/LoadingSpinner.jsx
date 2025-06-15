import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import {
  ActivityIndicator,
  Text,
  Card,
  Surface,
  ProgressBar,
  useTheme,
} from "react-native-paper";

/**
 * React Native Paper-based LoadingSpinner component
 * Maintains compatibility with existing usage while providing Material Design styling
 */
const LoadingSpinner = ({
  size = "large",
  text = "Memuat...",
  subText = null,
  style,
  showProgress = false,
  progressSteps = [],
  currentStep = 0,
}) => {
  const paperTheme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const progressValue = showProgress && progressSteps.length > 0 
    ? (currentStep + 1) / progressSteps.length 
    : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size={size} animating />
      </View>

      {text && (
        <Text variant="titleMedium" style={[styles.text, { color: paperTheme.colors.onSurface }]}>
          {text}
        </Text>
      )}

      {subText && (
        <Text variant="bodyMedium" style={[styles.subText, { color: paperTheme.colors.onSurfaceVariant }]}>
          {subText}
        </Text>
      )}

      {showProgress && progressSteps.length > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progressValue}
            color={paperTheme.colors.primary}
            style={styles.progressBar}
          />

          {progressSteps[currentStep] && (
            <Text variant="bodyMedium" style={[styles.stepText, { color: paperTheme.colors.onSurfaceVariant }]}>
              {progressSteps[currentStep]}
            </Text>
          )}

          <Text variant="bodySmall" style={[styles.stepCounter, { color: paperTheme.colors.onSurfaceVariant }]}>
            {currentStep + 1} dari {progressSteps.length}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

/**
 * Paper-based LoadingCard component
 */
const LoadingCard = ({
  title = "Memuat Data",
  subtitle = "Mohon tunggu sebentar...",
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const paperTheme = useTheme();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <LoadingSpinner size="large" />
          <Text variant="titleLarge" style={[styles.cardTitle, { color: paperTheme.colors.onSurface }]}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={[styles.cardSubtitle, { color: paperTheme.colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
          {children}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

/**
 * Paper-based LoadingOverlay component
 */
const LoadingOverlay = ({
  visible,
  text = "Memuat...",
}) => {
  const paperTheme = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Surface style={styles.overlayContent} elevation={5}>
        <LoadingSpinner size="large" text={text} />
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  text: {
    marginTop: 12,
    fontWeight: '600',
    textAlign: "center",
  },
  subText: {
    marginTop: 8,
    textAlign: "center",
  },
  progressContainer: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
  },
  stepText: {
    fontWeight: '500',
    textAlign: "center",
    marginBottom: 4,
  },
  stepCounter: {
    textAlign: "center",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
    minWidth: 300,
  },
  cardContent: {
    alignItems: "center",
    padding: 40,
  },
  cardTitle: {
    fontWeight: '600',
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  cardSubtitle: {
    textAlign: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  overlayContent: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    maxWidth: 280,
  },
});

export { LoadingCard, LoadingOverlay };
export default LoadingSpinner;