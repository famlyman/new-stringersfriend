# Stringer's Friend Component Library

A comprehensive React Native component library designed for the Stringer's Friend application. This library provides reusable, accessible, and well-tested components for building consistent user interfaces.

## 📁 Structure

```
src/components/
├── dashboard/           # Dashboard-specific components
│   ├── DashboardCard.tsx
│   ├── DashboardItems.tsx
│   ├── DashboardStats.tsx
│   └── __tests__/       # Unit tests
├── ui/                  # Generic UI components
│   └── SkeletonLoader.tsx
└── README.md           # This file
```

## 🎯 Dashboard Components

### DashboardCard

A flexible card component for displaying dashboard content with optional "View All" functionality.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | ✅ | - | The title displayed in the card header |
| `icon` | `Ionicons.glyphMap` | ✅ | - | Icon name to display next to the title |
| `children` | `ReactNode` | ✅ | - | Content to render inside the card |
| `onViewAll` | `() => void` | ❌ | - | Callback when "View All" is pressed |
| `emptyMessage` | `string` | ❌ | `'No items found'` | Message when no content |
| `emptyIcon` | `Ionicons.glyphMap` | ❌ | `'document-text-outline'` | Icon for empty state |
| `style` | `ViewStyle` | ❌ | - | Additional styles |
| `testID` | `string` | ❌ | - | Test identifier |

#### Example

```tsx
import { DashboardCard } from '@/components/dashboard/DashboardCard';

<DashboardCard
  title="Active Jobs"
  icon="briefcase-outline"
  onViewAll={() => navigation.navigate('Jobs')}
  emptyMessage="No active jobs"
>
  {jobs.map(job => (
    <JobItem key={job.id} job={job} />
  ))}
</DashboardCard>
```

### DashboardStats

A grid of statistics cards displaying key metrics.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `jobsCount` | `number` | ✅ | Number of active jobs |
| `clientsCount` | `number` | ✅ | Number of clients |
| `inventoryCount` | `number` | ✅ | Number of inventory items |
| `lowStockCount` | `number` | ✅ | Number of low stock items |

#### Example

```tsx
import { DashboardStats } from '@/components/dashboard/DashboardStats';

<DashboardStats
  jobsCount={5}
  clientsCount={12}
  inventoryCount={25}
  lowStockCount={3}
/>
```

### DashboardItems

Collection of item components for displaying data in lists.

#### JobItem

Displays job information with status badges and due dates.

```tsx
import { JobItem } from '@/components/dashboard/DashboardItems';

<JobItem
  job={jobData}
  onPress={() => navigation.navigate('JobDetails', { jobId: jobData.id })}
/>
```

#### ClientItem

Displays client information with avatar and contact details.

```tsx
import { ClientItem } from '@/components/dashboard/DashboardItems';

<ClientItem
  client={clientData}
  onPress={() => navigation.navigate('ClientDetails', { clientId: clientData.id })}
/>
```

#### InventoryItem

Displays inventory information with stock levels and low stock warnings.

```tsx
import { InventoryItem } from '@/components/dashboard/DashboardItems';

<InventoryItem
  item={inventoryData}
  onPress={() => navigation.navigate('InventoryEdit', { itemId: inventoryData.id })}
/>
```

## 🎨 UI Components

### SkeletonLoader

A loading skeleton component with shimmer animation.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `width` | `DimensionValue` | ❌ | `'100%'` | Width of the skeleton |
| `height` | `DimensionValue` | ❌ | `16` | Height of the skeleton |
| `borderRadius` | `number` | ❌ | `4` | Border radius |
| `style` | `ViewStyle` | ❌ | - | Additional styles |

#### Example

```tsx
import { SkeletonLoader, SkeletonCard } from '@/components/ui/SkeletonLoader';

// Single skeleton
<SkeletonLoader width={200} height={20} />

// Card with multiple skeletons
<SkeletonCard count={3} />
```

## 🧪 Testing

All components include comprehensive unit tests. Run tests with:

```bash
npm test
```

### Test Coverage

- ✅ Component rendering
- ✅ Props validation
- ✅ User interactions
- ✅ Edge cases
- ✅ Accessibility

## 🎨 Styling

Components use a consistent design system defined in `src/constants/colors.ts`:

```tsx
export const COLORS = {
  primary: '#11387f',      // Deep Blue
  navy: '#131c56',        // Dark Navy
  magenta: '#981b68',     // Vivid Magenta
  purple: '#510c46',      // Deep Purple
  // ... more colors
};
```

## ♿ Accessibility

All components include:

- Proper semantic markup
- Touch target sizes (minimum 44x44 points)
- Color contrast compliance
- Screen reader support
- Focus management

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (with React Native Web)

## 🚀 Performance

- Memoized components where appropriate
- Optimized re-renders
- Efficient animations using `useNativeDriver`
- Lazy loading support

## 🔧 Development

### Adding New Components

1. Create component file in appropriate directory
2. Add JSDoc documentation
3. Create unit tests
4. Update this README
5. Add to component index if needed

### Component Guidelines

- Use TypeScript for type safety
- Include comprehensive JSDoc comments
- Follow consistent naming conventions
- Implement proper error boundaries
- Add accessibility props
- Include loading states

## 📄 License

This component library is part of the Stringer's Friend application.

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on multiple platforms 