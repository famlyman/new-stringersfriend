import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UI_KIT } from '../../styles/uiKit';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * A reusable button component with consistent styling using the UI Kit.
 * 
 * @example
 * ```tsx
 * <Button
 *   title="Save Changes"
 *   onPress={handleSave}
 *   variant="primary"
 *   size="large"
 *   icon="checkmark"
 * />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle[] = [UI_KIT.button.base];
    
    // Add variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(UI_KIT.button.primary as ViewStyle);
        break;
      case 'secondary':
        baseStyle.push(UI_KIT.button.secondary as ViewStyle);
        break;
      case 'outline':
        baseStyle.push(UI_KIT.button.outline as ViewStyle);
        break;
      case 'text':
        baseStyle.push(UI_KIT.button.text as ViewStyle);
        break;
    }
    
    // Add size styles
    switch (size) {
      case 'small':
        baseStyle.push(UI_KIT.button.small as ViewStyle);
        break;
      case 'large':
        baseStyle.push(UI_KIT.button.large as ViewStyle);
        break;
    }
    
    // Add disabled state
    if (disabled) {
      baseStyle.push({ opacity: 0.5 });
    }
    
    return Object.assign({}, ...baseStyle);
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle[] = [UI_KIT.text.button];
    
    // Add variant-specific text colors
    switch (variant) {
      case 'primary':
        baseTextStyle.push({ color: UI_KIT.colors.white });
        break;
      case 'secondary':
        baseTextStyle.push({ color: UI_KIT.colors.text });
        break;
      case 'outline':
        baseTextStyle.push({ color: UI_KIT.colors.primary });
        break;
      case 'text':
        baseTextStyle.push({ color: UI_KIT.colors.primary });
        break;
    }
    
    // Add size-specific text sizes
    switch (size) {
      case 'small':
        baseTextStyle.push({ fontSize: UI_KIT.typography.sizes.sm });
        break;
      case 'large':
        baseTextStyle.push({ fontSize: UI_KIT.typography.sizes.lg });
        break;
    }
    
    return Object.assign({}, ...baseTextStyle);
  };

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const iconColor = variant === 'primary' ? UI_KIT.colors.white : UI_KIT.colors.primary;
    
    return (
      <Ionicons 
        name={icon} 
        size={iconSize} 
        color={iconColor}
        style={{ 
          marginRight: iconPosition === 'left' ? UI_KIT.spacing.xs : 0,
          marginLeft: iconPosition === 'right' ? UI_KIT.spacing.xs : 0,
        }} 
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Ionicons 
            name="reload" 
            size={20} 
            color={variant === 'primary' ? UI_KIT.colors.white : UI_KIT.colors.primary}
            style={{ marginRight: UI_KIT.spacing.xs }}
          />
          <Text style={[getTextStyle(), textStyle]}>Loading...</Text>
        </>
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}; 