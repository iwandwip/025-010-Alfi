import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ActivityIndicator, Text } from "react-native";
import { Shadows } from "../../constants/theme";

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

  const ProgressBar = ({ progress, style }) => (
    <View style={[{
      height: 6,
      backgroundColor: '#E0E0E0',
      borderRadius: 3,
      overflow: 'hidden',
    }, style]}>
      <View style={{
        height: '100%',
        width: `${progress * 100}%`,
        backgroundColor: '#F50057',
        borderRadius: 3,
      }} />
    </View>
  );

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
        <ActivityIndicator size={size} color="#F50057" />
      </View>

      {text && (
        <Text style={[styles.text, { color: '#333' }]}>
          {text}
        </Text>
      )}

      {subText && (
        <Text style={[styles.subText, { color: '#666' }]}>
          {subText}
        </Text>
      )}

      {showProgress && progressSteps.length > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progressValue}
            style={styles.progressBar}
          />

          {progressSteps[currentStep] && (
            <Text style={[styles.stepText, { color: '#666' }]}>
              {progressSteps[currentStep]}
            </Text>
          )}

          <Text style={[styles.stepCounter, { color: '#666' }]}>
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <LoadingSpinner size="large" />
          <Text style={[styles.cardTitle, { color: '#333' }]}>
            {title}
          </Text>
          <Text style={[styles.cardSubtitle, { color: '#666' }]}>
            {subtitle}
          </Text>
          {children}
        </View>
      </View>
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
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <LoadingSpinner size="large" text={text} />
      </View>
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
    fontSize: 16,
  },
  subText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
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
    fontSize: 14,
  },
  stepCounter: {
    textAlign: "center",
    fontSize: 12,
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
    backgroundColor: '#FFFFFF',
    ...Shadows.md,
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
    fontSize: 18,
  },
  cardSubtitle: {
    textAlign: "center",
    fontSize: 14,
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
    backgroundColor: '#FFFFFF',
    ...Shadows.md,
  },
});

export { LoadingCard, LoadingOverlay };
export default LoadingSpinner;