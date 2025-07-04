import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Shadows } from "../../constants/theme";
import { lightTheme } from "../../constants/Colors";

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
  px = 16,
  py = 16,
  m = 8,
  bg = lightTheme.white,
  borderColor = lightTheme.gray200,
  shadow = "md",
  style,
  ...props
}) => {
  const getVariantStyle = () => {
    const baseStyle = {
      backgroundColor: bg,
      borderRadius: 12,
      paddingHorizontal: px,
      paddingVertical: py,
      margin: m,
      overflow: "hidden",
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          ...(Shadows[shadow] || Shadows.md),
        };
      case "outline":
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: borderColor,
        };
      case "filled":
        return {
          ...baseStyle,
          backgroundColor: bg,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return {
          ...baseStyle,
          ...(Shadows[shadow] || Shadows.md),
        };
    }
  };

  const getBadgeColor = (colorScheme) => {
    switch (colorScheme) {
      case "success":
        return { backgroundColor: lightTheme.success + "20", color: lightTheme.success };
      case "warning":
        return { backgroundColor: lightTheme.warning + "20", color: lightTheme.warning };
      case "danger":
        return { backgroundColor: lightTheme.error + "20", color: lightTheme.error };
      default:
        return { backgroundColor: lightTheme.primary + "20", color: lightTheme.primary };
    }
  };

  const CardContent = () => (
    <>
      {image && (
        <Image
          source={typeof image === "string" ? { uri: image } : image}
          style={{
            height: imageHeight,
            width: "100%",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            marginBottom: -16,
            marginTop: -16,
            marginHorizontal: -16,
          }}
        />
      )}

      {(title || subtitle || badge || icon || headerAction) && (
        <View style={{ marginBottom: showDivider ? 12 : 0 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              {icon && (
                <View style={{ marginRight: 8 }}>
                  <MaterialIcons name={icon} size={24} color={lightTheme.primary} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                {title && (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: lightTheme.gray900,
                      marginBottom: subtitle ? 2 : 0,
                    }}
                  >
                    {title}
                  </Text>
                )}

                {subtitle && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: lightTheme.gray600,
                    }}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>

              {badge && (
                <View
                  style={{
                    ...getBadgeColor(badge.colorScheme),
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: getBadgeColor(badge.colorScheme).color,
                    }}
                  >
                    {badge.text}
                  </Text>
                </View>
              )}
            </View>

            {headerAction}
          </View>
        </View>
      )}

      {showDivider && (title || subtitle) && children && (
        <View
          style={{ height: 1, backgroundColor: lightTheme.gray200, marginBottom: 12 }}
        />
      )}

      {children}

      {footer && (
        <>
          <View
            style={{
              height: 1,
              backgroundColor: lightTheme.gray200,
              marginTop: 12,
              marginBottom: 12,
            }}
          />
          {footer}
        </>
      )}
    </>
  );

  const cardStyle = [getVariantStyle(), style];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={cardStyle}
        {...props}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      <CardContent />
    </View>
  );
};

// Predefined card variants for common use cases
export const NBInfoCard = ({
  title,
  value,
  icon,
  color = lightTheme.primary,
  ...props
}) => (
  <NBCard variant="elevated" px={16} py={20} {...props}>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: lightTheme.gray600,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: lightTheme.gray900,
          }}
        >
          {value}
        </Text>
      </View>

      {icon && (
        <View
          style={{
            backgroundColor: `${color}1A`,
            padding: 12,
            borderRadius: 50,
          }}
        >
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
      )}
    </View>
  </NBCard>
);

export const NBListCard = ({ items, onItemPress, ...props }) => (
  <NBCard variant="outline" px={0} py={0} {...props}>
    <View>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onItemPress && onItemPress(item)}
          activeOpacity={0.7}
          style={{
            backgroundColor: index % 2 === 1 ? lightTheme.gray50 : "transparent",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: index < items.length - 1 ? 1 : 0,
              borderBottomColor: lightTheme.gray200,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              {item.icon && (
                <View style={{ marginRight: 12 }}>
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={item.iconColor || lightTheme.gray600}
                  />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: lightTheme.gray900,
                  }}
                >
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: lightTheme.gray600,
                    }}
                  >
                    {item.subtitle}
                  </Text>
                )}
              </View>
            </View>

            {item.value && (
              <Text
                style={{
                  fontSize: 14,
                  color: lightTheme.gray700,
                  fontWeight: "500",
                }}
              >
                {item.value}
              </Text>
            )}

            {onItemPress && (
              <MaterialIcons name="chevron-right" size={20} color={lightTheme.gray400} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </NBCard>
);

export default NBCard;
