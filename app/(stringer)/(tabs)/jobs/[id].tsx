import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { JobStatus, statusConfig } from '../../../../src/types/job';
import { supabase } from '../../../../src/lib/supabase';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { normalizeToArray } from '../../../../src/utils/dataNormalization';
import { Menu } from 'react-native-paper';
import CustomHeader from '../../../../src/components/CustomHeader';
import { UI_KIT } from '../../../../src/styles/uiKit';

// Define JobDetail explicitly with all necessary fields
interface JobDetail {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string | null;
  racquet_id: string;
  job_type: string;
  job_status: JobStatus;
  job_notes: string | null;
  due_date: string | null;
  completed_date: string | null;
  stringer_id: string;

  // Embedded relationships 
  client: {
    id: string;
    full_name: string;
  }[] | null; // Always treated as an array
  racquet: {
    id: string;
    brand: { name: string; }[] | null; // Always treated as an array
    model: { name: string; }[] | null; // Always treated as an array
  }[] | null; // Always treated as an array
  job_stringing_details: {
    id: string;
    tension_main?: number | null;
    tension_cross?: number | null;
    price?: number | null;
    main_string_model?: { name: string }[] | null; // Always treated as an array
    cross_string_model?: { name: string }[] | null; // Always treated as an array
  }[]; 
}

