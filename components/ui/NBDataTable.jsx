import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const NBDataTable = ({ 
  headers, 
  data, 
  onEdit, 
  onDelete, 
  keyExtractor,
  showActions = true,
  striped = true,
  variant = 'simple',
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'lunas':
        return { backgroundColor: '#D4EDDA', color: '#155724' };
      case 'pending':
      case 'belum_bayar':
        return { backgroundColor: '#FFF3CD', color: '#856404' };
      case 'inactive':
      case 'error':
      case 'terlambat':
        return { backgroundColor: '#F8D7DA', color: '#721C24' };
      default:
        return { backgroundColor: '#F8F9FA', color: '#6C757D' };
    }
  };

  const formatNumber = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return String(value);
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderCell = (value, columnIndex, rowIndex, row) => {
    // Actions column
    if (showActions && columnIndex === headers.length - 1) {
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(row)}
              style={{
                backgroundColor: '#F50057',
                padding: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                marginRight: onDelete ? 4 : 0,
              }}
              accessibilityLabel="Edit"
            >
              <MaterialIcons name="edit" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(row)}
              style={{
                backgroundColor: '#F44336',
                padding: 8,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                marginLeft: onEdit ? 4 : 0,
              }}
              accessibilityLabel="Delete"
            >
              <MaterialIcons name="delete" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Status column (assuming it's column 3)
    if (columnIndex === 3 && typeof value === 'string' && (
      value.toLowerCase().includes('active') ||
      value.toLowerCase().includes('inactive') ||
      value.toLowerCase().includes('pending') ||
      value.toLowerCase().includes('completed') ||
      value.toLowerCase().includes('error') ||
      value.toLowerCase().includes('lunas') ||
      value.toLowerCase().includes('belum_bayar') ||
      value.toLowerCase().includes('terlambat')
    )) {
      const statusColors = getStatusColor(value);
      return (
        <View style={{
          ...statusColors,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: statusColors.color,
          }}>
            {String(value)}
          </Text>
        </View>
      );
    }

    // DateTime column (assuming it's column 0)
    if (columnIndex === 0 && value && (value instanceof Date || typeof value === 'string')) {
      return (
        <Text style={{
          fontSize: 12,
          color: '#4A4A4A',
        }}>
          {formatDateTime(value)}
        </Text>
      );
    }

    // Number columns (assuming columns 1 and 2)
    if ((columnIndex === 1 || columnIndex === 2) && typeof value === 'number') {
      return (
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#4A4A4A',
        }}>
          {formatNumber(value)}
        </Text>
      );
    }

    // Default cell
    return (
      <Text style={{
        fontSize: 14,
        color: '#4A4A4A',
      }} numberOfLines={2}>
        {String(value || '')}
      </Text>
    );
  };

  const getCellWidth = (index) => {
    const widths = [120, 90, 90, 90, 90];
    return widths[index] || 90;
  };

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      overflow: 'hidden',
    }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>
          {/* Header */}
          <View style={{
            backgroundColor: '#F8F9FA',
            borderBottomWidth: 2,
            borderBottomColor: '#E0E0E0',
            paddingHorizontal: 8,
            paddingVertical: 12,
            flexDirection: 'row',
          }}>
            {headers.map((header, index) => (
              <View
                key={index}
                style={{
                  width: getCellWidth(index),
                  paddingHorizontal: 8,
                  alignItems: 'center',
                  borderRightWidth: index < headers.length - 1 ? 1 : 0,
                  borderRightColor: '#E0E0E0',
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#1A1A1A',
                  textAlign: 'center',
                }}>
                  {header}
                </Text>
              </View>
            ))}
          </View>

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
              <TouchableOpacity
                key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}
                activeOpacity={0.7}
                style={{
                  backgroundColor: striped && rowIndex % 2 === 0 ? '#FFFFFF' : '#F8F9FA',
                  borderBottomWidth: 1,
                  borderBottomColor: '#F0F0F0',
                  paddingHorizontal: 8,
                  paddingVertical: 12,
                  flexDirection: 'row',
                }}
              >
                {rowData.map((cellValue, cellIndex) => (
                  <View
                    key={cellIndex}
                    style={{
                      width: getCellWidth(cellIndex),
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRightWidth: cellIndex < headers.length - 1 ? 1 : 0,
                      borderRightColor: '#F0F0F0',
                    }}
                  >
                    {renderCell(cellValue, cellIndex, rowIndex, row)}
                  </View>
                ))}
              </TouchableOpacity>
            );
          })}

          {/* Empty State */}
          {data.length === 0 && (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ color: '#999999', fontSize: 16 }}>
                Tidak ada data untuk ditampilkan
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default NBDataTable;