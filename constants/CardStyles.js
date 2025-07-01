import { StyleSheet } from 'react-native';
import { lightTheme as Colors } from './Colors';
import { Spacing, BorderRadius, Shadows, Typography } from './theme';

export const CardStyles = StyleSheet.create({
  // Base card styles
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  
  cardCompact: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadows.xs,
  },
  
  cardLarge: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  
  // Card sections
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  
  cardContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  
  cardFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  
  // Card with proper padding
  cardWithPadding: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  
  // Interactive card
  cardPressable: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    activeOpacity: 0.95,
  },
  
  // List item card
  listCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.xs,
  },
  
  // Status cards
  successCard: {
    backgroundColor: Colors.successContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success + '20',
  },
  
  warningCard: {
    backgroundColor: Colors.warningContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warning + '20',
  },
  
  errorCard: {
    backgroundColor: Colors.errorContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  
  // Typography styles for cards
  cardTitle: {
    ...Typography.h5,
    marginBottom: Spacing.xs,
  },
  
  cardSubtitle: {
    ...Typography.subtitle2,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  
  cardBody: {
    ...Typography.body2,
    color: Colors.text,
    lineHeight: 22,
  },
  
  cardCaption: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  
  // Sections within cards
  cardSection: {
    marginBottom: Spacing.md,
  },
  
  cardSectionLast: {
    marginBottom: 0,
  },
  
  // Row layouts
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  cardRowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  // Avatar styles
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cardAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Icon container
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  // Chip/Badge styles
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  
  cardChipText: {
    ...Typography.caption,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  
  // Divider
  cardDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  
  // Action buttons container
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  
  cardActionsSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
});

// Helper function to get consistent card style
export const getCardStyle = (type = 'default', pressed = false) => {
  const baseStyle = type === 'compact' ? CardStyles.cardCompact : 
                    type === 'large' ? CardStyles.cardLarge : 
                    CardStyles.card;
  
  if (pressed) {
    return {
      ...baseStyle,
      transform: [{ scale: 0.98 }],
      ...Shadows.xs,
    };
  }
  
  return baseStyle;
};

// Helper function for status card styles
export const getStatusCardStyle = (status) => {
  switch (status) {
    case 'success':
    case 'lunas':
      return CardStyles.successCard;
    case 'warning':
    case 'belumBayar':
      return CardStyles.warningCard;
    case 'error':
    case 'terlambat':
      return CardStyles.errorCard;
    default:
      return CardStyles.card;
  }
};