const statusFlow: JobStatus[] = ['pending', 'in_progress', 'completed', 'picked_up'];

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id, user?.id]);

  const fetchJob = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          created_at,
          updated_at,
          client_id,
          racquet_id,
          job_type,
          job_status,
          job_notes,
          due_date,
          completed_date,
          stringer_id,
          client:clients!jobs_client_id_fkey (id, full_name),
          racquet:racquets!jobs_racquet_id_fkey (id, brand:brands(name), model:models(name)),
          job_stringing_details:job_stringing_details!fk_job (
            id, 
            tension_main, 
            tension_cross, 
            price, 
            main_string_model:string_model!fk_job_main_string_model (name), 
            cross_string_model:string_model!fk_job_cross_string_model (name)
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;

      if (data) {
        const transformedJob: JobDetail = {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
          client_id: data.client_id,
          racquet_id: data.racquet_id,
          job_type: data.job_type,
          job_status: (data.job_status || 'pending') as JobStatus,
          job_notes: data.job_notes,
          due_date: data.due_date,
          completed_date: data.completed_date,
          stringer_id: data.stringer_id,
          
          client: normalizeToArray(data.client),
          racquet: normalizeToArray(data.racquet ? {
            id: (data.racquet as any).id,
            brand: normalizeToArray((data.racquet as any).brand),
            model: normalizeToArray((data.racquet as any).model),
          } : null),
          job_stringing_details: (data.job_stringing_details || []).map((detail: any) => ({
            id: detail.id,
            tension_main: detail.tension_main,
            tension_cross: detail.tension_cross,
            price: detail.price,
            main_string_model: normalizeToArray(detail.main_string_model),
            cross_string_model: normalizeToArray(detail.cross_string_model),
          })),
        };
        setJob(transformedJob);
      }
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
      const updatedFields: { job_status: JobStatus; updated_at: string; completed_date?: string } = {
        job_status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'completed' && !job.completed_date) {
        updatedFields.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('jobs')
        .update(updatedFields)
        .eq('id', job.id);

      if (error) {
        throw error;
      }
      
      // Only update local state if database update is successful
      setJob(prevJob => prevJob ? { ...prevJob, ...updatedFields } : null);
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
              router.push('/(stringer)/(tabs)/jobs');
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

  const nextStatus = getNextStatus(job.job_status);
  const statusInfo = statusConfig[job.job_status];

  // Get stringing details, assuming there's only one set of stringing details per job
  const stringingDetails = job.job_stringing_details && job.job_stringing_details.length > 0
    ? job.job_stringing_details[0]
    : null;

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="white"
        translucent={false}
      />
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <CustomHeader
        title="Job Details"
        onBack={handleBack}
        onMenu={openMenu}
        menuVisible={menuVisible}
        closeMenu={closeMenu}
        job={job}
        router={router}
        deleteJob={deleteJob}
        leftContent={
          <TouchableOpacity onPress={handleBack} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color={UI_KIT.colors.gray} />
          </TouchableOpacity>
        }
        rightContent={
          <Menu
            visible={!!menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu} style={{ padding: 8 }}>
                <Ionicons name="ellipsis-vertical" size={20} color={UI_KIT.colors.gray} />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                closeMenu && closeMenu();
                if (job?.id && router) {
                  router.push(`/(stringer)/(tabs)/jobs/${job.id}/edit`);
                }
              }}
              title="Edit Job"
            />
            <Menu.Item
              onPress={() => {
                closeMenu && closeMenu();
                if (job && deleteJob) deleteJob();
              }}
              title="Delete Job"
            />
          </Menu>
        }
        titleStyle={{ color: UI_KIT.colors.gray, fontSize: 28, fontWeight: 'bold' }}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={styles.contentContainer}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollViewContent}
            automaticallyAdjustKeyboardInsets={false}
            automaticallyAdjustsScrollIndicatorInsets={false}
          >
          <View style={styles.header}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={styles.price}>${stringingDetails?.price?.toFixed(2) || '0.00'}</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client</Text>
            <TouchableOpacity 
              style={styles.infoCard}
              onPress={() => {
                if (job.client && job.client.length > 0) {
                  router.push(`/(stringer)/clients/${job.client[0].id}`);
                }
              }}
            >
              <View style={styles.infoIcon}>
                <Ionicons name="person-outline" size={20} color="#007AFF" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{job.client?.[0]?.full_name || 'N/A'}</Text>
                <Text style={styles.infoSubtitle}>View client details</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Racquet</Text>
            <TouchableOpacity 
              style={styles.infoCard}
              onPress={() => {
                if (job.racquet && job.racquet.length > 0) {
                  router.push(`/(stringer)/racquets/${job.racquet[0].id}`);
                }
              }}
            >
              <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="tennisball-outline" size={20} color="#1976D2" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{job.racquet?.[0]?.brand?.[0]?.name || 'N/A'} {job.racquet?.[0]?.model?.[0]?.name || 'N/A'}</Text>
                <Text style={styles.infoSubtitle}>View racquet details</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stringing Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Main String</Text>
                <Text style={styles.detailValue}>{stringingDetails?.main_string_model?.[0]?.name || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Cross String</Text>
                <Text style={styles.detailValue}>{stringingDetails?.cross_string_model?.[0]?.name || 'N/A'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tension (Mains)</Text>
                <Text style={styles.detailValue}>{stringingDetails?.tension_main || 'N/A'} lbs</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Tension (Crosses)</Text>
                <Text style={styles.detailValue}>{stringingDetails?.tension_cross || 'N/A'} lbs</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {job.due_date ? new Date(job.due_date).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Completed Date</Text>
                <Text style={styles.detailValue}>
                  {job.completed_date ? new Date(job.completed_date).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
          
          {job.job_notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{job.job_notes}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.timeline}>
            {statusFlow.map((status, index) => {
              const isCompleted = statusFlow.indexOf(job.job_status) >= index;
              const isCurrent = job.job_status === status;
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
                    {/* Safely access date properties based on status, using optional chaining and specific properties */}
                    {status === 'pending' && job.created_at && (
                      <Text style={styles.timelineDate}>
                        {new Date(job.created_at).toLocaleString()}
                      </Text>
                    )}
                    {status === 'in_progress' && job.updated_at && (
                      <Text style={styles.timelineDate}>
                        {new Date(job.updated_at).toLocaleString()}
                      </Text>
                    )}
                    {status === 'completed' && job.completed_date && (
                      <Text style={styles.timelineDate}>
                        {new Date(job.completed_date).toLocaleString()}
                      </Text>
                    )}
                    {status === 'picked_up' && job.updated_at && (
                      <Text style={styles.timelineDate}>
                        {new Date(job.updated_at).toLocaleString()}
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
            <View style={[styles.footer, { bottom: insets.bottom }]}>
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Ensure content is not hidden by the tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  infoIcon: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%', // Approximately half width for two columns
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  notesCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
  },
  notesText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  timeline: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 13,
    color: '#999',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -10,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  headerButton: {
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 20,
  },
  menuButton: {
    marginHorizontal: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
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
    marginBottom: 47,
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
