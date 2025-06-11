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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

type Job = {
  id: string;
  title: string;
  status: JobStatus;
  client: {
    id: string;
    full_name: string;
  };
  created_at: string;
  racket_count: number;
};

const getStatusDisplay = (status: JobStatus): { text: string; color: string } => {
  switch (status) {
    case 'in_progress':
      return { text: 'In Progress', color: '#FFA000' };
    case 'completed':
      return { text: 'Completed', color: '#4CAF50' };
    case 'cancelled':
      return { text: 'Cancelled', color: '#F44336' };
    case 'pending':
    default:
      return { text: 'Pending', color: '#2196F3' };
  }
};

export default function JobsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<Job[]>([]);
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
          client:clients (id, full_name)
        `)
        .eq('stringer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.id]);

  const renderItem = ({ item }: { item: Job }) => {
    const status = getStatusDisplay(item.status);
    
    return (
      <Link href={`/(stringer)/(tabs)/jobs/${item.id}`} asChild>
        <TouchableOpacity style={styles.jobItem}>
          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>{item.title || `Job #${item.id.slice(0, 6)}`}</Text>
            {item.client && <Text style={styles.jobClient}>{item.client.full_name}</Text>}
            <Text style={[styles.jobStatus, { color: status.color }]}>
              {status.text}
            </Text>
            <Text style={styles.jobDate}>
              {new Date(item.created_at).toLocaleDateString()}
              {item.racket_count > 0 && ` • ${item.racket_count} ${item.racket_count === 1 ? 'racket' : 'rackets'}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#666" />
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
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
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  jobClient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  jobStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  jobDate: {
    fontSize: 13,
    color: '#888',
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
