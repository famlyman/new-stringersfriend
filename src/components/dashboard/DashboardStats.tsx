import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export type DashboardStatsProps = {
  jobsCount: number;
  clientsCount: number;
  inventoryCount: number;
};

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color: string;
  iconColor?: string;
  onPress?: () => void;
}

const getIconContainerStyle = (color: string): ViewStyle => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: `${color}33`, // Add transparency
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
});

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, iconColor, onPress }) => (
  <TouchableOpacity style={styles.statItem} onPress={onPress}>
    <View style={styles.statRow}>
      <View style={getIconContainerStyle(color)}>
        <Ionicons name={icon} size={20} color={iconColor || color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  jobsCount,
  clientsCount,
  inventoryCount,
}) => (
  <View style={styles.statsContainer}>
    <StatCard 
      icon="briefcase-outline" 
      value={jobsCount} 
      label="Active Jobs" 
      color={COLORS.primary} 
    />
    <StatCard 
      icon="people-outline" 
      value={clientsCount} 
      label="Clients" 
      color={COLORS.magenta} 
    />
    <StatCard 
      icon="cube-outline" 
      value={inventoryCount} 
      label="In Stock" 
      color={COLORS.green} 
    />
  </View>
);

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  } as ViewStyle,
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  // statIconContainer is now handled by getIconContainerStyle function
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  } as TextStyle,
  statLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  } as TextStyle,
});
