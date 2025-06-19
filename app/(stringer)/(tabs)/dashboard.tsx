import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../src/constants/colors';
import { DashboardCard } from '../../../src/components/dashboard/DashboardCard';
import { DashboardStats } from '../../../src/components/dashboard/DashboardStats';
import { JobItem, ClientItem, InventoryItem } from '../../../src/components/dashboard/DashboardItems';
import { SkeletonCard } from '../../../src/components/ui/SkeletonLoader';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState({
    jobsCount: 0,
    clientsCount: 0,
    inventoryCount: 0,
  });

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

        // Calculate stats
        setStats({
          jobsCount: jobsData?.length || 0,
          clientsCount: clientsData?.length || 0,
          inventoryCount: inventoryData?.length || 0,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.id]);

  const handleJobPress = (jobId: string) => {
    router.push(`/(stringer)/(tabs)/jobs/${jobId}`);
  };

  const handleClientPress = (clientId: string) => {
    router.push(`/(stringer)/clients/${clientId}`);
  };

  const handleInventoryPress = (itemId: string) => {
    router.push(`/(stringer)/inventory/${itemId}/edit`);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{shopName || user?.user_metadata?.name || 'Stringer'}</Text>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <SkeletonCard count={3} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{shopName || user?.user_metadata?.name || 'Stringer'}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{shopName || user?.user_metadata?.name || 'Stringer'}</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stats Section */}
        <DashboardStats 
          jobsCount={stats.jobsCount}
          clientsCount={stats.clientsCount}
          inventoryCount={stats.inventoryCount}
        />

        {/* Jobs Card */}
        <DashboardCard
          title="Active Jobs"
          icon="briefcase-outline"
          onViewAll={() => router.push('/(stringer)/(tabs)/jobs')}
          emptyMessage="No active jobs"
          emptyIcon="briefcase-outline"
        >
          {jobs.map(job => (
            <JobItem
              key={job.id}
              job={job}
              onPress={() => handleJobPress(job.id)}
            />
          ))}
        </DashboardCard>

        {/* Clients Card */}
        <DashboardCard
          title="Recent Clients"
          icon="people-outline"
          onViewAll={() => router.push('/(stringer)/clients')}
          emptyMessage="No clients yet"
          emptyIcon="people-outline"
        >
          {clients.map(client => (
            <ClientItem
              key={client.id}
              client={client}
              onPress={() => handleClientPress(client.id)}
            />
          ))}
        </DashboardCard>

        {/* Inventory Card */}
        <DashboardCard
          title="Inventory"
          icon="cube-outline"
          onViewAll={() => router.push('/(stringer)/inventory')}
          emptyMessage="No inventory items"
          emptyIcon="cube-outline"
        >
          {inventory.map(item => (
            <InventoryItem
              key={item.id}
              item={item}
              onPress={() => handleInventoryPress(item.id)}
            />
          ))}
        </DashboardCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
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
    color: COLORS.gray,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
}); 