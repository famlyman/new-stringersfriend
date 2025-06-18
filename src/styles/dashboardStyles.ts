import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export const dashboardStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Header
  headerGradient: {
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'System',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // Cards
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  halfCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: COLORS.gray,
    fontSize: 14,
    marginRight: 4,
  },

  // List Items
  itemRow: {
    paddingVertical: 12,
  },
  smallItemRow: {
    paddingVertical: 10,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemMain: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.navy,
    flex: 1,
    marginRight: 8,
  },
  itemSub: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemDate: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },

  // Status Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Client Items
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },

  // Inventory Items
  inventoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  inventoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0F9F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stockText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  lowStockText: {
    color: COLORS.orange,
    fontWeight: '500',
  },
  lowStockLabel: {
    fontSize: 11,
    color: COLORS.white,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    overflow: 'hidden',
  },

  // Empty States
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallEmptyState: {
    padding: 16,
  },
  emptyText: {
    marginTop: 8,
    color: COLORS.gray,
    textAlign: 'center',
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  skeletonCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  skeletonTitle: {
    width: 120,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonItem: {
    height: 72,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 12,
  },
});

export const statusStyles = (status: string) => {
  const styles = {
    pending: {
      color: '#FF9500',
      backgroundColor: '#FFF4E5',
      icon: 'time-outline',
    },
    in_progress: {
      color: '#007AFF',
      backgroundColor: '#E5F0FF',
      icon: 'sync-outline',
    },
    completed: {
      color: '#34C759',
      backgroundColor: '#E8F5E9',
      icon: 'checkmark-done-outline',
    },
    default: {
      color: '#8E8E93',
      backgroundColor: '#F2F2F7',
      icon: 'help-outline',
    },
  };

  return styles[status as keyof typeof styles] || styles.default;
};
