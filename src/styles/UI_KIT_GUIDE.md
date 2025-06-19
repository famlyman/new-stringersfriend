# UI Kit Guide

A comprehensive design system for Stringer's Friend that ensures consistency across all components and screens.

## 🎨 Quick Start

```tsx
import { UI_KIT, Button, Text, Card, Badge } from '@/components';

// Use the UI Kit
<Card variant="elevated" style={{ marginBottom: UI_KIT.spacing.md }}>
  <Text variant="h3">Welcome</Text>
  <Text variant="body">This uses our design system.</Text>
  <Button title="Get Started" onPress={handlePress} />
</Card>
```

## 📏 Spacing Scale

Use consistent spacing throughout your app:

```tsx
import { SPACING } from '@/components';

// Available spacing values
SPACING.xs   // 4px
SPACING.sm   // 8px
SPACING.md   // 16px
SPACING.lg   // 24px
SPACING.xl   // 32px
SPACING.xxl  // 48px
SPACING.xxxl // 64px

// Usage
<View style={{ marginBottom: SPACING.md, padding: SPACING.lg }}>
```

## 🔤 Typography System

### Text Variants

```tsx
import { Text } from '@/components';

// Headings
<Text variant="h1">Display Heading</Text>
<Text variant="h2">Large Heading</Text>
<Text variant="h3">Medium Heading</Text>
<Text variant="h4">Small Heading</Text>
<Text variant="h5">Tiny Heading</Text>
<Text variant="h6">Micro Heading</Text>

// Body Text
<Text variant="body">Regular body text</Text>
<Text variant="bodySmall">Small body text</Text>
<Text variant="bodyLarge">Large body text</Text>

// Special Text
<Text variant="caption">Caption text</Text>
<Text variant="label">Label text</Text>
<Text variant="link">Link text</Text>
<Text variant="button">Button text</Text>
```

### Font Sizes & Weights

```tsx
import { TYPOGRAPHY } from '@/components';

// Font sizes
TYPOGRAPHY.sizes.xs      // 12px
TYPOGRAPHY.sizes.sm      // 14px
TYPOGRAPHY.sizes.md      // 16px
TYPOGRAPHY.sizes.lg      // 18px
TYPOGRAPHY.sizes.xl      // 20px
TYPOGRAPHY.sizes.xxl     // 24px
TYPOGRAPHY.sizes.xxxl    // 28px
TYPOGRAPHY.sizes.display // 32px

// Font weights
TYPOGRAPHY.weights.normal    // 400
TYPOGRAPHY.weights.medium    // 500
TYPOGRAPHY.weights.semibold  // 600
TYPOGRAPHY.weights.bold      // 700
TYPOGRAPHY.weights.extrabold // 800
```

## 🎯 Component Library

### Button Component

```tsx
import { Button } from '@/components';

// Variants
<Button title="Primary" variant="primary" onPress={handlePress} />
<Button title="Secondary" variant="secondary" onPress={handlePress} />
<Button title="Outline" variant="outline" onPress={handlePress} />
<Button title="Text" variant="text" onPress={handlePress} />

// Sizes
<Button title="Small" size="small" onPress={handlePress} />
<Button title="Medium" size="medium" onPress={handlePress} />
<Button title="Large" size="large" onPress={handlePress} />

// With icons
<Button 
  title="Save" 
  icon="checkmark" 
  iconPosition="left"
  onPress={handlePress} 
/>

// States
<Button title="Loading" loading={true} onPress={handlePress} />
<Button title="Disabled" disabled={true} onPress={handlePress} />
```

### Card Component

```tsx
import { Card, CardHeader, CardContent } from '@/components';

// Basic card
<Card>
  <Text variant="h3">Card Title</Text>
  <Text variant="body">Card content</Text>
</Card>

// Card variants
<Card variant="base">Base card</Card>
<Card variant="elevated">Elevated card</Card>
<Card variant="outlined">Outlined card</Card>

// Structured card
<Card>
  <CardHeader>
    <Text variant="h4">Header</Text>
  </CardHeader>
  <CardContent>
    <Text variant="body">Content</Text>
  </CardContent>
</Card>
```

### Badge Component

```tsx
import { Badge } from '@/components';

// Variants
<Badge variant="primary" label="Primary" />
<Badge variant="success" label="Success" />
<Badge variant="warning" label="Warning" />
<Badge variant="error" label="Error" />
<Badge variant="neutral" label="Neutral" />
```

### Text Component

```tsx
import { Text } from '@/components';

// Basic usage
<Text variant="h1">Heading</Text>
<Text variant="body">Body text</Text>

// With custom color
<Text variant="body" color={UI_KIT.colors.primary}>
  Colored text
</Text>

// With custom styling
<Text 
  variant="body" 
  style={{ marginTop: UI_KIT.spacing.md }}
>
  Custom styled text
</Text>
```

## 🎨 Colors

