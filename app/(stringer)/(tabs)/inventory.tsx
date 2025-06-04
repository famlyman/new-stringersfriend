import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAuth } from '../../../src/contexts/AuthContext';
import { supabase } from '../../../src/lib/supabase';

type StringInventory = {
  id: string;
  string_name: string;
  brand: string;
  gauge: string;
  color: string;
  length_feet: number;
  stock_quantity: number;
  min_stock_level: number;
  cost_per_set: number;
  created_at: string;
};

export default function InventoryScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<StringInventory[]>([]);

  const fetchInventory = useCallback(async () => {
    if (!session?.user?.id) {
      setError('No active session');
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('string_inventory')
        .select('*')
        .eq('user_id', session.user.id)
        .order('brand', { ascending: true })
        .order('string_name', { ascending: true });

      if (fetchError) throw fetchError;
      setInventory(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    setLoading(true);
    fetchInventory();
  }, [fetchInventory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInventory();
  }, [fetchInventory]);

  const renderItem = ({ item }: { item: StringInventory }) => (
    <View style={styles.inventoryItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>
          {item.brand} {item.string_name}
        </Text>
        <View style={[
          styles.stockBadge,
          item.stock_quantity <= item.min_stock_level && styles.lowStockBadge
        ]}>
          <Text style={styles.stockText}>
            {item.stock_quantity} {item.stock_quantity === 1 ? 'set' : 'sets'}
          </Text>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.detailText}>Gauge: {item.gauge}mm</Text>
        <Text style={styles.detailText}>Length: {item.length_feet}ft</Text>
        <Text style={styles.detailText}>Min. Stock: {item.min_stock_level}</Text>
      </View>
      <Text style={styles.priceText}>
        ${item.cost_per_set?.toFixed(2) || '0.00'} per set
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchInventory}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>String Inventory</Text>
        <Link href="/(stringer)/inventory/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>
      
      {inventory.length > 0 ? (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>
              {inventory.length} {inventory.length === 1 ? 'Item' : 'Items'} in Stock
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No inventory items yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first string to get started
          </Text>
          <Link href="/(stringer)/inventory/new" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Add String</Text>
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
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 8,
  },
  inventoryItem: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  stockBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockBadge: {
    backgroundColor: '#ffebee',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2e7d32',
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
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});