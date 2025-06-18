import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        // Shop name
        const { data: stringerProfile } = await supabase
          .from('stringers')
          .select('shop_name')
          .eq('id', user.id)
          .single();
        setShopName(stringerProfile?.shop_name || null);

        // Jobs (exclude picked_up)
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('id, job_type, job_status, created_at, due_date, client:clients!jobs_client_id_fkey (full_name)')
          .eq('stringer_id', user.id)
          .not('job_status', 'eq', 'picked_up')
          .order('created_at', { ascending: false })
          .limit(5);
        setJobs(jobsData || []);

        // Clients
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, full_name, email')
          .eq('user_id', user.id)
          .order('full_name', { ascending: true })
          .limit(5);
        setClients(clientsData || []);

        // Inventory (strings for now)
        const { data: inventoryData } = await supabase
          .from('string_inventory')
          .select('id, stock_quantity, string_brand!brand_id(name), string_model!model_id(name)')
          .eq('stringer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setInventory(inventoryData || []);
      } catch (err) {
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
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{shopName || user?.user_metadata?.name || 'Stringer'}</Text>
        </View>

        {/* Jobs Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/(stringer)/(tabs)/jobs')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {jobs.length === 0 ? (
            <Text style={styles.emptyText}>No jobs yet</Text>
          ) : jobs.map(job => (
            <View key={job.id} style={styles.itemRow}>
              <Text style={styles.itemMain}>{job.job_type ? job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1) : 'Job'}</Text>
              <Text style={[styles.itemStatus, { color: job.job_status === 'pending' ? '#FF9500' : job.job_status === 'in_progress' ? '#007AFF' : '#34C759' }]}>{job.job_status.replace('_', ' ')}</Text>
              <Text style={styles.itemSub}>{job.client?.full_name || 'No client'}</Text>
              <Text style={styles.itemDate}>{job.due_date ? `Due: ${new Date(job.due_date).toLocaleDateString()}` : ''}</Text>
            </View>
          ))}
        </View>

        {/* Clients Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Clients</Text>
            <TouchableOpacity onPress={() => router.push('/(stringer)/clients')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {clients.length === 0 ? (
            <Text style={styles.emptyText}>No clients yet</Text>
          ) : clients.map(client => (
            <View key={client.id} style={styles.itemRow}>
              <Text style={styles.itemMain}>{client.full_name}</Text>
              <Text style={styles.itemSub}>{client.email}</Text>
            </View>
          ))}
        </View>

        {/* Inventory Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Inventory</Text>
            <TouchableOpacity onPress={() => router.push('/(stringer)/inventory')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {inventory.length === 0 ? (
            <Text style={styles.emptyText}>No inventory yet</Text>
          ) : inventory.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemMain}>{(item.string_brand?.name || '') + ' ' + (item.string_model?.name || '')}</Text>
              <Text style={styles.itemSub}>Stock: {item.stock_quantity}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  errorText: {
    color: COLORS.magenta,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.navy,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.white,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    boxShadow: '0 2px 8px rgba(17,56,127,0.08)',
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  seeAll: {
    color: COLORS.magenta,
    fontWeight: '600',
    fontSize: 15,
  },
  itemRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingVertical: 10,
  },
  itemMain: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
  },
  itemStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 2,
    color: COLORS.magenta,
  },
  itemSub: {
    fontSize: 14,
    color: COLORS.purple,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 12,
  },
}); 