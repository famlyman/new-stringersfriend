import React from 'react';
import { View, ViewStyle } from 'react-native';
import { UI_KIT } from '../../styles/uiKit';
import { Text } from './Text';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A reusable badge component with consistent styling using the UI Kit.
 * 
 * @example
 * ```tsx
 * <Badge variant="success" label="Completed" />
 * <Badge variant="warning" label="Pending" />
 * <Badge variant="error" label="Failed" />
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
  testID,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    return {
      ...UI_KIT.badge.base,
      ...UI_KIT.badge[variant],
      ...style,
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return UI_KIT.colors.primary;
      case 'success':
        return UI_KIT.colors.green;
      case 'warning':
        return UI_KIT.colors.orange;
      case 'error':
        return UI_KIT.colors.red;
      case 'neutral':
        return UI_KIT.colors.gray;
      default:
        return UI_KIT.colors.primary;
    }
  };

  return (
    <View style={getBadgeStyle()} testID={testID}>
      <Text 
        variant="caption" 
        color={getTextColor()}
        style={{ fontWeight: UI_KIT.typography.weights.semibold }}
      >
        {label}
      </Text>
    </View>
  );
}; 