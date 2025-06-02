import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Job, JobStatus, statusConfig } from '../../../src/types/job';

// Mock data - will be replaced with actual API calls
const mockJob: Job = {
  id: '1',
  created_at: '2025-05-28T10:00:00Z',
  updated_at: '2025-05-28T10:00:00Z',
  user_id: 'user1',
  client_id: 'client1',
  client_name: 'John Doe',  
  racquet_id: 'racquet1',
  racquet_name: 'Babolat Pure Aero',
  string_id: 'string1',
  string_name: 'Luxilon Alu Power 1.25',
  tension_main: 52,
  tension_cross: 50,
  status: 'pending',
  price: 35,
  notes: 'Prefer slightly lower tension on crosses. Customer mentioned the last string job felt too stiff.',
};

const statusFlow: JobStatus[] = ['pending', 'in_progress', 'completed', 'picked_up'];

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      setJob(mockJob);
    } catch (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: JobStatus) => {
    if (!job) return;
    
    setUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we would update the job in the database
      const updatedJob = {
        ...job,
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'completed' && !job.completed_at && { completed_at: new Date().toISOString() }),
        ...(newStatus === 'picked_up' && !job.picked_up_at && { picked_up_at: new Date().toISOString() }),
      };
      
      setJob(updatedJob);
      Alert.alert('Success', `Job marked as ${statusConfig[newStatus].label.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status');
    } finally {
      setUpdating(false);
    }
  };

  const deleteJob = () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 800));
              router.back();
              // In a real app, we would delete the job from the database
            } catch (error) {
              console.error('Error deleting job:', error);
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const getNextStatus = (currentStatus: JobStatus): JobStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    return statusFlow[currentIndex + 1] || null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={styles.emptyText}>Job not found</Text>
      </View>
    );
  }

  const nextStatus = getNextStatus(job.status);
  const statusInfo = statusConfig[job.status];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Job Details',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => {
                Alert.alert(
                  'Job Actions',
                  '',
                  [
                    {
                      text: 'Edit Job',
                      onPress: () => router.push(`/(tabs)/jobs/${job.id}/edit`),
                    },
                    {
                      text: 'Delete Job',
                      style: 'destructive',
                      onPress: deleteJob,
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#007AFF" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.price}>${job.price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => router.push(`/(tabs)/clients/${job.client_id}`)}
          >
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={20} color="#007AFF" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{job.client_name}</Text>
              <Text style={styles.infoSubtitle}>View client details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Racquet</Text>
          <View style={styles.infoCard}>
            <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="tennisball-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{job.racquet_name}</Text>
              <Text style={styles.infoSubtitle}>Brand: {job.racquet_name.split(' ')[0]}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stringing Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>String</Text>
              <Text style={styles.detailValue}>{job.string_name}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tension (Mains)</Text>
              <Text style={styles.detailValue}>{job.tension_main} lbs</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Tension (Crosses)</Text>
              <Text style={styles.detailValue}>{job.tension_cross} lbs</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {new Date(job.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        
        {job.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{job.notes}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.timeline}>
          {statusFlow.map((status, index) => {
            const isCompleted = statusFlow.indexOf(job.status) >= index;
            const isCurrent = job.status === status;
            const config = statusConfig[status];
            
            return (
              <View key={status} style={styles.timelineItem}>
                <View style={[
                  styles.timelineDot,
                  {
                    backgroundColor: isCompleted ? config.color : '#E0E0E0',
                    borderColor: isCurrent ? config.color : 'transparent',
                  }
                ]}>
                  <Ionicons 
                    name={config.icon} 
                    size={14} 
                    color={isCompleted ? '#fff' : '#999'} 
                  />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineTitle,
                    { color: isCompleted ? '#1a1a1a' : '#999' }
                  ]}>
                    {config.label}
                  </Text>
                  {job[`${status}_at` as keyof Job] && (
                    <Text style={styles.timelineDate}>
                      {new Date(job[`${status}_at` as keyof Job] as string).toLocaleString()}
                    </Text>
                  )}
                </View>
                {index < statusFlow.length - 1 && (
                  <View 
                    style={[
                      styles.timelineLine,
                      { 
                        backgroundColor: isCompleted ? config.color : '#E0E0E0',
                        opacity: isCompleted ? 1 : 0.5,
                      }
                    ]} 
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
      
      {nextStatus && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              { backgroundColor: statusConfig[nextStatus].color }
            ]}
            onPress={() => updateStatus(nextStatus)}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons 
                  name={statusConfig[nextStatus].icon} 
                  size={20} 
                  color="#fff" 
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>
                  Mark as {statusConfig[nextStatus].label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    paddingLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  detailItem: {
    width: '50%',
    padding: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  timeline: {
    marginTop: 8,
    marginBottom: 24,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 32,
    marginBottom: 20,
    minHeight: 40,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timelineContent: {
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: '#999',
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: -20,
    width: 2,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
