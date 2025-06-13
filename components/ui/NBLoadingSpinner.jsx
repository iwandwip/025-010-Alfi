import React, { useEffect, useRef } from "react";
import {
  Spinner,
  HStack,
  VStack,
  Text,
  Progress,
  Box,
  Center,
  Modal,
  Heading,
} from "native-base";
import { Animated } from "react-native";
import { Colors } from "../../constants/Colors";

const NBLoadingSpinner = ({
  size = "lg",
  color = Colors.primary,
  text = "Memuat...",
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
    ? ((currentStep + 1) / progressSteps.length) * 100
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
      <VStack space={4} alignItems="center" p={5}>
        <Box position="relative">
          <Spinner
            size={size}
            color={color}
            accessibilityLabel={accessibilityLabel || text}
          />
          {/* Pulse effect background */}
          <Box
            position="absolute"
            w={60}
            h={60}
            borderRadius="full"
            bg={color}
            opacity={0.1}
            top={-15}
            left={-15}
          />
        </Box>

        {text && (
          <Text
            fontSize={16}
            fontWeight="600"
            color={color}
            textAlign="center"
          >
            {text}
          </Text>
        )}

        {subText && (
          <Text
            fontSize={14}
            color={Colors.gray600}
            textAlign="center"
          >
            {subText}
          </Text>
        )}

        {showProgress && progressSteps.length > 0 && (
          <VStack space={2} w="100%" alignItems="center">
            <Progress
              value={progressValue}
              w="100%"
              h={2}
              bg={Colors.gray200}
              _filledTrack={{
                bg: color,
              }}
            />
            
            {progressSteps[currentStep] && (
              <Text
                fontSize={14}
                color={Colors.gray700}
                fontWeight="500"
                textAlign="center"
              >
                {progressSteps[currentStep]}
              </Text>
            )}
            
            <Text
              fontSize={12}
              color={Colors.gray500}
              textAlign="center"
            >
              {currentStep + 1} dari {progressSteps.length}
            </Text>
          </VStack>
        )}
      </VStack>
    </Animated.View>
  );
};

const NBLoadingCard = ({
  title = "Memuat Data",
  subtitle = "Mohon tunggu sebentar...",
  color = Colors.primary,
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
      <Center flex={1} px={6}>
        <Box
          bg={Colors.white}
          borderRadius={20}
          p={10}
          alignItems="center"
          shadow={9}
          borderWidth={1}
          borderColor={Colors.gray200}
          minW={300}
        >
          <NBLoadingSpinner size="lg" color={color} text="" />
          
          <Heading size="md" mt={4} textAlign="center">
            {title}
          </Heading>
          
          <Text
            fontSize={14}
            color={Colors.gray600}
            textAlign="center"
            mt={2}
          >
            {subtitle}
          </Text>
          
          {children}
        </Box>
      </Center>
    </Animated.View>
  );
};

const NBLoadingOverlay = ({
  visible,
  text = "Memuat...",
  color = Colors.primary,
}) => {
  return (
    <Modal isOpen={visible} size="full">
      <Modal.Content
        bg="transparent"
        shadow="none"
        maxWidth="100%"
        h="100%"
      >
        <Center flex={1} bg="rgba(0, 0, 0, 0.7)">
          <Box
            bg={Colors.white}
            borderRadius={16}
            p={8}
            alignItems="center"
            maxW={280}
          >
            <NBLoadingSpinner
              size="lg"
              color={color}
              text={text}
            />
          </Box>
        </Center>
      </Modal.Content>
    </Modal>
  );
};

export { NBLoadingCard, NBLoadingOverlay };
export default NBLoadingSpinner;