import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock data - replace with your actual data fetching logic
const jobs = [
  { id: '1', title: 'Job 1', status: 'In Progress', client: 'Client A' },
  { id: '2', title: 'Job 2', status: 'Completed', client: 'Client B' },
  { id: '3', title: 'Job 3', status: 'Pending', client: 'Client C' },
];

export default function JobsScreen() {
  const renderItem = ({ item }: { item: typeof jobs[0] }) => (
    <Link href={`/jobs/${item.id}`} asChild>
      <TouchableOpacity style={styles.jobItem}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.jobClient}>{item.client}</Text>
          <Text style={[
            styles.jobStatus,
            item.status === 'Completed' && styles.statusCompleted,
            item.status === 'In Progress' && styles.statusInProgress,
          ]}>
            {item.status}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <Link href="/jobs/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>
      
      <FlatList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  jobItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
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
    color: '#666',
  },
  statusCompleted: {
    color: '#34C759',
  },
  statusInProgress: {
    color: '#FF9500',
  },
});
