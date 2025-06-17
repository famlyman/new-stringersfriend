import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { supabase } from '../../../../src/lib/supabase';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { JobStatus, statusConfig, Job as JobBase } from '../../../../src/types/job';

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
      console.log('Raw job data:', data);
      
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

  const renderItem = ({ item }: { item: JobWithClient }) => {
    const status = getStatusDisplay(item.job_status);
    
    return (
      <Link href={`/(stringer)/(tabs)/jobs/${item.id}`} asChild>
        <TouchableOpacity style={styles.jobCard}>
          <View style={styles.jobCardContent}>
            <Text style={styles.jobCardTitle}>{item.title}</Text>
            {item.client && <Text style={styles.jobCardSubtitle}>{item.client.full_name}</Text>}
            <View style={styles.jobCardDetails}>
              <Text style={styles.jobCardDetailText}>
                {new Date(item.created_at).toLocaleDateString()}
                {item.racket_count > 0 && ` • ${item.racket_count} ${item.racket_count === 1 ? 'racket' : 'racquets'}`}
              </Text>
              <View style={[styles.jobCardStatusContainer, { backgroundColor: status.color }]}>
                <Text style={styles.jobCardStatusText}>{status.text}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </Link>
    );
  };

  if (loading) {
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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchJobs}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <Link href="/(stringer)/(tabs)/jobs/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>
      
      {jobs.length > 0 ? (
        <FlatList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchJobs}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
        />
      ) : (
        <View style={[styles.emptyState, { paddingBottom: insets.bottom + 20 }]}>
          <Ionicons name="list-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No jobs yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first job to get started</Text>
          <Link href="/(stringer)/(tabs)/jobs/new" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Create Job</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  jobCardContent: {
    flex: 1,
  },
  jobCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  jobCardSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  jobCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  jobCardDetailText: {
    fontSize: 14,
    color: '#888',
  },
  jobCardStatusContainer: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  jobCardStatusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