```tsx
import { UI_KIT } from '@/components';

// Brand Colors
UI_KIT.colors.primary  // #11387f - Deep Blue
UI_KIT.colors.navy     // #131c56 - Dark Navy
UI_KIT.colors.magenta  // #981b68 - Vivid Magenta
UI_KIT.colors.purple   // #510c46 - Deep Purple

// UI Colors
UI_KIT.colors.background // #f5f5f5
UI_KIT.colors.white      // #fff
UI_KIT.colors.text       // #222
UI_KIT.colors.textLight  // #888

// Status Colors
UI_KIT.colors.success    // #34C759 - Green
UI_KIT.colors.warning    // #FF9500 - Orange
UI_KIT.colors.error      // #FF3B30 - Red
UI_KIT.colors.info       // #007AFF - Blue

// Additional Colors
UI_KIT.colors.gray       // #8E8E93
UI_KIT.colors.lightGray  // #F2F2F7
UI_KIT.colors.green      // #34C759
UI_KIT.colors.orange     // #FF9500
UI_KIT.colors.red        // #FF3B30
UI_KIT.colors.blue       // #007AFF
```

## 🔲 Border Radius

```tsx
import { BORDER_RADIUS } from '@/components';

// Available values
BORDER_RADIUS.none  // 0px
BORDER_RADIUS.sm    // 4px
BORDER_RADIUS.md    // 8px
BORDER_RADIUS.lg    // 12px
BORDER_RADIUS.xl    // 16px
BORDER_RADIUS.xxl   // 24px
BORDER_RADIUS.full  // 9999px (circular)
```

## 🌟 Shadows

```tsx
import { SHADOWS } from '@/components';

// Available shadows
SHADOWS.sm  // Small shadow
SHADOWS.md  // Medium shadow
SHADOWS.lg  // Large shadow
SHADOWS.xl  // Extra large shadow

// Usage
<View style={SHADOWS.md}>
  <Text>Content with shadow</Text>
</View>
```

## 📱 Responsive Design

```tsx
import { UI_KIT } from '@/components';

// Responsive spacing
const responsiveSpacing = UI_KIT.utils.getResponsiveSpacing(16);

// Responsive font size
const responsiveFontSize = UI_KIT.utils.getResponsiveFontSize(16);

// Create spacing objects
const margin = UI_KIT.utils.createSpacing(16); // All sides
const padding = UI_KIT.utils.createPadding(16, 24); // Top/bottom, left/right
```

## 🎯 Best Practices

### 1. Use the UI Kit Consistently

✅ **Good:**
```tsx
<View style={{ marginBottom: UI_KIT.spacing.md }}>
  <Text variant="h3">Title</Text>
  <Text variant="body">Content</Text>
</View>
```

❌ **Avoid:**
```tsx
<View style={{ marginBottom: 20 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>
  <Text style={{ fontSize: 16 }}>Content</Text>
</View>
```

### 2. Use Component Variants

✅ **Good:**
```tsx
<Button variant="primary" title="Save" onPress={handleSave} />
<Badge variant="success" label="Completed" />
```

❌ **Avoid:**
```tsx
<TouchableOpacity style={{ backgroundColor: '#11387f', padding: 8 }}>
  <Text style={{ color: 'white' }}>Save</Text>
</TouchableOpacity>
```

### 3. Leverage the Spacing Scale

✅ **Good:**
```tsx
<View style={{ 
  padding: UI_KIT.spacing.md,
  marginBottom: UI_KIT.spacing.lg 
}}>
```

❌ **Avoid:**
```tsx
<View style={{ 
  padding: 15,
  marginBottom: 25 
}}>
```

## 🔧 Migration Guide

### From Custom Styles to UI Kit

**Before:**
```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
});
```

**After:**
```tsx
import { UI_KIT, Card, Text } from '@/components';

<Card variant="elevated" style={{ marginBottom: UI_KIT.spacing.md }}>
  <Text variant="h3" style={{ marginBottom: UI_KIT.spacing.sm }}>
    Title
  </Text>
</Card>
```

## 📚 Component Examples

### Profile Card
```tsx
<Card variant="elevated">
  <CardHeader>
    <Text variant="h4">Profile</Text>
  </CardHeader>
  <CardContent>
    <Text variant="body">Name: John Doe</Text>
    <Text variant="body">Email: john@example.com</Text>
    <Badge variant="success" label="Verified" />
  </CardContent>
</Card>
```

### Action Buttons
```tsx
<View style={{ flexDirection: 'row', gap: UI_KIT.spacing.sm }}>
  <Button 
    title="Cancel" 
    variant="outline" 
    onPress={handleCancel} 
  />
  <Button 
    title="Save" 
    variant="primary" 
    icon="checkmark"
    onPress={handleSave} 
  />
</View>
```

### Status Display
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: UI_KIT.spacing.sm }}>
  <Text variant="body">Status:</Text>
  <Badge variant="warning" label="In Progress" />
</View>
```

This UI Kit provides everything you need to build consistent, beautiful interfaces across your entire application! 