import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../src/components/ui/Text';
import { UI_KIT } from '../../../src/styles/uiKit';

type Client = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  user_id: string;
};

export default function ClientsScreen() {
  const { session } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return 'No phone';
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if we have a valid 10-digit number
    if (cleaned.length !== 10) return phone;
    // Format as (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  };

  useEffect(() => {
    if (!session?.user?.id) {
      setError('No active session');
      setLoading(false);
      return;
    }

    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('stringer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setClients(data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [session]);

  const MINI_CARD_STYLE = {
    backgroundColor: UI_KIT.colors.white,
    borderRadius: 12,
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

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={MINI_CARD_STYLE}
      activeOpacity={0.7}
      onPress={() => router.push(`/(stringer)/clients/${item.id}`)}
    >
      <View style={{ flex: 1 }}>
        <Text variant="h5" style={{ marginBottom: 4 }}>{item.full_name}</Text>
        {item.email && <Text variant="body" color={UI_KIT.colors.gray}>{item.email}</Text>}
        {item.phone && <Text variant="body" color={UI_KIT.colors.gray}>{formatPhoneNumber(item.phone)}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={UI_KIT.colors.gray} />
    </TouchableOpacity>
  );

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
          onPress={() => setLoading(true)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.headerTitle}>Clients</Text>
        <Link href="/(stringer)/clients/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={UI_KIT.colors.white} />
          </TouchableOpacity>
        </Link>
      </View>
      
      {clients.length > 0 ? (
        <FlatList
          data={clients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No clients yet</Text>
          <Text style={styles.emptyStateSubtext}>Add your first client to get started</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: UI_KIT.spacing.md,
    paddingTop: UI_KIT.spacing.md,
    paddingBottom: UI_KIT.spacing.sm,
    backgroundColor: UI_KIT.colors.navy,
    borderBottomWidth: 1,
    borderBottomColor: UI_KIT.colors.primary,
  },
  headerTitle: {
    color: UI_KIT.colors.gray,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: UI_KIT.colors.gray,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});