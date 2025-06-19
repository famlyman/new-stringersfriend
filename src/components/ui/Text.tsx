import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps } from 'react-native';
import { UI_KIT } from '../../styles/uiKit';

type TextVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'body' | 'bodySmall' | 'bodyLarge'
  | 'caption' | 'label' | 'link' | 'button';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
}

/**
 * A reusable text component with consistent typography using the UI Kit.
 * 
 * @example
 * ```tsx
 * <Text variant="h1" color={UI_KIT.colors.primary}>
 *   Welcome to Stringer's Friend
 * </Text>
 * 
 * <Text variant="body" style={{ marginTop: UI_KIT.spacing.md }}>
 *   This is body text with custom styling.
 * </Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  style,
  children,
  ...props
}) => {
  const getTextStyle = (): TextStyle => {
    const baseStyle = UI_KIT.text[variant];
    
    return {
      ...baseStyle,
      ...(color && { color }),
      ...style,
    };
  };

  return (
    <RNText style={getTextStyle()} {...props}>
      {children}
    </RNText>
  );
}; 