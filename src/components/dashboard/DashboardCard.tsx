import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Props for the DashboardCard component
 */
export type DashboardCardProps = {
  /** The title displayed in the card header */
  title: string;
  /** Ionicons icon name to display next to the title */
  icon: keyof typeof Ionicons.glyphMap;
  /** Optional callback function when "View All" is pressed */
  onViewAll?: () => void;
  /** The content to render inside the card */
  children: ReactNode;
  /** Custom message to display when there's no content */
  emptyMessage?: string;
  /** Icon to display in the empty state */
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  /** Additional styles to apply to the card container */
  style?: ViewStyle;
  /** Test ID for testing purposes */
  testID?: string;
};

/**
 * A reusable card component for displaying dashboard content with optional "View All" functionality.
 * 
 * This component provides a consistent layout for dashboard sections with:
 * - A header with title and icon
 * - Optional "View All" button
 * - Content area that can display items or an empty state
 * - Consistent styling and spacing
 * 
 * @example
 * ```tsx
 * <DashboardCard
 *   title="Active Jobs"
 *   icon="briefcase-outline"
 *   onViewAll={() => navigation.navigate('Jobs')}
 *   emptyMessage="No active jobs"
 * >
 *   {jobs.map(job => <JobItem key={job.id} job={job} />)}
 * </DashboardCard>
 * ```
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  onViewAll,
  children,
  emptyMessage = 'No items found',
  emptyIcon = 'document-text-outline',
  style,
  testID,
}) => {
  /**
   * Handles the "View All" button press
   */
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  const hasContent = React.Children.count(children) > 0;
  const showViewAll = onViewAll && hasContent;

  return (
    <View style={[styles.card, style]} testID={testID}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={COLORS.primary} 
            style={styles.cardIcon} 
          />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {showViewAll && (
          <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.cardContent}>
        {hasContent ? (
          children
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={emptyIcon} 
              size={40} 
              color={COLORS.lightGray} 
              style={styles.emptyIcon} 
            />
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  } as ViewStyle,
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  cardIcon: {
    marginRight: 8,
  } as ViewStyle,
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  } as TextStyle,
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    marginRight: 4,
    fontWeight: '500',
  } as TextStyle,
  cardContent: {
    padding: 16,
  } as ViewStyle,
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  } as ViewStyle,
  emptyIcon: {
    marginBottom: 8,
  } as ViewStyle,
  emptyText: {
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  } as TextStyle,
});
