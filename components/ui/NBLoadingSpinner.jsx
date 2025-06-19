import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, Modal } from 'react-native';
import { Shadows } from '../../constants/theme';

const NBLoadingSpinner = ({
  size = 'large',
  color = '#F50057',
  text = 'Memuat...',
  subText = null,
  style,
  showProgress = false,
  progressSteps = [],
  currentStep = 0,
  accessibilityLabel,
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
    ? ((currentStep + 1) / progressSteps.length)
    : 0;

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={{
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator
            size={size}
            color={color}
            accessibilityLabel={accessibilityLabel || text}
          />
          <View style={{
            position: 'absolute',
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: color,
            opacity: 0.1,
          }} />
        </View>

        {text && (
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: color,
            textAlign: 'center',
            marginTop: 16,
          }}>
            {text}
          </Text>
        )}

        {subText && (
          <Text style={{
            fontSize: 14,
            color: '#666666',
            textAlign: 'center',
            marginTop: 8,
          }}>
            {subText}
          </Text>
        )}

        {showProgress && progressSteps.length > 0 && (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
            <View style={{
              width: '100%',
              height: 4,
              backgroundColor: '#E0E0E0',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <View style={{
                width: `${progressValue * 100}%`,
                height: '100%',
                backgroundColor: color,
                borderRadius: 2,
              }} />
            </View>
            
            {progressSteps[currentStep] && (
              <Text style={{
                fontSize: 14,
                color: '#4A4A4A',
                fontWeight: '500',
                textAlign: 'center',
                marginTop: 8,
              }}>
                {progressSteps[currentStep]}
              </Text>
            )}
            
            <Text style={{
              fontSize: 12,
              color: '#999999',
              textAlign: 'center',
              marginTop: 4,
            }}>
              {currentStep + 1} dari {progressSteps.length}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const NBLoadingCard = ({
  title = 'Memuat Data',
  subtitle = 'Mohon tunggu sebentar...',
  color = '#F50057',
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
    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
      }}>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 40,
          alignItems: 'center',
          ...Shadows.lg,
          borderWidth: 1,
          borderColor: '#E0E0E0',
          minWidth: 300,
        }}>
          <NBLoadingSpinner size="large" color={color} text="" />
          
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            marginTop: 16,
            textAlign: 'center',
            color: '#1A1A1A',
          }}>
            {title}
          </Text>
          
          <Text style={{
            fontSize: 14,
            color: '#666666',
            textAlign: 'center',
            marginTop: 8,
          }}>
            {subtitle}
          </Text>
          
          {children}
        </View>
      </View>
    </Animated.View>
  );
};

const NBLoadingOverlay = ({
  visible,
  text = 'Memuat...',
  color = '#F50057',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 32,
          alignItems: 'center',
          maxWidth: 280,
          width: '80%',
        }}>
          <NBLoadingSpinner
            size="large"
            color={color}
            text={text}
          />
        </View>
      </View>
    </Modal>
  );
};

export { NBLoadingCard, NBLoadingOverlay };
export default NBLoadingSpinner;