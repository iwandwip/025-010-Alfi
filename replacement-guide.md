# React Native Paper Replacement Guide

This document outlines the systematic replacement of react-native-paper components with React Native core components and custom components.

## Import Replacements

### Remove these imports:
```javascript
import {
  Surface,
  Text,
  Card,
  Avatar,
  Chip,
  IconButton,
  ActivityIndicator,
  useTheme,
  Button,
  Divider,
  FAB,
  Modal,
  Portal,
  Searchbar
} from "react-native-paper";
```

### Replace with:
```javascript
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import NBCard from '../../components/ui/NBCard';
```

## Component Replacements

### 1. Surface → View
```javascript
// Before
<Surface style={styles.header} elevation={2}>

// After
<View style={[styles.header, Shadows.md]}>
```

### 2. Text variants → Standard Text with styles
```javascript
// Before
<Text variant="headlineMedium" style={styles.title}>

// After
<Text style={[styles.title, { fontSize: 20, fontWeight: '600', color: Colors.text }]}>
```

### 3. Card → NBCard or styled View
```javascript
// Before
<Card style={styles.card} mode="elevated">
  <Card.Content>
    Content here
  </Card.Content>
</Card>

// After
<View style={[styles.card, Shadows.md, { backgroundColor: Colors.surface, borderRadius: 16, padding: 16 }]}>
  Content here
</View>
```

### 4. Avatar → Custom View with MaterialIcons
```javascript
// Before
<Avatar.Text size={48} label="W" />
<Avatar.Icon size={48} icon="account" />

// After
<View style={styles.avatar}>
  <Text style={styles.avatarText}>W</Text>
</View>

<View style={styles.avatarIcon}>
  <MaterialIcons name="person" size={32} color={Colors.primary} />
</View>
```

### 5. Chip → Styled View
```javascript
// Before
<Chip icon="check" mode="flat">Status</Chip>

// After
<View style={styles.chip}>
  <MaterialIcons name="check" size={16} color={Colors.success} />
  <Text style={styles.chipText}>Status</Text>
</View>
```

### 6. IconButton → TouchableOpacity with MaterialIcons
```javascript
// Before
<IconButton icon="arrow-left" onPress={onPress} />

// After
<TouchableOpacity onPress={onPress} style={styles.iconButton}>
  <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
</TouchableOpacity>
```

### 7. Button → Custom Button component
```javascript
// Before
<Button mode="contained" onPress={onPress}>Title</Button>

// After
<Button title="Title" onPress={onPress} variant="primary" />
```

### 8. Divider → View with backgroundColor
```javascript
// Before
<Divider />

// After
<View style={styles.divider} />

// Add to styles:
divider: {
  height: 1,
  backgroundColor: Colors.border,
  marginVertical: 8,
}
```

### 9. FAB → TouchableOpacity with styling
```javascript
// Before
<FAB icon="plus" onPress={onPress} style={styles.fab} />

// After
<TouchableOpacity style={styles.fab} onPress={onPress}>
  <MaterialIcons name="add" size={24} color={Colors.textInverse} />
</TouchableOpacity>

// Add to styles:
fab: {
  position: 'absolute',
  bottom: 16,
  right: 16,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: Colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  ...Shadows.lg,
}
```

### 10. useTheme → Colors from constants
```javascript
// Before
const theme = useTheme();
style={{ color: theme.colors.primary }}

// After
style={{ color: Colors.primary }}
```

## Style Patterns

### Shadow Replacement
```javascript
// Add shadows using the constants
...Shadows.sm  // Light shadow
...Shadows.md  // Medium shadow  
...Shadows.lg  // Heavy shadow
```

### Color Usage
```javascript
backgroundColor: Colors.surface
color: Colors.text
borderColor: Colors.border
```

### Common Style Patterns
```javascript
const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    ...Shadows.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Shadows.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
});
```

This guide should be applied systematically to all 22 files listed in the original request.