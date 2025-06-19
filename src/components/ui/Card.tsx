import React from 'react';
import { View, ViewStyle } from 'react-native';
import { UI_KIT } from '../../styles/uiKit';

type CardVariant = 'base' | 'elevated' | 'outlined';

interface CardProps {
  variant?: CardVariant;
  style?: ViewStyle;
  children: React.ReactNode;
  testID?: string;
}

/**
 * A reusable card component with consistent styling using the UI Kit.
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" style={{ marginBottom: UI_KIT.spacing.md }}>
 *   <Text variant="h3">Card Title</Text>
 *   <Text variant="body">Card content goes here.</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  variant = 'base',
  style,
  children,
  testID,
}) => {
  const getCardStyle = (): ViewStyle => {
    return {
      ...UI_KIT.card[variant],
      ...style,
    };
  };

  return (
    <View style={getCardStyle()} testID={testID}>
      {children}
    </View>
  );
};

// Card Header component
interface CardHeaderProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ style, children }) => {
  return (
    <View style={[UI_KIT.card.header, style]}>
      {children}
    </View>
  );
};

// Card Content component
interface CardContentProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ style, children }) => {
  return (
    <View style={[UI_KIT.card.content, style]}>
      {children}
    </View>
  );
}; 