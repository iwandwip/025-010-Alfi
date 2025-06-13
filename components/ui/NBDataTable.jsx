import React from "react";
import {
  Box,
  ScrollView,
  Table,
  Text,
  HStack,
  IconButton,
  Icon,
  Badge,
  Divider,
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const NBDataTable = ({ 
  headers, 
  data, 
  onEdit, 
  onDelete, 
  keyExtractor,
  showActions = true,
  striped = true,
  variant = "simple",
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
      case "lunas":
        return "success";
      case "pending":
      case "belum_bayar":
        return "warning";
      case "inactive":
      case "error":
      case "terlambat":
        return "danger";
      default:
        return "coolGray";
    }
  };

  const formatNumber = (value) => {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    return String(value);
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderCell = (value, columnIndex, rowIndex, row) => {
    // Actions column
    if (showActions && columnIndex === headers.length - 1) {
      return (
        <HStack space={1} justifyContent="center">
          {onEdit && (
            <IconButton
              icon={<Icon as={MaterialIcons} name="edit" />}
              borderRadius="full"
              size="sm"
              variant="solid"
              bg={Colors.primary}
              _pressed={{ bg: `${Colors.primary}CC` }}
              onPress={() => onEdit(row)}
              accessibilityLabel="Edit"
            />
          )}
          {onDelete && (
            <IconButton
              icon={<Icon as={MaterialIcons} name="delete" />}
              borderRadius="full"
              size="sm"
              variant="solid"
              bg={Colors.error}
              _pressed={{ bg: `${Colors.error}CC` }}
              onPress={() => onDelete(row)}
              accessibilityLabel="Delete"
            />
          )}
        </HStack>
      );
    }

    // Status column (assuming it's column 3)
    if (columnIndex === 3 && typeof value === "string" && (
      value.toLowerCase().includes("active") ||
      value.toLowerCase().includes("inactive") ||
      value.toLowerCase().includes("pending") ||
      value.toLowerCase().includes("completed") ||
      value.toLowerCase().includes("error") ||
      value.toLowerCase().includes("lunas") ||
      value.toLowerCase().includes("belum_bayar") ||
      value.toLowerCase().includes("terlambat")
    )) {
      return (
        <Badge
          colorScheme={getStatusColor(value)}
          variant="subtle"
          borderRadius="full"
          px={3}
        >
          {String(value)}
        </Badge>
      );
    }

    // DateTime column (assuming it's column 0)
    if (columnIndex === 0 && value && (value instanceof Date || typeof value === "string")) {
      return (
        <Text fontSize="xs" fontFamily="monospace" color={Colors.gray700}>
          {formatDateTime(value)}
        </Text>
      );
    }

    // Number columns (assuming columns 1 and 2)
    if ((columnIndex === 1 || columnIndex === 2) && typeof value === "number") {
      return (
        <Text fontSize="sm" fontFamily="monospace" fontWeight="500" color={Colors.gray700}>
          {formatNumber(value)}
        </Text>
      );
    }

    // Default cell
    return (
      <Text fontSize="sm" color={Colors.gray700} numberOfLines={2}>
        {String(value || "")}
      </Text>
    );
  };

  const getCellWidth = (index) => {
    const widths = ["120px", "90px", "90px", "90px", "90px"];
    return widths[index] || "90px";
  };

  return (
    <Box
      bg={Colors.white}
      borderRadius={12}
      borderWidth={1}
      borderColor={Colors.gray200}
      overflow="hidden"
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Box minW="100%">
          {/* Header */}
          <HStack
            bg={Colors.gray50}
            borderBottomWidth={2}
            borderBottomColor={Colors.gray200}
            px={2}
            py={3}
          >
            {headers.map((header, index) => (
              <Box
                key={index}
                w={getCellWidth(index)}
                px={2}
                alignItems="center"
                borderRightWidth={index < headers.length - 1 ? 1 : 0}
                borderRightColor={Colors.gray200}
              >
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color={Colors.gray900}
                  textAlign="center"
                >
                  {header}
                </Text>
              </Box>
            ))}
          </HStack>

          {/* Data Rows */}
          {data.map((row, rowIndex) => {
            const rowData = [
              row.datetime,
              row.value1,
              row.value2,
              row.status,
              showActions ? row : null,
            ].filter((_, idx) => idx < headers.length);

            return (
              <HStack
                key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}
                bg={striped && rowIndex % 2 === 0 ? Colors.white : Colors.gray25}
                borderBottomWidth={1}
                borderBottomColor={Colors.gray100}
                px={2}
                py={3}
                _hover={{
                  bg: Colors.gray50,
                }}
              >
                {rowData.map((cellValue, cellIndex) => (
                  <Box
                    key={cellIndex}
                    w={getCellWidth(cellIndex)}
                    px={2}
                    alignItems="center"
                    justifyContent="center"
                    borderRightWidth={cellIndex < headers.length - 1 ? 1 : 0}
                    borderRightColor={Colors.gray100}
                  >
                    {renderCell(cellValue, cellIndex, rowIndex, row)}
                  </Box>
                ))}
              </HStack>
            );
          })}

          {/* Empty State */}
          {data.length === 0 && (
            <Box py={8} alignItems="center">
              <Text color={Colors.gray500} fontSize="md">
                Tidak ada data untuk ditampilkan
              </Text>
            </Box>
          )}
        </Box>
      </ScrollView>
    </Box>
  );
};

export default NBDataTable;