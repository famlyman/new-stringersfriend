import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView
} from 'react-native';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { JobStatus, statusConfig, Job as JobBase } from '../../../../src/types/job';
import { 
  UI_KIT, 
  Text, 
  Button, 
  Card, 
  Badge, 
  SkeletonLoader,
  DashboardCard
} from '../../../../src/components';

interface JobWithClient extends Omit<JobBase, 'client'> {
  client: {
    id: string;
    full_name: string;
  } | null;
  racket_count: number;
  title: string;
}

const getStatusDisplay = (jobStatus: JobStatus): { text: string; color: string } => {
  const config = statusConfig[jobStatus] || statusConfig.pending;
  return { text: config.label, color: config.color };
};

const getStatusVariant = (jobStatus: JobStatus): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
  switch (jobStatus) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'pending':
      return 'warning';
    case 'picked_up':
      return 'neutral';
    default:
      return 'neutral';
  }
};

const MINI_CARD_STYLE = {
  backgroundColor: UI_KIT.colors.white,
  borderRadius: UI_KIT.borderRadius.lg,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 2,
  elevation: 1,
  marginBottom: UI_KIT.spacing.md,
  padding: UI_KIT.spacing.md,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
};

const renderJobMiniCard = (item: JobWithClient) => {
  const statusConfig = getStatusDisplay(item.job_status);
  const statusVariant = getStatusVariant(item.job_status);
  return (
    <Link href={`/(stringer)/(tabs)/jobs/${item.id}`} asChild key={item.id}>
      <TouchableOpacity activeOpacity={0.7} style={MINI_CARD_STYLE}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h5" style={styles.jobCardTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={UI_KIT.colors.gray} />
          </View>
          {item.client && (
            <Text variant="body" color={UI_KIT.colors.gray} style={styles.jobCardSubtitle}>
              {item.client.full_name}
            </Text>
          )}
          <View style={styles.jobCardDetails}>
            <Text variant="caption" color={UI_KIT.colors.gray}>
              {new Date(item.created_at).toLocaleDateString()}
              {item.racket_count > 0 && ` • ${item.racket_count} ${item.racket_count === 1 ? 'racket' : 'racquets'}`}
            </Text>
            <Badge variant={statusVariant} label={statusConfig.text} />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function JobsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<JobWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!user?.id) {
      setError('No active session');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          client:clients!jobs_client_id_fkey (id, full_name),
          racquet:racquets!jobs_racquet_id_fkey (id)
        `)
        .eq('stringer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our JobWithClient type
      const transformedJobs: JobWithClient[] = (data || []).map((job: any) => ({
        ...job,
        title: job.job_type ? job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1) : (job.job_notes ? job.job_notes.substring(0, Math.min(job.job_notes.length, 50)) + (job.job_notes.length > 50 ? '...' : '') : `Job #${job.id.slice(0, 6)}`),
        client: job.client ? { id: job.client.id, full_name: job.client.full_name } : null,
        racket_count: job.racquet ? 1 : 0
      }));
      
      setJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <Text variant="h2" color={UI_KIT.colors.gray}>Jobs</Text>
          <View style={styles.addButtonPlaceholder} />
        </View>
        
        <View style={styles.loadingContainer}>
          <SkeletonLoader width="100%" height={100} style={styles.skeletonItem} />
          <SkeletonLoader width="100%" height={100} style={styles.skeletonItem} />
          <SkeletonLoader width="100%" height={100} style={styles.skeletonItem} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}>
        <View style={styles.header}>
          <Text variant="h2" color={UI_KIT.colors.gray}>Jobs</Text>
          <View style={styles.addButtonPlaceholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text variant="body" color={UI_KIT.colors.red} style={styles.errorText}>
            {error}
          </Text>
          <Button 
            title="Retry" 
            onPress={fetchJobs}
            variant="primary"
            style={{ marginTop: UI_KIT.spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text variant="h2" color={UI_KIT.colors.gray}>Jobs</Text>
        <Link href="/(stringer)/(tabs)/jobs/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={UI_KIT.colors.white} />
          </TouchableOpacity>
        </Link>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent}>
        <DashboardCard
          title="All Jobs"
          icon="briefcase-outline"
          style={{ marginHorizontal: 0, marginBottom: 0 }}
        >
          {jobs.length > 0 ? (
            jobs.map(renderJobMiniCard)
          ) : (
            <View style={[styles.emptyState, { paddingBottom: insets.bottom + UI_KIT.spacing.md }]}> 
              <Ionicons 
                name="list-outline" 
                size={64} 
                color={UI_KIT.colors.lightGray} 
              />
              <Text variant="h4" style={styles.emptyStateText}>
                No jobs yet
              </Text>
              <Text variant="body" color={UI_KIT.colors.gray} style={styles.emptyStateSubtext}>
                Create your first job to get started
              </Text>
              <Link href="/(stringer)/(tabs)/jobs/new" asChild>
                <TouchableOpacity>
                  <Button 
                    title="Create Job" 
                    variant="primary"
                    icon="add"
                    onPress={() => {}}
                    style={{ marginTop: UI_KIT.spacing.lg }}
                  />
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </DashboardCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_KIT.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: UI_KIT.spacing.md,
    backgroundColor: UI_KIT.colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: UI_KIT.colors.primary,
    paddingBottom: 30,
  },
  addButton: {
    backgroundColor: UI_KIT.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  listContent: {
    paddingTop: UI_KIT.spacing.md,
    paddingBottom: UI_KIT.spacing.md,
  },
  jobCard: {
    marginBottom: UI_KIT.spacing.md,
  },
  jobCardContent: {
    flex: 1,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobCardTitle: {
    marginBottom: UI_KIT.spacing.xs,
  },
  jobCardSubtitle: {
    marginBottom: UI_KIT.spacing.sm,
  },
  jobCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: UI_KIT.spacing.sm,
  },
  loadingContainer: {
    paddingTop: UI_KIT.spacing.md,
    paddingBottom: UI_KIT.spacing.md,
  },
  skeletonItem: {
    marginBottom: UI_KIT.spacing.md,
    marginHorizontal: UI_KIT.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_KIT.spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: UI_KIT.spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_KIT.spacing.lg,
  },
  emptyStateText: {
    marginTop: UI_KIT.spacing.md,
    marginBottom: UI_KIT.spacing.sm,
  },
  emptyStateSubtext: {
    marginBottom: UI_KIT.spacing.lg,
    textAlign: 'center',
  },
});
