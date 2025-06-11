import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../src/lib/supabase';

interface DashboardStats {
  activeJobs: number;
  totalClients: number;
  stringStock: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    totalClients: 0,
    stringStock: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch shop name from stringers table
        const { data: stringerProfile, error: stringerError } = await supabase
          .from('stringers')
          .select('shop_name')
          .eq('user_id', user.id)
          .single();

        if (stringerError) {
          console.error('Error fetching stringer profile:', stringerError);
          // Don't throw, as other dashboard data might still load
        } else if (stringerProfile) {
          setShopName(stringerProfile.shop_name);
        }

        // Fetch active jobs
        const { count: activeJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('stringer_id', user.id)
          .in('status', ['pending', 'in_progress']);
        
        // Fetch total clients
        const { count: totalClients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Fetch string inventory
        const { data: inventory, error: inventoryError } = await supabase
          .from('string_inventory')
          .select('stock_quantity')
          .eq('stringer_id', user.id);
        
        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError);
          throw new Error('Failed to load inventory data');
        }
        
        const stringStock = inventory?.reduce((sum, item) => sum + (item.stock_quantity || 0), 0) || 0;
        
        setStats({
          activeJobs: activeJobs || 0,
          totalClients: totalClients || 0,
          stringStock,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{shopName || user?.user_metadata?.name || 'Stringer'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeJobs}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalClients}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.stringStock}</Text>
          <Text style={styles.statLabel}>Strings in Stock</Text>
        </View>
      </View>

      <View style={styles.upcomingContainer}>
        <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No upcoming jobs</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 10,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  upcomingContainer: {
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emptyStateText: {
    color: '#999',
    fontSize: 15,
  },
}); 