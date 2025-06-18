import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, TouchableOpacityProps, View as ViewType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * Job data structure for dashboard display
 */
export type Job = {
  /** Unique identifier for the job */
  id: string;
  /** Type of job (e.g., 'stringing', 'restringing') */
  job_type: string;
  /** Current status of the job */
  job_status: 'pending' | 'in_progress' | 'completed' | string;
  /** ISO date string when the job was created */
  created_at: string;
  /** Optional due date for the job */
  due_date?: string;
  /** Client information associated with the job */
  client: {
    full_name: string;
  } | null;
  /** Additional properties for extensibility */
  [key: string]: any;
};

/**
 * Client data structure for dashboard display
 */
export type Client = {
  /** Unique identifier for the client */
  id: string;
  /** Full name of the client */
  full_name: string;
  /** Email address of the client */
  email: string;
  /** Additional properties for extensibility */
  [key: string]: any;
};

/**
 * Inventory item data structure for dashboard display
 */
export type InventoryItem = {
  /** Unique identifier for the inventory item */
  id: string;
  /** Current stock quantity */
  stock_quantity: number;
  /** String brand information */
  string_brand: {
    name: string;
  } | null;
  /** String model information */
  string_model: {
    name: string;
  } | null;
  /** Additional properties for extensibility */
  [key: string]: any;
};

/**
 * Base props for all item components
 */
interface BaseItemProps {
  /** Optional callback when the item is pressed */
  onPress?: () => void;
  /** Additional styles to apply to the item container */
  style?: ViewStyle;
}

/**
 * Props for the JobItem component
 */
interface JobItemProps extends BaseItemProps {
  /** Job data to display */
  job: Job;
}

/**
 * Props for the ClientItem component
 */
interface ClientItemProps extends BaseItemProps {
  /** Client data to display */
  client: Client;
}

/**
 * Props for the InventoryItem component
 */
interface InventoryItemProps extends BaseItemProps {
  /** Inventory item data to display */
  item: InventoryItem;
}

/**
 * A status badge component that displays job status with appropriate colors and icons.
 * 
 * @param status - The job status to display
 * @returns A styled status badge component
 * 
 * @example
 * ```tsx
 * <StatusBadge status="in_progress" />
 * ```
 */
export const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { color: '#FF9500', backgroundColor: '#FFF4E5', icon: 'time-outline' },
    in_progress: { color: '#007AFF', backgroundColor: '#E5F0FF', icon: 'sync-outline' },
    completed: { color: '#34C759', backgroundColor: '#E8F5E9', icon: 'checkmark-done-outline' },
  }[status] || { color: '#8E8E93', backgroundColor: '#F2F2F7', icon: 'help-outline' };

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
      <Ionicons 
        name={statusConfig.icon as any} 
        size={14} 
        color={statusConfig.color} 
        style={styles.statusIcon} 
      />
      <Text style={[styles.statusText, { color: statusConfig.color }]}>
        {status.replace('_', ' ')}
      </Text>
    </View>
  );
};

/**
 * A component for displaying job information in a dashboard list.
 * 
 * Features:
 * - Job type and status display
 * - Client name
 * - Due date (if available)
 * - Status badge with color coding
 * - Optional press handling
 * 
 * @example
 * ```tsx
 * <JobItem
 *   job={jobData}
 *   onPress={() => navigation.navigate('JobDetails', { jobId: jobData.id })}
 * />
 * ```
 */
export const JobItem = React.forwardRef<ViewType, JobItemProps & TouchableOpacityProps>(({ 
  job, 
  onPress,
  style,
  ...props 
}, ref) => {
  const Container = onPress ? TouchableOpacity : View;
  const clientName = job.client?.full_name || 'No client';
  const jobType = job.job_type ? 
    job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1) : 
    'Job';
  
  return (
    <Container 
      ref={ref as any}
      style={[styles.itemContainer, styles.jobItem, style] as ViewStyle[]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {jobType}
        </Text>
        <StatusBadge status={job.job_status} />
      </View>
      
      <Text style={styles.itemSubtitle} numberOfLines={1}>
        {clientName}
      </Text>
      
      {job.due_date && (
        <View style={styles.dueDateContainer}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
          <Text style={styles.dueDateText}>
            Due: {new Date(job.due_date).toLocaleDateString()}
          </Text>
        </View>
      )}
    </Container>
  );
});

/**
 * A component for displaying client information in a dashboard list.
 * 
 * Features:
 * - Client avatar with icon
 * - Full name and email
 * - Optional press handling
 * 
 * @example
 * ```tsx
 * <ClientItem
 *   client={clientData}
 *   onPress={() => navigation.navigate('ClientDetails', { clientId: clientData.id })}
 * />
 * ```
 */
export const ClientItem = React.forwardRef<ViewType, ClientItemProps & TouchableOpacityProps>(({ 
  client, 
  onPress,
  style,
  ...props 
}, ref) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      ref={ref as any}
      style={[styles.itemContainer, styles.clientContainer, style] as ViewStyle[]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {client.full_name}
        </Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {client.email}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </Container>
  );
});

/**
 * A component for displaying inventory item information in a dashboard list.
 * 
 * Features:
 * - Brand and model name
 * - Stock quantity with low stock warning
 * - Color-coded icons based on stock level
 * - Optional press handling
 * 
 * @example
 * ```tsx
 * <InventoryItem
 *   item={inventoryData}
 *   onPress={() => navigation.navigate('InventoryEdit', { itemId: inventoryData.id })}
 * />
 * ```
 */
export const InventoryItem = React.forwardRef<ViewType, InventoryItemProps & TouchableOpacityProps>(({ 
  item, 
  onPress,
  style,
  ...props 
}, ref) => {
  const Container = onPress ? TouchableOpacity : View;
  const brandName = item.string_brand?.name || 'Unknown Brand';
  const modelName = item.string_model?.name || 'Unknown Model';
  
  return (
    <Container 
      ref={ref as any}
      style={[styles.itemContainer, styles.inventoryContainer, style] as ViewStyle[]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.inventoryIcon}>
        <Ionicons 
          name={'cube-outline'} 
          size={20} 
          color={COLORS.green} 
        />
      </View>
      <View style={styles.inventoryInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {brandName} {modelName}
        </Text>
        <View style={styles.stockContainer}>
          <Text style={[styles.stockText, { color: COLORS.gray }]}>
            {item.stock_quantity} in stock
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </Container>
  );
});

const styles = StyleSheet.create({
  // Base Item Styles
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  } as TextStyle,
  itemSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  } as TextStyle,
  
  // Job Item
  jobItem: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  } as ViewStyle,
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dueDateText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },
  
  // Client Item
  clientItem: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  clientInfo: {
    flex: 1,
  } as ViewStyle,
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  // Inventory Item
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  inventoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  inventoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  inventoryInfo: {
    flex: 1,
  } as ViewStyle,
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  } as ViewStyle,
  stockText: {
    fontSize: 13,
    color: COLORS.gray,
  } as TextStyle,
  stockValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  } as TextStyle,
  lowStockBadge: {
    backgroundColor: '#FFEDE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  } as ViewStyle,
  lowStockText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  } as TextStyle,
  
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  } as ViewStyle,
  statusIcon: {
    marginRight: 4,
  } as ViewStyle,
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  } as TextStyle,
});
