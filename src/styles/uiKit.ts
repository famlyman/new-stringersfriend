import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// SPACING SCALE
// ============================================================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const TYPOGRAPHY = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
  },
  
  // Font weights
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================
export const LAYOUT = {
  // Screen dimensions
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  // Container max widths
  container: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1200,
  },
  
  // Common aspect ratios
  aspectRatio: {
    square: 1,
    video: 16 / 9,
    photo: 4 / 3,
  },
} as const;

// ============================================================================
// COMPONENT STYLES
// ============================================================================

// Card styles
export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  elevated: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.lg,
  },
  outlined: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    padding: SPACING.md,
  },
});

// Button styles
export const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  primary: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  secondary: {
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  outline: {
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  small: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    minHeight: 24,
    borderRadius: BORDER_RADIUS.sm,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 56,
  },
});

// Text styles
export const textStyles = StyleSheet.create({
  // Headings
  h1: {
    fontSize: TYPOGRAPHY.sizes.display,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.display * TYPOGRAPHY.lineHeights.tight,
  },
  h2: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.xxxl * TYPOGRAPHY.lineHeights.tight,
  },
  h3: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.xxl * TYPOGRAPHY.lineHeights.normal,
  },
  h4: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.xl * TYPOGRAPHY.lineHeights.normal,
  },
  h5: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.normal,
  },
  h6: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.normal,
  },
  
  // Body text
  body: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.md * TYPOGRAPHY.lineHeights.normal,
  },
  bodySmall: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
  bodyLarge: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.lg * TYPOGRAPHY.lineHeights.normal,
  },
  
  // Caption and labels
  caption: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.normal,
    color: COLORS.gray,
    lineHeight: TYPOGRAPHY.sizes.xs * TYPOGRAPHY.lineHeights.normal,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
  
  // Interactive text
  link: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  button: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
});

// Input styles
export const inputStyles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  focused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: COLORS.red,
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: COLORS.lightGray,
    color: COLORS.gray,
  },
  large: {
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  small: {
    paddingVertical: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});

// List styles
export const listStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  item: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  itemSelected: {
    backgroundColor: 'rgba(17, 56, 127, 0.05)',
  },
});

// Badge styles
export const badgeStyles = StyleSheet.create({
  base: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: 'rgba(17, 56, 127, 0.1)',
  },
  success: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  warning: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  error: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  neutral: {
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
  },
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get responsive spacing based on screen size
 */
export const getResponsiveSpacing = (baseSpacing: number): number => {
  if (SCREEN_WIDTH < 375) return baseSpacing * 0.8; // Small phones
  if (SCREEN_WIDTH < 768) return baseSpacing; // Normal phones
  return baseSpacing * 1.2; // Tablets and larger
};

/**
 * Get responsive font size based on screen size
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  if (SCREEN_WIDTH < 375) return baseSize * 0.9; // Small phones
  if (SCREEN_WIDTH < 768) return baseSize; // Normal phones
  return baseSize * 1.1; // Tablets and larger
};

/**
 * Create a consistent margin/padding object
 */
export const createSpacing = (top: number, right?: number, bottom?: number, left?: number) => ({
  marginTop: top,
  marginRight: right ?? top,
  marginBottom: bottom ?? top,
  marginLeft: left ?? right ?? top,
});

/**
 * Create a consistent padding object
 */
export const createPadding = (top: number, right?: number, bottom?: number, left?: number) => ({
  paddingTop: top,
  paddingRight: right ?? top,
  paddingBottom: bottom ?? top,
  paddingLeft: left ?? right ?? top,
});

// ============================================================================
// THEME EXPORT
// ============================================================================
export const UI_KIT = {
  spacing: SPACING,
  typography: TYPOGRAPHY,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  layout: LAYOUT,
  colors: COLORS,
  card: cardStyles,
  button: buttonStyles,
  text: textStyles,
  input: inputStyles,
  list: listStyles,
  badge: badgeStyles,
  utils: {
    getResponsiveSpacing,
    getResponsiveFontSize,
    createSpacing,
    createPadding,
  },
} as const;

export default UI_KIT; 