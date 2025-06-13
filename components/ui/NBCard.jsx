import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Divider,
  Pressable,
  Badge,
  Icon,
  Image,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
// Colors now use NativeBase theme tokens

const NBCard = ({
  title,
  subtitle,
  children,
  onPress,
  variant = "elevated",
  showDivider = false,
  headerAction,
  footer,
  image,
  imageHeight = 200,
  badge,
  icon,
  px = "4",
  py = "4",
  m = "2",
  bg = "white",
  borderColor = "gray.200",
  shadow = "2",
  style,
  ...props
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case "elevated":
        return {
          shadow: shadow,
          borderWidth: 0,
        };
      case "outline":
        return {
          shadow: "0",
          borderWidth: 1,
          borderColor: borderColor,
        };
      case "filled":
        return {
          shadow: "0",
          borderWidth: 0,
          bg: bg,
        };
      case "ghost":
        return {
          shadow: "0",
          borderWidth: 0,
          bg: "transparent",
        };
      default:
        return {
          shadow: shadow,
          borderWidth: 0,
        };
    }
  };

  const variantProps = getVariantProps();

  const CardContent = () => (
    <>
      {image && (
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          alt={title || "Card image"}
          height={imageHeight}
          width="100%"
          borderTopRadius="lg"
          mb="-4"
          mt="-4"
          mx="-4"
        />
      )}

      {(title || subtitle || badge || icon || headerAction) && (
        <VStack space="2" mb={showDivider ? "3" : "0"}>
          <HStack alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" space="2" flex={1}>
              {icon && (
                <Icon
                  as={MaterialIcons}
                  name={icon}
                  size="6"
                  color="primary.500"
                />
              )}
              
              <VStack flex={1}>
                {title && (
                  <Heading size="md" color="gray.900">
                    {title}
                  </Heading>
                )}
                
                {subtitle && (
                  <Text fontSize="sm" color="gray.600" mt="0.5">
                    {subtitle}
                  </Text>
                )}
              </VStack>

              {badge && (
                <Badge
                  colorScheme={badge.colorScheme || "primary"}
                  variant={badge.variant || "subtle"}
                  rounded="full"
                  px="3"
                >
                  {badge.text}
                </Badge>
              )}
            </HStack>

            {headerAction}
          </HStack>
        </VStack>
      )}

      {showDivider && (title || subtitle) && children && (
        <Divider bg="gray.200" mb="3" />
      )}

      {children}

      {footer && (
        <>
          <Divider bg="gray.200" mt="3" mb="3" />
          {footer}
        </>
      )}
    </>
  );

  const cardProps = {
    bg: bg,
    rounded: "lg",
    px: px,
    py: py,
    m: m,
    overflow: "hidden",
    ...variantProps,
    ...props,
    style: style,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        _pressed={{
          opacity: 0.8,
          transform: [{ scale: "0.98" }],
        }}
      >
        <Box {...cardProps}>
          <CardContent />
        </Box>
      </Pressable>
    );
  }

  return (
    <Box {...cardProps}>
      <CardContent />
    </Box>
  );
};

// Predefined card variants for common use cases
export const NBInfoCard = ({ title, value, icon, color = Colors.primary, ...props }) => (
  <NBCard
    variant="elevated"
    px="4"
    py="5"
    {...props}
  >
    <HStack alignItems="center" justifyContent="space-between">
      <VStack flex={1}>
        <Text fontSize="sm" color="gray.600" mb="1">
          {title}
        </Text>
        <Heading size="xl" color="gray.900">
          {value}
        </Heading>
      </VStack>
      
      {icon && (
        <Box
          bg={`${color}1A`}
          p="3"
          rounded="full"
        >
          <Icon
            as={MaterialIcons}
            name={icon}
            size="6"
            color={color}
          />
        </Box>
      )}
    </HStack>
  </NBCard>
);

export const NBListCard = ({ items, onItemPress, ...props }) => (
  <NBCard variant="outline" p="0" {...props}>
    <VStack divider={<Divider />} space="0">
      {items.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => onItemPress && onItemPress(item)}
          _pressed={{ bg: "gray.50" }}
        >
          <HStack
            alignItems="center"
            justifyContent="space-between"
            px="4"
            py="3"
          >
            <HStack alignItems="center" space="3" flex={1}>
              {item.icon && (
                <Icon
                  as={MaterialIcons}
                  name={item.icon}
                  size="5"
                  color={item.iconColor || "gray.600"}
                />
              )}
              
              <VStack flex={1}>
                <Text fontSize="md" color="gray.900">
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text fontSize="sm" color="gray.600">
                    {item.subtitle}
                  </Text>
                )}
              </VStack>
            </HStack>

            {item.value && (
              <Text fontSize="sm" color="gray.700" fontWeight="500">
                {item.value}
              </Text>
            )}

            {onItemPress && (
              <Icon
                as={MaterialIcons}
                name="chevron-right"
                size="5"
                color="gray.400"
              />
            )}
          </HStack>
        </Pressable>
      ))}
    </VStack>
  </NBCard>
);

export default NBCard;